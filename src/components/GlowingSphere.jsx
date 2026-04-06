import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import './GlowingSphere.css'

// Custom shader for the glowing effect
const GlowingMaterial = ({ mousePosition }) => {
  const materialRef = useRef()
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor1: { value: new THREE.Color('#6366f1') }, // Indigo
    uColor2: { value: new THREE.Color('#ec4899') }, // Pink
    uColor3: { value: new THREE.Color('#06b6d4') }, // Cyan
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      // Smoothly interpolate mouse position
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mousePosition.x, mousePosition.y),
        0.1
      )
    }
  })

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec2 uMouse;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // Add some wave distortion based on mouse
      vec3 pos = position;
      float dist = length(uMouse);
      pos += normal * sin(pos.x * 3.0 + uTime) * 0.02 * (1.0 - dist * 0.5);
      pos += normal * cos(pos.y * 2.0 + uTime * 0.8) * 0.015 * (1.0 - dist * 0.5);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    
    void main() {
      // Create a dynamic gradient based on position and time
      float t = uTime * 0.3;
      
      // Mix colors based on position
      vec3 color = mix(uColor1, uColor2, sin(vPosition.x * 2.0 + t) * 0.5 + 0.5);
      color = mix(color, uColor3, cos(vPosition.y * 2.0 - t) * 0.5 + 0.5);
      
      // Add fresnel-like rim lighting
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      
      // Mouse interaction glow
      float mouseGlow = 1.0 - length(uMouse) * 0.5;
      color += fresnel * mouseGlow * 0.8;
      
      // Pulsing glow effect
      float pulse = sin(t * 2.0) * 0.1 + 0.9;
      color *= pulse;
      
      // Add sparkle effect
      float sparkle = pow(sin(vPosition.x * 20.0 + uTime * 3.0) * sin(vPosition.y * 20.0 - uTime * 2.0), 8.0);
      color += sparkle * 0.3;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
    />
  )
}

// The main sphere component
const GlowingSphere3D = ({ mousePosition }) => {
  const sphereRef = useRef()
  
  useFrame((state) => {
    if (sphereRef.current) {
      // Auto-rotate
      sphereRef.current.rotation.x += 0.003
      sphereRef.current.rotation.y += 0.005
      
      // Add slight wobble based on mouse
      const targetX = mousePosition.y * 0.3
      const targetY = mousePosition.x * 0.3
      sphereRef.current.rotation.x += (targetX - sphereRef.current.rotation.x) * 0.02
      sphereRef.current.rotation.z += (targetY - sphereRef.current.rotation.z) * 0.02
    }
  })

  return (
    <Sphere ref={sphereRef} args={[2, 64, 64]}>
      <GlowingMaterial mousePosition={mousePosition} />
    </Sphere>
  )
}

// Outer glow effect
const OuterGlow = ({ mousePosition }) => {
  const glowRef = useRef()
  
  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.002
      glowRef.current.rotation.x += 0.001
    }
  })

  return (
    <Sphere ref={glowRef} args={[2.3, 32, 32]}>
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  )
}

// Scene with lights and controls
const Scene = ({ mousePosition }) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#06b6d4" />
      
      <GlowingSphere3D mousePosition={mousePosition} />
      <OuterGlow mousePosition={mousePosition} />
      
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        autoRotate={false}
      />
    </>
  )
}

// Main component
function GlowingSphere() {
  const mousePosition = useRef({ x: 0, y: 0 })
  
  const handleMouseMove = (e) => {
    // Normalize mouse position to -1 to 1 range
    mousePosition.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    }
  }

  return (
    <div className="glowing-sphere-container" onMouseMove={handleMouseMove}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene mousePosition={mousePosition.current} />
      </Canvas>
      <div className="sphere-instructions">
        <p>Move your mouse to interact</p>
      </div>
    </div>
  )
}

export default GlowingSphere
