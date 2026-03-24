import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export interface LoadResult {
  object: THREE.Object3D
  mixer?: THREE.AnimationMixer
  verts: number
  faces: number
  hasAnimation: boolean
}

function countGeometry(obj: THREE.Object3D) {
  let verts = 0, faces = 0
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    const geo = mesh.geometry
    if (geo.attributes.position) verts += geo.attributes.position.count
    if (geo.index) faces += geo.index.count / 3
    else if (geo.attributes.position) faces += geo.attributes.position.count / 3
  })
  return { verts: Math.round(verts), faces: Math.round(faces) }
}

function applyShadows(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

function centerAndScale(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 3 / maxDim
  obj.scale.setScalar(scale)
  const newBox = new THREE.Box3().setFromObject(obj)
  const center = newBox.getCenter(new THREE.Vector3())
  obj.position.sub(center)
  obj.position.y = 0
}

export async function loadFile(
  file: File,
  onProgress?: (msg: string) => void
): Promise<LoadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const url = URL.createObjectURL(file)

  try {
    let object: THREE.Object3D
    let mixer: THREE.AnimationMixer | undefined
    let hasAnimation = false

    if (ext === 'fbx') {
      onProgress?.('Parsing FBX…')
      const loader = new FBXLoader()
      object = await new Promise<THREE.Object3D>((res, rej) => loader.load(url, res, undefined, rej))
      const grp = object as THREE.Group & { animations?: THREE.AnimationClip[] }
      if (grp.animations?.length) {
        mixer = new THREE.AnimationMixer(object)
        mixer.clipAction(grp.animations[0]).play()
        hasAnimation = true
      }
    } else if (ext === 'obj') {
      onProgress?.('Parsing OBJ…')
      const loader = new OBJLoader()
      object = await new Promise<THREE.Object3D>((res, rej) => loader.load(url, res, undefined, rej))
    } else if (ext === 'gltf' || ext === 'glb') {
      onProgress?.('Parsing GLTF…')
      const loader = new GLTFLoader()
      const gltf = await new Promise<{ scene: THREE.Object3D; animations: THREE.AnimationClip[] }>(
        (res, rej) => loader.load(url, res as never, undefined, rej)
      )
      object = gltf.scene
      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(object)
        mixer.clipAction(gltf.animations[0]).play()
        hasAnimation = true
      }
    } else {
      throw new Error(`Unsupported format: .${ext}`)
    }

    applyShadows(object)
    centerAndScale(object)
    const { verts, faces } = countGeometry(object)

    return { object, mixer, verts, faces, hasAnimation }
  } finally {
    URL.revokeObjectURL(url)
  }
}
