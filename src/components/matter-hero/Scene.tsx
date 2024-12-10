import { useMemo, useRef, useState } from 'react'
import { useBox, usePlane } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { useControls } from '@/components/matter-hero/use-controls'

const SHAPES = ['box', 'sphere', 'cylinder'] as const

function RandomShape({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  const { state } = useControls()
  const shape = useMemo(
    () => SHAPES[Math.floor(Math.random() * SHAPES.length)],
    []
  )
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
    ],
  }))

  useFrame(() => {
    api.applyForce([state.x * 50, state.y * 50, 0], [0, 0, 0])
  })

  return (
    <mesh ref={ref}>
      {shape === 'box' && <boxGeometry />}
      {shape === 'sphere' && <sphereGeometry />}
      {shape === 'cylinder' && <cylinderGeometry />}
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Plane({ color, ...props }) {
  const [ref] = usePlane(() => ({ ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function Scene() {
  const { viewport } = useThree()
  const [shapes, setShapes] = useState<JSX.Element[]>([])
  const { state } = useControls()

  useFrame(() => {
    if (shapes.length < state.blockCount) {
      const newShapes = []
      for (let i = shapes.length; i < state.blockCount; i++) {
        newShapes.push(
          <RandomShape
            key={i}
            position={[
              (Math.random() - 0.5) * viewport.width,
              viewport.height / 2 + Math.random() * 2,
              0,
            ]}
            color={`hsl(${Math.random() * 360}, 100%, 75%)`}
          />
        )
      }
      setShapes((prev) => [...prev, ...newShapes])
    } else if (shapes.length > state.blockCount) {
      setShapes((prev) => prev.slice(0, state.blockCount))
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Plane color="#cccccc" rotation={[-Math.PI / 2, 0, 0]} />
      {shapes}
    </>
  )
}
