import * as THREE from 'three';
import { ANIMATION_CONFIG } from './config';

export interface ParticleSystemOptions {
  count?: number;
  duration?: number;
  spread?: number;
  speed?: { min: number; max: number };
  gravity?: number;
  colors?: string[];
  position?: { x: number; y: number; z: number };
  size?: number;
}

export function createCelebrationParticles(
  container: HTMLElement,
  options: ParticleSystemOptions = {}
): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  particles: THREE.Points;
  animate: () => void;
  dispose: () => void;
} {
  const config = ANIMATION_CONFIG.particles.celebration;
  
  const particleCount = options.count ?? config.count;
  const duration = options.duration ?? config.duration;
  const spread = options.spread ?? config.spread;
  const speed = options.speed ?? config.speed;
  const gravity = options.gravity ?? config.gravity;
  const colors = options.colors ?? config.colors;
  const position = options.position ?? { x: 0, y: 0, z: 0 };
  const size = options.size ?? 2;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Particle geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors_array = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Random position at origin
    positions[i3] = position.x;
    positions[i3 + 1] = position.y;
    positions[i3 + 2] = position.z;

    // Random velocity
    const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
    const speedValue = Math.random() * (speed.max - speed.min) + speed.min;
    velocities[i3] = Math.cos(angle) * speedValue;
    velocities[i3 + 1] = Math.sin(angle) * speedValue;
    velocities[i3 + 2] = (Math.random() - 0.5) * speedValue * 0.5;

    // Random color
    const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
    colors_array[i3] = color.r;
    colors_array[i3 + 1] = color.g;
    colors_array[i3 + 2] = color.b;

    // Lifetime
    lifetimes[i] = Math.random() * duration;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3));

  // Particle material
  const material = new THREE.PointsMaterial({
    size: size,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Animation
  const startTime = Date.now();
  let animationId: number;

  const animate = () => {
    animationId = requestAnimationFrame(animate);

    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > duration) {
      cancelAnimationFrame(animationId);
      return;
    }

    const positions = geometry.attributes.position.array as Float32Array;
    const velocities_array = velocities;

    // Update particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update position
      positions[i3] += velocities_array[i3] * 0.01;
      positions[i3 + 1] += velocities_array[i3 + 1] * 0.01 - gravity * 0.0001;
      positions[i3 + 2] += velocities_array[i3 + 2] * 0.01;

      // Fade out over time
      const life = elapsed / duration;
      if (life > 0.5) {
        material.opacity = 1 - (life - 0.5) * 2;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  };

  const dispose = () => {
    cancelAnimationFrame(animationId);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };

  animate();

  return {
    scene,
    camera,
    renderer,
    particles,
    animate,
    dispose,
  };
}

export function createHoverParticles(
  container: HTMLElement,
  options: ParticleSystemOptions = {}
): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  particles: THREE.Points;
  animate: () => void;
  dispose: () => void;
} {
  const config = ANIMATION_CONFIG.particles.hover;
  
  return createCelebrationParticles(container, {
    count: options.count ?? config.count,
    duration: options.duration ?? config.duration,
    spread: options.spread ?? config.spread,
    speed: options.speed ?? config.speed,
    colors: options.colors ?? config.colors,
    size: options.size ?? 1,
    ...options,
  });
}

export function createSimpleParticleBurst(
  element: HTMLElement,
  options: {
    count?: number;
    colors?: string[];
    duration?: number;
  } = {}
) {
  const config = ANIMATION_CONFIG.particles.celebration;
  const count = options.count ?? 20;
  const colors = options.colors ?? config.colors;
  const duration = options.duration ?? 1;

  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';

    const angle = (Math.random() * 360) * (Math.PI / 180);
    const distance = Math.random() * 100 + 50;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    document.body.appendChild(particle);

    // Animate with CSS
    particle.animate(
      [
        {
          transform: 'translate(0, 0) scale(1)',
          opacity: 1,
        },
        {
          transform: `translate(${x}px, ${y}px) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: duration * 1000,
        easing: 'ease-out',
      }
    ).onfinish = () => {
      document.body.removeChild(particle);
    };
  }
}

