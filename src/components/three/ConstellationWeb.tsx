'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Interconnected node constellation — nodes drift slowly and
 * nearby nodes are linked with faint glowing lines.
 * Great for team / network / contact sections.
 */
function ConstellationNodes({ count = 40, color = '#FF6A00', connectionColor = '#00D9FF', connectionDistance = 3.5, isDark = true }: {
  count?: number; color?: string; connectionColor?: string; connectionDistance?: number; isDark?: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const nodes = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 6 - 2
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.05
      ),
      scale: 0.03 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
    })),
  [count]);

  // Pre-allocate line geometry for max connections
  const maxLines = count * 3; // avg ~3 connections per node
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const posArray = new Float32Array(maxLines * 2 * 3); // 2 vertices per segment, 3 floats each
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, [maxLines]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta;
    const t = clock.current;

    // Update node positions
    const currentPositions: THREE.Vector3[] = [];
    nodes.forEach((node, i) => {
      const px = node.pos.x + Math.sin(t * node.vel.x + node.phase) * 1.5;
      const py = node.pos.y + Math.cos(t * node.vel.y + node.phase) * 1.0;
      const pz = node.pos.z + Math.sin(t * node.vel.z) * 0.5;
      currentPositions.push(new THREE.Vector3(px, py, pz));

      dummy.position.set(px, py, pz);
      const pulse = 0.8 + Math.sin(t * 1.5 + node.phase) * 0.2;
      dummy.scale.setScalar(node.scale * pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update connections
    if (linesRef.current) {
      const posAttr = lineGeo.attributes.position;
      const arr = posAttr.array as Float32Array;
      let lineIdx = 0;

      for (let i = 0; i < count && lineIdx < maxLines; i++) {
        for (let j = i + 1; j < count && lineIdx < maxLines; j++) {
          const dist = currentPositions[i].distanceTo(currentPositions[j]);
          if (dist < connectionDistance) {
            const base = lineIdx * 6;
            arr[base] = currentPositions[i].x;
            arr[base + 1] = currentPositions[i].y;
            arr[base + 2] = currentPositions[i].z;
            arr[base + 3] = currentPositions[j].x;
            arr[base + 4] = currentPositions[j].y;
            arr[base + 5] = currentPositions[j].z;
            lineIdx++;
          }
        }
      }

      lineGeo.setDrawRange(0, lineIdx * 2);
      posAttr.needsUpdate = true;
    }
    inv();
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={isDark ? 0.8 : 0.4} />
      </instancedMesh>
      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial color={connectionColor} transparent opacity={isDark ? 0.25 : 0.1} />
      </lineSegments>
    </group>
  );
}

function PulsingCore({ color = '#FF6A00', isDark = true }: { color?: string; isDark?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock: c, invalidate: inv }) => {
    if (!ref.current) return;
    const t = c.elapsedTime;
    ref.current.rotation.y = t * 0.1;
    ref.current.rotation.z = t * 0.05;
    const scale = 0.4 + Math.sin(t * 0.8) * 0.05;
    ref.current.scale.setScalar(scale);
    inv();
  });

  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={isDark ? 0.2 : 0.06} />
    </mesh>
  );
}

interface ConstellationWebProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function ConstellationWeb({ className, primaryColor = '#FF6A00', secondaryColor = '#00D9FF' }: ConstellationWebProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fogColor = isDark ? '#000000' : '#ffffff';
  const fogNear = isDark ? 14 : 8;
  const fogFar = isDark ? 35 : 24;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <PulsingCore color={primaryColor} isDark={isDark} />
        <ConstellationNodes count={35} color={primaryColor} connectionColor={secondaryColor} connectionDistance={3.5} isDark={isDark} />
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      </Canvas>
    </div>
  );
}
