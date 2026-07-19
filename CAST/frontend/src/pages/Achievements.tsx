import { Award, Footprints, FishOff, Inbox, Flame, GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAppStore } from '@/store/useAppStore'

const ICONS: Record<string, any> = {
  footprints: Footprints, 'fish-off': FishOff, inbox: Inbox, flame: Flame, 'graduation-cap': GraduationCap,
}

export function Achievements() {
  const achievements = useAppStore((s) => s.achievements)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Achievements</h1>
      <p className="mt-1 text-muted">Badges you've unlocked along the way.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Award
          const earned = Boolean(a.earned_at)
          return (
            <Card key={a.id} className={earned ? '' : 'opacity-50'}>
              <Icon size={24} className={earned ? 'text-teal' : 'text-muted'} />
              <div className="mt-3 font-medium">{a.title}</div>
              <div className="mt-1 text-xs text-muted">{a.description}</div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
