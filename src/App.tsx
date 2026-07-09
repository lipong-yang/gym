import { Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ChecklistPage } from './features/checklist/ChecklistPage'
import { TimerPage } from './features/timer/TimerPage'
import { WeightsPage } from './features/weights/WeightsPage'
import { GoalsPage } from './features/goals/GoalsPage'
import { RunningPage } from './features/running/RunningPage'
import { RopePage } from './features/rope/RopePage'
import { TennisPage } from './features/tennis/TennisPage'

export default function App() {
  return (
    <AuthGate>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/weights" element={<WeightsPage />} />
          <Route path="/running" element={<RunningPage />} />
          <Route path="/rope" element={<RopePage />} />
          <Route path="/tennis" element={<TennisPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>
      </AppShell>
    </AuthGate>
  )
}
