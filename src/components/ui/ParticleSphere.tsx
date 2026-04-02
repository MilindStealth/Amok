"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

const GALLERY_IMAGES = [
  "/Images/img-1.jpg",
  "/Images/img-2.jpg",
  "/Images/img-3.jpg",
  "/Images/img-4.jpg",
  "/Images/img-5.jpg",
  "/Images/img-6.jpg",
  "/Images/img-7.jpg",
  "/Images/img-8.jpg",
  "/Images/img-9.jpg",
  "/Images/img-10.jpg",
  "/Images/img-11.jpg",
  "/Images/img-12.jpg",
  "/Images/img-13.jpg",
  "/Images/img-14.jpg",
  "/Images/img-15.jpg",
  "/Images/img-16.jpg",
]

interface ParticleSphereProps {
  onImageClick?: (url: string) => void;
}

export function ParticleSphere({ onImageClick }: ParticleSphereProps) {
  const PARTICLE_COUNT = 1500
  const PARTICLE_SIZE_MIN = 0.005
  const PARTICLE_SIZE_MAX = 0.010
  const SPHERE_RADIUS = 9
  const POSITION_RANDOMNESS = 4
  const ROTATION_SPEED_Y = 0.0005
  const PARTICLE_OPACITY = 1
  const IMAGE_COUNT = 24
  const IMAGE_SIZE = 1.9
  const IMAGE_ORBIT_RADIUS = 8.5

  const groupRef = useRef<THREE.Group>(null)

  const textures = useTexture(GALLERY_IMAGES)

  useMemo(() => {
    textures.forEach((texture) => {
      if (texture) {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.flipY = false
      }
    })
  }, [textures])

  const particles = useMemo(() => {
    const pts = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT)
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi
      const r = SPHERE_RADIUS + (Math.random() - 0.5) * POSITION_RANDOMNESS
      pts.push({
        position: [
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.cos(phi),
          r * Math.sin(theta) * Math.sin(phi),
        ] as [number, number, number],
        scale: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.8, 0.6 + Math.random() * 0.3),
      })
    }
    return pts
  }, [])

  const orbitingImages = useMemo(() => {
    const imgs = []
    for (let i = 0; i < IMAGE_COUNT; i++) {
      const angle = (i / IMAGE_COUNT) * Math.PI * 2
      const x = IMAGE_ORBIT_RADIUS * Math.cos(angle)
      const z = IMAGE_ORBIT_RADIUS * Math.sin(angle)
      const position = new THREE.Vector3(x, 0, z)
      const outward = position.clone().normalize()
      const euler = new THREE.Euler()
      const matrix = new THREE.Matrix4()
      matrix.lookAt(position, position.clone().add(outward), new THREE.Vector3(0, 1, 0))
      euler.setFromRotationMatrix(matrix)
      euler.z += Math.PI
      const textureIndex = i % textures.length
      imgs.push({
        position: [x, 0, z] as [number, number, number],
        rotation: [euler.x, euler.y, euler.z] as [number, number, number],
        textureIndex,
        url: GALLERY_IMAGES[textureIndex],
      })
    }
    return imgs
  }, [textures.length])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED_Y
    }
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position} scale={p.scale}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color={p.color} transparent opacity={PARTICLE_OPACITY} />
        </mesh>
      ))}
      {orbitingImages.map((img, i) => (
        <mesh
          key={`img-${i}`}
          position={img.position}
          rotation={img.rotation}
          onClick={(e) => { e.stopPropagation(); onImageClick?.(img.url); }}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = ""; }}
        >
          <planeGeometry args={[IMAGE_SIZE, IMAGE_SIZE]} />
          <meshBasicMaterial map={textures[img.textureIndex]} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}
