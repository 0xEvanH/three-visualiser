import { create } from 'zustand'
import * as THREE from 'three'

export type ParticleMode = 'float' | 'orbit' | 'burst' | 'rain'
export type SkyboxPreset = 'void' | 'fog' | 'dusk' | 'neon' | 'arctic' | 'ember'
export type CameraMode = 'orbit' | 'top' | 'front' | 'side'

export interface SkyConfig {
  bg: string
  fogDensity: number
  fogColor: string
  ambient: number
  key: number
  fill: number
  rim: number
  keyColor: string
  fillColor: string
  rimColor: string
}

const SKY_PRESETS: Record<SkyboxPreset, SkyConfig> = {
  void:   { bg: '#000000', fogDensity: 0,     fogColor: '#000000', ambient: 0.3,  key: 1.5, fill: 0.5, rim: 0.8,  keyColor: '#ffffff', fillColor: '#a0c0ff', rimColor: '#ff8060' },
  fog:    { bg: '#101018', fogDensity: 0.025, fogColor: '#101018', ambient: 0.6,  key: 1.0, fill: 0.8, rim: 0.3,  keyColor: '#d0e0ff', fillColor: '#8090b0', rimColor: '#ffffff' },
  dusk:   { bg: '#0a0510', fogDensity: 0.01,  fogColor: '#1a0a20', ambient: 0.2,  key: 2.0, fill: 0.3, rim: 1.5,  keyColor: '#ffb060', fillColor: '#8040a0', rimColor: '#ff40a0' },
  neon:   { bg: '#020208', fogDensity: 0.015, fogColor: '#020218', ambient: 0.15, key: 1.8, fill: 1.2, rim: 2.0,  keyColor: '#00ffcc', fillColor: '#8000ff', rimColor: '#ff0080' },
  arctic: { bg: '#e8f0f8', fogDensity: 0.008, fogColor: '#c0d8f0', ambient: 1.5,  key: 2.5, fill: 1.0, rim: 0.2,  keyColor: '#ffffff', fillColor: '#c0e0ff', rimColor: '#80c0ff' },
  ember:  { bg: '#08040a', fogDensity: 0.02,  fogColor: '#1a0800', ambient: 0.2,  key: 2.5, fill: 0.2, rim: 1.8,  keyColor: '#ff6020', fillColor: '#400010', rimColor: '#ff2000' },
}

export interface ModelInfo {
  name: string
  verts: number
  faces: number
  hasAnimation: boolean
}

interface ViewerState {
  autoRotate: boolean
  wireframe: boolean
  showGrid: boolean
  showShadow: boolean
  showAxes: boolean
  showParticles: boolean
  panelOpen: boolean
  modelScale: number
  modelElevation: number
  rotateSpeed: number
  exposure: number
  bloomIntensity: number
  bloomEnabled: boolean
  sky: SkyConfig
  skyPreset: SkyboxPreset
  particleMode: ParticleMode
  particleCount: number
  particleSize: number
  particleSpeed: number
  particleSpread: number
  particleColor: string
  modelInfo: ModelInfo | null
  loadedObject: THREE.Object3D | null
  mixer: THREE.AnimationMixer | null
  isLoading: boolean
  loadingMsg: string
  cameraMode: CameraMode
  screenshotTrigger: number

  set: (partial: Partial<ViewerState>) => void
  applySkyPreset: (preset: SkyboxPreset) => void
  updateSky: (patch: Partial<SkyConfig>) => void
  triggerScreenshot: () => void
}

export const useViewerStore = create<ViewerState>((set) => ({
  autoRotate: true,
  wireframe: false,
  showGrid: true,
  showShadow: true,
  showAxes: false,
  showParticles: true,
  panelOpen: true,
  modelScale: 1,
  modelElevation: 0,
  rotateSpeed: 0.5,
  exposure: 1,
  bloomIntensity: 0.4,
  bloomEnabled: true,
  sky: SKY_PRESETS.void,
  skyPreset: 'void',
  particleMode: 'float',
  particleCount: 800,
  particleSize: 1.8,
  particleSpeed: 0.4,
  particleSpread: 8,
  particleColor: '#ffffff',
  modelInfo: null,
  loadedObject: null,
  mixer: null,
  isLoading: false,
  loadingMsg: '',
  cameraMode: 'orbit',
  screenshotTrigger: 0,

  set: (partial) => set(partial),
  applySkyPreset: (preset) => set({ sky: SKY_PRESETS[preset], skyPreset: preset }),
  updateSky: (patch) => set((s) => ({ sky: { ...s.sky, ...patch } })),
  triggerScreenshot: () => set((s) => ({ screenshotTrigger: s.screenshotTrigger + 1 })),
}))

export { SKY_PRESETS }
