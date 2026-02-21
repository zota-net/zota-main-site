'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Slowly rotating torus rings with orbiting micro-particles.
 * Great for values / philosophy sections.
 */
function FloatingTorus({ radius = 2, tube = 0.02, color = '#FF6A00', speed = 0.15, position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number], isDark = true }: {
  radius?: number; tube?: number; color?: string; speed?: number; position?: [number, number, number]; rotation?: [number, number, number]; isDark?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ invalidate: inv }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.5;
    ref.current.rotation.y += delta * speed;
    inv();
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <torusGeometry args={[radius, tube, 12, 60]} />
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.45 : 0.18} />
    </mesh>
  );
}

function MicroParticles({ count = 80, color = '#00D9FF', spread = 10, isDark = true }: { count?: number; color?: string; spread?: number; isDark?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.7,
        (Math.random() - 0.5) * spread * 0.5 - 2
      ),
      speed: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      scale: 0.01 + Math.random() * 0.03,
    })),
  [count, spread]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta;

    particles.forEach((p, i) => {
      const t = clock.current;
      dummy.position.set(
        p.pos.x + Math.sin(t * p.speed + p.phase) * 0.3,
        p.pos.y + Math.cos(t * p.speed * 0.6 + p.phase) * 0.25,
        p.pos.z + Math.sin(t * p.speed * 0.3) * 0.15
      );
      const pulse = 0.7 + Math.sin(t * 2 + p.phase) * 0.3;
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.6 : 0.3} />
    </instancedMesh>
  );
}

interface TorusFieldProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function TorusField({ className, primaryColor = '#FF6A00', secondaryColor = '#00D9FF' }: TorusFieldProps) {
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
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        {/* Three nested torus rings at different tilts */}
        <FloatingTorus radius={3} tube={0.02} color={primaryColor} speed={0.12} rotation={[0.4, 0, 0]} isDark={isDark} />
        <FloatingTorus radius={4.5} tube={0.015} color={secondaryColor} speed={-0.08} rotation={[-0.6, 0.3, 0.2]} isDark={isDark} />
        <FloatingTorus radius={6} tube={0.012} color={primaryColor} speed={0.06} rotation={[0.8, -0.2, 0.4]} isDark={isDark} />

        {/* Ambient micro particles */}
        <MicroParticles count={60} color={secondaryColor} spread={12} isDark={isDark} />

        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      </Canvas>
    </div>
  );
}
