'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Spiraling DNA-like helix of particles — perfect for hero sections on About/Contact.
 */
function HelixStrand({ count = 120, color = '#FF6A00', radius = 2, speed = 0.3, reverse = false, isDark = true }: {
  count?: number; color?: string; radius?: number; speed?: number; reverse?: boolean; isDark?: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      t: (i / count) * Math.PI * 6, // 3 full rotations
      scale: 0.02 + Math.random() * 0.03,
      ySpread: (i / count) * 12 - 6, // -6 to 6 vertical
    })),
  [count]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta * speed;

    particles.forEach((p, i) => {
      const angle = p.t + clock.current * (reverse ? -1 : 1);
      dummy.position.set(
        Math.cos(angle) * radius,
        p.ySpread,
        Math.sin(angle) * radius
      );
      const pulse = 1 + Math.sin(clock.current * 2 + p.t) * 0.3;
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
      <meshBasicMaterial color={color} transparent opacity={isDark ? 0.75 : 0.4} />
    </instancedMesh>
  );
}

function ConnectorLines({ color = '#FF6A00', isDark = true }: { color?: string; isDark?: boolean }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const clock = useRef(0);

  const { geometry, pairCount } = useMemo(() => {
    const pairs = 30;
    const posArr = new Float32Array(pairs * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    return { geometry: geo, pairCount: pairs };
  }, []);

  useFrame(({ invalidate: inv }, delta) => {
    if (!linesRef.current) return;
    clock.current += delta * 0.3;

    const posArr = linesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pairCount; i++) {
      const t = (i / pairCount) * Math.PI * 6 + clock.current;
      const y = (i / pairCount) * 12 - 6;
      // Left helix point
      posArr[i * 6] = Math.cos(t) * 2;
      posArr[i * 6 + 1] = y;
      posArr[i * 6 + 2] = Math.sin(t) * 2;
      // Right helix point
      posArr[i * 6 + 3] = Math.cos(t + Math.PI) * 2;
      posArr[i * 6 + 4] = y;
      posArr[i * 6 + 5] = Math.sin(t + Math.PI) * 2;
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    inv();
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={isDark ? 0.18 : 0.06} />
    </lineSegments>
  );
}

interface DNAHelixProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function DNAHelix({ className, primaryColor = '#FF6A00', secondaryColor = '#00D9FF' }: DNAHelixProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fogColor = isDark ? '#000000' : '#ffffff';
  const fogNear = isDark ? 10 : 5;
  const fogFar = isDark ? 28 : 18;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [5, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <group rotation={[0.2, 0, 0.1]}>
          <HelixStrand count={100} color={primaryColor} radius={2} speed={0.3} isDark={isDark} />
          <HelixStrand count={100} color={secondaryColor} radius={2} speed={0.3} reverse isDark={isDark} />
          <ConnectorLines color={primaryColor} isDark={isDark} />
        </group>
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      </Canvas>
    </div>
  );
}
