import clsx from 'clsx'

// Small accessible toggle switch, styled to match the AEGIS palette
// rather than a default browser checkbox.
export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'w-9 h-5 rounded-full transition-colors relative shrink-0',
        checked ? 'bg-teal' : 'bg-border dark:bg-border-dark'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-subtle transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
