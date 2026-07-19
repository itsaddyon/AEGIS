import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SplashScreen } from '@/components/layout/SplashScreen'
import { useAppStore } from '@/store/useAppStore'

import { Home } from '@/pages/Home'
import { LearningPath } from '@/pages/LearningPath'
import { MissionDetail } from '@/pages/missions/MissionDetail'
import { PracticeLab } from '@/pages/PracticeLab'
import { FakeInboxSimulation } from '@/pages/simulations/FakeInboxSimulation'
import { FakeWebsiteSimulation } from '@/pages/simulations/FakeWebsiteSimulation'
import { QrScannerSimulation } from '@/pages/simulations/QrScannerSimulation'
import { OtpScamSimulation } from '@/pages/simulations/OtpScamSimulation'
import { PhoneCallSimulation } from '@/pages/simulations/PhoneCallSimulation'
import { UsbAttackSimulation } from '@/pages/simulations/UsbAttackSimulation'
import { SocialChatSimulation } from '@/pages/simulations/SocialChatSimulation'
import { BrowserWarningSimulation } from '@/pages/simulations/BrowserWarningSimulation'
import { PasswordLabSimulation } from '@/pages/simulations/PasswordLabSimulation'
import { ComingSoonSimulation } from '@/pages/simulations/ComingSoonSimulation'
import { Challenges } from '@/pages/Challenges'
import { Achievements } from '@/pages/Achievements'
import { Progress } from '@/pages/Progress'
import { Settings } from '@/pages/Settings'
import { About } from '@/pages/About'
import { ComingSoon } from '@/pages/ComingSoon'
import { NetworkMonitorLauncher } from '@/pages/NetworkMonitorLauncher'
import { ThreatDetectionLauncher } from '@/pages/ThreatDetectionLauncher'
import { OnboardingModal } from '@/components/common/OnboardingModal'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const profile = useAppStore((s) => s.profile)
  const loading = useAppStore((s) => s.loading)
  const refreshAll = useAppStore((s) => s.refreshAll)

  useEffect(() => { refreshAll() }, [refreshAll])

  useEffect(() => {
    document.documentElement.classList.toggle('light', profile?.theme === 'light')
  }, [profile?.theme])

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  const needsOnboarding = !loading && !!profile && profile.display_name === 'Learner'

  if (needsOnboarding) {
    return <OnboardingModal onDone={refreshAll} />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/learning-path/:missionId" element={<MissionDetail />} />
        <Route path="/practice-lab" element={<PracticeLab />} />
        <Route path="/practice-lab/fake-inbox" element={<FakeInboxSimulation />} />
        <Route path="/practice-lab/real-vs-fake-site" element={<FakeWebsiteSimulation />} />
        <Route path="/practice-lab/qr-scanner" element={<QrScannerSimulation />} />
        <Route path="/practice-lab/otp-scam" element={<OtpScamSimulation />} />
        <Route path="/practice-lab/phone-call" element={<PhoneCallSimulation />} />
        <Route path="/practice-lab/usb-attack" element={<UsbAttackSimulation />} />
        <Route path="/practice-lab/social-chat" element={<SocialChatSimulation />} />
        <Route path="/practice-lab/browser-warning" element={<BrowserWarningSimulation />} />
        <Route path="/practice-lab/password-lab" element={<PasswordLabSimulation />} />
        <Route path="/practice-lab/:simId" element={<ComingSoonSimulation />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/network-monitor" element={<NetworkMonitorLauncher />} />
        <Route path="/threat-detection" element={<ThreatDetectionLauncher />} />
        <Route path="/coming-soon/:feature" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}
