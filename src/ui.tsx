import type { ReactNode } from 'react'

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  display?: string
  onChange: (v: number) => void
}

export function SliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9.5px] font-medium tracking-[0.05em] text-white/38 uppercase">{label}</span>
        <span className="text-[9.5px] font-mono font-medium text-white/55 tabular-nums">
          {display ?? value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

interface ColorSwatchProps {
  label: string
  value: string
  onChange: (v: string) => void
}

export function ColorSwatch({ label, value, onChange }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4.5 h-4.5 rounded-sm cursor-pointer relative overflow-hidden shrink-0"
        style={{ background: value, border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute -inset-1 opacity-0 cursor-pointer"
          style={{ width: 'calc(100% + 8px)', height: 'calc(100% + 8px)' }}
        />
      </div>
      <span className="text-[9.5px] font-medium tracking-[0.04em] text-white/32 uppercase">{label}</span>
    </div>
  )
}

interface ToggleProps {
  on: boolean
  onChange: (v: boolean) => void
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative shrink-0 cursor-pointer transition-all duration-200"
      style={{
        width: 30,
        height: 17,
        borderRadius: 999,
        background: on ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
        border: on ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
        boxShadow: on ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
      }}
    >
      <span
        className="absolute top-0.5 w-2.75 h-2.75 rounded-full transition-all duration-200"
        style={{
          left: on ? 15 : 2,
          background: on ? '#fff' : 'rgba(255,255,255,0.35)',
          boxShadow: on ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
        }}
      />
    </button>
  )
}

interface SectionProps {
  label: string
  badge?: string
  children: ReactNode
}

export function PanelSection({ label, badge, children }: SectionProps) {
  return (
    <div className="px-4 py-4 border-b border-white/5">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[8.5px] font-black tracking-[0.18em] text-white/30 uppercase">{label}</span>
        {badge && (
          <span
            className="text-[7.5px] px-1.5 py-px rounded font-mono font-bold text-white/20 tracking-widest uppercase"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

interface PresetGridProps {
  options: string[]
  active: string
  onSelect: (v: string) => void
}

export function PresetGrid({ options, active, onSelect }: PresetGridProps) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="py-1.5 px-2 rounded text-[8.5px] font-bold tracking-[0.08em] uppercase transition-all duration-150 cursor-pointer font-sans text-center"
          style={{
            background: active === opt ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.035)',
            border: active === opt ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
            color: active === opt ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
            boxShadow: active === opt ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

interface CtrlRowProps {
  label: string
  children: ReactNode
}

export function CtrlRow({ label, children }: CtrlRowProps) {
  return (
    <div className="flex items-center justify-between mb-3 last:mb-0">
      <span className="text-[9.5px] font-medium tracking-[0.04em] text-white/38">{label}</span>
      {children}
    </div>
  )
}
