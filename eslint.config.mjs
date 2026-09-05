import next from "eslint-config-next";

/**
 * Flat config. `next lint` was removed in Next 16, so `npm run lint` calls
 * eslint directly.
 */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      // shadcn output — vendored code, not ours to lint
      "components/ui/**",
    ],
  },

  ...next,

  {
    rules: {
      /*
        eslint-plugin-react-hooks v7 ships React-Compiler-oriented rules that
        are noisy on this codebase without pointing at real defects:

        - purity: flags Date.now() / Math.random() used to build element ids
          inside click handlers, which is exactly where they belong.
        - immutability / set-state-in-effect: flags the standard "fetch once on
          mount, then setState" pattern used by the dashboard lists.

        Kept on as warnings so a genuinely suspicious case still shows up.
      */
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
