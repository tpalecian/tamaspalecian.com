'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Html, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Matter from 'matter-js'
import * as THREE from 'three'
import { Pane } from 'tweakpane'

// SVG icons (you'll need to replace these with your actual SVG data)
const SVG_ICONS = {
  Bear: `<svg viewBox="0 0 100 100"><path d="M50 25 L25 75 L75 75 Z" /></svg>`,
  // Add other SVG icons here
}

const config = {
  debug: false,
  theme: 'system',
  x: 0,
  y: 0.25,
  lower: 1.2,
  upper: 5,
  stagger: 12,
  scale: 0.01,
  blockCount: 35,
  bounce: 0.5,
  random: true,
  device: false,
  xLimit: 0.2,
  yLimit: 0.2,
}

const PhysicsText = ({ text }) => {
  const [words, setWords] = useState([])
  const [blocks, setBlocks] = useState([])
  const engineRef = useRef(null)
  const sceneRef = useRef(null)
  const { size } = useThree()
  const mouseConstraintRef = useRef(null)

  const paneRef = useRef(null)

  useEffect(() => {
    // Initialize tweakpane
    paneRef.current = new Pane()
    const pane = paneRef.current

    pane.addBinding(config, 'debug')
    pane.addBinding(config, 'theme', {
      options: { System: 'system', Light: 'light', Dark: 'dark' },
    })
    // Add other config options to the pane...

    return () => pane.dispose()
  }, [])

  const createSVGTexture = (svgString) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const texture = new THREE.TextureLoader().load(url)
    URL.revokeObjectURL(url)
    return texture
  }

  const svgTextures = useMemo(() => {
    return Object.fromEntries(
      Object.entries(SVG_ICONS).map(([key, svg]) => [
        key,
        createSVGTexture(svg),
      ])
    )
  }, [])

  useEffect(() => {
    const engine = Matter.Engine.create()
    engine.gravity.x = config.x
    engine.gravity.y = config.y
    engine.gravity.scale = config.scale
    engineRef.current = engine

    const newWords = text.split(' ').map((word, index) => {
      const body = Matter.Bodies.rectangle(
        size.width / 2 + index * 100 - text.split(' ').length * 50,
        100,
        80,
        30,
        { isStatic: true, label: word }
      )
      Matter.Composite.add(engine.world, body)
      return body
    })
    setWords(newWords)

    const createBlocks = () => {
      const newBlocks = Array(config.blockCount)
        .fill()
        .map(() => {
          const scale = THREE.MathUtils.lerp(
            config.lower,
            config.upper,
            Math.random()
          )
          const body = Matter.Bodies.circle(
            Math.random() * size.width,
            Math.random() * size.height - size.height,
            10 * scale,
            {
              restitution: config.random ? Math.random() : config.bounce,
              friction: 0.001,
              scale,
              icon: Object.keys(SVG_ICONS)[
                Math.floor(Math.random() * Object.keys(SVG_ICONS).length)
              ],
            }
          )
          Matter.Composite.add(engine.world, body)
          return body
        })
      setBlocks(newBlocks)
    }

    createBlocks()

    const ground = Matter.Bodies.rectangle(
      size.width / 2,
      size.height - 10,
      size.width,
      20,
      { isStatic: true }
    )
    const leftWall = Matter.Bodies.rectangle(
      -10,
      size.height / 2,
      20,
      size.height,
      { isStatic: true }
    )
    const rightWall = Matter.Bodies.rectangle(
      size.width + 10,
      size.height / 2,
      20,
      size.height,
      { isStatic: true }
    )
    Matter.Composite.add(engine.world, [ground, leftWall, rightWall])

    const mouse = Matter.Mouse.create(document.body)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    Matter.Composite.add(engine.world, mouseConstraint)
    mouseConstraintRef.current = mouseConstraint

    paneRef.current.on('change', (ev) => {
      if (['x', 'y', 'scale'].includes(ev.presetKey)) {
        engine.gravity[ev.presetKey] = config[ev.presetKey]
      }
      if (ev.presetKey === 'blockCount') {
        createBlocks()
      }
    })

    return () => {
      Matter.Engine.clear(engine)
      Matter.Events.off(mouseConstraint)
    }
  }, [text, size, svgTextures])

  useFrame(() => {
    Matter.Engine.update(engineRef.current)
    if (sceneRef.current) {
      words.forEach((word, index) => {
        const mesh = sceneRef.current.getObjectByName(`word-${index}`)
        if (mesh) {
          mesh.position.set(
            word.position.x - size.width / 2,
            -word.position.y + size.height / 2,
            0
          )
        }
      })
      blocks.forEach((block, index) => {
        const mesh = sceneRef.current.getObjectByName(`block-${index}`)
        if (mesh) {
          mesh.position.set(
            block.position.x - size.width / 2,
            -block.position.y + size.height / 2,
            0
          )
          mesh.rotation.z = -block.angle
        }
      })
    }
  })

  return (
    <group ref={sceneRef}>
      {words.map((word, index) => (
        <Text key={index} name={`word-${index}`} fontSize={20} color="black">
          {word.label}
        </Text>
      ))}
      {blocks.map((block, index) => (
        <mesh key={index} name={`block-${index}`}>
          <planeGeometry args={[20 * block.scale, 20 * block.scale]} />
          <meshBasicMaterial
            map={svgTextures[block.icon]}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      {config.debug && (
        <Html>
          <div
            style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}
          >
            Debug Mode
          </div>
        </Html>
      )}
    </group>
  )
}

const App = () => {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ position: [0, 0, 500], fov: 50 }}
      onCreated={({ gl, events }) => {
        console.log(events, 'events')
        gl.setClearColor(new THREE.Color('#f0f0f0'))
        events.connect(document.getElementsByTagName('body')[0])
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <PhysicsText text="React Three Fiber with Matter.js" />
    </Canvas>
  )
}

export default App
