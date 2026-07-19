import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { TitleBar } from './components/layout/TitleBar'
import { SplashPreloader } from './components/layout/SplashPreloader'
import { SecurityOverview } from './pages/SecurityOverview'
import { CaseFiles } from './pages/CaseFiles'
import { CaseDetail } from './pages/CaseDetail'
import { LiveMonitoring } from './pages/LiveMonitoring'
import { Placeholder } from './pages/Placeholder'
import { NetworkMonitorLauncher } from './pages/NetworkMonitorLauncher'
import { LearningHubLauncher } from './pages/LearningHubLauncher'
import { Settings } from './pages/Settings'
import { About } from './pages/About'

export default function App() {
  const [booting, setBooting] = useState(true)

  if (booting) {
    return <SplashPreloader onComplete={() => setBooting(false)} />
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-canvas dark:bg-graphite text-charcoal dark:text-canvas">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-canvas dark:bg-graphite p-6">
          <Routes>
            <Route path="/" element={<SecurityOverview />} />
            <Route path="/cases" element={<CaseFiles />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/reports" element={<Placeholder title="Reports" />} />
            <Route path="/history" element={<Placeholder title="Incident History" />} />
            <Route path="/network" element={<NetworkMonitorLauncher />} />
            <Route path="/learning" element={<LearningHubLauncher />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
