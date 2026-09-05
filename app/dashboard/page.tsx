import ProjectList from '@/components/custom/dashboard/ProjectList'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'
import React from 'react'

function DashboardPage() {
  return (
    <div>
        <WelcomeBanner/>
        
        <ProjectList/>

    </div>
  )
}

export default DashboardPage
