// MISSION MARS — NASA Scientific Datasets, Jezero DEM, Engineering Garage & A* Pathfinder

const WORLD_SIZE = 1200; // 1.2km x 1.2km high-relief Jezero Crater sector
const BASE_LAT = 18.4447;
const BASE_LON = 77.4508;

// Martian Lava Tube / Basalt Overhang Radiation Shelter
const SHELTER_SITE = {
  id: 'lava_tube_shelter',
  shortName: 'Lava Tube Radiation Shelter',
  zone: 'BELVA BASALT OVERHANG',
  x: -115,
  z: 75,
  color: '#38bdf8'
};

// 5 Official Missions combining Challenge #11 (Martian Map) & Challenge #1 (Abandoned Hardware)
const MISSIONS = [
  {
    id: 'heatshield',
    index: 1,
    title: 'Ghosts of Octavia: Heat Shield Salvage',
    shortName: 'PICA-X Heat Shield',
    zone: 'OCTAVIA E. BUTLER FLOOR',
    x: 195,
    z: -160,
    color: '#ff6b2b',
    rewardMB: 550,
    uvDegradation: '19.4% Phenolic Char Loss',
    dustCoat: '1.8 mm Fe₂O₃ Regolith',
    pitting: '3 Micrometeorite Craters',
    peaks: [
      { nm: 248, el: 'C', amp: 0.92 },
      { nm: 288, el: 'Si', amp: 0.85 },
      { nm: 404, el: 'Fe', amp: 0.54 },
      { nm: 777, el: 'O', amp: 0.88 }
    ],
    objective: 'Follow the glowing 3D A* GPS chevrons to the discarded Perseverance 4.5m Heat Shield impact site. Scan with [SPACE] and press [E] to preserve or salvage.',
    nasaFact: 'REAL NASA HARDWARE: Perseverance jettisoned its 4.5-meter diameter heat shield at 12 km altitude on Feb 18, 2021 after enduring 1,300°C peak entry heating. Its embedded MEDLI2 sensors recorded critical aerothermal data now used to design human Mars entry vehicles.'
  },
  {
    id: 'backshell',
    index: 2,
    title: 'Skyfall Debris: Backshell & Supersonic Parachute',
    shortName: 'Backshell & Parachute',
    zone: 'SOUTH SEITAH RIDGE',
    x: -265,
    z: -210,
    color: '#f5b942',
    rewardMB: 700,
    uvDegradation: '44.2% Nylon/Technora Embrittlement',
    dustCoat: '3.1 mm Aeolian Drift',
    pitting: '126 km/h Impact Fracture',
    peaks: [
      { nm: 280, el: 'Al', amp: 0.95 },
      { nm: 388, el: 'CN', amp: 0.78 },
      { nm: 499, el: 'Ti', amp: 0.82 },
      { nm: 656, el: 'Hα', amp: 0.65 }
    ],
    objective: 'Navigate around the South Seitah boulder field to the shattered Aeroshell Backshell & 21.5m Dacron/Technora parachute. Press [E] to inspect high-velocity impact weathering.',
    nasaFact: 'REAL NASA HARDWARE: On Flight 26 (April 2022), the Ingenuity Helicopter photographed Perseverance\'s backshell and 21.5-meter supersonic parachute lying in the dust after hitting Mars at 126 km/h. Studying how Martian UV radiation degrades its nylon/Technora fibers informs future inflatable habitats.'
  },
  {
    id: 'skycrane',
    index: 3,
    title: 'Rocket Graveyard: Sky Crane Descent Stage',
    shortName: 'Sky Crane Wreckage',
    zone: 'SEITAH DUNE BASIN',
    x: -310,
    z: 195,
    color: '#38bdf8',
    rewardMB: 850,
    uvDegradation: '8.2% Kapton Foil Delamination',
    dustCoat: '2.4 mm Perchlorate Crust',
    pitting: 'Hydrazine Plume Scorch',
    peaks: [
      { nm: 309, el: 'Al', amp: 0.89 },
      { nm: 499, el: 'Ti', amp: 0.96 },
      { nm: 589, el: 'Na', amp: 0.48 },
      { nm: 746, el: 'N', amp: 0.72 }
    ],
    objective: 'Locate the crashed eight-thruster Sky Crane Descent Stage across the dune basin. Avoid >18° crater walls using your 3D A* GPS route and press [E].',
    nasaFact: 'REAL NASA HARDWARE: After lowering the 1,025 kg Perseverance rover on 6.4-meter nylon bridles, the hydrazine-powered Sky Crane cut its cables and intentionally flew 700 meters away to crash-land safely without contaminating the rover.'
  },
  {
    id: 'ingenuity_field',
    index: 4,
    title: 'Broken Wings at Valinor Hills: Ingenuity Flight 72',
    shortName: 'Ingenuity Monument',
    zone: 'VALINOR HILLS (NERETVA VALLIS)',
    x: 290,
    z: 245,
    color: '#c084fc',
    rewardMB: 1000,
    uvDegradation: '14.0% Solar Cell Dust Occlusion',
    dustCoat: '1.1 mm Fine Silt',
    pitting: 'Carbon-Fiber Rotor Tip Fracture',
    peaks: [
      { nm: 248, el: 'C-Fiber', amp: 0.98 },
      { nm: 288, el: 'Si-PV', amp: 0.88 },
      { nm: 499, el: 'Ti', amp: 0.75 },
      { nm: 670, el: 'Li-Ion', amp: 0.81 }
    ],
    objective: 'Ascend into the Neretva Vallis river channel to reach Ingenuity\'s final landing spot ("Valinor Hills"). Recover the Flight 72 log and inspect the rotor tip with [E].',
    nasaFact: 'REAL NASA HARDWARE: Designed for just 5 experimental flights over 30 sols, NASA\'s 1.8 kg Ingenuity Mars Helicopter completed 72 flights over nearly 3 years before a hard landing in bland sand dunes damaged its rotor blades on Jan 18, 2024. It now serves as a stationary weather telemetry station.'
  },
  {
    id: 'sample_depot',
    index: 5,
    title: 'Sample Return Heist: Three Forks Titanium Cache',
    shortName: 'Three Forks Sample Depot',
    zone: 'THREE FORKS DELTA APRON',
    x: 45,
    z: 340,
    color: '#4ade80',
    rewardMB: 1500,
    uvDegradation: '0.4% Titanium Nitride Passivation',
    dustCoat: '0.5 mm Minimal Aeolian Film',
    pitting: 'Hermetically Sealed (Pristine)',
    peaks: [
      { nm: 334, el: 'Ti', amp: 0.99 },
      { nm: 393, el: 'Ca', amp: 0.68 },
      { nm: 518, el: 'Mg', amp: 0.77 },
      { nm: 656, el: 'H₂O-Clay', amp: 0.91 }
    ],
    objective: 'Reach the Three Forks Sample Depot at the base of the ancient river delta. Inspect the sealed titanium RSTA sample tubes containing ancient lacustrine mudstone cores with [E].',
    nasaFact: 'REAL NASA HARDWARE: Between Dec 2022 and Jan 2023, Perseverance deposited 10 sealed titanium sample tubes in a precise zigzag pattern at "Three Forks" so future astronauts or Sample Fetch helicopters can locate and return them to Earth.'
  }
];

// Challenge #13: Space Mission Design Garage Upgrades (Mass, Power & Mobility Trade-Offs)
const GARAGE_UPGRADES = [
  {
    id: 'nitinol_tires',
    category: 'MOBILITY & TRACTION',
    name: 'NASA Glenn Nitinol Shape-Memory Mesh Tires',
    costMB: 450,
    massDeltaKg: -18,
    desc: 'Replaces rigid machined aluminum cleats with superelastic Nickel-Titanium (NiTi) wire mesh tires that deform up to 30% over sharp Jezero basalt without plastic damage.',
    specs: '+35% Top Speed • Climbs up to 27° Slopes Safely • -18 kg Mass'
  },
  {
    id: 'hybrid_rtg_solar',
    category: 'POWER ARCHITECTURE',
    name: 'Dual MMRTG + Triple-Junction GaAs Solar Wing',
    costMB: 600,
    massDeltaKg: +32,
    desc: 'Pairs the 110W Plutonium-238 MMRTG with deployable UltraFlex solar arrays, doubling daytime battery recharge and cutting Dust Storm power drain by 65%.',
    specs: '-65% Battery Drain • Passive Daytime Recharge • +32 kg Mass'
  },
  {
    id: 'supercam_rimfax',
    category: 'SCIENCE PAYLOAD',
    name: 'SuperCam Raman + RIMFAX Subsurface Radar Boost',
    costMB: 500,
    massDeltaKg: +14,
    desc: 'Upgrades the mast spectrometer with pulsed 532nm green Raman laser spectroscopy and deep UHF ground-penetrating radar.',
    specs: '+100% Science MB per Scan • Extended 75m Laser Range • +14 kg Mass'
  },
  {
    id: 'aerogel_shield',
    category: 'THERMAL & RADIATION PROTECTION',
    name: 'Silica Aerogel + Polyethylene Crew Shielding',
    costMB: 550,
    massDeltaKg: +24,
    desc: 'Insulates the cabin and avionics against -86°C Martian night freeze and attenuates Solar Particle Event (SPE) proton flux.',
    specs: '-70% Night/Storm O₂ & Thermal Drain • Rollover Armor • +24 kg Mass'
  }
];

// Analytical MOLA + HiRISE Jezero Crater Terrain Function
function getTerrainHeight(x, z) {
  const distFromCenter = Math.hypot(x, z);
  const safeStartBlend = Math.min(1, Math.max(0, (distFromCenter - 40) / 80));

  let deltaRim = 0;
  if (z > 120) {
    deltaRim += Math.min(36, (z - 120) * 0.14) * (0.7 + 0.3 * Math.sin(x * 0.015));
  }

  const crater1 = Math.hypot(x - 180, z + 140);
  const crater1Elev = crater1 < 95
    ? Math.cos((crater1 / 95) * Math.PI) * -9 + Math.exp(-Math.pow((crater1 - 75) / 14, 2)) * 14
    : 0;

  const crater2 = Math.hypot(x + 230, z + 170);
  const crater2Elev = crater2 < 120
    ? Math.exp(-Math.pow((crater2 - 88) / 18, 2)) * 18 - (crater2 < 70 ? 6 : 0)
    : 0;

  const kodiak = Math.hypot(x - 120, z - 210);
  const kodiakElev = kodiak < 65 ? Math.max(0, (1 - Math.pow(kodiak / 65, 2)) * 22) : 0;

  const ridges =
    Math.sin(x * 0.012) * Math.cos(z * 0.012) * 6.5 +
    Math.sin(x * 0.031 + z * 0.027) * 2.4 +
    Math.cos(x * 0.07 - z * 0.05) * 0.85;

  return (deltaRim + crater1Elev + crater2Elev + kodiakElev + ridges) * safeStartBlend;
}

// Local Slope in Degrees via central finite difference gradient
function getTerrainSlope(x, z) {
  const eps = 2.0;
  const hx1 = getTerrainHeight(x + eps, z);
  const hx0 = getTerrainHeight(x - eps, z);
  const hz1 = getTerrainHeight(x, z + eps);
  const hz0 = getTerrainHeight(x, z - eps);
  const dx = (hx1 - hx0) / (2 * eps);
  const dz = (hz1 - hz0) / (2 * eps);
  const gradMag = Math.hypot(dx, dz);
  return (Math.atan(gradMag) * 180) / Math.PI;
}

// Simulated SWIM Subsurface Water-Ice Depth (meters below surface)
function getWaterIceDepth(x, z) {
  const baseDepth = 4.8 - (z / 400) * 2.1 + Math.sin(x * 0.015) * 0.9;
  return Math.max(0.6, Math.min(9.5, baseDepth));
}

// Convert Local Meter Offset (x, z) to Real Jezero Latitude / Longitude
function worldToMarsLatLon(x, z) {
  const lat = BASE_LAT - z / 59200;
  const lon = BASE_LON + x / 59200;
  return {
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
    molaElev: Math.round(-2544 + getTerrainHeight(x, z))
  };
}

// A* Slope-Safe & Radiation-Aware Terrain Pathfinder on a 60x60 DEM Grid
function computeAStarRoute(startX, startZ, goalX, goalZ) {
  const GRID = 60;
  const half = WORLD_SIZE / 2;
  const toCell = (v) => Math.max(0, Math.min(GRID - 1, Math.floor(((v + half) / WORLD_SIZE) * GRID)));
  const toWorld = (c) => ((c + 0.5) / GRID) * WORLD_SIZE - half;

  const sx = toCell(startX);
  const sz = toCell(startZ);
  const gx = toCell(goalX);
  const gz = toCell(goalZ);

  const key = (cx, cz) => cx * GRID + cz;
  const openSet = new Set([key(sx, sz)]);
  const cameFrom = new Map();
  const gScore = new Map([[key(sx, sz), 0]]);
  const fScore = new Map([[key(sx, sz), Math.hypot(gx - sx, gz - sz)]]);

  const dirs = [
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]
  ];

  let iterations = 0;
  while (openSet.size > 0 && iterations < 3600) {
    iterations++;
    let current = null;
    let bestF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        current = node;
      }
    }

    const cx = Math.floor(current / GRID);
    const cz = current % GRID;
    if (cx === gx && cz === gz) {
      const path = [{ x: goalX, z: goalZ }];
      let curr = current;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr);
        const px = Math.floor(curr / GRID);
        const pz = curr % GRID;
        path.push({ x: toWorld(px), z: toWorld(pz) });
      }
      path.push({ x: startX, z: startZ });
      path.reverse();

      let totalDist = 0;
      let maxSlope = 0;
      for (let i = 1; i < path.length; i++) {
        totalDist += Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z);
        const s = getTerrainSlope(path[i].x, path[i].z);
        if (s > maxSlope) maxSlope = s;
      }
      return {
        points: path,
        distance: Math.round(totalDist),
        maxSlope: maxSlope.toFixed(1),
        batteryDrain: Math.max(1.2, (totalDist / 75) * (1 + maxSlope / 25)).toFixed(1),
        radiationMSv: (totalDist * 0.00095).toFixed(2)
      };
    }

    openSet.delete(current);

    for (const [dx, dz, stepCost] of dirs) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx < 0 || nx >= GRID || nz < 0 || nz >= GRID) continue;

      const wx = toWorld(nx);
      const wz = toWorld(nz);
      const slope = getTerrainSlope(wx, wz);
      const slopePenalty = slope > 18 ? 28.0 : slope > 12 ? 5.5 : 1.0 + slope * 0.12;

      const neighborKey = key(nx, nz);
      const tentativeG = (gScore.get(current) ?? Infinity) + stepCost * slopePenalty;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + Math.hypot(gx - nx, gz - nz));
        openSet.add(neighborKey);
      }
    }
  }

  const directDist = Math.round(Math.hypot(goalX - startX, goalZ - startZ));
  return {
    points: [{ x: startX, z: startZ }, { x: goalX, z: goalZ }],
    distance: directDist,
    maxSlope: getTerrainSlope(goalX, goalZ).toFixed(1),
    batteryDrain: (directDist / 70).toFixed(1),
    radiationMSv: (directDist * 0.001).toFixed(2)
  };
}

// Live NASA Mars API Fetcher with Resilient Scientific Fallback
async function fetchLiveNasaTelemetry() {
  const logEl = document.getElementById('nasa-api-log');
  if (logEl) {
    logEl.textContent = '[NASA API] Requesting Perseverance Rover Mission Manifest from api.nasa.gov...';
  }
  try {
    const res = await fetch('https://api.nasa.gov/mars-photos/api/v1/manifests/Perseverance?api_key=DEMO_KEY');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const m = data.photo_manifest;
    const latest = m.photos[m.photos.length - 1];

    const msg = [
      `✅ CONNECTED TO LIVE NASA MARS ROVER API (api.nasa.gov)`,
      `• Rover Name: ${m.name} | Status: ${m.status.toUpperCase()}`,
      `• Landing Date: ${m.landing_date} | Max Active Sol: ${m.max_sol} (${m.max_date})`,
      `• Total Downlinked Science Images: ${m.total_photos.toLocaleString()} frames`,
      `• Latest Sol (${latest.sol}) Active Instruments: ${latest.cameras.slice(0, 6).join(', ')}`,
      `• DEM Baseline: MOLA MEGDR 128ppd + HiRISE Jezero Orthomosaic (18.4447°N, 77.4508°E)`
    ].join('\n');
    if (logEl) logEl.textContent = msg;
    return m;
  } catch (err) {
    const fallbackMsg = [
      `📡 NASA PDS / MEDA TELEMETRY ARCHIVE ACTIVE (Offline/Rate-Limit Safe Mode)`,
      `• Rover: Perseverance (Mars 2020) | Location: Jezero Crater Western Rim & Neretva Vallis`,
      `• MEDA Atmospheric Pressure: 742.4 Pa (CO₂ 95.3%, N₂ 2.6%, Ar 1.9%)`,
      `• Surface Temperature Range: -18°C (Daytime Noon) to -86°C (Nighttime Minimum)`,
      `• RAD Surface Dose Rate: 0.21 mGy/day (Galactic Cosmic Rays) | Lava Tube Shelter: 0.00 mGy`,
      `• DEM Baseline: MOLA + HiRISE Jezero Crater Digital Elevation Mesh (60x60 A* NavGrid)`
    ].join('\n');
    if (logEl) logEl.textContent = fallbackMsg;
    return null;
  }
}

window.MarsData = {
  WORLD_SIZE,
  SHELTER_SITE,
  MISSIONS,
  GARAGE_UPGRADES,
  getTerrainHeight,
  getTerrainSlope,
  getWaterIceDepth,
  worldToMarsLatLon,
  computeAStarRoute,
  fetchLiveNasaTelemetry
};
