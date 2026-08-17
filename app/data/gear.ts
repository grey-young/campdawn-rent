export type ArtKind =
  | 'tower'
  | 'block'
  | 'handheld'
  | 'screen'
  | 'ultrawide'
  | 'beam'
  | 'pad'
  | 'stick'
  | 'visor'
  | 'cans'
  | 'bar'
  | 'wheel'
  | 'rig'
  | 'seat'
  | 'cabinet'

export interface Spec {
  label: string
  value: string
}

export interface GearItem {
  slug: string
  name: string
  brand: string
  category: string
  art: ArtKind
  tint: string
  tagline: string
  blurb: string
  specs: Spec[]
  includes: string[]
  /** Cut out product photo in public/gear. Falls back to the drawn art. */
  photo?: string
  badge?: string
  hot?: boolean
}

export const categories = [
  { id: 'all', label: 'Everything' },
  { id: 'consoles', label: 'Consoles' },
  { id: 'screens', label: 'Screens' },
  { id: 'handhelds', label: 'Handhelds' },
  { id: 'reality', label: 'Virtual reality' },
  { id: 'controls', label: 'Controls' },
  { id: 'audio', label: 'Audio' },
  { id: 'racing', label: 'Racing' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'arcade', label: 'Arcade' }
]

export const gear: GearItem[] = [
  {
    slug: 'playstation5pro',
    photo: '/gear/playstation5pro.webp',
    name: 'PlayStation 5 Pro',
    brand: 'Sony',
    category: 'consoles',
    art: 'tower',
    tint: '#4da6ff',
    tagline: 'The flagship, tuned and ready',
    blurb:
      'Our most requested console. Every unit ships freshly cleaned, updated overnight and loaded with a rotating library so nobody waits on a download bar.',
    badge: 'Most booked',
    hot: true,
    specs: [
      { label: 'Storage', value: '2 TB' },
      { label: 'Output', value: '4K at 120 fps' },
      { label: 'Pads', value: '2 DualSense' },
      { label: 'Library', value: '40 plus titles' }
    ],
    includes: ['Two DualSense pads', 'Charging dock', 'Ultra speed HDMI cable', 'Game library access']
  },
  {
    slug: 'xboxseriesx',
    photo: '/gear/xboxseriesx.webp',
    name: 'Xbox Series X',
    brand: 'Microsoft',
    category: 'consoles',
    art: 'block',
    tint: '#5ef08a',
    tagline: 'Raw power in a quiet box',
    blurb:
      'A full Game Pass Ultimate seat comes with every booking, so the whole catalogue is unlocked the moment you power it on.',
    hot: true,
    specs: [
      { label: 'Storage', value: '1 TB' },
      { label: 'Output', value: '4K at 120 fps' },
      { label: 'Pads', value: '2 wireless' },
      { label: 'Pass', value: 'Ultimate included' }
    ],
    includes: ['Two wireless pads', 'Rechargeable battery kit', 'Game Pass Ultimate', 'HDMI 2.1 cable']
  },
  {
    slug: 'switch2',
    photo: '/gear/switch2.webp',
    name: 'Nintendo Switch 2',
    brand: 'Nintendo',
    category: 'consoles',
    art: 'handheld',
    tint: '#ff5f6d',
    tagline: 'Couch chaos on demand',
    blurb:
      'Four pads in the box because nobody plays this one alone. Docks to any screen in under a minute and travels in a padded case.',
    specs: [
      { label: 'Mode', value: 'Dock or handheld' },
      { label: 'Pads', value: '4 controllers' },
      { label: 'Screen', value: '7.9 inch HDR' },
      { label: 'Party', value: 'Up to 8 players' }
    ],
    includes: ['Four controllers', 'Dock and cables', 'Travel case', 'Party title pack']
  },
  {
    slug: 'steamdeck',
    photo: '/gear/steamdeck.webp',
    name: 'Steam Deck OLED',
    brand: 'Valve',
    category: 'handhelds',
    art: 'handheld',
    tint: '#8f7bff',
    tagline: 'A whole PC in your palms',
    blurb:
      'Arrives signed into a stocked account with hundreds of titles ready to launch. Perfect for long flights and slow afternoons.',
    specs: [
      { label: 'Screen', value: '7.4 inch OLED' },
      { label: 'Storage', value: '1 TB' },
      { label: 'Battery', value: 'Up to 12 hours' },
      { label: 'Library', value: '300 plus titles' }
    ],
    includes: ['Deck and charger', 'Hard shell case', 'Screen protector', 'Loaded library']
  },
  {
    slug: 'quest3',
    photo: '/gear/quest3.webp',
    name: 'Meta Quest 3',
    brand: 'Meta',
    category: 'reality',
    art: 'visor',
    tint: '#4de8ff',
    tagline: 'Rooms that are not there',
    blurb:
      'Sanitised between every booking and shipped with fresh facial interfaces. We map your play space on delivery so you never clip a wall.',
    hot: true,
    specs: [
      { label: 'Lens', value: 'Pancake optics' },
      { label: 'Storage', value: '512 GB' },
      { label: 'Mode', value: 'Mixed reality' },
      { label: 'Session', value: '3 hour battery' }
    ],
    includes: ['Headset and pads', 'Elite strap with battery', 'Fresh face liners', 'Ten title bundle']
  },
  {
    slug: 'psvr2',
    photo: '/gear/psvr2.webp',
    name: 'PlayStation VR2',
    brand: 'Sony',
    category: 'reality',
    art: 'visor',
    tint: '#a58bff',
    tagline: 'Eye tracked and unforgiving',
    blurb:
      'Pairs with any PlayStation 5 in our fleet. Headset feedback and adaptive triggers make the horror titles genuinely rough.',
    specs: [
      { label: 'Panel', value: 'Dual 2000 by 2040' },
      { label: 'Tracking', value: 'Inside out' },
      { label: 'Feel', value: 'Headset haptics' },
      { label: 'Needs', value: 'PlayStation 5' }
    ],
    includes: ['Headset and Sense pads', 'Charging station', 'Fresh liners', 'Six title bundle']
  },
  {
    slug: 'oled65',
    photo: '/gear/oled65.webp',
    name: 'OLED 65 evo',
    brand: 'LG',
    category: 'screens',
    art: 'screen',
    tint: '#ffb648',
    tagline: 'Black that is actually black',
    blurb:
      'We mount it, level it, calibrate it and take it away again. Four HDMI 2.1 ports so every console you rent stays plugged in.',
    badge: 'Crowd pleaser',
    specs: [
      { label: 'Size', value: '65 inch' },
      { label: 'Panel', value: 'OLED evo' },
      { label: 'Refresh', value: '144 Hz' },
      { label: 'Ports', value: '4 by HDMI 2.1' }
    ],
    includes: ['Floor stand or wall mount', 'Calibration on site', 'Cable management', 'Surge protection']
  },
  {
    slug: 'odysseyark',
    name: 'Odyssey Ark',
    brand: 'Samsung',
    category: 'screens',
    art: 'ultrawide',
    tint: '#ff7ad9',
    tagline: 'A curved wall of pixels',
    blurb:
      'Fifty five inches of curve that rotates into portrait for the truly unhinged. Comes with the height adjustable arm and puck remote.',
    specs: [
      { label: 'Size', value: '55 inch curve' },
      { label: 'Refresh', value: '165 Hz' },
      { label: 'Modes', value: 'Four screens at once' },
      { label: 'Rotate', value: 'Portrait ready' }
    ],
    includes: ['Adjustable stand', 'Puck remote', 'Cable kit', 'Setup and alignment']
  },
  {
    slug: 'beamprojector',
    photo: '/gear/beamprojector.webp',
    name: 'Ultra short throw beam',
    brand: 'Hisense',
    category: 'screens',
    art: 'beam',
    tint: '#f8c93f',
    tagline: 'One hundred inches from a shelf',
    blurb:
      'Sits eight inches from the wall and throws a hundred inch picture. Ideal for gardens, warehouses and rooms that refuse a television.',
    specs: [
      { label: 'Picture', value: 'Up to 120 inch' },
      { label: 'Source', value: 'Triple laser 4K' },
      { label: 'Throw', value: '8 inch distance' },
      { label: 'Sound', value: '40 watt built in' }
    ],
    includes: ['Beam unit', 'Roll up screen', 'Alignment on site', 'Blackout drape']
  },
  {
    slug: 'dualsenseedge',
    photo: '/gear/dualsenseedge.webp',
    name: 'DualSense Edge',
    brand: 'Sony',
    category: 'controls',
    art: 'pad',
    tint: '#7c5cff',
    tagline: 'Tuned for the people who care',
    blurb:
      'Swappable sticks, back paddles and per game profiles. Bring your own settings on a memory stick and we will load them before delivery.',
    specs: [
      { label: 'Sticks', value: 'Swappable modules' },
      { label: 'Paddles', value: 'Four rear inputs' },
      { label: 'Profiles', value: 'Saved on device' },
      { label: 'Case', value: 'Braided lock cable' }
    ],
    includes: ['Pad and case', 'Spare stick modules', 'Braided cable', 'Profile loading']
  },
  {
    slug: 'elitepad',
    photo: '/gear/elitepad.webp',
    name: 'Elite Series 2',
    brand: 'Microsoft',
    category: 'controls',
    art: 'pad',
    tint: '#5ef08a',
    tagline: 'Metal where it matters',
    blurb:
      'Adjustable stick tension, hair trigger locks and a wrap case that charges it. The pad most of our regulars quietly refuse to give back.',
    specs: [
      { label: 'Tension', value: 'Three settings' },
      { label: 'Triggers', value: 'Hair lock stops' },
      { label: 'Battery', value: '40 hours' },
      { label: 'Grip', value: 'Rubberised wrap' }
    ],
    includes: ['Pad and charge case', 'Paddle set', 'Thumbstick set', 'Cleaning kit']
  },
  {
    slug: 'fightstick',
    photo: '/gear/fightstick.webp',
    name: 'Tournament fight stick',
    brand: 'Razer',
    category: 'controls',
    art: 'stick',
    tint: '#ff6a3d',
    tagline: 'Levers, buttons, no excuses',
    blurb:
      'Genuine arcade parts on a weighted base that will not slide off your knees. Wired for zero latency on console or desktop.',
    specs: [
      { label: 'Lever', value: 'Arcade grade' },
      { label: 'Buttons', value: 'Eight face keys' },
      { label: 'Base', value: 'Weighted metal' },
      { label: 'Link', value: 'Wired low latency' }
    ],
    includes: ['Stick unit', 'Spare button set', 'Wrist pad', 'Console link cable']
  },
  {
    slug: 'racingwheel',
    photo: '/gear/racingwheel.webp',
    name: 'Direct drive wheel',
    brand: 'Logitech',
    category: 'racing',
    art: 'wheel',
    tint: '#ff5f6d',
    tagline: 'Force feedback you feel tomorrow',
    blurb:
      'Eleven newton metres of torque through a real leather rim, with load cell pedals that punish late braking. Clamps to any solid desk.',
    hot: true,
    specs: [
      { label: 'Torque', value: '11 Nm direct' },
      { label: 'Pedals', value: 'Load cell trio' },
      { label: 'Rim', value: 'Leather wrapped' },
      { label: 'Mount', value: 'Desk clamp kit' }
    ],
    includes: ['Wheel base and rim', 'Three pedal set', 'Clamp hardware', 'Profile presets']
  },
  {
    slug: 'racingrig',
    photo: '/gear/racingrig.webp',
    name: 'Cockpit racing rig',
    brand: 'Playseat',
    category: 'racing',
    art: 'rig',
    tint: '#ffb648',
    tagline: 'Sit down, shut up, go fast',
    blurb:
      'A full aluminium cockpit with a bucket seat, adjustable reach and a triple screen arm. We build it in your room and carry it out after.',
    badge: 'Two person build',
    specs: [
      { label: 'Frame', value: 'Aluminium profile' },
      { label: 'Seat', value: 'Reclining bucket' },
      { label: 'Arm', value: 'Triple screen ready' },
      { label: 'Build', value: 'We assemble it' }
    ],
    includes: ['Full cockpit frame', 'Bucket seat', 'Screen arm', 'Assembly and removal']
  },
  {
    slug: 'arctisnovapro',
    photo: '/gear/arctisnovapro.webp',
    name: 'Arctis Nova Pro',
    brand: 'SteelSeries',
    category: 'audio',
    art: 'cans',
    tint: '#4de8ff',
    tagline: 'Footsteps, exactly where they are',
    blurb:
      'Active noise cancelling with a hot swap battery base, so the headset never dies mid raid. New ear cushions on every booking.',
    specs: [
      { label: 'Sound', value: 'Spatial mix' },
      { label: 'Battery', value: 'Hot swap pair' },
      { label: 'Mic', value: 'Retractable boom' },
      { label: 'Noise', value: 'Active cancelling' }
    ],
    includes: ['Headset and base', 'Two batteries', 'Fresh cushions', 'Console and PC links']
  },
  {
    slug: 'soundbar',
    name: 'Atmos sound bar',
    brand: 'Sonos',
    category: 'audio',
    art: 'bar',
    tint: '#a58bff',
    tagline: 'Explosions with an address',
    blurb:
      'Height channels that bounce off the ceiling plus a wireless sub that will annoy the neighbours. Tuned to your room on delivery.',
    specs: [
      { label: 'Channels', value: '9 with height' },
      { label: 'Sub', value: 'Wireless bass unit' },
      { label: 'Tuning', value: 'Room calibration' },
      { label: 'Link', value: 'HDMI eARC' }
    ],
    includes: ['Sound bar', 'Wireless subwoofer', 'Room tuning', 'eARC cable']
  },
  {
    slug: 'titanseat',
    photo: '/gear/titanseat.webp',
    name: 'Titan Evo chair',
    brand: 'Secretlab',
    category: 'comfort',
    art: 'seat',
    tint: '#f8c93f',
    tagline: 'For the sessions that run long',
    blurb:
      'Four way lumbar, magnetic head pillow and a cold cure foam base. Steam cleaned between bookings and delivered fully built.',
    specs: [
      { label: 'Lumbar', value: 'Four way internal' },
      { label: 'Foam', value: 'Cold cure base' },
      { label: 'Recline', value: '165 degrees' },
      { label: 'Arms', value: 'Four way adjust' }
    ],
    includes: ['Chair fully built', 'Head pillow', 'Floor mat', 'Steam clean certificate']
  },
  {
    slug: 'arcadecabinet',
    photo: '/gear/arcadecabinet.webp',
    name: 'Retro arcade cabinet',
    brand: 'Campdawn',
    category: 'arcade',
    art: 'cabinet',
    tint: '#ff7ad9',
    tagline: 'Two players, one quarter, no mercy',
    blurb:
      'A restored upright loaded with four hundred classics, a real CRT filter and a coin door that still clunks. Weighs a lot. We handle that.',
    badge: 'Event favourite',
    specs: [
      { label: 'Titles', value: '400 classics' },
      { label: 'Players', value: 'Two stations' },
      { label: 'Panel', value: 'Real arcade parts' },
      { label: 'Move', value: 'Stair crew included' }
    ],
    includes: ['Full cabinet', 'Free play mode', 'Stair delivery crew', 'Coin door for show']
  }
]

export interface Bundle {
  slug: string
  name: string
  span: string
  days: number
  tagline: string
  blurb: string
  items: string[]
  extras: string[]
  accent: string
  art: ArtKind
}

export const bundles: Bundle[] = [
  {
    slug: 'weekender',
    name: 'The Weekender',
    span: 'Friday to Monday',
    days: 3,
    tagline: 'One console, one screen, zero planning',
    blurb:
      'The kit we send out more than any other. A flagship console, a screen worth looking at and enough pads that nobody has to sit and watch.',
    items: ['playstation5pro', 'oled65', 'dualsenseedge'],
    extras: ['Two extra pads', 'Snack crate on the house'],
    accent: '#f8c93f',
    art: 'tower'
  },
  {
    slug: 'houseparty',
    name: 'The House Party',
    span: 'Three full days',
    days: 3,
    tagline: 'Built for a room with twenty people in it',
    blurb:
      'A cabinet in the corner, a hundred inch picture on the wall and sound that carries into the compound. Designed for the house that becomes the venue.',
    items: ['arcadecabinet', 'switch2', 'soundbar', 'beamprojector'],
    extras: ['Roll up screen', 'Crew on site for the first hour'],
    accent: '#ff7ad9',
    art: 'cabinet'
  },
  {
    slug: 'apexdriver',
    name: 'The Apex Driver',
    span: 'One full week',
    days: 7,
    tagline: 'A racing team in the corner of your sitting room',
    blurb:
      'A full cockpit, real torque through the rim and a curved wall of screen. We build it, we tune it and we take it away when your neck gives up.',
    items: ['racingrig', 'racingwheel', 'odysseyark', 'arctisnovapro'],
    extras: ['Wheel profile presets', 'Assembly and removal'],
    accent: '#ff5f6d',
    art: 'rig'
  }
]

export const bundleBySlug = (slug: string) => bundles.find((b) => b.slug === slug)

export const bySlug = (slug: string) => gear.find((g) => g.slug === slug)

export const categoryLabel = (id: string) =>
  categories.find((c) => c.id === id)?.label ?? id
