import type { SkyboxPreset, ParticleMode, CameraMode } from './store.ts'
import { useViewerStore } from './store.ts'
import { SliderRow, ColorSwatch, Toggle, PanelSection, PresetGrid, CtrlRow } from './ui'

export function Panel() {
  const store = useViewerStore()

  return (
    <div
      className={`
        fixed right-0 top-12 bottom-0 w-65 z-10
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        overflow-y-auto overflow-x-hidden
        ${store.panelOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{
        background: 'rgba(8,8,10,0.75)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <PanelSection label="Camera" badge="View">
        <PresetGrid
          options={['orbit', 'front', 'side', 'top']}
          active={store.cameraMode}
          onSelect={v => store.set({ cameraMode: v as CameraMode })}
        />
      </PanelSection>

      <PanelSection label="Transform" badge="Model">
        <SliderRow label="Scale" value={store.modelScale} min={0.01} max={5} step={0.01} onChange={v => store.set({ modelScale: v })} />
        <SliderRow label="Elevation" value={store.modelElevation} min={-3} max={3} step={0.01} onChange={v => store.set({ modelElevation: v })} />
        <SliderRow label="Rotate Speed" value={store.rotateSpeed} min={0} max={3} step={0.01} onChange={v => store.set({ rotateSpeed: v })} />
      </PanelSection>

      <PanelSection label="Lighting" badge="Scene">
        <SliderRow label="Ambient" value={store.sky.ambient} min={0} max={3} step={0.01} onChange={v => store.updateSky({ ambient: v })} />
        <SliderRow label="Key" value={store.sky.key} min={0} max={5} step={0.01} onChange={v => store.updateSky({ key: v })} />
        <SliderRow label="Fill" value={store.sky.fill} min={0} max={3} step={0.01} onChange={v => store.updateSky({ fill: v })} />
        <SliderRow label="Rim" value={store.sky.rim} min={0} max={3} step={0.01} onChange={v => store.updateSky({ rim: v })} />
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/6">
          <ColorSwatch label="Key" value={store.sky.keyColor} onChange={v => store.updateSky({ keyColor: v })} />
          <ColorSwatch label="Fill" value={store.sky.fillColor} onChange={v => store.updateSky({ fillColor: v })} />
          <ColorSwatch label="Rim" value={store.sky.rimColor} onChange={v => store.updateSky({ rimColor: v })} />
        </div>
      </PanelSection>

      <PanelSection label="Skybox" badge="Env">
        <PresetGrid
          options={['void', 'fog', 'dusk', 'neon', 'arctic', 'ember']}
          active={store.skyPreset}
          onSelect={v => store.applySkyPreset(v as SkyboxPreset)}
        />
        <div className="mt-3">
          <SliderRow label="Fog Density" value={store.sky.fogDensity} min={0} max={0.05} step={0.001} display={store.sky.fogDensity.toFixed(3)} onChange={v => store.updateSky({ fogDensity: v })} />
          <div className="flex gap-3 mt-2">
            <ColorSwatch label="BG" value={store.sky.bg} onChange={v => store.updateSky({ bg: v })} />
            <ColorSwatch label="Fog" value={store.sky.fogColor} onChange={v => store.updateSky({ fogColor: v })} />
          </div>
        </div>
      </PanelSection>

      <PanelSection label="Post FX" badge="Render">
        <CtrlRow label="Bloom">
          <Toggle on={store.bloomEnabled} onChange={v => store.set({ bloomEnabled: v })} />
        </CtrlRow>
        <div className="mt-3">
          <SliderRow label="Bloom Intensity" value={store.bloomIntensity} min={0} max={3} step={0.01} onChange={v => store.set({ bloomIntensity: v })} />
          <SliderRow label="Exposure" value={store.exposure} min={0.1} max={3} step={0.01} onChange={v => store.set({ exposure: v })} />
        </div>
        <div className="mt-2 pt-3 border-t border-white/6">
          <CtrlRow label="Grid Floor">
            <Toggle on={store.showGrid} onChange={v => store.set({ showGrid: v })} />
          </CtrlRow>
          <CtrlRow label="Shadows">
            <Toggle on={store.showShadow} onChange={v => store.set({ showShadow: v })} />
          </CtrlRow>
          <CtrlRow label="Axes">
            <Toggle on={store.showAxes} onChange={v => store.set({ showAxes: v })} />
          </CtrlRow>
        </div>
      </PanelSection>

      <PanelSection label="Particles" badge="FX">
        <CtrlRow label="Enabled">
          <Toggle on={store.showParticles} onChange={v => store.set({ showParticles: v })} />
        </CtrlRow>
        <div className="mt-3">
          <SliderRow label="Count" value={store.particleCount} min={50} max={3000} step={50} display={String(store.particleCount)} onChange={v => store.set({ particleCount: v })} />
          <SliderRow label="Size" value={store.particleSize} min={0.2} max={6} step={0.1} onChange={v => store.set({ particleSize: v })} />
          <SliderRow label="Speed" value={store.particleSpeed} min={0} max={2} step={0.01} onChange={v => store.set({ particleSpeed: v })} />
          <SliderRow label="Spread" value={store.particleSpread} min={1} max={20} step={0.1} onChange={v => store.set({ particleSpread: v })} />
          <div className="mt-2">
            <ColorSwatch label="Color" value={store.particleColor} onChange={v => store.set({ particleColor: v })} />
          </div>
        </div>
        <div className="mt-3">
          <PresetGrid
            options={['float', 'orbit', 'burst', 'rain']}
            active={store.particleMode}
            onSelect={v => store.set({ particleMode: v as ParticleMode })}
          />
        </div>
      </PanelSection>
    </div>
  )
}
