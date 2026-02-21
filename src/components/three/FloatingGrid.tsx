'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Animated floating grid plane with wave displacement.
 * Great for tech/data sections.
 */
function WavePlane({ color = '#FF6A00', speed = 0.4, isDark = true }: { color?: string; speed?: number; isDark?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const clock = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, 40, 40);
    geo.rotateX(-Math.PI * 0.45);
    return geo;
  }, []);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta * speed;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 2];
      arr[i * 3 + 1] = Math.sin(x * 0.5 + clock.current) * 0.3 + Math.cos(z * 0.4 + clock.current * 0.8) * 0.25;
    }
    pos.needsUpdate = true;
    inv();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -2, -5]}>
      <meshBasicMaterial color={color} wireframe transparent opacity={isDark ? 0.25 : 0.1} />
    </mesh>
  );
}

function FloatingCubes({ count = 20, color = '#FF6A00', isDark = true }: { count?: number; color?: string; isDark?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const cubes = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 5
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ),
      scale: 0.05 + Math.random() * 0.15,
      floatSpeed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    })),
  [count]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta;

    cubes.forEach((cube, i) => {
      const t = clock.current;
      dummy.position.set(
        cube.pos.x,
        cube.pos.y + Math.sin(t * cube.floatSpeed + cube.phase) * 0.5,
        cube.pos.z
      );
      dummy.rotation.set(
        t * cube.rotSpeed.x,
        t * cube.rotSpeed.y,
        t * cube.rotSpeed.z
      );
      dummy.scale.setScalar(cube.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.45 : 0.2} wireframe />
    </instancedMesh>
  );
}

interface FloatingGridProps {
  className?: string;
  color?: string;
  showCubes?: boolean;
}

export default function FloatingGrid({ className, color = '#FF6A00', showCubes = true }: FloatingGridProps) {
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
  const fogFar = isDark ? 38 : 26;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 5, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <WavePlane color={color} isDark={isDark} />
        {showCubes && <FloatingCubes count={18} color={color} isDark={isDark} />}
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      </Canvas>
    </div>
  );
}
