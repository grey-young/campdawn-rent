<script setup lang="ts">
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(defineProps<{ trigger?: string }>(), { trigger: '' })

const host = ref<HTMLDivElement | null>(null)
const ready = ref(false)
const intro = useState('introDone', () => false)

let stop: (() => void) | null = null
let enter: gsap.core.Timeline | null = null
let waiting: ReturnType<typeof setTimeout> | undefined

/** Lets the gear fly in. Called once, whichever signal arrives first. */
const play = () => {
  clearTimeout(waiting)
  enter?.play()
}

watch(intro, (v) => v && play())

const bgVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`

const bgFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;
  uniform float uScroll;
  uniform vec3  cA;
  uniform vec3  cB;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0);
    float t = uTime * 0.045;

    vec2 warp = vec2(
      fbm(p * 1.5 + vec2(t, -t * 0.6)),
      fbm(p * 1.5 + vec2(3.4, 1.9) - vec2(t * 0.8, t))
    );

    float f = fbm(p * 2.1 + warp * 1.5 + uMouse * 0.22 + vec2(0.0, uScroll * 0.5));

    vec3 col = vec3(0.004, 0.005, 0.009);
    col = mix(col, cB * 0.46, smoothstep(0.32, 0.9, f) * 0.86);
    col = mix(col, cA * 0.26, smoothstep(0.6, 1.0, f * f) * 0.4);

    float horizon = exp(-abs(p.y + 0.32) * 3.4);
    col += cB * horizon * 0.1;
    col += cA * exp(-abs(p.y + 0.55) * 9.0) * 0.05;

    float vig = smoothstep(1.35, 0.16, length(p * vec2(0.85, 1.15)));
    col *= mix(0.14, 1.0, vig);

    col += (hash(uv * uRes + fract(t)) - 0.5) * 0.006;

    gl_FragColor = vec4(col, 1.0);
  }
`

function softSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = grd
  x.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function build(mount: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  const dpr = Math.min(window.devicePixelRatio, 1.75)
  renderer.setPixelRatio(dpr)
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
  mount.appendChild(renderer.domElement)

  /* ---------- main scene ---------- */
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0a0d18, 0.028)

  /* ---------- backdrop quad, drawn before everything ---------- */
  const bgUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    cA: { value: new THREE.Color('#f8c93f') },
    cB: { value: new THREE.Color('#4327a8') }
  }
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: bgVert,
      fragmentShader: bgFrag,
      uniforms: bgUniforms,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false
    })
  )
  backdrop.frustumCulled = false
  backdrop.renderOrder = -999
  scene.add(backdrop)

  const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 120)
  camera.position.set(0, 0.35, 9)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envRT.texture
  scene.environmentIntensity = 1.0

  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(4, 6, 5)
  scene.add(key)

  const rimLight = new THREE.DirectionalLight(0xdfe9ff, 1.7)
  rimLight.position.set(-5, 2, -6)
  scene.add(rimLight)

  const ionLight = new THREE.PointLight(0xf8c93f, 46, 26, 2)
  ionLight.position.set(-3.4, 1.6, 2.4)
  scene.add(ionLight)

  const voltLight = new THREE.PointLight(0x7c5cff, 58, 28, 2)
  voltLight.position.set(3.6, -1.4, 1.6)
  scene.add(voltLight)

  scene.add(new THREE.AmbientLight(0x39435f, 1.0))

  const world = new THREE.Group()
  scene.add(world)

  /* ---------- floor grid ---------- */
  const grid = new THREE.GridHelper(60, 60, 0x7c5cff, 0x1b2030)
  const gm = grid.material as THREE.Material & { opacity: number; transparent: boolean }
  gm.transparent = true
  gm.opacity = 0.34
  grid.position.set(0, -3.1, -6)
  world.add(grid)

  /* ---------- portal rings ---------- */
  const ringGroup = new THREE.Group()
  ringGroup.position.z = -3.2
  world.add(ringGroup)

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.016, 12, 220),
    new THREE.MeshBasicMaterial({
      color: 0xf8c93f,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      fog: false
    })
  )
  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(3.85, 0.01, 12, 220),
    new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      fog: false
    })
  )
  const ringC = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.006, 10, 180),
    new THREE.MeshBasicMaterial({
      color: 0x4de8ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      fog: false
    })
  )
  ringGroup.add(ringA, ringB, ringC)

  /* ---------- floating gear ---------- */
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0x333d52,
    metalness: 0.8,
    roughness: 0.26,
    envMapIntensity: 1.35,
    clearcoat: 1,
    clearcoatRoughness: 0.12
  })

  const pale = new THREE.MeshPhysicalMaterial({
    color: 0x99a4b8,
    metalness: 0.45,
    roughness: 0.34,
    envMapIntensity: 1.05,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  })

  const lit = new THREE.MeshStandardMaterial({
    color: 0x0d1118,
    emissive: 0xf8c93f,
    emissiveIntensity: 2.1,
    metalness: 0.7,
    roughness: 0.3
  })

  const violet = new THREE.MeshPhysicalMaterial({
    color: 0x6a4dff,
    metalness: 0.2,
    roughness: 0.08,
    envMapIntensity: 2.1,
    transparent: true,
    opacity: 0.72,
    clearcoat: 1
  })

  type Floater = {
    mesh: THREE.Object3D
    home: THREE.Vector3
    spin: THREE.Vector3
    amp: number
    phase: number
    depth: number
    /** Nought parked out in the dark, one settled at home. */
    lands: { v: number }
  }

  const floaters: Floater[] = []
  const disposables: Array<{ dispose: () => void }> = [
    chrome,
    pale,
    lit,
    violet,
    ringA.geometry,
    ringB.geometry,
    ringC.geometry,
    ringA.material as THREE.Material,
    ringB.material as THREE.Material,
    ringC.material as THREE.Material
  ]

  const add = (
    mesh: THREE.Object3D,
    pos: [number, number, number],
    spin: [number, number, number],
    amp: number,
    depth: number
  ) => {
    mesh.position.set(...pos)
    world.add(mesh)
    floaters.push({
      mesh,
      home: mesh.position.clone(),
      spin: new THREE.Vector3(...spin),
      amp,
      phase: Math.random() * Math.PI * 2,
      depth,
      lands: { v: reduced ? 1 : 0 }
    })
    return mesh
  }

  // console slab
  const slabGeo = new RoundedBoxGeometry(0.9, 2.05, 0.42, 6, 0.1)
  disposables.push(slabGeo)
  const slab = new THREE.Group()
  const slabCore = new THREE.Mesh(slabGeo, chrome)
  const finGeo = new RoundedBoxGeometry(0.16, 2.2, 0.62, 5, 0.07)
  disposables.push(finGeo)
  const finL = new THREE.Mesh(finGeo, pale)
  finL.position.x = -0.5
  const finR = new THREE.Mesh(finGeo, pale)
  finR.position.x = 0.5
  const stripGeo = new RoundedBoxGeometry(0.05, 1.6, 0.05, 3, 0.02)
  disposables.push(stripGeo)
  const strip = new THREE.Mesh(stripGeo, lit)
  strip.position.z = 0.22
  slab.add(slabCore, finL, finR, strip)
  slab.scale.setScalar(1.05)
  add(slab, [3.35, 0.55, 0.1], [0.0006, 0.0042, 0.0011], 0.34, 1)

  // cube console
  const cubeGeo = new RoundedBoxGeometry(1.05, 1.5, 1.05, 7, 0.14)
  disposables.push(cubeGeo)
  const cube = new THREE.Mesh(cubeGeo, chrome)
  add(cube, [1.75, -1.75, 0.6], [0.0011, -0.0035, 0.0007], 0.4, 0.85)

  // screen panel
  const panelGeo = new RoundedBoxGeometry(2.5, 1.45, 0.07, 5, 0.035)
  disposables.push(panelGeo)
  const panel = new THREE.Mesh(panelGeo, chrome)
  const faceGeo = new THREE.PlaneGeometry(2.34, 1.3)
  disposables.push(faceGeo)
  const faceMat = new THREE.MeshBasicMaterial({ color: 0x7ad63f, transparent: true, opacity: 0.34 })
  disposables.push(faceMat)
  const face = new THREE.Mesh(faceGeo, faceMat)
  face.position.z = 0.04
  const screen = new THREE.Group()
  screen.add(panel, face)
  screen.rotation.set(0.1, -0.5, 0.05)
  add(screen, [4.55, 2.05, -1.7], [0.0004, 0.0016, -0.0004], 0.28, 0.6)

  // orb
  const orbGeo = new THREE.IcosahedronGeometry(0.62, 3)
  disposables.push(orbGeo)
  add(new THREE.Mesh(orbGeo, violet), [4.1, -0.35, 1.5], [0.002, 0.003, 0.001], 0.5, 1.15)

  // small chips
  const chipGeo = new RoundedBoxGeometry(0.46, 0.46, 0.46, 5, 0.09)
  disposables.push(chipGeo)
  add(new THREE.Mesh(chipGeo, lit), [2.3, 1.95, 1.8], [0.005, 0.004, 0.003], 0.55, 1.3)
  add(new THREE.Mesh(chipGeo, pale), [-4.3, 2.15, -1.4], [0.003, -0.005, 0.002], 0.45, 0.7)
  add(new THREE.Mesh(chipGeo, chrome), [5.4, -1.6, 1.1], [-0.004, 0.003, 0.005], 0.6, 1.2)

  // torus ring prop
  const knotGeo = new THREE.TorusGeometry(0.55, 0.16, 20, 90)
  disposables.push(knotGeo)
  const knot = new THREE.Mesh(knotGeo, chrome)
  knot.rotation.set(0.6, 0.3, 0)
  add(knot, [-4.6, -1.5, -1.2], [0.003, 0.004, 0.0016], 0.36, 0.7)

  /* ---------- dust ---------- */
  const COUNT = 900
  const dustPos = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 26
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 15
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 22 - 3
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const sprite = softSprite()
  const dustMat = new THREE.PointsMaterial({
    size: 0.07,
    map: sprite,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xd6e6ff,
    sizeAttenuation: true
  })
  const dust = new THREE.Points(dustGeo, dustMat)
  world.add(dust)
  disposables.push(dustGeo, dustMat, sprite)

  /* ---------- post processing ---------- */
  const composer = new EffectComposer(renderer)
  composer.setPixelRatio(dpr)
  composer.setSize(mount.clientWidth, mount.clientHeight)
  composer.addPass(new RenderPass(scene, camera))

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(mount.clientWidth, mount.clientHeight),
    0.46,
    0.34,
    0.97
  )
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  /* ---------- interaction state ---------- */
  const pointer = { x: 0, y: 0 }
  const eased = { x: 0, y: 0 }
  const scrollState = { p: 0 }

  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  /* ---------- intro ----------
     Built paused and held back until the preloader lifts its curtain. The scene
     itself boots the moment the page does, so the shaders are compiled and the
     first frames are already drawn by the time anyone can see them, but nothing
     flies in until there is somebody watching it happen.

     The float in the render loop rewrites every position each frame, so the
     arrival rides on `lands` and is folded into that maths rather than fighting
     it with a tween of its own. */
  world.scale.setScalar(reduced ? 1 : 0.82)

  enter = gsap.timeline({ paused: true })

  if (!reduced) {
    floaters.forEach((f, i) => {
      const at = 0.28 + i * 0.075
      enter.to(f.lands, { v: 1, duration: 2.4, ease: 'swift' }, at)
      enter.from(f.mesh.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1.9, ease: 'swift' }, at)
    })

    enter.to(world.scale, { x: 1, y: 1, z: 1, duration: 2.6, ease: 'swift' }, 0)
    enter.from(ringGroup.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 2.2, ease: 'swift' }, 0.1)
    enter.from([ringA.material, ringB.material, ringC.material], { opacity: 0, duration: 1.6 }, 0.2)
  }

  /* ---------- scroll link ---------- */
  let st: ScrollTrigger | null = null
  if (props.trigger && !reduced) {
    st = ScrollTrigger.create({
      trigger: props.trigger,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        scrollState.p = self.progress
      }
    })
  }

  /* ---------- render loop ---------- */
  let raf = 0
  let visible = true
  const t0 = performance.now()

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = !!entry?.isIntersecting
    },
    { threshold: 0 }
  )
  io.observe(mount)

  const render = () => {
    raf = requestAnimationFrame(render)
    if (!visible) return

    const t = (performance.now() - t0) / 1000
    const p = scrollState.p

    eased.x += (pointer.x - eased.x) * 0.045
    eased.y += (pointer.y - eased.y) * 0.045

    bgUniforms.uTime.value = t
    bgUniforms.uMouse.value.set(eased.x, eased.y)
    bgUniforms.uScroll.value = p

    floaters.forEach((f, i) => {
      const m = f.mesh
      const away = 1 - f.lands.v
      m.rotation.x += f.spin.x
      m.rotation.y += f.spin.y
      m.rotation.z += f.spin.z
      m.position.y = f.home.y + Math.sin(t * 0.55 + f.phase) * f.amp - away * 3
      m.position.x = f.home.x + Math.cos(t * 0.36 + f.phase) * f.amp * 0.42
      // depth aware pointer parallax
      m.position.x += eased.x * f.depth * 0.62
      m.position.y += -eased.y * f.depth * 0.36
      m.position.z = f.home.z + (i % 2 === 0 ? Math.sin(t * 0.3 + f.phase) * 0.4 : 0) - away * 14
    })

    ringGroup.rotation.z = t * 0.06
    ringA.rotation.z = -t * 0.16
    ringB.rotation.z = t * 0.11
    ringC.rotation.z = -t * 0.24

    dust.rotation.y = t * 0.012
    dust.position.y = Math.sin(t * 0.15) * 0.4

    ionLight.position.x = -3.4 + Math.sin(t * 0.4) * 1.6
    voltLight.position.y = -1.4 + Math.cos(t * 0.33) * 1.4

    camera.position.z = 9 - p * 6.4
    camera.position.y = 0.35 + eased.y * -0.32 + p * 0.9
    camera.position.x = eased.x * 0.55
    camera.rotation.z = eased.x * 0.012
    camera.lookAt(0, p * 0.4, -2)

    world.rotation.y = eased.x * 0.11 + p * 0.32
    world.rotation.x = eased.y * 0.05

    composer.render()
  }
  render()

  /* ---------- resize ---------- */
  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    composer.setSize(w, h)
    bloom.setSize(w, h)
    bgUniforms.uRes.value.set(w, h)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  ready.value = true

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    st?.kill()
    window.removeEventListener('pointermove', onPointer)
    disposables.forEach((d) => d.dispose())
    backdrop.geometry.dispose()
    ;(backdrop.material as THREE.Material).dispose()
    bloom.dispose()
    composer.dispose()
    envRT.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    scene.clear()
  }
}

onMounted(() => {
  if (!host.value) return
  // Give the browser one frame so layout is measured before WebGL boots.
  requestAnimationFrame(() => {
    if (!host.value) return
    stop = build(host.value)
    // The curtain may already be up, and on a page without one it never comes
    // down at all, so the arrival is never left waiting on a signal that is not
    // going to be sent.
    if (intro.value) play()
    else waiting = setTimeout(play, 8000)
  })
})

onBeforeUnmount(() => {
  clearTimeout(waiting)
  enter?.kill()
  stop?.()
})
</script>

<template>
  <div ref="host" class="scene" :class="{ live: ready }" />
</template>

<style scoped>
.scene {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.2s var(--e-out);
  background: radial-gradient(120% 90% at 50% 40%, #131a2c 0%, #06070a 70%);
}

.scene.live {
  opacity: 1;
}
</style>
