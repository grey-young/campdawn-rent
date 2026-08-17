<script setup lang="ts">
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import gsap from 'gsap'
import type { ArtKind } from '~/data/gear'

const props = withDefaults(defineProps<{ kind: ArtKind; tint?: string }>(), { tint: '#f8c93f' })

const host = ref<HTMLDivElement | null>(null)
const ready = ref(false)
let stop: (() => void) | null = null

function glowTexture(color: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, color)
  g.addColorStop(0.35, `${color}66`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function build(mount: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tint = new THREE.Color(props.tint)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.28
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y'
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 60)
  camera.position.set(0, 0.45, 6.9)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.03)
  scene.environment = envRT.texture
  scene.environmentIntensity = 1.9

  const key = new THREE.DirectionalLight(0xffffff, 5.2)
  key.position.set(3, 5, 4)
  scene.add(key)

  const front = new THREE.DirectionalLight(0xffffff, 2.4)
  front.position.set(-1, 1.5, 7)
  scene.add(front)

  const back = new THREE.DirectionalLight(0xcfe0ff, 2.2)
  back.position.set(-4, 2, -5)
  scene.add(back)

  const rim = new THREE.PointLight(tint.getHex(), 44, 22, 2)
  rim.position.set(-3, 1.4, 2.4)
  scene.add(rim)

  const fill = new THREE.PointLight(0x7c5cff, 30, 22, 2)
  fill.position.set(3.2, -1.6, 2)
  scene.add(fill)

  scene.add(new THREE.AmbientLight(0x4d5a80, 2.3))

  const trash: Array<{ dispose: () => void }> = []
  const keep = <T extends { dispose: () => void }>(x: T) => {
    trash.push(x)
    return x
  }

  const shell = keep(
    new THREE.MeshPhysicalMaterial({
      color: 0x5b6884,
      metalness: 0.58,
      roughness: 0.22,
      envMapIntensity: 2.0,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    })
  )

  const pale = keep(
    new THREE.MeshPhysicalMaterial({
      color: 0xe9eff9,
      metalness: 0.22,
      roughness: 0.26,
      envMapIntensity: 1.4,
      clearcoat: 1,
      clearcoatRoughness: 0.08
    })
  )

  const light = keep(
    new THREE.MeshStandardMaterial({
      color: 0x0c1017,
      emissive: tint,
      emissiveIntensity: 2.6,
      metalness: 0.5,
      roughness: 0.35
    })
  )

  const glass = keep(
    new THREE.MeshStandardMaterial({
      color: 0x05070c,
      emissive: tint,
      emissiveIntensity: 0.85,
      metalness: 0.15,
      roughness: 0.08
    })
  )

  const veil = keep(
    new THREE.MeshBasicMaterial({
      color: tint,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )

  const rb = (w: number, h: number, d: number, r = 0.06) =>
    keep(new RoundedBoxGeometry(w, h, d, 6, r))
  const cyl = (rt: number, rb2: number, h: number, s = 32) =>
    keep(new THREE.CylinderGeometry(rt, rb2, h, s))

  // rig carries the idle sway and drag, body holds a fixed presentation pose so
  // flat shapes such as a wheel or a panel are never shown edge on
  const rig = new THREE.Group()
  const body = new THREE.Group()
  rig.add(body)

  const put = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(...pos)
    m.rotation.set(...rot)
    body.add(m)
    return m
  }

  const P = Math.PI

  const poses: Partial<Record<ArtKind, [number, number, number]>> = {
    wheel: [-0.24, 0.52, 0],
    pad: [-0.3, 0.34, 0],
    stick: [-0.34, 0.3, 0],
    cans: [0, 0.32, 0],
    screen: [0, 0.3, 0],
    ultrawide: [0, 0.3, 0],
    bar: [0, 0.22, 0],
    handheld: [-0.16, 0.34, 0],
    visor: [-0.1, 0.32, 0]
  }
  body.rotation.set(...(poses[props.kind] ?? [0, 0, 0]))

  switch (props.kind) {
    case 'tower':
      put(rb(0.95, 2.2, 0.5, 0.1), shell)
      put(rb(0.17, 2.36, 0.74, 0.07), pale, [-0.54, 0, 0])
      put(rb(0.17, 2.36, 0.74, 0.07), pale, [0.54, 0, 0])
      put(rb(0.06, 1.72, 0.05, 0.02), light, [0, 0, 0.26])
      break

    case 'block':
      put(rb(1.2, 1.85, 1.2, 0.14), shell)
      put(cyl(0.36, 0.36, 0.07), light, [0, 0.94, 0])
      put(cyl(0.07, 0.07, 0.04), light, [0, -0.7, 0.62], [P / 2, 0, 0])
      break

    case 'handheld':
      put(rb(2.05, 1.05, 0.15, 0.06), shell)
      put(rb(1.42, 0.86, 0.03, 0.02), glass, [0, 0, 0.09])
      put(rb(0.44, 1.2, 0.34, 0.15), light, [-1.02, 0, 0])
      put(rb(0.44, 1.2, 0.34, 0.15), light, [1.02, 0, 0])
      put(cyl(0.11, 0.11, 0.06), pale, [-1.02, 0.3, 0.18], [P / 2, 0, 0])
      put(cyl(0.11, 0.11, 0.06), pale, [1.02, -0.24, 0.18], [P / 2, 0, 0])
      break

    case 'screen':
    case 'ultrawide':
      put(rb(3.15, 1.82, 0.09, 0.04), shell)
      put(rb(3.0, 1.68, 0.03, 0.02), glass, [0, 0, 0.06])
      put(rb(0.24, 0.42, 0.22, 0.05), shell, [0, -1.12, 0])
      put(rb(1.35, 0.07, 0.55, 0.03), pale, [0, -1.35, 0])
      break

    case 'beam':
      put(rb(1.75, 0.55, 1.0, 0.1), shell)
      put(cyl(0.17, 0.17, 0.08), light, [0.9, 0, 0], [0, 0, P / 2])
      put(keep(new THREE.ConeGeometry(0.85, 2.2, 34, 1, true)), veil, [2.05, 0, 0], [0, 0, -P / 2])
      break

    case 'pad':
      put(rb(1.72, 0.78, 0.5, 0.22), shell)
      put(rb(0.46, 0.86, 0.46, 0.2), shell, [-0.66, -0.5, 0], [0, 0, 0.26])
      put(rb(0.46, 0.86, 0.46, 0.2), shell, [0.66, -0.5, 0], [0, 0, -0.26])
      put(cyl(0.14, 0.14, 0.1), light, [-0.34, -0.1, 0.24], [P / 2, 0, 0])
      put(cyl(0.14, 0.14, 0.1), light, [0.34, -0.1, 0.24], [P / 2, 0, 0])
      put(rb(0.55, 0.05, 0.02), light, [0, 0.3, 0.25])
      break

    case 'stick':
      put(rb(1.85, 0.34, 1.25, 0.08), shell)
      put(cyl(0.04, 0.04, 0.24), pale, [-0.58, 0.26, 0])
      put(keep(new THREE.SphereGeometry(0.15, 24, 16)), light, [-0.58, 0.44, 0])
      for (let i = 0; i < 6; i++) {
        put(
          cyl(0.09, 0.09, 0.05),
          i % 2 ? pale : light,
          [0.05 + (i % 3) * 0.3, 0.19, i > 2 ? 0.28 : -0.05]
        )
      }
      break

    case 'visor':
      put(rb(1.75, 0.9, 0.62, 0.24), shell)
      put(rb(1.5, 0.66, 0.05, 0.16), glass, [0, 0.02, 0.32])
      put(keep(new THREE.TorusGeometry(0.86, 0.055, 10, 40, P)), pale, [0, 0.02, -0.14], [0, 0, P])
      break

    case 'cans':
      put(keep(new THREE.TorusGeometry(0.78, 0.07, 12, 48, P)), pale, [0, 0.05, 0])
      put(cyl(0.42, 0.42, 0.3), shell, [-0.78, 0.02, 0], [0, 0, P / 2])
      put(cyl(0.42, 0.42, 0.3), shell, [0.78, 0.02, 0], [0, 0, P / 2])
      put(cyl(0.3, 0.3, 0.08), light, [-0.94, 0.02, 0], [0, 0, P / 2])
      put(cyl(0.3, 0.3, 0.08), light, [0.94, 0.02, 0], [0, 0, P / 2])
      break

    case 'bar':
      put(rb(3.1, 0.38, 0.38, 0.17), shell)
      put(rb(2.85, 0.06, 0.03, 0.02), light, [0, -0.1, 0.2])
      put(rb(0.72, 0.72, 0.72, 0.1), shell, [1.5, -0.86, 0])
      put(cyl(0.2, 0.2, 0.05), light, [1.5, -0.86, 0.38], [P / 2, 0, 0])
      break

    case 'wheel':
      put(keep(new THREE.TorusGeometry(0.88, 0.115, 18, 64)), shell)
      put(keep(new THREE.TorusGeometry(0.88, 0.03, 10, 64, P * 0.7)), light, [0, 0, 0.09], [0, 0, P * 0.16])
      put(cyl(0.3, 0.3, 0.2), shell, [0, 0, 0], [P / 2, 0, 0])
      put(rb(1.5, 0.13, 0.1, 0.04), shell, [0, 0.06, 0])
      put(rb(0.12, 0.7, 0.1, 0.04), shell, [0, -0.42, 0])
      break

    case 'rig':
      put(rb(0.95, 1.35, 0.22, 0.1), shell, [0, 0.5, -0.55], [-0.22, 0, 0])
      put(rb(0.95, 0.22, 1.0, 0.08), shell, [0, -0.25, 0])
      put(rb(0.11, 0.11, 2.6, 0.04), pale, [-0.5, -0.55, 0.5])
      put(rb(0.11, 0.11, 2.6, 0.04), pale, [0.5, -0.55, 0.5])
      put(rb(0.11, 0.62, 0.11, 0.04), pale, [0, -0.3, 1.62])
      put(keep(new THREE.TorusGeometry(0.32, 0.06, 12, 40)), light, [0, 0.1, 1.62])
      break

    case 'seat':
      put(rb(1.0, 1.5, 0.28, 0.14), shell, [0, 0.55, 0])
      put(rb(1.05, 0.26, 1.0, 0.12), shell, [0, -0.34, 0.28])
      put(rb(0.86, 0.05, 0.03, 0.02), light, [0, 0.95, 0.16])
      put(cyl(0.09, 0.09, 0.55), pale, [0, -0.75, 0.28])
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * P * 2
        put(rb(0.62, 0.07, 0.09, 0.03), pale, [Math.cos(a) * 0.31, -1.03, 0.28 + Math.sin(a) * 0.31], [0, -a, 0])
      }
      break

    default:
      put(rb(1.25, 2.4, 1.0, 0.06), shell)
      put(rb(1.1, 0.32, 0.06, 0.02), light, [0, 0.92, 0.52])
      put(rb(0.95, 0.74, 0.04, 0.02), glass, [0, 0.32, 0.52])
      put(rb(1.15, 0.1, 0.55, 0.03), shell, [0, -0.24, 0.44], [0.34, 0, 0])
      put(keep(new THREE.SphereGeometry(0.09, 20, 14)), light, [-0.3, -0.14, 0.6])
      put(cyl(0.07, 0.07, 0.04), light, [0.22, -0.16, 0.62], [P / 2, 0, 0])
      break
  }

  scene.add(rig)

  // ground pool
  const poolTex = keep(glowTexture(props.tint))
  const poolMat = keep(
    new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  const pool = new THREE.Mesh(keep(new THREE.PlaneGeometry(5.4, 5.4)), poolMat)
  pool.rotation.x = -P / 2
  pool.position.y = -1.5
  scene.add(pool)

  const haloMat = keep(
    new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  const halo = new THREE.Mesh(keep(new THREE.PlaneGeometry(8, 8)), haloMat)
  halo.position.z = -2.6
  scene.add(halo)

  /* interaction
     The idle motion is a sway rather than a full spin. A continuous spin turns
     flat shapes like a wheel or a panel edge on for half of every loop, which
     reads as broken. Dragging still gives the visitor the full 360. */
  const BASE_Y = -0.5
  let dragging = false
  let lastX = 0
  let vel = 0
  let userY = BASE_Y
  const spin = { sway: 0.34 }

  const dom = renderer.domElement
  const down = (e: PointerEvent) => {
    dragging = true
    lastX = e.clientX
    dom.setPointerCapture(e.pointerId)
    gsap.to(spin, { sway: 0, duration: 0.5 })
  }
  const move = (e: PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    userY += dx * 0.009
    vel = dx * 0.009
  }
  const up = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    try {
      dom.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer already gone */
    }
    gsap.to(spin, { sway: 0.34, duration: 2.4, delay: 1.2 })
  }

  dom.addEventListener('pointerdown', down)
  dom.addEventListener('pointermove', move)
  dom.addEventListener('pointerup', up)
  dom.addEventListener('pointercancel', up)

  const hover = { x: 0, y: 0 }
  const eased = { x: 0, y: 0 }
  const track = (e: PointerEvent) => {
    const r = mount.getBoundingClientRect()
    hover.x = ((e.clientX - r.left) / r.width - 0.5) * 2
    hover.y = ((e.clientY - r.top) / r.height - 0.5) * 2
  }
  const untrack = () => {
    hover.x = 0
    hover.y = 0
  }
  mount.addEventListener('pointermove', track)
  mount.addEventListener('pointerleave', untrack)

  /* intro */
  rig.rotation.set(0.14, BASE_Y, 0)
  const intro = { spin: 0 }
  if (!reduced) {
    intro.spin = -2.6
    gsap.to(intro, { spin: 0, duration: 2.2, ease: 'swift' })
    gsap.from(rig.scale, { x: 0.4, y: 0.4, z: 0.4, duration: 1.6, ease: 'swift' })
    gsap.from([poolMat, haloMat], { opacity: 0, duration: 1.6 })
  }

  let raf = 0
  let visible = true
  const t0 = performance.now()

  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting), { threshold: 0 })
  io.observe(mount)

  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (!visible) return
    const t = (performance.now() - t0) / 1000

    if (!dragging) {
      userY = THREE.MathUtils.clamp(userY + vel, BASE_Y - P, BASE_Y + P)
      vel *= 0.9
    }

    eased.x += (hover.x - eased.x) * 0.06
    eased.y += (hover.y - eased.y) * 0.06

    rig.rotation.y =
      userY + intro.spin + (reduced ? 0 : Math.sin(t * 0.34) * spin.sway + eased.x * 0.22)
    rig.rotation.x = 0.16 + eased.y * 0.16
    rig.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.07
    camera.position.x = eased.x * 0.5
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  }
  loop()

  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  ready.value = true

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    dom.removeEventListener('pointerdown', down)
    dom.removeEventListener('pointermove', move)
    dom.removeEventListener('pointerup', up)
    dom.removeEventListener('pointercancel', up)
    mount.removeEventListener('pointermove', track)
    mount.removeEventListener('pointerleave', untrack)
    trash.forEach((d) => d.dispose())
    envRT.dispose()
    pmrem.dispose()
    renderer.dispose()
    dom.remove()
    scene.clear()
  }
}

onMounted(() => {
  requestAnimationFrame(() => {
    if (host.value) stop = build(host.value)
  })
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <div class="vw" :class="{ live: ready }">
    <div ref="host" class="vw_canvas" data-cursor="drag" data-cursor-label="Drag to spin" />
    <p class="mono vw_hint">Drag to spin</p>
  </div>
</template>

<style scoped>
.vw {
  position: relative;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s var(--e-out);
}

.vw.live {
  opacity: 1;
}

.vw_canvas {
  position: absolute;
  inset: 0;
}

.vw_hint {
  position: absolute;
  left: 50%;
  bottom: 1.1rem;
  transform: translateX(-50%);
  color: var(--faint);
  pointer-events: none;
  opacity: 0.8;
}
</style>
