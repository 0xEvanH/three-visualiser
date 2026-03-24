import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { TopBar } from './TopBar'
import { Panel } from './Panel'
import { EmptyState, DropOverlay, Loader, InfoBar, Notification, ProgressBar, notify } from './overlays'
import { useViewerStore } from './store.ts'
import { loadFile } from './loader'

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraResetRef = useRef<(() => void) | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const store = useViewerStore()

  const handleFile = useCallback(async (file: File) => {
    store.set({ isLoading: true, loadingMsg: 'Reading file…' })
    try {
      const result = await loadFile(file, msg => store.set({ loadingMsg: msg }))
      store.set({
        loadedObject: result.object,
        mixer: result.mixer ?? null,
        modelInfo: {
          name: file.name,
          verts: result.verts,
          faces: result.faces,
          hasAnimation: result.hasAnimation,
        },
        modelScale: 1,
        modelElevation: 0,
        cameraMode: 'orbit',
      })
      notify('Loaded: ' + file.name)
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to load model')
    } finally {
      store.set({ isLoading: false })
    }
  }, [store])

  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); setDropActive(true) }
    const onDragLeave = (e: DragEvent) => { if (!e.relatedTarget) setDropActive(false) }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setDropActive(false)
      const file = e.dataTransfer?.files[0]
      if (file) handleFile(file)
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [handleFile])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') cameraResetRef.current?.()
      if (e.key === 'w' || e.key === 'W') store.set({ wireframe: !store.wireframe })
      if (e.key === ' ') { e.preventDefault(); store.set({ autoRotate: !store.autoRotate }) }
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); store.triggerScreenshot() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [store])

  useEffect(() => { notify('Drop or import an FBX · OBJ · GLTF file') }, [])

  return (
    <div className="w-full h-full relative bg-black">
      <input
        ref={fileInputRef}
        type="file"
        accept=".fbx,.obj,.gltf,.glb"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />

      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: 4 }}
        camera={{ position: [0, 2, 6], fov: 45, near: 0.01, far: 1000 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Scene resetRef={cameraResetRef} />
      </Canvas>

      <ProgressBar />
      <TopBar onUpload={() => fileInputRef.current?.click()} onReset={() => cameraResetRef.current?.()} />
      <Panel />
      <EmptyState onUpload={() => fileInputRef.current?.click()} />
      <DropOverlay active={dropActive} />
      <Loader />
      <InfoBar />
      <Notification />
    </div>
  )
}
