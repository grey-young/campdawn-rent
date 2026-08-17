<script setup lang="ts">
import type { ArtKind } from '~/data/gear'

const props = withDefaults(
  defineProps<{
    kind: ArtKind
    tint?: string
  }>(),
  { tint: '#f8c93f' }
)

const uid = useId()
const g = (name: string) => `${name}${uid}`.replace(/[^a-zA-Z0-9_]/g, '')
const u = (name: string) => `url(#${g(name)})`
</script>

<template>
  <svg class="art" viewBox="0 0 400 400" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient :id="g('body')" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#59647d" />
        <stop offset="0.52" stop-color="#333c50" />
        <stop offset="1" stop-color="#1b2130" />
      </linearGradient>

      <linearGradient :id="g('chrome')" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f7ff" />
        <stop offset="0.45" stop-color="#c3cad9" />
        <stop offset="1" stop-color="#7c8598" />
      </linearGradient>

      <linearGradient :id="g('glass')" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" :stop-color="props.tint" stop-opacity="0.85" />
        <stop offset="0.48" :stop-color="props.tint" stop-opacity="0.3" />
        <stop offset="1" stop-color="#080b12" stop-opacity="0.96" />
      </linearGradient>

      <linearGradient :id="g('beam')" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" :stop-color="props.tint" stop-opacity="0.5" />
        <stop offset="1" :stop-color="props.tint" stop-opacity="0.03" />
      </linearGradient>

      <radialGradient :id="g('halo')" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" :stop-color="props.tint" stop-opacity="0.34" />
        <stop offset="0.55" :stop-color="props.tint" stop-opacity="0.08" />
        <stop offset="1" :stop-color="props.tint" stop-opacity="0" />
      </radialGradient>

      <filter :id="g('soft')" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="7" />
      </filter>

      <filter :id="g('blur')" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
    </defs>

    <!-- ambient halo -->
    <circle class="halo" cx="200" cy="196" r="168" :fill="u('halo')" />

    <!-- floor pool -->
    <ellipse class="pool" cx="200" cy="340" rx="110" ry="13" :fill="props.tint" opacity="0.24" :filter="u('blur')" />

    <g class="dev">
      <!-- ================= tower ================= -->
      <template v-if="kind === 'tower'">
        <path
          d="M176 84 C154 120 150 168 150 206 C150 244 154 292 176 328"
          :stroke="u('chrome')" stroke-width="17" stroke-linecap="round"
        />
        <path
          d="M224 84 C246 120 250 168 250 206 C250 244 246 292 224 328"
          :stroke="u('chrome')" stroke-width="17" stroke-linecap="round"
        />
        <rect x="176" y="82" width="48" height="248" rx="13" :fill="u('body')" />
        <rect x="176" y="82" width="48" height="248" rx="13" stroke="rgba(255,255,255,.3)" />
        <rect class="pulse" x="195" y="100" width="9" height="212" rx="4.5" :fill="props.tint" opacity="0.85" />
        <rect x="195" y="100" width="9" height="212" rx="4.5" :fill="props.tint" :filter="u('soft')" opacity="0.6" />
        <circle cx="200" cy="336" r="4" :fill="props.tint" />
      </template>

      <!-- ================= block ================= -->
      <template v-else-if="kind === 'block'">
        <rect x="148" y="94" width="104" height="220" rx="18" :fill="u('body')" />
        <rect x="148" y="94" width="104" height="220" rx="18" stroke="rgba(255,255,255,.3)" />
        <circle cx="200" cy="128" r="30" :fill="props.tint" opacity="0.16" />
        <circle cx="200" cy="128" r="30" :stroke="props.tint" stroke-opacity="0.5" stroke-dasharray="3 6" />
        <circle class="pulse" cx="200" cy="128" r="15" :fill="props.tint" opacity="0.55" :filter="u('soft')" />
        <rect x="164" y="188" width="72" height="4" rx="2" fill="rgba(255,255,255,.09)" />
        <rect x="164" y="204" width="52" height="4" rx="2" fill="rgba(255,255,255,.07)" />
        <circle cx="200" cy="286" r="10" :stroke="props.tint" stroke-width="2" />
        <circle cx="200" cy="286" r="3.5" :fill="props.tint" />
      </template>

      <!-- ================= handheld ================= -->
      <template v-else-if="kind === 'handheld'">
        <rect x="98" y="130" width="52" height="142" rx="24" :fill="props.tint" opacity="0.85" />
        <rect x="250" y="130" width="52" height="142" rx="24" :fill="props.tint" opacity="0.55" />
        <rect x="132" y="136" width="136" height="130" rx="16" :fill="u('body')" />
        <rect x="132" y="136" width="136" height="130" rx="16" stroke="rgba(255,255,255,.32)" />
        <rect class="screen" x="146" y="150" width="108" height="102" rx="8" :fill="u('glass')" />
        <circle cx="122" cy="166" r="11" fill="#0d1017" stroke="rgba(255,255,255,.2)" />
        <circle cx="278" cy="234" r="11" fill="#0d1017" stroke="rgba(255,255,255,.2)" />
        <circle cx="278" cy="160" r="5" fill="rgba(255,255,255,.35)" />
        <circle cx="292" cy="174" r="5" fill="rgba(255,255,255,.25)" />
        <circle cx="264" cy="174" r="5" fill="rgba(255,255,255,.25)" />
        <circle cx="278" cy="188" r="5" fill="rgba(255,255,255,.25)" />
        <rect x="115" y="222" width="6" height="26" rx="3" fill="rgba(255,255,255,.28)" />
        <rect x="105" y="232" width="26" height="6" rx="3" fill="rgba(255,255,255,.28)" />
      </template>

      <!-- ================= screen ================= -->
      <template v-else-if="kind === 'screen'">
        <rect x="52" y="94" width="296" height="176" rx="9" :fill="u('body')" />
        <rect class="screen" x="59" y="101" width="282" height="156" rx="5" :fill="u('glass')" />
        <rect x="52" y="94" width="296" height="176" rx="9" stroke="rgba(255,255,255,.32)" />
        <path d="M178 270 L222 270 L232 314 L168 314 Z" :fill="u('body')" />
        <rect x="138" y="311" width="124" height="9" rx="4.5" :fill="u('chrome')" opacity="0.55" />
        <rect x="59" y="252" width="282" height="5" rx="2.5" :fill="props.tint" opacity="0.5" :filter="u('soft')" />
      </template>

      <!-- ================= ultrawide ================= -->
      <template v-else-if="kind === 'ultrawide'">
        <path d="M58 122 Q200 84 342 122 L342 262 Q200 300 58 262 Z" :fill="u('body')" />
        <path class="screen" d="M68 130 Q200 95 332 130 L332 254 Q200 289 68 254 Z" :fill="u('glass')" />
        <path d="M58 122 Q200 84 342 122 L342 262 Q200 300 58 262 Z" stroke="rgba(255,255,255,.32)" />
        <rect x="190" y="286" width="20" height="34" rx="6" :fill="u('body')" />
        <rect x="140" y="316" width="120" height="10" rx="5" :fill="u('chrome')" opacity="0.5" />
        <path d="M68 250 Q200 285 332 250" :stroke="props.tint" stroke-opacity="0.55" stroke-width="4" :filter="u('soft')" />
      </template>

      <!-- ================= beam ================= -->
      <template v-else-if="kind === 'beam'">
        <rect x="132" y="62" width="228" height="140" rx="6" fill="#05070c" stroke="rgba(255,255,255,.3)" />
        <rect class="screen" x="138" y="68" width="216" height="128" rx="4" :fill="u('glass')" />
        <path d="M176 268 L140 202 L354 202 Z" :fill="u('beam')" />
        <rect x="60" y="256" width="150" height="52" rx="14" :fill="u('body')" />
        <rect x="60" y="256" width="150" height="52" rx="14" stroke="rgba(255,255,255,.3)" />
        <circle cx="176" cy="270" r="13" fill="#05070c" :stroke="props.tint" stroke-width="2" />
        <circle class="pulse" cx="176" cy="270" r="6" :fill="props.tint" />
        <rect x="78" y="272" width="46" height="4" rx="2" fill="rgba(255,255,255,.14)" />
        <rect x="78" y="284" width="28" height="4" rx="2" fill="rgba(255,255,255,.1)" />
      </template>

      <!-- ================= pad ================= -->
      <template v-else-if="kind === 'pad'">
        <path
          d="M122 158 C104 168 92 198 88 230 C84 260 94 280 114 281 C133 282 144 262 158 250 C170 240 180 236 200 236 C220 236 230 240 242 250 C256 262 267 282 286 281 C306 280 316 260 312 230 C308 198 296 168 278 158 C260 149 224 146 200 146 C176 146 140 149 122 158 Z"
          :fill="u('body')"
        />
        <path
          d="M122 158 C104 168 92 198 88 230 C84 260 94 280 114 281 C133 282 144 262 158 250 C170 240 180 236 200 236 C220 236 230 240 242 250 C256 262 267 282 286 281 C306 280 316 260 312 230 C308 198 296 168 278 158 C260 149 224 146 200 146 C176 146 140 149 122 158 Z"
          stroke="rgba(255,255,255,.32)"
        />
        <path d="M148 172 L252 172" :stroke="props.tint" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round" />
        <rect x="126" y="196" width="8" height="30" rx="4" fill="rgba(255,255,255,.32)" />
        <rect x="115" y="207" width="30" height="8" rx="4" fill="rgba(255,255,255,.32)" />
        <circle cx="262" cy="196" r="7" :fill="props.tint" opacity="0.9" />
        <circle cx="280" cy="212" r="7" fill="rgba(255,255,255,.28)" />
        <circle cx="244" cy="212" r="7" fill="rgba(255,255,255,.28)" />
        <circle cx="262" cy="228" r="7" fill="rgba(255,255,255,.28)" />
        <circle cx="166" cy="240" r="19" fill="#0c0f16" stroke="rgba(255,255,255,.22)" />
        <circle cx="234" cy="240" r="19" fill="#0c0f16" stroke="rgba(255,255,255,.22)" />
        <circle cx="166" cy="240" r="8" :fill="props.tint" opacity="0.35" />
        <circle cx="234" cy="240" r="8" :fill="props.tint" opacity="0.35" />
      </template>

      <!-- ================= stick ================= -->
      <template v-else-if="kind === 'stick'">
        <path d="M96 188 L304 188 L332 258 L68 258 Z" :fill="u('body')" />
        <path d="M96 188 L304 188 L332 258 L68 258 Z" stroke="rgba(255,255,255,.32)" />
        <path d="M68 258 L332 258 L332 288 L68 288 Z" fill="#0a0c12" stroke="rgba(255,255,255,.22)" />
        <rect x="124" y="200" width="9" height="34" rx="4.5" :fill="u('chrome')" opacity="0.7" />
        <circle class="pulse" cx="128" cy="176" r="20" :fill="props.tint" />
        <circle cx="122" cy="170" r="6" fill="rgba(255,255,255,.45)" />
        <g fill="rgba(255,255,255,.22)" :stroke="props.tint" stroke-opacity="0.4">
          <circle cx="204" cy="212" r="11" />
          <circle cx="234" cy="208" r="11" />
          <circle cx="264" cy="210" r="11" />
          <circle cx="292" cy="216" r="11" />
          <circle cx="208" cy="240" r="11" />
          <circle cx="238" cy="236" r="11" />
          <circle cx="268" cy="238" r="11" />
          <circle cx="296" cy="244" r="11" />
        </g>
      </template>

      <!-- ================= visor ================= -->
      <template v-else-if="kind === 'visor'">
        <path d="M104 186 C78 186 72 210 76 232" :stroke="u('chrome')" stroke-width="12" stroke-linecap="round" opacity="0.5" />
        <path d="M296 186 C322 186 328 210 324 232" :stroke="u('chrome')" stroke-width="12" stroke-linecap="round" opacity="0.5" />
        <path d="M110 178 C110 148 138 136 200 136 C262 136 290 148 290 178 L290 226 C290 254 262 268 200 268 C138 268 110 254 110 226 Z" :fill="u('body')" />
        <path d="M110 178 C110 148 138 136 200 136 C262 136 290 148 290 178 L290 226 C290 254 262 268 200 268 C138 268 110 254 110 226 Z" stroke="rgba(255,255,255,.32)" />
        <path class="screen" d="M128 180 C128 164 152 158 200 158 C248 158 272 164 272 180 L272 214 C272 234 248 242 200 242 C152 242 128 234 128 214 Z" :fill="u('glass')" />
        <circle cx="164" cy="200" r="17" :fill="props.tint" opacity="0.32" :filter="u('soft')" />
        <circle cx="236" cy="200" r="17" :fill="props.tint" opacity="0.32" :filter="u('soft')" />
        <circle cx="200" cy="150" r="4" :fill="props.tint" />
      </template>

      <!-- ================= cans ================= -->
      <template v-else-if="kind === 'cans'">
        <path d="M112 232 C112 142 152 100 200 100 C248 100 288 142 288 232" :stroke="u('chrome')" stroke-width="15" stroke-linecap="round" />
        <rect x="84" y="208" width="56" height="98" rx="24" :fill="u('body')" />
        <rect x="84" y="208" width="56" height="98" rx="24" stroke="rgba(255,255,255,.32)" />
        <rect x="260" y="208" width="56" height="98" rx="24" :fill="u('body')" />
        <rect x="260" y="208" width="56" height="98" rx="24" stroke="rgba(255,255,255,.32)" />
        <ellipse class="pulse" cx="112" cy="257" rx="15" ry="30" :fill="props.tint" opacity="0.42" />
        <ellipse cx="288" cy="257" rx="15" ry="30" :fill="props.tint" opacity="0.42" />
        <path d="M140 286 C168 300 176 316 176 330" :stroke="props.tint" stroke-width="5" stroke-linecap="round" opacity="0.75" />
      </template>

      <!-- ================= bar ================= -->
      <template v-else-if="kind === 'bar'">
        <rect x="46" y="170" width="308" height="50" rx="19" :fill="u('body')" />
        <rect x="46" y="170" width="308" height="50" rx="19" stroke="rgba(255,255,255,.32)" />
        <g :fill="props.tint" opacity="0.35">
          <circle v-for="i in 22" :key="i" :cx="66 + (i - 1) * 13.5" cy="195" r="3" />
        </g>
        <rect class="pulse" x="46" y="214" width="308" height="4" rx="2" :fill="props.tint" opacity="0.55" :filter="u('soft')" />
        <rect x="246" y="248" width="98" height="98" rx="18" :fill="u('body')" />
        <rect x="246" y="248" width="98" height="98" rx="18" stroke="rgba(255,255,255,.3)" />
        <circle cx="295" cy="297" r="30" fill="#0a0c12" stroke="rgba(255,255,255,.32)" />
        <circle cx="295" cy="297" r="12" :fill="props.tint" opacity="0.5" />
      </template>

      <!-- ================= wheel ================= -->
      <template v-else-if="kind === 'wheel'">
        <circle cx="200" cy="168" r="84" :stroke="u('body')" stroke-width="24" />
        <circle cx="200" cy="168" r="84" stroke="rgba(255,255,255,.3)" stroke-width="1" />
        <path d="M124 158 L276 158" :stroke="u('body')" stroke-width="20" stroke-linecap="round" />
        <path d="M200 168 L200 246" :stroke="u('body')" stroke-width="18" stroke-linecap="round" />
        <circle cx="200" cy="168" r="26" fill="#0c0f16" stroke="rgba(255,255,255,.16)" />
        <circle class="pulse" cx="200" cy="168" r="9" :fill="props.tint" />
        <path d="M148 132 A70 70 0 0 1 252 132" :stroke="props.tint" stroke-width="4" stroke-linecap="round" opacity="0.8" />
        <path d="M112 296 L176 282 L182 330 L118 340 Z" :fill="u('body')" />
        <path d="M196 296 L260 282 L266 330 L202 340 Z" :fill="u('body')" />
        <path d="M112 296 L176 282" :stroke="props.tint" stroke-width="3" opacity="0.6" />
        <path d="M196 296 L260 282" :stroke="props.tint" stroke-width="3" opacity="0.6" />
      </template>

      <!-- ================= rig ================= -->
      <template v-else-if="kind === 'rig'">
        <rect x="62" y="306" width="286" height="12" rx="6" :fill="u('body')" />
        <path d="M118 274 L222 274 L216 300 L114 300 Z" :fill="u('body')" />
        <path d="M124 274 L110 178 L152 172 L162 270 Z" :fill="u('body')" />
        <path d="M124 274 L110 178 L152 172 L162 270 Z" stroke="rgba(255,255,255,.3)" />
        <path d="M116 200 L146 196" :stroke="props.tint" stroke-width="4" stroke-linecap="round" opacity="0.7" />
        <path d="M118 226 L150 222" :stroke="props.tint" stroke-width="4" stroke-linecap="round" opacity="0.45" />
        <path d="M296 306 L296 232" :stroke="u('body')" stroke-width="14" stroke-linecap="round" />
        <circle cx="296" cy="212" r="27" :stroke="u('body')" stroke-width="11" />
        <circle class="pulse" cx="296" cy="212" r="7" :fill="props.tint" />
        <rect x="238" y="96" width="122" height="78" rx="6" :fill="u('body')" />
        <rect class="screen" x="243" y="101" width="112" height="68" rx="4" :fill="u('glass')" />
        <path d="M299 174 L299 190" :stroke="u('body')" stroke-width="8" />
      </template>

      <!-- ================= seat ================= -->
      <template v-else-if="kind === 'seat'">
        <path d="M150 96 C150 78 250 78 250 96 L260 232 C260 250 140 250 140 232 Z" :fill="u('body')" />
        <path d="M150 96 C150 78 250 78 250 96 L260 232 C260 250 140 250 140 232 Z" stroke="rgba(255,255,255,.3)" />
        <path d="M156 112 L244 112" :stroke="props.tint" stroke-width="4" stroke-linecap="round" opacity="0.75" />
        <path d="M162 146 L238 146" stroke="rgba(255,255,255,.3)" stroke-width="4" stroke-linecap="round" />
        <path d="M164 178 L236 178" stroke="rgba(255,255,255,.24)" stroke-width="4" stroke-linecap="round" />
        <rect x="130" y="234" width="140" height="34" rx="16" :fill="u('body')" />
        <rect x="130" y="234" width="140" height="34" rx="16" stroke="rgba(255,255,255,.3)" />
        <rect x="192" y="268" width="16" height="36" :fill="u('chrome')" opacity="0.5" />
        <g :stroke="u('chrome')" stroke-width="7" stroke-linecap="round" opacity="0.5">
          <path d="M200 304 L136 328" />
          <path d="M200 304 L264 328" />
          <path d="M200 304 L200 336" />
        </g>
        <circle cx="132" cy="332" r="7" :fill="props.tint" opacity="0.7" />
        <circle cx="268" cy="332" r="7" :fill="props.tint" opacity="0.7" />
        <circle cx="200" cy="340" r="7" :fill="props.tint" opacity="0.7" />
      </template>

      <!-- ================= cabinet ================= -->
      <template v-else>
        <path d="M128 62 L272 62 L288 334 L112 334 Z" :fill="u('body')" />
        <path d="M128 62 L272 62 L288 334 L112 334 Z" stroke="rgba(255,255,255,.3)" />
        <rect x="142" y="74" width="116" height="36" rx="4" :fill="props.tint" opacity="0.28" />
        <rect class="pulse" x="142" y="74" width="116" height="36" rx="4" :fill="props.tint" opacity="0.2" :filter="u('soft')" />
        <rect x="140" y="124" width="120" height="92" rx="4" fill="#05070c" />
        <rect class="screen" x="145" y="129" width="110" height="82" rx="3" :fill="u('glass')" />
        <path d="M134 234 L268 234 L274 264 L128 264 Z" fill="#0d1017" stroke="rgba(255,255,255,.24)" />
        <circle cx="164" cy="246" r="8" :fill="props.tint" />
        <circle cx="238" cy="246" r="8" :fill="props.tint" opacity="0.6" />
        <g fill="rgba(255,255,255,.26)">
          <circle cx="190" cy="243" r="5" />
          <circle cx="206" cy="242" r="5" />
          <circle cx="192" cy="256" r="5" />
          <circle cx="208" cy="255" r="5" />
        </g>
        <rect x="172" y="288" width="56" height="32" rx="3" fill="#05070c" stroke="rgba(255,255,255,.3)" />
        <rect x="192" y="298" width="16" height="4" rx="2" :fill="props.tint" opacity="0.8" />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.art {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.dev {
  transform-origin: 200px 200px;
  transform-box: fill-box;
}

.pulse {
  animation: artpulse 3.4s var(--e-in-out) infinite;
}

@keyframes artpulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 0.32; }
}

.screen {
  animation: artflicker 7s var(--e-soft) infinite;
}

@keyframes artflicker {
  0%, 100% { opacity: 1; }
  46% { opacity: 0.82; }
  52% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .pulse,
  .screen {
    animation: none;
  }
}
</style>
