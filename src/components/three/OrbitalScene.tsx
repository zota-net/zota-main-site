'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Orbiting rings with glowing particles — great for CTA / trust sections.
 */
function OrbitalRing({ radius = 4, count = 60, color = '#FF6A00', speed = 0.3, tilt = 0, isDark = true }: {
  radius?: number; count?: number; color?: string; speed?: number; tilt?: number; isDark?: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      offset: (Math.random() - 0.5) * 0.4,
      scale: 0.02 + Math.random() * 0.04,
      phaseSpeed: 0.8 + Math.random() * 0.4,
    })),
  [count]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta * speed;

    particles.forEach((p, i) => {
      const angle = p.angle + clock.current;
      const r = radius + p.offset;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.sin(angle * 2 + clock.current) * 0.3;
      dummy.position.set(x, y, z);
      const pulse = 1 + Math.sin(clock.current * p.phaseSpeed + p.angle) * 0.4;
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={isDark ? 0.85 : 0.5} />
      </instancedMesh>
    </group>
  );
}

function CentralCore({ color = '#FF6A00', isDark = true }: { color?: string; isDark?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ invalidate: inv }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.2;
    ref.current.rotation.x += delta * 0.1;
    inv();
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.3 : 0.12} wireframe />
    </mesh>
  );
}

function AxialParticles({ count = 40, color = '#00D9FF', isDark = true }: { count?: number; color?: string; isDark?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8 - 2
      ),
      speed: 0.1 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      scale: 0.01 + Math.random() * 0.025,
    })),
  [count]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta;

    particles.forEach((p, i) => {
      const t = clock.current;
      dummy.position.set(
        p.pos.x + Math.sin(t * p.speed + p.phase) * 0.2,
        p.pos.y + Math.cos(t * p.speed * 0.7 + p.phase) * 0.15,
        p.pos.z
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.55 : 0.25} />
    </instancedMesh>
  );
}

interface OrbitalSceneProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function OrbitalScene({ className, primaryColor = '#FF6A00', secondaryColor = '#00D9FF' }: OrbitalSceneProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fogColor = isDark ? '#000000' : '#ffffff';
  const fogNear = isDark ? 12 : 6;
  const fogFar = isDark ? 32 : 22;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <CentralCore color={primaryColor} isDark={isDark} />
        <OrbitalRing radius={3} count={50} color={primaryColor} speed={0.3} tilt={0.3} isDark={isDark} />
        <OrbitalRing radius={5} count={40} color={secondaryColor} speed={-0.2} tilt={-0.5} isDark={isDark} />
        <OrbitalRing radius={7} count={30} color={primaryColor} speed={0.15} tilt={0.8} isDark={isDark} />
        <AxialParticles count={35} color={secondaryColor} isDark={isDark} />
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      </Canvas>
    </div>
  );
}
