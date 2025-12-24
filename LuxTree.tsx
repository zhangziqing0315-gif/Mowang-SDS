import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../constants';
import { Ornaments } from './Ornaments';
import { Foliage } from './Foliage';

// A dense cluster of teeth for the center of the star
const CentralMaw: React.FC = () => {
    return (
        <group position={[0, 0, 0.35]}>
             {/* THE VOID / BLACK HOLE */}
             {/* Adjusted depth (z: -0.8 -> -0.6) */}
             <mesh position={[0, 0, -0.6]}>
                {/* Increased size slightly (0.18 -> 0.25) to ensure it fills the throat at this depth */}
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshBasicMaterial color="#000000" toneMapped={false} />
             </mesh>
        </group>
    )
}

// A single petal for the "Demogorgon" Star
const Petal: React.FC<{ index: number }> = ({ index }) => {
    // 5 petals distributed around circle
    const angle = (index / 5) * Math.PI * 2;

    return (
        <group rotation={[0, 0, angle]}>
            <MovingPetalMesh />
        </group>
    )
}

const MovingPetalMesh: React.FC = () => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(ref.current) {
            const t = state.clock.elapsedTime * 1.5;
            // Open wider to show the black hole
            const openAngle = 0.7 + Math.sin(t) * 0.2; 
            ref.current.rotation.x = -openAngle; 
        }
    });
    
    return (
        <group ref={ref}>
            {/* The Petal Flesh - Made Fuller */}
            <mesh position={[0, 0.5, 0]}> 
                {/* Thicker cone for fleshy look */}
                <coneGeometry args={[0.35, 1.2, 8]} /> 
                <meshStandardMaterial 
                    color="#4a0a0a" 
                    emissive="#880000" 
                    emissiveIntensity={1} 
                    roughness={0.3}
                />
            </mesh>

            {/* The Teeth - Moved DOWN towards center and clustered tighter */}
            <group position={[0, 0.15, -0.12]} rotation={[-0.1, 0, 0]}>
                {/* Main row */}
                {Array.from({length: 9}).map((_, i) => (
                   <mesh key={i} position={[0, 0.05 + (i * 0.09), 0]} rotation={[-1.5, 0, 0]}>
                       <coneGeometry args={[0.025, 0.1, 4]} />
                       <meshStandardMaterial color="#ffffff" emissive="#666666" roughness={0.1} />
                   </mesh>
                ))}
                
                {/* Side teeth left */}
                {Array.from({length: 7}).map((_, i) => (
                   <mesh key={`l-${i}`} position={[-0.06, 0.1 + (i * 0.09), 0.04]} rotation={[-1.5, 0, -0.3]}>
                       <coneGeometry args={[0.02, 0.08, 4]} />
                       <meshStandardMaterial color="#ffffff" emissive="#666666" roughness={0.1} />
                   </mesh>
                ))}
                
                {/* Side teeth right */}
                 {Array.from({length: 7}).map((_, i) => (
                   <mesh key={`r-${i}`} position={[0.06, 0.1 + (i * 0.09), 0.04]} rotation={[-1.5, 0, 0.3]}>
                       <coneGeometry args={[0.02, 0.08, 4]} />
                       <meshStandardMaterial color="#ffffff" emissive="#666666" roughness={0.1} />
                   </mesh>
                ))}
            </group>
        </group>
    )
}

const DemogorgonStar: React.FC<{ assembled: boolean }> = ({ assembled }) => {
    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 4.5, 0]}>
            <group scale={1.2}>
                {/* The Central Maw with Black Hole */}
                <CentralMaw />
                
                {/* 5 Petals */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <Petal key={i} index={i} />
                ))}

                {/* The Red Rift Glow - Behind the black hole or radiating from it */}
                <pointLight 
                    distance={10} 
                    intensity={assembled ? 20 : 5} 
                    color={COLORS.TITLE_RED} 
                    decay={2}
                    position={[0, 0.5, 0]}
                />
            </group>
        </Float>
    )
}

const MicroWire: React.FC<{ points: THREE.Vector3[], assembled: boolean }> = ({ points, assembled }) => {
    // Create a smooth curve connecting the spiral points
    const curve = useMemo(() => {
        // Use centripetal catmullrom for better curve behavior around tight turns
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    }, [points]);

    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state, delta) => {
        if(matRef.current) {
            // Fade in/out logic
            const targetOp = assembled ? 0.4 : 0.0;
            matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOp, delta * 3);
            matRef.current.visible = matRef.current.opacity > 0.01;
        }
    })

    return (
        <mesh>
            {/* Very thin tube to represent micro wire */}
            <tubeGeometry args={[curve, 300, 0.008, 5, false]} />
            <meshBasicMaterial ref={matRef} color="#000000" transparent opacity={0.4} />
        </mesh>
    )
}

const SurroundingLights: React.FC<{ assembled: boolean }> = ({ assembled }) => {
  const count = 75; // Reduced from 150 to 75 as requested
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Data: Spiral Tree Position vs Scatter position
  const { data, currentPositions, treePoints } = useMemo(() => {
    const temp = [];
    const points: THREE.Vector3[] = [];
    
    // High saturation "Christmas / Rainbow" palette
    const palette = [
      '#FF0000', // Red
      '#FF8800', // Orange
      '#FFFF00', // Yellow
      '#00FF00', // Green
      '#00FFFF', // Cyan
      '#0000FF', // Blue
      '#9900FF', // Purple
      '#FF0080', // Hot Pink
    ];
    
    // Generate along a spiral so we can connect them with a wire
    const turns = 12; // How many times it wraps around
    const heightRange = 6; // From top to bottom roughly
    const topY = 4.0; 
    
    for(let i=0; i<count; i++) {
      const t = i / (count - 1); // 0 to 1
      
      // 1. Tree Position (Spiral)
      // Going from Top down looks nice for hanging lights
      const y = topY - (t * heightRange); 
      
      // Calculate radius based on cone shape approximation
      // Normalized height 0 (bottom) to 1 (top) relative to Foliage cone
      // Foliage is roughly -2 to 4.
      // Current y is 4 down to -2.
      const hNorm = (y + 2) / 6; 
      const rBase = 2.8 * (1 - Math.max(0, hNorm * 0.9)); // Cone radius
      
      const angle = t * Math.PI * 2 * turns;
      
      // Add slight noise so it looks like a natural drape, not perfect math
      const r = rBase * (0.95 + Math.random() * 0.1); 
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      const treePos = new THREE.Vector3(x, y, z);
      points.push(treePos);

      // 2. Scatter Position
      const sr = 8 + Math.random() * 8;
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      const sx = sr * Math.sin(sPhi) * Math.cos(sTheta);
      const sy = sr * Math.sin(sPhi) * Math.sin(sTheta);
      const sz = sr * Math.cos(sPhi);
      const scatterPos = new THREE.Vector3(sx, sy, sz);

      // Distinct Color Logic
      const colorHex = palette[Math.floor(Math.random() * palette.length)];
      const color = new THREE.Color(colorHex);
      
      // High intensity multiplier for GLOW
      color.multiplyScalar(3.0); 

      temp.push({
        treePos,
        scatterPos,
        color: color,
        scale: Math.random() * 0.5 + 0.5,
      });
    }

    // Initialize current positions array
    const currPos = temp.map(d => d.scatterPos.clone()); 

    return { data: temp, currentPositions: currPos, treePoints: points };
  }, []);

  // We use a Ref to store current positions to avoid re-calculating useMemo every frame if we used state
  const positionsRef = useRef(currentPositions);

  useFrame((state, delta) => {
    if(!meshRef.current) return;
    
    let needsUpdate = false;

    data.forEach((d, i) => {
       const target = assembled ? d.treePos : d.scatterPos;
       const current = positionsRef.current[i];

       // Smooth transition
       current.lerp(target, delta * 2.0);

       dummy.position.copy(current);
       // Slightly smaller size for these micro-lights - Reduced to 0.03 (half of previous 0.06)
       dummy.scale.setScalar(0.03 * d.scale); 
       dummy.updateMatrix();
       meshRef.current!.setMatrixAt(i, dummy.matrix);
       needsUpdate = true;
    });

    if (needsUpdate) {
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  useLayoutEffect(() => {
     if(meshRef.current) {
         data.forEach((d, i) => {
             meshRef.current!.setColorAt(i, d.color);
         });
         meshRef.current.instanceColor!.needsUpdate = true;
     }
  }, [data]);

  return (
      <group>
          {/* The connecting wire */}
          <MicroWire points={treePoints} assembled={assembled} />

          {/* The bulbs */}
          <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial toneMapped={false} />
          </instancedMesh>
      </group>
  )
}

export const LuxTree: React.FC<{ assembled: boolean }> = ({ assembled }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Eerie hovering
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 - 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={[0.75, 0.75, 0.75]}>
      <DemogorgonStar assembled={assembled} />
      
      {/* Shift tree body down to avoid clipping with the star. Modified from -0.8 to -0.3 as requested (+0.5) */}
      <group position={[0, -0.3, 0]}>
        {/* Dark shadow foliage */}
        <Foliage assembled={assembled} />
        
        {/* Static faint lights on tree body with wire */}
        <SurroundingLights assembled={assembled} />

        {/* Neon Lights */}
        <Ornaments assembled={assembled} />
      </group>
    </group>
  );
};