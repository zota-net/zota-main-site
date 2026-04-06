'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

// Animated particle network node system
function NetworkNodes({ count = 100, mousePos }: { count?: number; mousePos: { x: number; y: number } }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20 - 5
      ),
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      scale: 0.03 + Math.random() * 0.06,
      pulseSpeed: 0.5 + Math.random() * 2,
    }));
  }, [count]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta;

    particles.forEach((particle, i) => {
      const t = clock.current;
      dummy.position.set(
        particle.position.x + Math.sin(t * particle.speed + particle.phase) * 0.3 + mousePos.x * 0.5,
        particle.position.y + Math.cos(t * particle.speed * 0.7 + particle.phase) * 0.2 + mousePos.y * 0.5,
        particle.position.z + Math.sin(t * 0.3 + particle.phase) * 0.5
      );
      const pulse = 1 + Math.sin(t * particle.pulseSpeed + particle.phase) * 0.3;
      dummy.scale.setScalar(particle.scale * pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#FF6A00" transparent opacity={0.7} />
    </instancedMesh>
  );
}

// Signal lines connecting nearby nodes
function SignalLines({ mousePos }: { mousePos: { x: number; y: number } }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const clock = useRef(0);

  const { positions, connections } = useMemo(() => {
    const nodes = Array.from({ length: 80 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 5
      ),
      speed: 0.15 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const conns: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < 8) {
          conns.push([i, j]);
        }
      }
    }

    return { positions: nodes, connections: conns };
  }, []);

  useFrame(({ invalidate: inv }, delta) => {
    if (!linesRef.current) return;
    clock.current += delta;

    const geo = linesRef.current.geometry;
    const posArr = geo.attributes.position.array as Float32Array;
    const colorArr = geo.attributes.color.array as Float32Array;

    connections.forEach((conn, idx) => {
      const [a, b] = conn;
      const t = clock.current;

      const ax = positions[a].pos.x + Math.sin(t * positions[a].speed + positions[a].phase) * 0.3 + mousePos.x * 0.3;
      const ay = positions[a].pos.y + Math.cos(t * positions[a].speed * 0.7) * 0.2 + mousePos.y * 0.3;
      const az = positions[a].pos.z + Math.sin(t * 0.3 + positions[a].phase) * 0.3;

      const bx = positions[b].pos.x + Math.sin(t * positions[b].speed + positions[b].phase) * 0.3 + mousePos.x * 0.3;
      const by = positions[b].pos.y + Math.cos(t * positions[b].speed * 0.7) * 0.2 + mousePos.y * 0.3;
      const bz = positions[b].pos.z + Math.sin(t * 0.3 + positions[b].phase) * 0.3;

      posArr[idx * 6] = ax;
      posArr[idx * 6 + 1] = ay;
      posArr[idx * 6 + 2] = az;
      posArr[idx * 6 + 3] = bx;
      posArr[idx * 6 + 4] = by;
      posArr[idx * 6 + 5] = bz;

      // Pulse color along lines
      const pulse = (Math.sin(t * 2 + idx * 0.1) + 1) * 0.5;
      const r = 1;
      const g = 0.4 + pulse * 0.2;
      const bCol = pulse * 0.1;
      const alpha = 0.1 + pulse * 0.15;

      colorArr[idx * 6] = r * alpha;
      colorArr[idx * 6 + 1] = g * alpha;
      colorArr[idx * 6 + 2] = bCol * alpha;
      colorArr[idx * 6 + 3] = r * alpha;
      colorArr[idx * 6 + 4] = g * alpha;
      colorArr[idx * 6 + 5] = bCol * alpha;
    });

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    inv();
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(connections.length * 6);
    const colorArr = new Float32Array(connections.length * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
    return geo;
  }, [connections.length]);

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.6} />
    </lineSegments>
  );
}

// Floating data packets
function DataPackets({ count = 40, mousePos }: { count?: number; mousePos: { x: number; y: number } }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);

  const packets = useMemo(() => {
    return Array.from({ length: count }, () => ({
      startPos: new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10 - 5
      ),
      direction: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5)
      ).normalize(),
      speed: 1 + Math.random() * 3,
      offset: Math.random() * 100,
      size: 0.02 + Math.random() * 0.03,
    }));
  }, [count]);

  useFrame(({ invalidate: inv }, delta) => {
    if (!meshRef.current) return;
    clock.current += delta;

    packets.forEach((p, i) => {
      const t = (clock.current * p.speed + p.offset) % 20 - 10;
      dummy.position.set(
        p.startPos.x + p.direction.x * t + mousePos.x * 0.2,
        p.startPos.y + p.direction.y * t + mousePos.y * 0.2,
        p.startPos.z + p.direction.z * t
      );
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    inv();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#00D9FF" transparent opacity={0.5} />
    </instancedMesh>
  );
}

// Camera auto-animation
function CameraRig() {
  const { camera } = useThree();
  const clock = useRef(0);

  useFrame(({ invalidate: inv }, delta) => {
    clock.current += delta;
    camera.position.x = Math.sin(clock.current * 0.1) * 0.5;
    camera.position.y = Math.cos(clock.current * 0.08) * 0.3;
    camera.lookAt(0, 0, -5);
    inv();
  });

  return null;
}

interface NetworkSceneProps {
  className?: string;
  mousePos?: { x: number; y: number };
}

export default function NetworkScene({ className, mousePos = { x: 0, y: 0 } }: NetworkSceneProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fogColor = isDark ? '#000000' : '#ffffff';

  return (
    <div className={className}>
      <Canvas
        key="network-canvas"
        camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />
        <NetworkNodes count={180} mousePos={mousePos} />
        <SignalLines mousePos={mousePos} />
        <DataPackets count={35} mousePos={mousePos} />
        <CameraRig />
        <fog attach="fog" args={[fogColor, 15, 40]} />
      </Canvas>
    </div>
  );
}
