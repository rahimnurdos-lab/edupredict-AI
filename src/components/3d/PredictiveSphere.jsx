import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

// Points for the neural constellation connecting to the sphere
const generateNetworkPoints = (count, radius) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const r = radius * (0.5 + Math.random() * 0.5);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos((Math.random() * 2) - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    // Create random connections (Time Series / Data representation)
    const px = x + (Math.random() - 0.5) * 2;
    const py = y + (Math.random() - 0.5) * 2;
    const pz = z + (Math.random() - 0.5) * 2;
    
    points.push([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(px, py, pz)
    ]);
  }
  return points;
};

export const PredictiveSphere = () => {
  const sphereRef = useRef();
  const groupRef = useRef();
  
  // Data points indicating moving grades
  const networkLines = useMemo(() => generateNetworkPoints(30, 3.5), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Smooth idle animation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#007aff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#40c4ff" />
      
      {/* Central "Predictive" Core */}
      <Sphere ref={sphereRef} args={[2.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#f4f8ff"
          attach="material"
          distort={0.4} // Animation distortion
          speed={2} // Animation speed
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9} // Glass effect
          thickness={1.5}
        />
      </Sphere>

      {/* Floating Data Connections (Time Series visualization) */}
      {networkLines.map((linePair, i) => (
        <Line 
          key={i} 
          points={linePair}
          color="#007aff" 
          lineWidth={1.5}
          transparent
          opacity={0.4 + (Math.sin(i) * 0.2)}
        />
      ))}
      
      {/* Data nodes */}
      {networkLines.map((linePair, i) => (
         <mesh key={`node-${i}`} position={linePair[1]}>
           <sphereGeometry args={[0.08, 16, 16]} />
           <meshStandardMaterial color={i % 3 === 0 ? "#007aff" : "#80d8ff"} emissive={i % 3 === 0 ? "#007aff" : "#80d8ff"} emissiveIntensity={0.5} />
         </mesh>
      ))}

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </group>
  );
};
