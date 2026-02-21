'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Rising particle field — like data packets flowing upward. 
 * Great for contact pages and CTA sections.
 */
function RisingParticles({ count = 80, color = '#FF6A00', isDark = true }: { count?: number; color?: string; isDark?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 10 - 3,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * 20,
      scale: 0.015 + Math.random() * 0.035,
      wobble: 0.2 + Math.random() * 0.5,
    })),
  [count]);

  useFrame(({ clock: c, invalidate: inv }) => {
    if (!meshRef.current) return;
    const t = c.elapsedTime;

    particles.forEach((p, i) => {
      // Rising Y with loop
      const y = ((t * p.speed + p.phase) % 14) - 7;
      dummy.position.set(
        p.x + Math.sin(t * p.wobble + p.phase) * 0.3,
        y,
        p.z
      );
      // Fade at extremes
      const fadeFactor = 1 - Math.abs(y) / 7;
      dummy.scale.setScalar(p.scale * Math.max(fadeFactor, 0.1));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.65 : 0.3} />
    </instancedMesh>
  );
}

function GlowingLines({ count = 15, color = '#00D9FF', isDark = true }: { count?: number; color?: string; isDark?: boolean }) {
  const linesRef = useRef<THREE.Group>(null);

  const lineObjects = useMemo(() =>
    Array.from({ length: count }, () => {
      const points = [
        new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          -7,
          (Math.random() - 0.5) * 8 - 3
        ),
        new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          7,
          (Math.random() - 0.5) * 8 - 3
        ),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: isDark ? 0.1 : 0.03 });
      return new THREE.Line(geo, mat);
    }),
  [count, color]);

  return (
    <group ref={linesRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

interface ParticleRiseProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function ParticleRise({ className, primaryColor = '#FF6A00', secondaryColor = '#00D9FF' }: ParticleRiseProps) {
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
  const fogFar = isDark ? 30 : 20;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <RisingParticles count={70} color={primaryColor} isDark={isDark} />
        <RisingParticles count={30} color={secondaryColor} isDark={isDark} />
        <GlowingLines count={12} color={secondaryColor} isDark={isDark} />
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      </Canvas>
    </div>
  );
}
