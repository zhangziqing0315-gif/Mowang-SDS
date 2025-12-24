import React from 'react';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SETTINGS } from '../constants';

export const Effects: React.FC = () => {
  return (
    <EffectComposer>
      {/* 80s Neon Bloom */}
      <Bloom 
        luminanceThreshold={0.8} 
        mipmapBlur 
        intensity={SETTINGS.bloomIntensity} 
        radius={SETTINGS.bloomRadius}
      />
      
      {/* Removed Noise as requested */}
      
      {/* VHS Color Shift */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.002, 0.002)} // Reduced slightly for clarity
        radialModulation={false}
        modulationOffset={0}
      />
      
      {/* Dark corners for horror vibe */}
      <Vignette eskil={false} offset={0.1} darkness={1.3} />
    </EffectComposer>
  );
};