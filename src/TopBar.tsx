import type { ReactNode } from 'react'
import { useViewerStore } from './store.ts'

function Btn({ children, active, onClick, title }: { children: ReactNode; active?: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        h-7 px-3 rounded-md border text-[9px] font-bold tracking-widest uppercase
        transition-all duration-150 cursor-pointer font-sans whitespace-nowrap
        ${active
          ? 'text-white bg-white/12 border-white/30'
          : 'text-white/40 bg-white/5 border-white/10 hover:text-white/70 hover:bg-white/9 hover:border-white/20'
        }
      `}
    >
      {children}
    </button>
  )
}

interface TopBarProps {
  onUpload: () => void
  onReset: () => void
}

export function TopBar({ onUpload, onReset }: TopBarProps) {
  const store = useViewerStore()

  return (
    <div
      className="fixed top-0 left-0 right-0 h-12 z-20 flex items-center justify-between px-5"
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-5 min-w-0">
        <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase shrink-0">
          Model Viewer
        </span>
        <div className="flex items-center gap-4 font-mono text-[9px] text-white/35 tracking-wider min-w-0">
          {store.modelInfo ? (
            <>
              <span className="text-white/55 truncate max-w-40">{store.modelInfo.name}</span>
              <span className="shrink-0">{store.modelInfo.verts.toLocaleString()} verts</span>
              <span className="shrink-0">{store.modelInfo.faces.toLocaleString()} tri</span>
              {store.modelInfo.hasAnimation && (
                <span className="shrink-0 text-white/50 border border-white/20 px-1.5 py-0.5 rounded text-[8px]">
                  ANIM
                </span>
              )}
            </>
          ) : (
            <span>No model loaded</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Btn onClick={onUpload}>↑ Import</Btn>
        <Btn active={store.autoRotate} onClick={() => store.set({ autoRotate: !store.autoRotate })}>Auto</Btn>
        <Btn active={store.wireframe} onClick={() => store.set({ wireframe: !store.wireframe })}>Wire</Btn>
        <Btn onClick={onReset}>Reset</Btn>
        <Btn onClick={() => store.triggerScreenshot()} title="Save screenshot (⌘S)">⬇ PNG</Btn>
        <Btn active={store.panelOpen} onClick={() => store.set({ panelOpen: !store.panelOpen })}>Panel</Btn>
      </div>
    </div>
  )
}
