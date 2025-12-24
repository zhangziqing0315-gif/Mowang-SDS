import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../constants';

// ---- Data Generation Logic ----

interface OrnamentData {
  id: number;
  treePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  scale: number;
  color: THREE.Color;
}

const generateOrnamentData = (count: number) => {
  const temp: OrnamentData[] = [];
  // Joyce Byers' Christmas Lights Palette (Rich & Varied)
  const colorPalette = [
      '#ff0033', // Red
      '#0088ff', // Blue
      '#ffcc00', // Yellow
      '#00ff66', // Green
      '#ffffff', // Cool White
      '#aa00ff', // Purple
      '#ff6600', // Orange
      '#ff0099', // Magenta
      '#00ffff', // Cyan
      '#ffdbb0', // Warm White
  ];

  const points: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / count; 
    
    // --- Tree Position (Clean Spiral for the Wire) ---
    // Height from top down or bottom up? Let's go bottom up (-2 to 4)
    // Actually top down might be better for wrapping, but bottom up is fine.
    // Let's make it tighter windings.
    const h = -2 + t * 6; // Height range
    const angle = t * Math.PI * 30; // More windings
    const rBase = 2.8 * (1 - (t * 0.85)); // Conical shape
    
    // Position on the ideal wire
    const tx = Math.cos(angle) * rBase;
    const tz = Math.sin(angle) * rBase;
    
    const treePos = new THREE.Vector3(tx, h, tz);
    points.push(treePos);
    
    // --- Scatter Position (Hive Mind Chaos) ---
    const sr = 6 + Math.random() * 8; 
    const sTheta = Math.random() * Math.PI * 2;
    const sPhi = Math.acos(2 * Math.random() - 1);
    
    const sx = sr * Math.sin(sPhi) * Math.cos(sTheta);
    const sy = sr * Math.sin(sPhi) * Math.sin(sTheta);
    const sz = sr * Math.cos(sPhi);

    // --- Scale ---
    const scale = 1.0; 

    // --- Color ---
    const hexColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    temp.push({
      id: i,
      treePos,
      scatterPos: new THREE.Vector3(sx, sy, sz),
      scale,
      color: new THREE.Color(hexColor)
    });
  }
  return { data: temp, points };
};

// ---- Wire Component ----

const Wire: React.FC<{ points: THREE.Vector3[], assembled: boolean }> = ({ points, assembled }) => {
    const curve = useMemo(() => {
        // Create a smooth curve from points
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    }, [points]);

    // Use TubeGeometry
    // We animate opacity.
    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state, delta) => {
        if(matRef.current) {
            const targetOp = assembled ? 0.6 : 0.0;
            matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOp, delta * 2);
            matRef.current.visible = matRef.current.opacity > 0.01;
        }
    })

    return (
        <mesh>
            <tubeGeometry args={[curve, 300, 0.03, 8, false]} />
            <meshBasicMaterial ref={matRef} color="#111111" transparent opacity={0.6} />
        </mesh>
    )
}

// ---- Instanced Bulbs ----

interface InstancedLayerProps {
  data: OrnamentData[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  assembled: boolean;
  dampSpeed: number; 
}

const InstancedLayer: React.FC<InstancedLayerProps> = ({ data, geometry, material, assembled, dampSpeed }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const currentPositions = useRef(data.map(d => d.treePos.clone())); 

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    let needsUpdate = false;

    data.forEach((item, i) => {
      // 1. Calculate Target
      const target = assembled ? item.treePos : item.scatterPos;
      const current = currentPositions.current[i];
      
      // 2. Physics / Movement
      const x = THREE.MathUtils.damp(current.x, target.x, dampSpeed, delta);
      const y = THREE.MathUtils.damp(current.y, target.y, dampSpeed, delta);
      const z = THREE.MathUtils.damp(current.z, target.z, dampSpeed, delta);
      
      current.set(x, y, z);
      
      // 3. Orientation
      dummy.position.copy(current);
      
      if (assembled) {
          // Point outward or hang down? C9 lights usually clip on or hang.
          // Let's make them point somewhat outward and up, classic tree style.
          // Look at center (0,y,0)
          dummy.lookAt(0, current.y, 0); 
          // Rotate so they point out (standard lookAt points +Z to target, we want +Y to point up? Or just orient geometry)
          // Let's assume geometry is Y-up.
          // If lookAt makes Z point to center, then X is tangent. 
          // We want the bulb (Y axis of mesh) to point OUT or UP.
          // Let's just point them randomly slightly to look natural "messy"
          dummy.rotation.x += Math.sin(i)*1;
          dummy.rotation.z += Math.cos(i)*1;
      } else {
          // Tumble in space
          dummy.rotation.set(
              time * 0.5 + i, 
              time * 0.3 + i, 
              time * 0.7 
          );
      }

      dummy.scale.setScalar(assembled ? 0.3 : 0.3); // Realistic small bulb size

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      needsUpdate = true;
    });

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  useEffect(() => {
     if (meshRef.current) {
         data.forEach((item, i) => {
             meshRef.current!.setColorAt(i, item.color);
         });
         meshRef.current.instanceColor!.needsUpdate = true;
     }
  }, [data]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
    >
        {/* We rely on instanceColor, so we don't pass color here */}
    </instancedMesh>
  );
};

export const Ornaments: React.FC<{ assembled: boolean }> = ({ assembled }) => {
  // Generate more bulbs for a dense string look
  const { data, points } = useMemo(() => generateOrnamentData(150), []);
  
  // Create a C9 Bulb shape
  // Cylinder base + Sphere top, merged? Or just a capsule-like geometry.
  // We can use a LatheGeometry to draw a perfect C9 profile.
  const geo = useMemo(() => {
      // C9 Profile points
      const points = [];
      // Socket
      points.push(new THREE.Vector2(0.15, 0));
      points.push(new THREE.Vector2(0.15, 0.3));
      // Bulb
      for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const angle = -Math.PI / 2 + t * Math.PI; // Half circle
          // Stretch the top to make it pointy
          const x = Math.cos(angle) * 0.3; 
          const y = 0.3 + Math.sin(angle) * 0.5 + (t * 0.4); // Elongate up
          if (x >= 0) points.push(new THREE.Vector2(x, y));
      }
      // Close top point
      points.push(new THREE.Vector2(0, 1.2));

      return new THREE.LatheGeometry(points, 16);
  }, []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
      roughness: 0.1, 
      metalness: 0.5,
      emissiveIntensity: 2.0, 
      toneMapped: false
  }), []);

  return (
    <group>
      <Wire points={points} assembled={assembled} />
      <InstancedLayer 
        data={data} 
        geometry={geo} 
        material={mat} 
        assembled={assembled} 
        dampSpeed={1.5} 
      />
    </group>
  );
};