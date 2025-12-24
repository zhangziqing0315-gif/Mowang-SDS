import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../constants';

const vertexShader = `
  uniform float uTime;
  uniform float uMorph; 
  
  attribute vec3 aScatterPos;
  attribute float aSize;
  attribute float aRandom;
  
  varying float vRandom;
  varying float vAlpha;

  void main() {
    vRandom = aRandom;
    
    vec3 currentPos = mix(aScatterPos, position, uMorph);
    
    // Slithering movement (Vines/Tentacles)
    float time = uTime * 0.5;
    
    vec3 noise = vec3(
        sin(time + currentPos.y),
        cos(time + currentPos.x * 0.5),
        sin(time + currentPos.z * 0.5)
    );

    vec3 finalPos = currentPos + (noise * 0.1);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Scale particles
    gl_PointSize = aSize * (150.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  uniform vec3 uColorMain;
  
  varying float vRandom;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Smoky/Webby texture
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Dark colors (Black/Dark Blue)
    vec3 color = uColorMain * (0.2 + 0.8 * vRandom);
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;

interface FoliageProps {
  assembled: boolean;
}

export const Foliage: React.FC<FoliageProps> = ({ assembled }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const uniforms = useRef({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    // Dark blue-grey for the "Shadow Monster" / Vines look
    uColorMain: { value: new THREE.Color('#1a1a2e') }, 
  });

  const count = 5000; 
  const { positions, scatterPositions, sizes, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scat = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const rnd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        // Tree Shape - Dense dark core
        const h = Math.random(); 
        const y = -2 + h * 6;
        const radiusAtHeight = 3.0 * (1 - Math.pow(h, 0.7));
        const theta = Math.random() * Math.PI * 2;
        const r = radiusAtHeight * Math.sqrt(Math.random());

        pos[i * 3] = r * Math.cos(theta);
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = r * Math.sin(theta);

        // Scatter Shape - Everywhere
        const sr = 10 + Math.random() * 5; 
        const sTheta = Math.random() * Math.PI * 2;
        const sPhi = Math.acos(2 * Math.random() - 1);
        
        scat[i * 3] = sr * Math.sin(sPhi) * Math.cos(sTheta);
        scat[i * 3 + 1] = sr * Math.sin(sPhi) * Math.sin(sTheta);
        scat[i * 3 + 2] = sr * Math.cos(sPhi);

        sz[i] = Math.random() * 0.5 + 0.2; 
        rnd[i] = Math.random(); 
    }

    return {
        positions: pos,
        scatterPositions: scat,
        sizes: sz,
        randoms: rnd
    };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
        uniforms.current.uTime.value = state.clock.elapsedTime;
        
        const targetMorph = assembled ? 1.0 : 0.0;
        uniforms.current.uMorph.value = THREE.MathUtils.damp(
            uniforms.current.uMorph.value, 
            targetMorph, 
            1.5, 
            delta
        );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPos" count={count} array={scatterPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial 
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
      />
    </points>
  );
};