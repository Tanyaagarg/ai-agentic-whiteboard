import { NextRequest } from "next/server";

const MODEL = "gemini-3.6-flash";

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Raw REST call. No SDK, so the body is exactly what we send.
 * 503/429 mean Google is busy or throttling us, which clears on its own,
 * so back off and try again instead of surfacing it to the user.
 */
async function callGemini(body: any, attempts = 3) {
    let lastError: any;

    for (let i = 0; i < attempts; i++) {
        const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY as string,
            },
            body: JSON.stringify(body),
        });

        const json = await res.json();

        if (res.ok) {
            return json;
        }

        lastError = new Error(json?.error?.message ?? `HTTP ${res.status}`);

        const transient = res.status === 503 || res.status === 429;

        if (!transient || i === attempts - 1) {
            throw lastError;
        }

        const wait = 1000 * 2 ** i;
        console.log(`gemini busy (${res.status}), retrying in ${wait}ms`);
        await sleep(wait);
    }

    throw lastError;
}

/** Models wrap JSON in fences or add a sentence before it. Dig the object out. */
function parseLoose(raw: string) {
    const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        // fall back to the outermost { ... } in the string
        const first = cleaned.indexOf("{");
        const last = cleaned.lastIndexOf("}");

        if (first === -1 || last <= first) {
            throw new Error("no JSON object found");
        }

        return JSON.parse(cleaned.slice(first, last + 1));
    }
}

function extractText(json: any) {
    const parts = json?.candidates?.[0]?.content?.parts ?? [];

    return parts
        .map((part: any) => part?.text ?? "")
        .join("")
        .trim();
}

/**
 * Health check: http://localhost:3000/api/ai
 * Runs the same one-word prompt twice so the timings can be compared.
 */
export async function GET() {
    const results: any = { model: MODEL, keyPresent: !!process.env.GEMINI_API_KEY };

    for (const variant of ["default", "lowThinking"]) {
        const startedAt = Date.now();

        try {
            const json = await callGemini({
                contents: [{ parts: [{ text: "Reply with the single word: ok" }] }],
                generationConfig:
                    variant === "lowThinking"
                        ? { thinkingConfig: { thinkingLevel: "low" } }
                        : {},
            });

            results[variant] = {
                ms: Date.now() - startedAt,
                text: extractText(json),
            };
        } catch (err: any) {
            results[variant] = {
                ms: Date.now() - startedAt,
                error: err?.message ?? "Unknown error",
            };
        }
    }

    return Response.json(results);
}

export async function POST(req: NextRequest) {
    const startedAt = Date.now();

    try {
        if (!process.env.GEMINI_API_KEY) {
            return Response.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const { userInput, type, systemPrompt } = await req.json();

        const finalPrompt = `${systemPrompt}

USER REQUEST: ${userInput}

CANVAS GENERATION RULES

Create a complete, detailed ${type}. A real one needs many elements, not a
few boxes. Produce between 15 and 25 elements. Never return fewer than 10.

Allowed element types, and nothing else:
rectangle, ellipse, diamond, text, line

Every element needs:
- id: a unique string, never reused
- type: one of the allowed types
- x and y: absolute pixel coordinates on the canvas
- width and height: for every type except text

Coordinates:
- Treat the top-left of the drawing as x: 0, y: 0.
- Every element needs its own x and y. Do not put several elements at the
  same coordinates and do not let them overlap.
- Lay the design out on a real grid. For a mobile screen, work inside a
  frame roughly 380 wide and 800 tall, with elements stacked down the page
  and around 16px between them.
- For a desktop layout, work inside roughly 1200 x 800.
- For a flowchart or diagram, space nodes at least 120px apart vertically
  and 200px apart horizontally.

Labels:
- Any element the user would read must carry a "text" value: buttons,
  fields, headings, nav items, nodes, list rows.
- Keep text short, like real UI copy.

Colors:
- Hex only, e.g. "#ffffff", "#1e1e1e".
- backgroundColor "transparent" is allowed for outlines.

Connections:
- from and to must reference ids that exist in elements.
- Use them for flow and relationships. A wireframe may have none.

Return an object in exactly this shape:

{
  "title": "Sign in screen",
  "elements": [
    { "id": "frame", "type": "rectangle", "x": 0, "y": 0, "width": 380, "height": 800, "backgroundColor": "transparent", "strokeColor": "#1e1e1e" },
    { "id": "heading", "type": "text", "x": 32, "y": 90, "text": "Welcome back", "fontSize": 24, "strokeColor": "#1e1e1e" },
    { "id": "email", "type": "rectangle", "x": 32, "y": 160, "width": 316, "height": 48, "text": "Email address", "backgroundColor": "#ffffff", "strokeColor": "#94a3b8" },
    { "id": "password", "type": "rectangle", "x": 32, "y": 224, "width": 316, "height": 48, "text": "Password", "backgroundColor": "#ffffff", "strokeColor": "#94a3b8" },
    { "id": "submit", "type": "rectangle", "x": 32, "y": 300, "width": 316, "height": 48, "text": "Sign in", "backgroundColor": "#2563eb", "strokeColor": "#2563eb" }
  ],
  "connections": []
}

That example has 5 elements to show the format. Your answer must have at
least 10, and 15 to 25 for a screen or a full diagram.

Return JSON only. No markdown, no commentary.`;

        const attempt = async (prompt: string): Promise<any> => {
            const json = await callGemini({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingLevel: "low" },
                    maxOutputTokens: 32768,
                    temperature: 1,
                },
            });

            const finishReason = json?.candidates?.[0]?.finishReason;
            const text = extractText(json);

            if (!text) {
                return { error: "Model returned an empty response", finishReason };
            }

            try {
                return {
                    diagramResult: parseLoose(text),
                    finishReason,
                    rawPreview: text.slice(0, 600),
                };
            } catch {
                return {
                    error: `Invalid JSON (finish: ${finishReason}). Starts with: ${text.slice(0, 200)}`,
                    finishReason,
                };
            }
        };

        console.log("calling", MODEL);

        const countOf = (r: any) => r?.diagramResult?.elements?.length ?? 0;

        let result = await attempt(finalPrompt);
        let count = countOf(result);

        // the model sometimes answers with a single placeholder shape;
        // one retry with a blunt nudge usually fixes it
        if (count > 0 && count < 8) {
            console.log("only", count, "elements, retrying");

            const retry = await attempt(
                `${finalPrompt}

IMPORTANT: a previous attempt returned only ${count} element(s). That is not
enough. Return at least 12 elements covering every part of the interface or
diagram described, each with its own coordinates.`
            );

            // keep the retry only if it actually did better; a failed or
            // thinner retry must not throw away a usable first answer
            if (countOf(retry) > count) {
                result = retry;
                count = countOf(retry);
            } else {
                console.log("retry was not better, keeping the first answer");
            }
        }

        console.log("gemini replied in", Date.now() - startedAt, "ms with", count, "elements");

        if (result.error) {
            return Response.json(result, { status: 500 });
        }

        const { diagramResult, rawPreview } = result;

        console.log(
            "elements:", diagramResult?.elements?.length,
            "connections:", diagramResult?.connections?.length
        );
        console.log("raw:", JSON.stringify(diagramResult).slice(0, 1500));

        return Response.json({
            success: true,
            diagramResult,
            rawPreview,
        });
    } catch (err: any) {
        console.error("AI route failed after", Date.now() - startedAt, "ms", err);

        return Response.json(
            { error: err?.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}