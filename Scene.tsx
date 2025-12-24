import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei';
import { LuxTree } from './LuxTree';
import { Effects } from './Effects';
import { COLORS } from '../constants';
import { SceneProps } from '../types';

export const Scene: React.FC<SceneProps> = ({ assembled }) => {
  return (
    <Canvas
      dpr={[1, 2]} 
      gl={{ antialias: false, toneMappingExposure: 0.9 }} 
      shadows
      camera={{ position: [0, 1, 9], fov: 50 }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={[COLORS.VOID_DARK]} />
        <fog attach="fog" args={[COLORS.VOID_FOG, 5, 25]} />

        {/* Lights - Moody and Eerie */}
        <ambientLight intensity={0.2} color="#445588" /> {/* Cool blue ambient (Upside Down) */}
        
        {/* The Red Rift Light */}
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={15} 
          castShadow 
          color="#ff3300"
        />
        
        {/* Backlight for silhouette */}
        <pointLight position={[-5, 2, -10]} intensity={5} color="#0044ff" />

        {/* Main Content - Moved down to -1.8 to avoid text overlap */}
        <group position={[0, -1.8, 0]}>
            <LuxTree assembled={assembled} />
        </group>

        {/* Floating Ash/Spores (The Upside Down particles) */}
        <Sparkles 
            count={300}
            scale={15}
            size={4}
            speed={0.4}
            opacity={0.5}
            color={COLORS.SPORE}
        />

        {/* Ground Reflections */}
        <ContactShadows 
            resolution={512} 
            scale={50} 
            blur={3} 
            opacity={0.4} 
            far={10} 
            color="#000000" 
        />
        
        {/* Post Processing */}
        <Effects />

        {/* Controls */}
        <OrbitControls 
            enablePan={false} 
            autoRotate={assembled} 
            autoRotateSpeed={0.3} 
            minPolarAngle={Math.PI / 2.5} 
            maxPolarAngle={Math.PI / 1.8}
            maxDistance={12}
            minDistance={4}
        />
      </Suspense>
    </Canvas>
  );
};