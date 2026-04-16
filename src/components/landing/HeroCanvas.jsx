import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PredictiveSphere } from '../3d/PredictiveSphere';

export default function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <PredictiveSphere />
    </Canvas>
  );
}
