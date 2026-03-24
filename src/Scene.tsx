import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useViewerStore } from './store.ts'

const _target = new THREE.Vector3()
const _camPos = new THREE.Vector3()

const CAMERA_PRESETS: Record<string, [THREE.Vector3, THREE.Vector3]> = {
  orbit:  [new THREE.Vector3(0, 2, 6),   new THREE.Vector3(0, 0, 0)],
  top:    [new THREE.Vector3(0, 8, 0.01), new THREE.Vector3(0, 0, 0)],
  front:  [new THREE.Vector3(0, 1.5, 6), new THREE.Vector3(0, 1.5, 0)],
  side:   [new THREE.Vector3(6, 1.5, 0), new THREE.Vector3(0, 1.5, 0)],
}

function CameraController({ resetRef }: { resetRef: React.MutableRefObject<(() => void) | null> }) {
  const { camera, controls } = useThree() as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null }
  const lerpTarget = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null)
  const { cameraMode, screenshotTrigger } = useViewerStore()

  const flyTo = useCallback((pos: THREE.Vector3, look: THREE.Vector3) => {
    lerpTarget.current = { pos: pos.clone(), look: look.clone() }
  }, [])

  resetRef.current = useCallback(() => {
    const [pos, look] = CAMERA_PRESETS[cameraMode] ?? CAMERA_PRESETS.orbit
    flyTo(pos, look)
  }, [cameraMode, flyTo])

  useEffect(() => {
    const [pos, look] = CAMERA_PRESETS[cameraMode] ?? CAMERA_PRESETS.orbit
    flyTo(pos, look)
  }, [cameraMode, flyTo])

  useEffect(() => {
    if (screenshotTrigger === 0) return
    const gl = (camera as unknown as { renderer?: THREE.WebGLRenderer }).renderer
    void gl
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'model-viewer-screenshot.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [screenshotTrigger, camera])

  useFrame(() => {
    if (!lerpTarget.current) return
    const { pos, look } = lerpTarget.current
    camera.position.lerp(pos, 0.08)
    _target.copy(controls?.target ?? _target)
    _target.lerp(look, 0.08)
    if (controls) controls.target.copy(_target)
    _camPos.subVectors(camera.position, pos)
    if (_camPos.lengthSq() < 0.0001) {
      camera.position.copy(pos)
      if (controls) controls.target.copy(look)
      lerpTarget.current = null
    }
  })

  return null
}

function Lights() {
  const { sky } = useViewerStore()
  return (
    <>
      <ambientLight intensity={sky.ambient} />
      <directionalLight
        castShadow
        position={[5, 8, 5]}
        intensity={sky.key}
        color={sky.keyColor}
        shadow-mapSize={[2048, 2048] as unknown as THREE.Vector2}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 2, -3]} intensity={sky.fill} color={sky.fillColor} />
      <directionalLight position={[0, 5, -8]} intensity={sky.rim} color={sky.rimColor} />
    </>
  )
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  const { particleCount, particleSize, particleSpeed, particleSpread, particleColor, particleMode, showParticles } = useViewerStore()
  const timeRef = useRef(0)

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const vel = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const r = particleSpread * (0.3 + Math.random() * 0.7)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3    ] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5 + 1
      pos[i * 3 + 2] = r * Math.cos(phi)
      vel[i * 3    ] = (Math.random() - 0.5) * 0.01
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005 + 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01
    }
    return { positions: pos, velocities: vel }
  }, [particleCount, particleSpread])

  useFrame((_, delta) => {
    if (!pointsRef.current || !showParticles) return
    timeRef.current += delta
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2
      if (particleMode === 'float') {
        pos[iy] += velocities[iy] * particleSpeed * 0.5
        pos[ix] += Math.sin(timeRef.current * 0.3 + i) * 0.002 * particleSpeed
        pos[iz] += Math.cos(timeRef.current * 0.2 + i) * 0.002 * particleSpeed
        if (pos[iy] > particleSpread * 0.8 + 1) pos[iy] = -particleSpread * 0.4
      } else if (particleMode === 'orbit') {
        const angle = Math.atan2(pos[iz], pos[ix]) + 0.005 * particleSpeed
        const r = Math.sqrt(pos[ix] * pos[ix] + pos[iz] * pos[iz])
        pos[ix] = r * Math.cos(angle)
        pos[iz] = r * Math.sin(angle)
        pos[iy] += Math.sin(timeRef.current + i * 0.1) * 0.003 * particleSpeed
      } else if (particleMode === 'burst') {
        pos[ix] += velocities[ix] * particleSpeed * 0.3
        pos[iy] += velocities[iy] * particleSpeed * 0.3
        pos[iz] += velocities[iz] * particleSpeed * 0.3
        const dist = Math.sqrt(pos[ix] ** 2 + pos[iy] ** 2 + pos[iz] ** 2)
        if (dist > particleSpread) {
          pos[ix] = (Math.random() - 0.5) * 0.1
          pos[iy] = (Math.random() - 0.5) * 0.1
          pos[iz] = (Math.random() - 0.5) * 0.1
        }
      } else if (particleMode === 'rain') {
        pos[iy] -= particleSpeed * 0.08
        pos[ix] += Math.sin(timeRef.current * 0.1 + i) * 0.001
        if (pos[iy] < -particleSpread * 0.5) {
          pos[iy] = particleSpread * 0.8
          pos[ix] = (Math.random() - 0.5) * particleSpread * 2
          pos[iz] = (Math.random() - 0.5) * particleSpread * 2
        }
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!showParticles) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={particleSize * 0.01}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  )
}

function AnimationTicker() {
  const { mixer } = useViewerStore()
  useFrame((_, delta) => { mixer?.update(delta) })
  return null
}

function LoadedModel() {
  const ref = useRef<THREE.Group>(null)
  const { loadedObject, wireframe, modelScale, modelElevation, rotateSpeed, autoRotate } = useViewerStore()

  useEffect(() => {
    if (!ref.current || !loadedObject) return
    ref.current.clear()
    ref.current.add(loadedObject)
  }, [loadedObject])

  useEffect(() => {
    if (!loadedObject) return
    loadedObject.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach(m => { (m as THREE.MeshStandardMaterial).wireframe = wireframe })
    })
  }, [wireframe, loadedObject])

  useFrame((_, delta) => {
    if (!ref.current || !autoRotate) return
    ref.current.rotation.y += delta * rotateSpeed
  })

  return <group ref={ref} position={[0, modelElevation, 0]} scale={modelScale} />
}

function PlaceholderModel() {
  const ref = useRef<THREE.Mesh>(null)
  const { loadedObject, wireframe } = useViewerStore()

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.4
    ref.current.rotation.x += delta * 0.1
  })

  if (loadedObject) return null

  return (
    <mesh ref={ref} position={[0, 1.2, 0]} castShadow>
      <torusKnotGeometry args={[1, 0.35, 128, 32]} />
      <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} wireframe={wireframe} />
    </mesh>
  )
}

function SceneFog() {
  const { scene } = useThree()
  const { sky } = useViewerStore()

  useEffect(() => {
    scene.background = new THREE.Color(sky.bg)
    scene.fog = sky.fogDensity > 0
      ? new THREE.FogExp2(new THREE.Color(sky.fogColor), sky.fogDensity)
      : null
  }, [sky, scene])

  return null
}

function ExposureSync() {
  const { gl } = useThree()
  const { exposure } = useViewerStore()
  useEffect(() => { gl.toneMappingExposure = exposure }, [exposure, gl])
  return null
}

export function Scene({ resetRef }: { resetRef: React.MutableRefObject<(() => void) | null> }) {
  const { showGrid, showAxes, showShadow, bloomEnabled, bloomIntensity } = useViewerStore()

  return (
    <>
      <SceneFog />
      <ExposureSync />
      <Lights />
      <AnimationTicker />
      <OrbitControls enableDamping dampingFactor={0.06} makeDefault />
      <CameraController resetRef={resetRef} />
      <PlaceholderModel />
      <LoadedModel />
      <Particles />
      {showGrid && (
        <Grid
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.3}
          cellColor="#1a1a1a"
          sectionSize={2}
          sectionThickness={0.6}
          sectionColor="#222"
          fadeDistance={25}
          fadeStrength={1}
          infiniteGrid
        />
      )}
      {showShadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
      )}
      {showAxes && <axesHelper args={[2]} />}
      {bloomEnabled && (
        <EffectComposer>
          <Bloom intensity={bloomIntensity} luminanceThreshold={0.6} luminanceSmoothing={0.9} />
        </EffectComposer>
      )}
    </>
  )
}
