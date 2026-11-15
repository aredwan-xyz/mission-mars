// MISSION MARS — Upgraded 3D Open-World Jezero Crater, 3D GPS Chevrons, Tire Tracks, Lava Tube Shelter & Sol Sky

function createMarsWorld(container) {
  const scene = new THREE.Scene();
  const baseFogColor = new THREE.Color(0xc86d44);
  scene.background = baseFogColor.clone();
  scene.fog = new THREE.FogExp2(baseFogColor.getHex(), 0.0022);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.4,
    1500
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffb88c, 0x472315, 0.72);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffe2c4, 1.25);
  sunLight.position.set(220, 340, -180);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 20;
  sunLight.shadow.camera.far = 950;
  const d = 320;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Starfield & Phobos/Deimos Moons (Visible during Blue Martian Sunset & Night)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1200;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.48;
    const r = 850;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) + 40;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xe2e8f0,
    size: 2.2,
    transparent: true,
    opacity: 0.0
  });
  const starsPoints = new THREE.Points(starGeo, starMat);
  scene.add(starsPoints);

  const phobosMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(9, 1),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 })
  );
  phobosMesh.position.set(-280, 410, 260);
  scene.add(phobosMesh);

  // 1. Procedural High-Detail Regolith Bump Texture + Jezero Crater Terrain Mesh
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 256;
  texCanvas.height = 256;
  const tCtx = texCanvas.getContext('2d');
  tCtx.fillStyle = '#808080';
  tCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4500; i++) {
    const v = 90 + Math.floor(Math.random() * 80);
    tCtx.fillStyle = `rgb(${v},${v},${v})`;
    tCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const regolithBump = new THREE.CanvasTexture(texCanvas);
  regolithBump.wrapS = THREE.RepeatWrapping;
  regolithBump.wrapT = THREE.RepeatWrapping;
  regolithBump.repeat.set(90, 90);

  const segs = 180;
  const terrainGeo = new THREE.PlaneGeometry(MarsData.WORLD_SIZE, MarsData.WORLD_SIZE, segs, segs);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const colors = [];
  const cFlat = new THREE.Color(0xb5532c);
  const cSlope = new THREE.Color(0x6e3019);
  const cDelta = new THREE.Color(0xd48455);
  const cBasin = new THREE.Color(0x8c3c22);

  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = MarsData.getTerrainHeight(vx, vz);
    posAttr.setY(i, vy);

    const slope = MarsData.getTerrainSlope(vx, vz);
    const col = cFlat.clone();
    if (slope > 15) {
      col.lerp(cSlope, Math.min(1, (slope - 15) / 18));
    } else if (vy > 10) {
      col.lerp(cDelta, Math.min(1, (vy - 10) / 22));
    } else if (vy < -3) {
      col.lerp(cBasin, Math.min(1, Math.abs(vy) / 12));
    }
    colors.push(col.r, col.g, col.b);
  }
  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    bumpMap: regolithBump,
    bumpScale: 0.35,
    roughness: 0.9,
    metalness: 0.06,
    flatShading: true
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // Dynamically apply Real NASA HiRISE/CTX Satellite Orthomosaic & DEM Relief to 3D Terrain
  function applyRealSatelliteTexture(orbitalImg) {
    if (!orbitalImg) return;
    // Update vertex heights from newly sampled 128x128 DEM matrix
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      posAttr.setY(i, MarsData.getTerrainHeight(vx, vz));
    }
    posAttr.needsUpdate = true;
    terrainGeo.computeVertexNormals();

    // Create Mars-tinted satellite texture canvas so vertex colors and orbital features blend cleanly
    const satCanvas = document.createElement('canvas');
    satCanvas.width = 512;
    satCanvas.height = 512;
    const sCtx = satCanvas.getContext('2d');
    sCtx.drawImage(orbitalImg, 0, 0, 512, 512);
    sCtx.fillStyle = 'rgba(195, 92, 50, 0.28)';
    sCtx.fillRect(0, 0, 512, 512);

    const satTexture = new THREE.CanvasTexture(satCanvas);
    terrainMat.map = satTexture;
    terrainMat.needsUpdate = true;

    // Refresh static monument & rock Y positions
    baseGroup.position.y = MarsData.getTerrainHeight(0, -25);
    shelterGroup.position.y = MarsData.getTerrainHeight(MarsData.SHELTER_SITE.x, MarsData.SHELTER_SITE.z);
    artifactMeshes.forEach((a) => {
      a.group.position.y = MarsData.getTerrainHeight(a.mission.x, a.mission.z);
    });
    scannableRocks.forEach((r) => {
      const ry = MarsData.getTerrainHeight(r.position.x, r.position.z);
      r.position.y = ry + r.scale.y * 0.45;
    });
  }

  // 2. Octavia E. Butler Base Habitat & Engineering Garage Pad near (0, -25)
  const baseGroup = new THREE.Group();
  const baseY = MarsData.getTerrainHeight(0, -25);
  baseGroup.position.set(0, baseY, -25);

  const domeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.3 })
  );
  domeMesh.castShadow = true;
  baseGroup.add(domeMesh);

  const airlock = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 7, 12),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 })
  );
  airlock.rotation.x = Math.PI / 2;
  airlock.position.set(0, 2.2, 9);
  baseGroup.add(airlock);

  const beaconLight = new THREE.PointLight(0x38bdf8, 1.8, 48);
  beaconLight.position.set(0, 12, 0);
  baseGroup.add(beaconLight);
  scene.add(baseGroup);

  // 2B. Martian Lava Tube / Basalt Overhang Radiation Shelter at (-115, 75)
  const shelterGroup = new THREE.Group();
  const shX = MarsData.SHELTER_SITE.x;
  const shZ = MarsData.SHELTER_SITE.z;
  const shY = MarsData.getTerrainHeight(shX, shZ);
  shelterGroup.position.set(shX, shY, shZ);

  const archMesh = new THREE.Mesh(
    new THREE.TorusGeometry(11, 4.2, 12, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x4a2518, roughness: 0.95, flatShading: true })
  );
  archMesh.position.y = 1.0;
  archMesh.castShadow = true;
  shelterGroup.add(archMesh);

  const roofCap = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 13, 18, 16, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x3b1d12, roughness: 0.95, flatShading: true })
  );
  roofCap.rotation.z = Math.PI / 2;
  roofCap.rotation.y = Math.PI / 2;
  roofCap.position.set(0, 1.0, -8);
  shelterGroup.add(roofCap);

  const shieldPortal = new THREE.Mesh(
    new THREE.CircleGeometry(9.5, 24, 0, Math.PI),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    })
  );
  shieldPortal.position.set(0, 0.8, 1.2);
  shelterGroup.add(shieldPortal);

  const shelterLight = new THREE.PointLight(0x38bdf8, 2.2, 55);
  shelterLight.position.set(0, 7, 2);
  shelterGroup.add(shelterLight);
  scene.add(shelterGroup);

  // 3. Scannable Martian Boulders with Real Atomic LIBS Spectral Peaks
  const scannableRocks = [];
  const rockTypes = [
    {
      name: 'Olivine-Rich Igneous Basalt (Máaz Formation)',
      comp: 'SiO₂: 46.1% • FeO: 19.4% • MgO: 16.8% • Olivine: High',
      peaks: [
        { nm: 288, el: 'Si', amp: 0.92 },
        { nm: 404, el: 'Fe', amp: 0.84 },
        { nm: 518, el: 'Mg', amp: 0.89 },
        { nm: 777, el: 'O', amp: 0.65 }
      ]
    },
    {
      name: 'Hydrated Smectite Mudstone (Shenandoah Delta)',
      comp: 'SiO₂: 51.3% • Al₂O₃: 15.2% • H₂O-Clay: 6.8% • Biosignature Priority',
      peaks: [
        { nm: 288, el: 'Si', amp: 0.95 },
        { nm: 309, el: 'Al', amp: 0.76 },
        { nm: 656, el: 'Hα(H₂O)', amp: 0.98 },
        { nm: 766, el: 'K', amp: 0.58 }
      ]
    },
    {
      name: 'Magnesium Carbonate Breccia (Marginal Unit)',
      comp: 'MgCO₃: 34.5% • FeCO₃: 12.1% • SiO₂: 38.0% • Lacustrine Shoreline',
      peaks: [
        { nm: 248, el: 'C', amp: 0.91 },
        { nm: 393, el: 'Ca', amp: 0.72 },
        { nm: 518, el: 'Mg', amp: 0.96 },
        { nm: 777, el: 'O', amp: 0.79 }
      ]
    },
    {
      name: 'Sulfate-Bearing Evaporite Vein (Belva Rim)',
      comp: 'CaSO₄: 42.0% • MgSO₄: 21.4% • Cl⁻: 1.9% • Ancient Brine Deposit',
      peaks: [
        { nm: 393, el: 'Ca', amp: 0.97 },
        { nm: 518, el: 'Mg', amp: 0.75 },
        { nm: 545, el: 'S', amp: 0.86 },
        { nm: 656, el: 'Hα', amp: 0.64 }
      ]
    },
    {
      name: 'Hematite "Blueberry" Concretion Outcrop',
      comp: 'Fe₂O₃: 64.2% • SiO₂: 24.1% • TiO₂: 2.3% • Aqueous Oxidation',
      peaks: [
        { nm: 288, el: 'Si', amp: 0.62 },
        { nm: 404, el: 'Fe-I', amp: 0.99 },
        { nm: 438, el: 'Fe-II', amp: 0.92 },
        { nm: 499, el: 'Ti', amp: 0.54 }
      ]
    }
  ];

  const rockGeo = new THREE.DodecahedronGeometry(1.0, 1);
  for (let i = 0; i < 160; i++) {
    const angle = (i * 137.5 * Math.PI) / 180;
    const rad = 35 + ((i * 29) % 480);
    const rx = Math.cos(angle) * rad;
    const rz = Math.sin(angle) * rad;
    const ry = MarsData.getTerrainHeight(rx, rz);
    const scale = 0.8 + (i % 5) * 0.65;

    const rMat = new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? 0x5c2c1d : 0x7c3f29,
      roughness: 0.9,
      flatShading: true
    });
    const rock = new THREE.Mesh(rockGeo, rMat);
    rock.position.set(rx, ry + scale * 0.45, rz);
    rock.scale.set(scale * 1.3, scale * 0.85, scale);
    rock.rotation.set(i * 0.4, i * 1.1, 0);
    rock.castShadow = true;
    rock.receiveShadow = true;

    const meta = rockTypes[i % rockTypes.length];
    rock.userData = {
      scannable: true,
      name: meta.name,
      composition: meta.comp,
      peaks: meta.peaks
    };
    scene.add(rock);
    scannableRocks.push(rock);
  }

  // 4. Build the 3 Playable Units: Perseverance Rover, Ingenuity Helicopter, EVA Astronaut
  const roverGroup = new THREE.Group();
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.1, 3.4),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38, metalness: 0.35 })
  );
  chassis.position.y = 1.25;
  chassis.castShadow = true;
  roverGroup.add(chassis);

  const goldDeck = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.25, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xf5b942, roughness: 0.3, metalness: 0.7 })
  );
  goldDeck.position.y = 1.85;
  roverGroup.add(goldDeck);

  // Deployable Solar Wing Upgrade Mesh (Hidden until unlocked in Garage!)
  const roverSolarWing = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.08, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.75, roughness: 0.2 })
  );
  roverSolarWing.position.set(0, 2.1, -0.4);
  roverSolarWing.visible = false;
  roverGroup.add(roverSolarWing);

  const mmrtg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 1.3, 10),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
  );
  mmrtg.rotation.x = -Math.PI / 3;
  mmrtg.position.set(0, 1.6, -2.0);
  roverGroup.add(mmrtg);

  const mastPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1 })
  );
  mastPole.position.set(0.65, 2.5, 1.1);
  roverGroup.add(mastPole);

  const mastHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.45, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  mastHead.position.set(0.65, 3.35, 1.15);
  roverGroup.add(mastHead);

  const chemCamLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0x660000 })
  );
  chemCamLens.rotation.x = Math.PI / 2;
  chemCamLens.position.set(0.65, 3.38, 1.38);
  roverGroup.add(chemCamLens);

  // Volumetric Rover Headlights (SpotLight + Twin Volumetric Cones)
  const headlightGroup = new THREE.Group();
  const roverSpotLight = new THREE.SpotLight(0xfffbeb, 2.4, 85, Math.PI / 4, 0.45, 1.2);
  roverSpotLight.position.set(0, 1.7, 1.7);
  roverSpotLight.target.position.set(0, 0.2, 22);
  headlightGroup.add(roverSpotLight);
  headlightGroup.add(roverSpotLight.target);

  const coneGeo = new THREE.ConeGeometry(3.2, 16, 16, 1, true);
  coneGeo.rotateX(-Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  [-0.9, 0.9].forEach((hx) => {
    const beam = new THREE.Mesh(coneGeo, coneMat);
    beam.position.set(hx, 1.35, 9.6);
    headlightGroup.add(beam);
  });
  roverGroup.add(headlightGroup);

  // 6 Rocker-Bogie Wheels
  const roverWheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.4 });
  const wheelZOffsets = [-1.45, 0, 1.45];
  [-1.55, 1.55].forEach((wx) => {
    wheelZOffsets.forEach((wz) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.55, wz);
      w.castShadow = true;
      roverGroup.add(w);
      roverWheels.push(w);
    });
  });

  roverGroup.position.set(0, MarsData.getTerrainHeight(0, 0), 0);
  scene.add(roverGroup);

  // 4B. INGENUITY MARS HELICOPTER
  const heliGroup = new THREE.Group();
  const heliBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.85, 0.95),
    new THREE.MeshStandardMaterial({ color: 0xf5b942, metalness: 0.8, roughness: 0.25 })
  );
  heliBody.position.y = 0.9;
  heliBody.castShadow = true;
  heliGroup.add(heliBody);

  const rotorMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  rotorMast.position.y = 1.65;
  heliGroup.add(rotorMast);

  const rotorUpper = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.04, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  rotorUpper.position.y = 1.95;
  heliGroup.add(rotorUpper);

  const rotorLower = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.04, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  rotorLower.position.y = 1.72;
  rotorLower.rotation.y = Math.PI / 2;
  heliGroup.add(rotorLower);

  const solarPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.06, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.2 })
  );
  solarPanel.position.y = 2.18;
  heliGroup.add(solarPanel);

  [
    [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    leg.position.set(lx, 0.45, lz);
    heliGroup.add(leg);
  });

  const hx = 10, hz = 8;
  heliGroup.position.set(hx, MarsData.getTerrainHeight(hx, hz), hz);
  scene.add(heliGroup);

  // 4C. COMMANDER VAL (EVA ASTRONAUT)
  const astroGroup = new THREE.Group();
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.38, 1.15, 12),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  torso.position.y = 1.35;
  torso.castShadow = true;
  astroGroup.add(torso);

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf5b942, metalness: 0.85, roughness: 0.15 })
  );
  helmet.position.y = 2.15;
  astroGroup.add(helmet);

  const plssPack = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.95, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
  );
  plssPack.position.set(0, 1.45, -0.35);
  astroGroup.add(plssPack);

  const ax = -7, az = 5;
  astroGroup.position.set(ax, MarsData.getTerrainHeight(ax, az), az);
  scene.add(astroGroup);

  // 5. Build the 5 Real Discarded NASA Hardware Monuments
  const artifactMeshes = [];

  MarsData.MISSIONS.forEach((m) => {
    const group = new THREE.Group();
    const my = MarsData.getTerrainHeight(m.x, m.z);
    group.position.set(m.x, my, m.z);

    if (m.id === 'heatshield') {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(4.2, 1.6, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide })
      );
      cone.rotation.z = 0.28;
      cone.position.y = 0.8;
      group.add(cone);
    } else if (m.id === 'backshell') {
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 3.8, 2.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })
      );
      shell.rotation.x = 0.4;
      shell.position.y = 1.0;
      group.add(shell);

      const chute = new THREE.Mesh(
        new THREE.CircleGeometry(6.5, 20),
        new THREE.MeshStandardMaterial({ color: 0xea580c, side: THREE.DoubleSide })
      );
      chute.rotation.x = -Math.PI / 2;
      chute.position.set(7.5, 0.35, 3.0);
      group.add(chute);
    } else if (m.id === 'skycrane') {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.4, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.35 })
      );
      frame.rotation.z = -0.35;
      frame.position.y = 1.1;
      group.add(frame);
    } else if (m.id === 'ingenuity_field') {
      const crashedCopter = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.4, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xf5b942, metalness: 0.8 })
      );
      crashedCopter.position.y = 0.9;
      group.add(crashedCopter);
    } else {
      for (let t = -2; t <= 2; t++) {
        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 1.4, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.1 })
        );
        tube.rotation.z = Math.PI / 2;
        tube.position.set(t * 1.5, 0.35, (t % 2) * 1.2);
        group.add(tube);
      }
    }

    const ringGeo = new THREE.CylinderGeometry(5.5, 5.5, 32, 24, 1, true);
    const ringMat = new THREE.MeshBasicMaterial({
      color: m.color,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beacon = new THREE.Mesh(ringGeo, ringMat);
    beacon.position.y = 16;
    group.add(beacon);

    group.userData = {
      scannable: true,
      missionId: m.id,
      name: `NASA ARTIFACT: ${m.shortName}`,
      composition: `UV Loss: ${m.uvDegradation} • Dust: ${m.dustCoat}`,
      peaks: m.peaks
    };

    scene.add(group);
    artifactMeshes.push({ mission: m, group, beacon });
  });

  // 6. 3D Glowing GPS Waypoint Chevrons on the Martian Terrain
  const gpsChevronsGroup = new THREE.Group();
  scene.add(gpsChevronsGroup);

  const chevronGeo = new THREE.ConeGeometry(1.1, 2.4, 4);
  chevronGeo.rotateX(Math.PI / 2);
  const chevronMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.82
  });

  function updateGpsChevrons(points) {
    while (gpsChevronsGroup.children.length > 0) {
      gpsChevronsGroup.remove(gpsChevronsGroup.children[0]);
    }
    if (!points || points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const yaw = Math.atan2(p2.x - p1.x, p2.z - p1.z);
      const midX = (p1.x + p2.x) * 0.5;
      const midZ = (p1.z + p2.z) * 0.5;
      const midY = MarsData.getTerrainHeight(midX, midZ) + 1.4;

      const mesh = new THREE.Mesh(chevronGeo, chevronMat);
      mesh.position.set(midX, midY, midZ);
      mesh.rotation.y = yaw;
      gpsChevronsGroup.add(mesh);
    }
  }

  // 7. Persistent 3D Rover Tire Tracks in Regolith
  const tracksGroup = new THREE.Group();
  scene.add(tracksGroup);
  const trackGeo = new THREE.PlaneGeometry(0.48, 1.3);
  trackGeo.rotateX(-Math.PI / 2);
  const trackMat = new THREE.MeshBasicMaterial({
    color: 0x3d190c,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });

  function addRoverTrack(x, z, yaw) {
    [-1.5, 1.5].forEach((offset) => {
      const tx = x + Math.cos(yaw) * offset;
      const tz = z - Math.sin(yaw) * offset;
      const ty = MarsData.getTerrainHeight(tx, tz) + 0.06;
      const tr = new THREE.Mesh(trackGeo, trackMat);
      tr.position.set(tx, ty, tz);
      tr.rotation.y = yaw;
      tracksGroup.add(tr);
    });
    while (tracksGroup.children.length > 240) {
      tracksGroup.remove(tracksGroup.children[0]);
    }
  }

  // 8. ChemCam Laser Beam Line
  const laserMat = new THREE.LineBasicMaterial({ color: 0xff1e1e, linewidth: 3 });
  const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -10)
  ]);
  const laserLine = new THREE.Line(laserGeo, laserMat);
  laserLine.visible = false;
  scene.add(laserLine);

  // 9. Volumetric Martian Dust Storm Particles
  const dustCount = 900;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 260;
    dustPositions[i * 3 + 1] = Math.random() * 45;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 260;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xff9d66,
    size: 0.85,
    transparent: true,
    opacity: 0.45
  });
  const dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    scene,
    camera,
    renderer,
    hemiLight,
    sunLight,
    starsPoints,
    phobosMesh,
    roverGroup,
    roverWheels,
    wheelMat,
    roverSolarWing,
    headlightGroup,
    heliGroup,
    rotorUpper,
    rotorLower,
    astroGroup,
    artifactMeshes,
    scannableRocks,
    gpsChevronsGroup,
    updateGpsChevrons,
    addRoverTrack,
    applyRealSatelliteTexture,
    laserLine,
    dustParticles
  };
}

window.createMarsWorld = createMarsWorld;
