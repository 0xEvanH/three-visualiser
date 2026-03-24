import { useEffect, useRef, useState } from 'react'
import { useViewerStore } from './store.ts'

export function EmptyState({ onUpload }: { onUpload: () => void }) {
  const { loadedObject } = useViewerStore()

  return (
    <div
      className={`
        fixed inset-0 top-12 z-5 flex flex-col items-center justify-center
        pointer-events-none transition-opacity duration-500
        ${loadedObject ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <span className="text-[9px] font-bold tracking-[0.2em] text-white/25 uppercase mb-5">
        01 — Model Viewer
      </span>
      <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black leading-[0.88] tracking-[-0.05em] text-white text-center mb-3">
        Drop a<br />3D Model
      </h1>
      <p className="text-[11px] text-white/30 tracking-[0.06em] mb-8 uppercase">
        FBX · OBJ · GLTF · GLB
      </p>
      <button
        onClick={onUpload}
        className="pointer-events-auto h-11 px-8 bg-white text-black text-[10px] font-black tracking-[0.12em] uppercase rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
      >
        Import File
      </button>
      <span className="text-[9px] text-white/20 tracking-widest mt-4 uppercase">
        Drag &amp; drop anywhere
      </span>
    </div>
  )
}

export function DropOverlay({ active }: { active: boolean }) {
  return (
    <div
      className={`
        fixed inset-0 z-100 flex flex-col items-center justify-center
        transition-opacity duration-300 pointer-events-none
        ${active ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(8px)',
        border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
      }}
    >
      <span className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4">
        Drop to import
      </span>
      <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-none tracking-[-0.04em] text-white">
        Release to Load
      </h2>
      <p className="text-[10px] text-white/35 tracking-wider mt-3 uppercase">
        FBX · OBJ · GLTF · GLB
      </p>
    </div>
  )
}

export function Loader() {
  const { isLoading, loadingMsg } = useViewerStore()

  return (
    <div
      className={`
        fixed inset-0 top-12 z-30 flex flex-col items-center justify-center gap-4
        transition-opacity duration-300
        ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div className="w-7 h-7 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      <span className="text-[9px] font-bold tracking-[0.16em] text-white/40 uppercase">
        {loadingMsg}
      </span>
    </div>
  )
}

export function InfoBar() {
  const { panelOpen } = useViewerStore()
  const hints = [
    ['Drag', 'Rotate'],
    ['Scroll', 'Zoom'],
    ['RMB', 'Pan'],
    ['R', 'Reset View'],
    ['W', 'Wireframe'],
    ['Space', 'Auto-rotate'],
    ['⌘S', 'Screenshot'],
  ]

  return (
    <div
      className={`
        fixed bottom-0 left-0 z-20 h-10 flex items-center px-5 gap-5
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${panelOpen ? 'right-65' : 'right-0'}
      `}
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {hints.map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5 text-[9px] text-white/30 tracking-wider">
          <span
            className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded text-[8px] font-bold font-mono text-white/40"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {key}
          </span>
          {label}
        </div>
      ))}
    </div>
  )
}

export function ProgressBar() {
  const { loadedObject, panelOpen } = useViewerStore()

  return (
    <div
      className="fixed left-0 top-0 w-0.5 z-50"
      style={{ height: '100vh', background: 'rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-full bg-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ height: loadedObject ? '100%' : '20%' }}
      />
      <div
        className={`
          absolute bottom-6 left-4 flex items-center gap-2
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${panelOpen ? '' : ''}
        `}
      >
        <span
          className="text-[9px] font-black tracking-[0.12em] text-white tabular-nums"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {loadedObject ? '02' : '01'}
        </span>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
        <span
          className="text-[9px] font-black tracking-[0.12em] text-white/30 tabular-nums"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          02
        </span>
      </div>
    </div>
  )
}

export function Notification() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      setMsg(detail)
      setVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(false), 2800)
    }
    window.addEventListener('notify', handler)
    return () => window.removeEventListener('notify', handler)
  }, [])

  return (
    <div
      className={`
        fixed bottom-14 left-5 z-100
        text-[10px] font-bold tracking-[0.08em] text-white
        px-4 py-2.5 rounded-lg pointer-events-none
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      {msg}
    </div>
  )
}

export function notify(msg: string) {
  window.dispatchEvent(new CustomEvent('notify', { detail: msg }))
}
