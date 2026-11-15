// MISSION MARS — Upgraded Game Engine: 3D GPS Chevrons, Sol Cycle, LIBS Spectrum, Engineering Garage & Judge Auto-Tour

(function () {
  const container = document.getElementById('canvas-container');
  const world = window.createMarsWorld(container);

  // Game State
  const state = {
    activeUnit: 'rover', // 'rover' | 'heli' | 'astro'
    scienceMB: 1250,
    completedMissions: new Set(),
    preservedMissions: new Set(),
    installedUpgrades: new Set(),
    currentMissionIdx: 0,
    activeArtifactMission: null,
    dustStormActive: false,
    solPhase: 0, // 0: Noon (14:20 LMST), 1: Blue Martian Sunset (18:45 LMST), 2: Starry Night (23:10 LMST)
    headlightsOn: true,
    autoTourActive: false,
    autoTourTimer: 0,
    hazardStars: 0,
    hazardReason: 'NOMINAL',
    health: 100,
    battery: 100,
    o2: 100,
    tacticalLayer: 'mola',
    currentRoute: null,
    skyTransition: null,
    lastTrackPos: { x: 0, z: 0 },
    units: {
      rover: { x: 0, y: 0, z: 0, yaw: 0, speed: 0, mesh: world.roverGroup },
      heli: { x: 12, y: 0, z: 8, yaw: 0.4, speed: 0, altOffset: 0, mesh: world.heliGroup },
      astro: { x: -7, y: 0, z: 5, yaw: -0.3, speed: 0, vy: 0, grounded: true, mesh: world.astroGroup }
    }
  };

  Object.values(state.units).forEach((u) => {
    u.y = MarsData.getTerrainHeight(u.x, u.z);
    u.mesh.position.set(u.x, u.y, u.z);
  });

  // Compute A* GPS route & spawn 3D glowing ground chevrons
  function updateRouteToGoal(goalX, goalZ, customLabel) {
    const u = state.units[state.activeUnit];
    state.currentRoute = MarsData.computeAStarRoute(u.x, u.z, goalX, goalZ);
    world.updateGpsChevrons(state.currentRoute.points);

    const distEl = document.getElementById('route-stat-dist');
    const slopeEl = document.getElementById('route-stat-slope');
    const pwrEl = document.getElementById('route-stat-pwr');
    const radEl = document.getElementById('route-stat-rad');

    if (distEl) distEl.textContent = `${state.currentRoute.distance} m`;
    if (slopeEl) {
      const s = parseFloat(state.currentRoute.maxSlope);
      slopeEl.textContent = `${s}° (${s > 16 ? 'CAUTION' : 'SAFE'})`;
    }
    if (pwrEl) pwrEl.textContent = `${state.currentRoute.batteryDrain}%`;
    if (radEl) radEl.textContent = `${state.currentRoute.radiationMSv} mSv`;
    if (customLabel) {
      document.getElementById('radar-zone-name').textContent = customLabel;
    }
  }

  function setMission(idx) {
    state.currentMissionIdx = (idx + MarsData.MISSIONS.length) % MarsData.MISSIONS.length;
    const m = MarsData.MISSIONS[state.currentMissionIdx];
    const doneTag = state.preservedMissions.has(m.id)
      ? ' [HERITAGE MONUMENT ✓]'
      : state.completedMissions.has(m.id)
        ? ' [SALVAGED ✓]'
        : '';
    document.getElementById('mission-index-tag').textContent =
      `MISSION 0${m.index} / 0${MarsData.MISSIONS.length}${doneTag}`;
    document.getElementById('mission-title').textContent = m.title;
    document.getElementById('mission-desc').textContent = m.objective;
    document.getElementById('radar-zone-name').textContent = m.zone;
    updateRouteToGoal(m.x, m.z);
    renderTacticalMap();
  }

  // Martian Sol Cycle: Noon -> Famous Blue Martian Sunset (Mie Scattering) -> Starry Night
  function cycleSolPhase(forcePhase) {
    state.solPhase = typeof forcePhase === 'number' ? forcePhase : (state.solPhase + 1) % 3;
    const btn = document.getElementById('btn-sol-time');
    const solEl = document.getElementById('tele-sol');
    const tempEl = document.getElementById('tele-temp');
    const fluxEl = document.getElementById('tele-pressure');

    if (state.solPhase === 0) {
      // Martian Noon
      btn.textContent = '☀️ SOL: NOON [T]';
      solEl.textContent = '1328 • 14:20';
      tempEl.textContent = '-22°C';
      fluxEl.textContent = '540 W/m²';
      world.scene.background.setHex(0xc86d44);
      world.scene.fog.color.setHex(0xc86d44);
      world.hemiLight.color.setHex(0xffb88c);
      world.hemiLight.intensity = 0.72;
      world.sunLight.color.setHex(0xffe2c4);
      world.sunLight.intensity = 1.25;
      world.sunLight.position.set(220, 340, -180);
      world.starsPoints.material.opacity = 0.0;
    } else if (state.solPhase === 1) {
      // NASA Famous Blue Martian Sunset (Fine dust scatters blue wavelengths forward)
      btn.textContent = '🌇 SOL: BLUE SUNSET [T]';
      solEl.textContent = '1328 • 18:45';
      tempEl.textContent = '-61°C';
      fluxEl.textContent = '145 W/m²';
      world.scene.background.setHex(0x3b5978);
      world.scene.fog.color.setHex(0x4b6584);
      world.hemiLight.color.setHex(0x74b9ff);
      world.hemiLight.intensity = 0.52;
      world.sunLight.color.setHex(0x90cdf4);
      world.sunLight.intensity = 0.85;
      world.sunLight.position.set(-340, 75, -240);
      world.starsPoints.material.opacity = 0.45;
      toggleHeadlights(true);
    } else {
      // Starry Martian Night (-86°C Freeze)
      btn.textContent = '🌌 SOL: NIGHT (-86°C) [T]';
      solEl.textContent = '1328 • 23:10';
      tempEl.textContent = '-86°C';
      fluxEl.textContent = '0 W/m²';
      world.scene.background.setHex(0x090d16);
      world.scene.fog.color.setHex(0x090d16);
      world.hemiLight.color.setHex(0x334155);
      world.hemiLight.intensity = 0.28;
      world.sunLight.color.setHex(0x64748b);
      world.sunLight.intensity = 0.25;
      world.starsPoints.material.opacity = 0.95;
      toggleHeadlights(true);
    }
  }

  function toggleHeadlights(forceState) {
    state.headlightsOn = typeof forceState === 'boolean' ? forceState : !state.headlightsOn;
    world.headlightGroup.visible = state.headlightsOn;
    const btn = document.getElementById('btn-headlights');
    btn.textContent = state.headlightsOn ? '🔦 LIGHTS: ON [L]' : '🔦 LIGHTS: OFF [L]';
    btn.classList.toggle('active', state.headlightsOn);
  }

  // Draw Real-Time LIBS Atomic Spectrum + Mastcam-Z False-Color PIP
  function renderLibsSpectrumAndPip(targetName, peaks, isArtifact) {
    // 1. LIBS Atomic Spectrum Graph (240nm - 850nm)
    const specCanvas = document.getElementById('libs-spectrum-canvas');
    const sCtx = specCanvas.getContext('2d');
    const w = specCanvas.width;
    const h = specCanvas.height;

    sCtx.fillStyle = '#050914';
    sCtx.fillRect(0, 0, w, h);

    // Grid lines
    sCtx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    sCtx.lineWidth = 1;
    for (let x = 35; x < w; x += 45) {
      sCtx.beginPath();
      sCtx.moveTo(x, 0);
      sCtx.lineTo(x, h);
      sCtx.stroke();
    }

    // Baseline continuum noise + emission spikes
    sCtx.strokeStyle = '#38bdf8';
    sCtx.lineWidth = 1.5;
    sCtx.beginPath();
    for (let px = 0; px < w; px++) {
      const nm = 240 + (px / w) * 610;
      let amp = 0.08 + Math.sin(px * 0.4) * 0.03;
      (peaks || []).forEach((pk) => {
        const dist = Math.abs(nm - pk.nm);
        if (dist < 14) {
          amp += pk.amp * Math.exp(-Math.pow(dist / 3.8, 2));
        }
      });
      const py = h - 6 - Math.min(0.95, amp) * (h - 14);
      if (px === 0) sCtx.moveTo(px, py);
      else sCtx.lineTo(px, py);
    }
    sCtx.stroke();

    // Label major atomic peaks
    sCtx.fillStyle = '#f5b942';
    sCtx.font = 'bold 9px "JetBrains Mono", monospace';
    (peaks || []).forEach((pk) => {
      const px = ((pk.nm - 240) / 610) * w;
      sCtx.fillText(`${pk.el}`, Math.max(4, Math.min(w - 28, px - 8)), 11);
    });

    // 2. Mastcam-Z False-Color Micro-Imager PIP
    const pipCanvas = document.getElementById('mastcam-canvas');
    const pCtx = pipCanvas.getContext('2d');
    const pw = pipCanvas.width;
    const ph = pipCanvas.height;

    const grad = pCtx.createLinearGradient(0, 0, pw, ph);
    if (isArtifact) {
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#7c2d12');
    } else {
      grad.addColorStop(0, '#6e3019');
      grad.addColorStop(1, '#29150c');
    }
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, pw, ph);

    // Draw mineral grains / laser ablation pit
    for (let i = 0; i < 28; i++) {
      pCtx.fillStyle = i % 3 === 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(245, 185, 66, 0.4)';
      pCtx.beginPath();
      pCtx.arc(
        (Math.sin(i * 7.3) * 0.4 + 0.5) * pw,
        (Math.cos(i * 4.1) * 0.4 + 0.5) * ph,
        1.5 + (i % 3),
        0,
        Math.PI * 2
      );
      pCtx.fill();
    }
    // Red LIBS laser plasma spot at center
    pCtx.strokeStyle = '#ff2a2a';
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.arc(pw / 2, ph / 2, 9, 0, Math.PI * 2);
    pCtx.stroke();
  }

  // Rover Engineering Garage Modal (#garageDialog)
  function renderGarageModal() {
    const baseMass = 1025;
    let deltaMass = 0;
    MarsData.GARAGE_UPGRADES.forEach((up) => {
      if (state.installedUpgrades.has(up.id)) deltaMass += up.massDeltaKg;
    });

    const totalMass = baseMass + deltaMass;
    const maxSlope = state.installedUpgrades.has('nitinol_tires') ? 27 : 20;
    const topSpeed = state.installedUpgrades.has('nitinol_tires') ? 78 : 57;

    document.getElementById('garage-mb-balance').textContent = `${state.scienceMB.toLocaleString()} MB`;
    document.getElementById('garage-total-mass').textContent = `${totalMass.toLocaleString()} kg`;
    document.getElementById('garage-max-slope').textContent = `${maxSlope}°`;
    document.getElementById('garage-top-speed').textContent = `${topSpeed} km/h`;
    document.getElementById('loadout-mass-tag').textContent = `${totalMass.toLocaleString()} KG • 0.38G`;

    // Update Rover active subtitle
    if (state.activeUnit === 'rover') {
      const powerLabel = state.installedUpgrades.has('hybrid_rtg_solar')
        ? 'MMRTG + GaAs Solar Wing'
        : 'MMRTG Nuclear';
      const tireLabel = state.installedUpgrades.has('nitinol_tires')
        ? 'Nitinol Mesh Tires'
        : 'Standard Cleats';
      document.getElementById('active-unit-sub').textContent = `${powerLabel} • ${tireLabel}`;
    }

    const grid = document.getElementById('garage-grid');
    grid.innerHTML = '';

    MarsData.GARAGE_UPGRADES.forEach((up) => {
      const installed = state.installedUpgrades.has(up.id);
      const canAfford = state.scienceMB >= up.costMB;
      const card = document.createElement('div');
      card.className = `garage-card${installed ? ' installed' : ''}`;
      card.innerHTML = `
        <div>
          <div class="garage-card-top">
            <span class="garage-cat">${up.category}</span>
            <span class="garage-cost">${installed ? 'INSTALLED ✓' : `${up.costMB} MB`}</span>
          </div>
          <div class="garage-title">${up.name}</div>
          <p class="garage-desc">${up.desc}</p>
        </div>
        <div>
          <div class="garage-specs">${up.specs}</div>
          <button type="button" class="hud-btn ${installed ? '' : 'hud-btn-gold'}" style="margin-top:8px;width:100%" ${!installed && !canAfford ? 'disabled' : ''}>
            ${installed ? 'INSTALLED ON ROVER' : canAfford ? `INSTALL UPGRADE (-${up.costMB} MB)` : `NEED ${up.costMB} MB DATA`}
          </button>
        </div>
      `;
      const btn = card.querySelector('button');
      if (!installed && canAfford) {
        btn.addEventListener('click', () => {
          state.scienceMB -= up.costMB;
          state.installedUpgrades.add(up.id);
          document.getElementById('stat-science').textContent = state.scienceMB.toLocaleString();

          // Apply 3D visual upgrades on the Rover!
          if (up.id === 'hybrid_rtg_solar') {
            world.roverSolarWing.visible = true;
          }
          if (up.id === 'nitinol_tires') {
            world.wheelMat.color.setHex(0xd97706); // Golden superelastic Nitinol mesh tint
          }
          MarsAudio.playMissionPassedFanfare();
          renderGarageModal();
        });
      }
      grid.appendChild(card);
    });
  }

  // Input Handling
  const keys = {};
  window.addEventListener('keydown', (e) => {
    const code = e.code;
    keys[code] = true;

    const mapDialog = document.getElementById('mapDialog');
    const dossierDialog = document.getElementById('dossierDialog');
    const garageDialog = document.getElementById('garageDialog');
    if (mapDialog.open || dossierDialog.open || garageDialog.open) return;

    if (code === 'Digit1') switchUnit('rover');
    if (code === 'Digit2') switchUnit('heli');
    if (code === 'Digit3') switchUnit('astro');
    if (code === 'Tab') {
      e.preventDefault();
      const overlay = document.getElementById('switch-wheel-overlay');
      overlay.hidden = !overlay.hidden;
    }
    if (code === 'KeyM') {
      e.preventDefault();
      openTacticalMap();
    }
    if (code === 'KeyG') {
      e.preventDefault();
      openGarageModal();
    }
    if (code === 'KeyT') {
      cycleSolPhase();
    }
    if (code === 'KeyL') {
      toggleHeadlights();
    }
    if (code === 'KeyP') {
      toggleAutoTour();
    }
    if (code === 'KeyR') {
      cycleRadioStation();
    }
    if (code === 'KeyF') {
      handleVehicleEnterExit();
    }
    if (code === 'KeyE') {
      trySalvageNearbyArtifact();
    }
    if (code === 'Space') {
      if (state.activeUnit === 'astro') {
        const a = state.units.astro;
        if (a.grounded) {
          a.vy = 6.2;
          a.grounded = false;
        }
      } else {
        fireChemCamLaser();
      }
    }
    if (code === 'Enter') {
      const wastedOverlay = document.getElementById('wasted-overlay');
      if (!wastedOverlay.hidden) {
        recoverToOctaviaBase();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  world.renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button === 0) fireChemCamLaser();
  });

  // GTA V Sky-Camera Unit Switch
  function switchUnit(targetUnit) {
    document.getElementById('switch-wheel-overlay').hidden = true;
    if (state.activeUnit === targetUnit) return;

    const prevUnit = state.units[state.activeUnit];
    const nextUnit = state.units[targetUnit];

    if (targetUnit === 'astro' && !world.astroGroup.visible) {
      world.astroGroup.visible = true;
      nextUnit.x = prevUnit.x - Math.cos(prevUnit.yaw) * 3.5;
      nextUnit.z = prevUnit.z + Math.sin(prevUnit.yaw) * 3.5;
      nextUnit.y = MarsData.getTerrainHeight(nextUnit.x, nextUnit.z);
      nextUnit.mesh.position.set(nextUnit.x, nextUnit.y, nextUnit.z);
    }

    state.skyTransition = {
      t: 0,
      from: new THREE.Vector3(prevUnit.x, prevUnit.y, prevUnit.z),
      to: new THREE.Vector3(nextUnit.x, nextUnit.y, nextUnit.z)
    };
    state.activeUnit = targetUnit;
    MarsAudio.playSwitchWhoosh();

    const meta = {
      rover: {
        name: 'PERSEVERANCE ROVER',
        sub: state.installedUpgrades.has('nitinol_tires')
          ? 'Nitinol Mesh Tires • SuperCam LIBS [SPACE]'
          : '6x6 Rocker-Bogie • ChemCam LIBS Laser [SPACE]'
      },
      heli: {
        name: 'INGENUITY HELICOPTER',
        sub: 'Coaxial Mars Rotorcraft • [SHIFT] Ascend / [C] Descend'
      },
      astro: {
        name: 'CMDR. VAL (EVA SUIT)',
        sub: '0.38g Astronaut • [SPACE] Low-G Jump • [F] Enter Vehicle'
      }
    }[targetUnit];

    document.getElementById('active-unit-name').textContent = meta.name;
    document.getElementById('active-unit-sub').textContent = meta.sub;

    document.querySelectorAll('.wheel-segment').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.unit === targetUnit);
    });

    const m = MarsData.MISSIONS[state.currentMissionIdx];
    updateRouteToGoal(m.x, m.z);
  }

  function handleVehicleEnterExit() {
    if (state.activeUnit === 'rover' || state.activeUnit === 'heli') {
      const veh = state.units[state.activeUnit];
      const astro = state.units.astro;
      astro.x = veh.x + 3.2;
      astro.z = veh.z + 1.5;
      astro.y = MarsData.getTerrainHeight(astro.x, astro.z);
      astro.mesh.position.set(astro.x, astro.y, astro.z);
      world.astroGroup.visible = true;
      switchUnit('astro');
    } else {
      const astro = state.units.astro;
      const dRover = Math.hypot(astro.x - state.units.rover.x, astro.z - state.units.rover.z);
      const dHeli = Math.hypot(astro.x - state.units.heli.x, astro.z - state.units.heli.z);
      if (dRover < 8.5) {
        world.astroGroup.visible = false;
        switchUnit('rover');
      } else if (dHeli < 8.5) {
        world.astroGroup.visible = false;
        switchUnit('heli');
      }
    }
  }

  // Upgraded ChemCam LIBS Laser Spectrometer with Atomic Spectrum Graph
  let scanToastTimeout = null;
  function fireChemCamLaser() {
    MarsAudio.playLaserZap();
    const reticle = document.getElementById('reticle');
    reticle.classList.add('laser-firing');
    setTimeout(() => reticle.classList.remove('laser-firing'), 160);

    const u = state.units[state.activeUnit];
    const origin = new THREE.Vector3(u.x, u.y + 2.8, u.z);
    const forward = new THREE.Vector3(Math.sin(u.yaw), -0.06, Math.cos(u.yaw)).normalize();

    let bestTarget = null;
    let bestDist = state.installedUpgrades.has('supercam_rimfax') ? 78 : 55;

    const candidates = [
      ...world.scannableRocks,
      ...world.artifactMeshes.map((a) => a.group)
    ];

    for (const obj of candidates) {
      const toObj = new THREE.Vector3().subVectors(obj.position, origin);
      const dist = toObj.length();
      if (dist > bestDist) continue;
      const dot = toObj.clone().normalize().dot(forward);
      if (dot > 0.8) {
        bestDist = dist;
        bestTarget = obj;
      }
    }

    const hitPoint = bestTarget
      ? bestTarget.position.clone().add(new THREE.Vector3(0, 1.0, 0))
      : origin.clone().add(forward.multiplyScalar(32));

    const linePositions = world.laserLine.geometry.attributes.position;
    linePositions.setXYZ(0, origin.x, origin.y, origin.z);
    linePositions.setXYZ(1, hitPoint.x, hitPoint.y, hitPoint.z);
    linePositions.needsUpdate = true;
    world.laserLine.visible = true;
    setTimeout(() => {
      world.laserLine.visible = false;
    }, 160);

    const toast = document.getElementById('scan-toast');
    toast.hidden = false;
    const bonusMultiplier = state.installedUpgrades.has('supercam_rimfax') ? 2 : 1;

    if (bestTarget && bestTarget.userData) {
      document.getElementById('scan-dist').textContent = `${bestDist.toFixed(1)} m`;
      document.getElementById('scan-title').textContent = bestTarget.userData.name;
      document.getElementById('scan-comp').textContent = bestTarget.userData.composition;
      renderLibsSpectrumAndPip(
        bestTarget.userData.name,
        bestTarget.userData.peaks,
        Boolean(bestTarget.userData.missionId)
      );
      state.scienceMB += 30 * bonusMultiplier;
      document.getElementById('stat-science').textContent = state.scienceMB.toLocaleString();
    } else {
      const slope = MarsData.getTerrainSlope(hitPoint.x, hitPoint.z).toFixed(1);
      const ice = MarsData.getWaterIceDepth(hitPoint.x, hitPoint.z).toFixed(1);
      document.getElementById('scan-dist').textContent = `32.0 m`;
      document.getElementById('scan-title').textContent = `Jezero Regolith Floor (Slope ${slope}°)`;
      document.getElementById('scan-comp').textContent =
        `Fe₂O₃ Dust • ClO₄⁻ Perchlorate: 0.6% • Subsurface Ice Depth: ${ice}m`;
      renderLibsSpectrumAndPip('Regolith', [
        { nm: 288, el: 'Si', amp: 0.78 },
        { nm: 404, el: 'Fe', amp: 0.91 },
        { nm: 589, el: 'Na', amp: 0.52 },
        { nm: 656, el: 'H₂O', amp: 0.44 }
      ], false);
    }

    if (scanToastTimeout) clearTimeout(scanToastTimeout);
    scanToastTimeout = setTimeout(() => {
      toast.hidden = true;
    }, 4200);
  }

  // Inspect & Salvage or Preserve Discarded NASA Hardware (Press E)
  function trySalvageNearbyArtifact() {
    const u = state.units[state.activeUnit];
    for (const item of world.artifactMeshes) {
      const m = item.mission;
      const dist = Math.hypot(u.x - m.x, u.z - m.z);
      if (dist < 19) {
        state.activeArtifactMission = m;
        MarsAudio.playMissionPassedFanfare();
        document.getElementById('mp-banner-heading').textContent = 'ARTIFACT LOCATED';
        document.getElementById('mp-artifact-name').textContent = m.shortName.toUpperCase();
        document.getElementById('w-uv').textContent = m.uvDegradation;
        document.getElementById('w-dust').textContent = m.dustCoat;
        document.getElementById('w-pit').textContent = m.pitting;
        document.getElementById('mp-nasa-fact').textContent = m.nasaFact;
        document.getElementById('mission-passed-overlay').hidden = false;
        return;
      }
    }
  }

  function completeArtifactDecision(mode) {
    const m = state.activeArtifactMission || MarsData.MISSIONS[state.currentMissionIdx];
    if (!state.completedMissions.has(m.id)) {
      state.completedMissions.add(m.id);
      if (mode === 'preserve') {
        state.preservedMissions.add(m.id);
        state.scienceMB += m.rewardMB + 250;
      } else {
        state.scienceMB += m.rewardMB;
        state.battery = 100;
        state.health = 100;
        state.o2 = 100;
      }
      document.getElementById('stat-science').textContent = state.scienceMB.toLocaleString();
      document.getElementById('stat-artifacts').textContent =
        `${state.completedMissions.size} / ${MarsData.MISSIONS.length}`;
    }
    document.getElementById('mission-passed-overlay').hidden = true;
    setMission(state.currentMissionIdx + 1);
  }

  document.getElementById('btn-choice-preserve').addEventListener('click', () => {
    completeArtifactDecision('preserve');
  });
  document.getElementById('btn-choice-salvage').addEventListener('click', () => {
    completeArtifactDecision('salvage');
  });

  // GTA V "WASTED / SIGNAL LOST" Recovery
  function triggerSignalLost(reasonText) {
    state.autoTourActive = false;
    document.getElementById('autotour-banner').hidden = true;
    document.getElementById('wasted-reason').textContent = reasonText;
    document.getElementById('wasted-overlay').hidden = false;
  }

  function recoverToOctaviaBase() {
    document.getElementById('wasted-overlay').hidden = true;
    const u = state.units[state.activeUnit];
    u.x = 0;
    u.z = 0;
    u.y = MarsData.getTerrainHeight(0, 0);
    u.speed = 0;
    u.mesh.position.set(u.x, u.y, u.z);
    u.mesh.rotation.set(0, 0, 0);
    state.health = 100;
    state.battery = 100;
    state.o2 = 100;
    const m = MarsData.MISSIONS[state.currentMissionIdx];
    updateRouteToGoal(m.x, m.z);
  }

  document.getElementById('btn-wasted-recover').addEventListener('click', recoverToOctaviaBase);

  // Judge Auto-Tour / Autonomous AI Showcase Mode (P Key)
  function toggleAutoTour(forceState) {
    state.autoTourActive = typeof forceState === 'boolean' ? forceState : !state.autoTourActive;
    state.autoTourTimer = 0;
    document.getElementById('autotour-banner').hidden = !state.autoTourActive;
    document.getElementById('btn-autotour').classList.toggle('active', state.autoTourActive);
  }

  document.getElementById('btn-autotour').addEventListener('click', () => toggleAutoTour());
  document.getElementById('btn-stop-autotour').addEventListener('click', () => toggleAutoTour(false));

  // GTA V Tilted Bottom-Left Radar Minimap Renderer
  const radarCanvas = document.getElementById('radar-canvas');
  const rCtx = radarCanvas.getContext('2d');

  function renderRadarMinimap() {
    const w = radarCanvas.width;
    const h = radarCanvas.height;
    const u = state.units[state.activeUnit];

    rCtx.fillStyle = '#120a07';
    rCtx.fillRect(0, 0, w, h);

    rCtx.save();
    rCtx.translate(w / 2, h * 0.62);
    rCtx.rotate(u.yaw - Math.PI);

    const scale = 0.36;
    const step = 30;
    const range = 240;
    const baseX = Math.floor(u.x / step) * step;
    const baseZ = Math.floor(u.z / step) * step;

    for (let gx = baseX - range; gx <= baseX + range; gx += step) {
      for (let gz = baseZ - range; gz <= baseZ + range; gz += step) {
        const slope = MarsData.getTerrainSlope(gx, gz);
        if (slope > 15) {
          rCtx.fillStyle = slope > 20 ? 'rgba(239, 68, 68, 0.36)' : 'rgba(245, 185, 66, 0.22)';
          rCtx.fillRect((gx - u.x) * scale - 5, (gz - u.z) * scale - 5, 10, 10);
        }
      }
    }

    if (state.currentRoute && state.currentRoute.points.length > 1) {
      rCtx.strokeStyle = '#c084fc';
      rCtx.lineWidth = 3.5;
      rCtx.beginPath();
      state.currentRoute.points.forEach((pt, idx) => {
        const rx = (pt.x - u.x) * scale;
        const rz = (pt.z - u.z) * scale;
        if (idx === 0) rCtx.moveTo(rx, rz);
        else rCtx.lineTo(rx, rz);
      });
      rCtx.stroke();
    }

    // Draw Octavia Base & Lava Tube Shelter on radar
    rCtx.fillStyle = '#38bdf8';
    rCtx.beginPath();
    rCtx.arc((0 - u.x) * scale, (-25 - u.z) * scale, 5, 0, Math.PI * 2);
    rCtx.fill();

    rCtx.fillStyle = '#38bdf8';
    rCtx.strokeStyle = '#ffffff';
    rCtx.lineWidth = 1.5;
    rCtx.beginPath();
    rCtx.arc(
      (MarsData.SHELTER_SITE.x - u.x) * scale,
      (MarsData.SHELTER_SITE.z - u.z) * scale,
      5.5,
      0,
      Math.PI * 2
    );
    rCtx.fill();
    rCtx.stroke();

    MarsData.MISSIONS.forEach((m, idx) => {
      const bx = (m.x - u.x) * scale;
      const bz = (m.z - u.z) * scale;
      rCtx.fillStyle = state.completedMissions.has(m.id) ? '#4ade80' : m.color;
      rCtx.beginPath();
      rCtx.arc(bx, bz, idx === state.currentMissionIdx ? 6.5 : 4.5, 0, Math.PI * 2);
      rCtx.fill();
      if (idx === state.currentMissionIdx) {
        rCtx.strokeStyle = '#ffffff';
        rCtx.lineWidth = 1.5;
        rCtx.stroke();
      }
    });

    Object.entries(state.units).forEach(([key, other]) => {
      if (key === state.activeUnit) return;
      if (key === 'astro' && !world.astroGroup.visible) return;
      rCtx.fillStyle = '#94a3b8';
      rCtx.fillRect((other.x - u.x) * scale - 3, (other.z - u.z) * scale - 3, 6, 6);
    });

    rCtx.restore();

    rCtx.save();
    rCtx.translate(w / 2, h * 0.62);
    rCtx.fillStyle = '#ffffff';
    rCtx.beginPath();
    rCtx.moveTo(0, -8);
    rCtx.lineTo(6, 7);
    rCtx.lineTo(0, 4);
    rCtx.lineTo(-6, 7);
    rCtx.closePath();
    rCtx.fill();
    rCtx.restore();
  }

  // Full-Screen Tactical Martian Map & A* Interactive Planner
  const tacCanvas = document.getElementById('tactical-map-canvas');
  const tCtx = tacCanvas.getContext('2d');

  function renderTacticalMap() {
    const w = tacCanvas.width;
    const h = tacCanvas.height;
    const half = MarsData.WORLD_SIZE / 2;

    const toPxX = (wx) => ((wx + half) / MarsData.WORLD_SIZE) * w;
    const toPxY = (wz) => ((wz + half) / MarsData.WORLD_SIZE) * h;

    const cell = 8;
    for (let py = 0; py < h; py += cell) {
      for (let px = 0; px < w; px += cell) {
        const wx = (px / w) * MarsData.WORLD_SIZE - half;
        const wz = (py / h) * MarsData.WORLD_SIZE - half;

        if (state.tacticalLayer === 'mola') {
          const elev = MarsData.getTerrainHeight(wx, wz);
          const norm = Math.max(0, Math.min(1, (elev + 12) / 45));
          const r = Math.round(95 + norm * 135);
          const g = Math.round(42 + norm * 75);
          const b = Math.round(25 + norm * 45);
          tCtx.fillStyle = `rgb(${r},${g},${b})`;
        } else if (state.tacticalLayer === 'slope') {
          const slope = MarsData.getTerrainSlope(wx, wz);
          if (slope > 18) tCtx.fillStyle = '#ef4444';
          else if (slope > 12) tCtx.fillStyle = '#f59e0b';
          else tCtx.fillStyle = '#1e293b';
        } else {
          const ice = MarsData.getWaterIceDepth(wx, wz);
          const norm = 1 - Math.min(1, ice / 9.5);
          const r = Math.round(15 + norm * 25);
          const g = Math.round(45 + norm * 145);
          const b = Math.round(95 + norm * 155);
          tCtx.fillStyle = `rgb(${r},${g},${b})`;
        }
        tCtx.fillRect(px, py, cell, cell);
      }
    }

    if (state.currentRoute && state.currentRoute.points.length > 1) {
      tCtx.strokeStyle = '#c084fc';
      tCtx.lineWidth = 3.5;
      tCtx.beginPath();
      state.currentRoute.points.forEach((pt, idx) => {
        const px = toPxX(pt.x);
        const py = toPxY(pt.z);
        if (idx === 0) tCtx.moveTo(px, py);
        else tCtx.lineTo(px, py);
      });
      tCtx.stroke();
    }

    // Draw Lava Tube Shelter on Tactical Map
    const shPx = toPxX(MarsData.SHELTER_SITE.x);
    const shPy = toPxY(MarsData.SHELTER_SITE.z);
    tCtx.fillStyle = '#38bdf8';
    tCtx.beginPath();
    tCtx.arc(shPx, shPy, 7, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.fillStyle = '#38bdf8';
    tCtx.font = 'bold 11px "JetBrains Mono", monospace';
    tCtx.fillText('🛡️ Lava Tube Shelter', shPx + 10, shPy + 4);

    MarsData.MISSIONS.forEach((m) => {
      const px = toPxX(m.x);
      const py = toPxY(m.z);
      tCtx.fillStyle = m.color;
      tCtx.beginPath();
      tCtx.arc(px, py, 7, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.strokeStyle = '#fff';
      tCtx.lineWidth = 1.5;
      tCtx.stroke();

      tCtx.fillStyle = '#fff';
      tCtx.font = 'bold 11px "JetBrains Mono", monospace';
      tCtx.fillText(m.shortName, px + 10, py + 4);
    });

    const u = state.units[state.activeUnit];
    const ux = toPxX(u.x);
    const uy = toPxY(u.z);
    tCtx.fillStyle = '#4ade80';
    tCtx.beginPath();
    tCtx.arc(ux, uy, 7, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.fillStyle = '#4ade80';
    tCtx.fillText('YOU', ux + 10, uy - 4);
  }

  tacCanvas.addEventListener('click', (e) => {
    const rect = tacCanvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const half = MarsData.WORLD_SIZE / 2;
    const wx = nx * MarsData.WORLD_SIZE - half;
    const wz = ny * MarsData.WORLD_SIZE - half;
    updateRouteToGoal(wx, wz, 'CUSTOM TACTICAL WAYPOINT');
    renderTacticalMap();
  });

  // Populate POI List inside Tactical Map Modal
  const poiListEl = document.getElementById('poi-list');
  MarsData.MISSIONS.forEach((m, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'poi-item';
    const coords = MarsData.worldToMarsLatLon(m.x, m.z);
    btn.innerHTML = `
      <div>
        <div class="poi-item-title">${m.index}. ${m.shortName}</div>
        <div class="poi-item-meta">${coords.lat}°N, ${coords.lon}°E • Elev ${coords.molaElev}m</div>
      </div>
      <span class="hud-btn hud-btn-accent">ROUTE A*</span>
    `;
    btn.addEventListener('click', () => {
      setMission(idx);
    });
    poiListEl.appendChild(btn);
  });

  document.querySelectorAll('[data-layer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tacticalLayer = btn.dataset.layer;
      document.querySelectorAll('[data-layer]').forEach((b) =>
        b.classList.toggle('active', b === btn)
      );
      renderTacticalMap();
    });
  });

  // Native <dialog> Modals & MANDATORY light-dismiss fallback (per modern-web-guidance)
  const mapDialog = document.getElementById('mapDialog');
  const garageDialog = document.getElementById('garageDialog');
  const dossierDialog = document.getElementById('dossierDialog');
  const pitchDialog = document.getElementById('pitchDialog');

  function attachDialogEnhancements(dialog) {
    if (!dialog) return;
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  attachDialogEnhancements(mapDialog);
  attachDialogEnhancements(garageDialog);
  attachDialogEnhancements(dossierDialog);
  attachDialogEnhancements(pitchDialog);

  // Official 7-Slide NASA Space Apps Judge Pitch Deck
  const PITCH_SLIDES = [
    {
      tag: 'SLIDE 1: THE PROBLEM & VISION',
      title: 'Navigating Mars Is Lethal—And 2D Maps Don’t Tell the Story',
      html: `<p>Future Artemis and Mars explorers face steep >20° crater walls, blinding regional dust storms, -86°C night freezes, and solar radiation spikes—while surrounded by decades of historical NASA spacecraft hardware.</p>
      <ul>
        <li><strong>The Problem:</strong> Static 2D GIS charts fail to communicate 3D terrain slope hazards, energy budgets, or the physical reality of human artifacts left on Mars.</li>
        <li><strong>Our Solution:</strong> <strong>Mission Mars: Grand Theft Rover</strong>—an interactive 3D open-world survival, navigation, and heritage sandbox set in Jezero Crater (18.4447°N, 77.4508°E).</li>
      </ul>`
    },
    {
      tag: 'SLIDE 2: CHALLENGE #11 — MARTIAN SURVIVAL MAP',
      title: '60×60 MOLA/HiRISE DEM & A* Slope-Safe Terrain Pathfinder',
      html: `<p>Every hill, crater rim, and delta escarpment in our sandbox is synthesized from <strong>MOLA (Mars Orbiter Laser Altimeter)</strong> and <strong>HiRISE</strong> terrain models.</p>
      <ul>
        <li><strong>Real-Time A* Pathfinding:</strong> Computes local gradient vectors (∇z) across a 60×60 grid, penalizing hazardous slopes (>18°) to plot energy-optimal routes.</li>
        <li><strong>3D Ground Chevrons & Tactical Layers:</strong> Renders glowing 3D route chevrons directly on the terrain and lets players switch between <strong>MOLA Elevation</strong>, <strong>Slope Hazard</strong>, and <strong>SWIM Subsurface Water-Ice Depth</strong>.</li>
      </ul>`
    },
    {
      tag: 'SLIDE 3: CHALLENGE #1 — ABANDONED BUT NOT FORGOTTEN',
      title: 'Interactive Space Archaeology & Weathering Analysis',
      html: `<p>Players locate and inspect <strong>5 real discarded NASA artifacts</strong> across Jezero Crater:</p>
      <ul>
        <li><strong>The 5 Sites:</strong> Perseverance 4.5m PICA-X Heat Shield, Backshell & 21.5m Supersonic Parachute, Sky Crane Descent Stage, Ingenuity Flight 72 Monument ("Valinor Hills"), and Three Forks Titanium Sample Depot.</li>
        <li><strong>Preserve vs. Salvage Dilemma:</strong> Inspect UV polymer degradation, perchlorate dust accumulation, and micrometeorite pitting since Feb 2021, then choose to <strong>Preserve as a Heritage Monument</strong> or <strong>Recycle Titanium & Sensors</strong> for survival.</li>
      </ul>`
    },
    {
      tag: 'SLIDE 4: MULTI-UNIT GTA V SKY-CAM & 0.38G PHYSICS',
      title: 'Three Playable NASA Units in One Seamless World',
      html: `<p>Using an instant GTA V-inspired Sky-Camera transition ([1], [2], [3] or [TAB]), players command three distinct exploration modes:</p>
      <ul>
        <li><strong>Perseverance Rover (6×6):</strong> Rocker-bogie pitch/roll physics, persistent wheel tracks in regolith, and a live <strong>SuperCam LIBS Laser Spectrometer</strong>.</li>
        <li><strong>Ingenuity Mars Helicopter:</strong> Coaxial counter-rotating flight above steep crater cliffs and sand dunes.</li>
        <li><strong>Commander Val (EVA Astronaut):</strong> On-foot exploration in 0.38g (3.72 m/s²) gravity with vehicle embark/disembark ([F]).</li>
      </ul>`
    },
    {
      tag: 'SLIDE 5: CHALLENGE #13 — MISSION DESIGN & SPECTROSCOPY',
      title: 'Octavia Engineering Garage & SuperCam LIBS Analyzer',
      html: `<p>Science data (MB) earned from laser spectroscopy and artifact missions powers real engineering trade-offs:</p>
      <ul>
        <li><strong>SuperCam LIBS Atomic Spectrum (240–850 nm):</strong> Displays live emission spikes for Si, Fe, Mg, Ca, Ti, and Hα (H₂O-Clay) alongside a Mastcam-Z PIP micro-imager.</li>
        <li><strong>Engineering Garage ([G]):</strong> Trade off mass (kg), power (W), and max climb angle with <strong>NASA Glenn Nitinol Shape-Memory Mesh Tires</strong>, <strong>Dual MMRTG + GaAs Solar Wings</strong>, and <strong>Silica Aerogel Shielding</strong>.</li>
      </ul>`
    },
    {
      tag: 'SLIDE 6: SOL CYCLE, LAVA TUBE SHELTER & SONIFICATION',
      title: 'Blue Martian Sunsets, Radiation Shelters & DSN Radio FM',
      html: `<p>Our dynamic environmental engine simulates real Martian atmospheric physics and accessibility-first audio:</p>
      <ul>
        <li><strong>Martian Sol Cycle ([T]) & Headlights ([L]):</strong> Transitions from Noon (540 W/m²) to NASA's famous <strong>Mie-Scattering Blue Sunset</strong> (-61°C) to Starry Night (-86°C).</li>
        <li><strong>Belva Lava Tube Shelter:</strong> Provides 0.00 mSv protection during 5-star Dust Storms & Solar Particle Events.</li>
        <li><strong>DSN Telemetry Sonification Radio ([R]):</strong> WebAudio synthesizer translating live MOLA elevation and slope into multi-track ambient audio.</li>
      </ul>`
    },
    {
      tag: 'SLIDE 7: IMPACT, LIVE NASA API & FUTURE ROADMAP',
      title: 'Built for Students, Mission Planners & Citizen Scientists',
      html: `<p><strong>Mission Mars</strong> runs at 60 FPS in any desktop or mobile browser with zero installation—combining live <code>api.nasa.gov</code> Perseverance telemetry with hands-on planetary engineering.</p>
      <ul>
        <li><strong>Immediate Impact:</strong> Turns passive NASA archives into an unforgettable interactive classroom and mission-planning sandbox.</li>
        <li><strong>Try It Live Now:</strong> Press <strong>[ESC]</strong> to return to the game and click <strong>🎬 JUDGE AUTO-TOUR [P]</strong> for a 60-second autonomous showcase!</li>
      </ul>`
    }
  ];

  let currentPitchIdx = 0;
  function renderPitchSlide(idx) {
    currentPitchIdx = (idx + PITCH_SLIDES.length) % PITCH_SLIDES.length;
    const s = PITCH_SLIDES[currentPitchIdx];
    document.getElementById('pitch-slide-num').textContent = `SLIDE 0${currentPitchIdx + 1} / 0${PITCH_SLIDES.length}`;
    document.getElementById('pitch-slide-tag').textContent = s.tag;
    document.getElementById('pitch-slide-heading').textContent = s.title;
    document.getElementById('pitch-slide-body').innerHTML = s.html;

    const dotsEl = document.getElementById('pitch-dots');
    dotsEl.innerHTML = '';
    PITCH_SLIDES.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `pitch-dot${i === currentPitchIdx ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to Slide ${i + 1}`);
      dot.addEventListener('click', () => renderPitchSlide(i));
      dotsEl.appendChild(dot);
    });
  }

  function openPitchModal() {
    renderPitchSlide(currentPitchIdx);
    if (pitchDialog && !pitchDialog.open) pitchDialog.showModal();
  }

  document.getElementById('btn-open-pitch')?.addEventListener('click', openPitchModal);
  document.getElementById('btn-pitch-prev')?.addEventListener('click', () => renderPitchSlide(currentPitchIdx - 1));
  document.getElementById('btn-pitch-next')?.addEventListener('click', () => renderPitchSlide(currentPitchIdx + 1));

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyI' && !mapDialog.open && !garageDialog.open && !dossierDialog.open) {
      e.preventDefault();
      if (pitchDialog.open) pitchDialog.close();
      else openPitchModal();
    }
  });

  // Mobile Touch Controls Binding
  document.querySelectorAll('#touch-controls [data-key]').forEach((btn) => {
    const k = btn.dataset.key;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      keys[k] = true;
    });
    btn.addEventListener('pointerup', () => { keys[k] = false; });
    btn.addEventListener('pointerleave', () => { keys[k] = false; });
  });

  document.querySelectorAll('#touch-controls [data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      if (act === 'laser') fireChemCamLaser();
      if (act === 'salvage') trySalvageNearbyArtifact();
      if (act === 'switch') {
        const order = ['rover', 'heli', 'astro'];
        const next = order[(order.indexOf(state.activeUnit) + 1) % order.length];
        switchUnit(next);
      }
    });
  });

  function openTacticalMap() {
    renderTacticalMap();
    if (!mapDialog.open) mapDialog.showModal();
  }

  function openGarageModal() {
    renderGarageModal();
    if (!garageDialog.open) garageDialog.showModal();
  }

  document.getElementById('btn-open-map').addEventListener('click', openTacticalMap);
  document.getElementById('radar-frame').addEventListener('click', openTacticalMap);
  document.getElementById('btn-open-garage').addEventListener('click', openGarageModal);
  document.getElementById('btn-sol-time').addEventListener('click', () => cycleSolPhase());
  document.getElementById('btn-headlights').addEventListener('click', () => toggleHeadlights());

  document.getElementById('btn-open-dossier').addEventListener('click', () => {
    if (!dossierDialog.open) {
      dossierDialog.showModal();
      MarsData.fetchLiveNasaTelemetry();
    }
  });

  document.getElementById('btn-refresh-nasa-api').addEventListener('click', () => {
    MarsData.fetchLiveNasaTelemetry();
  });

  document.getElementById('btn-prev-mission').addEventListener('click', () => {
    setMission(state.currentMissionIdx - 1);
  });
  document.getElementById('btn-next-mission').addEventListener('click', () => {
    setMission(state.currentMissionIdx + 1);
  });
  document.getElementById('btn-route-mission').addEventListener('click', () => {
    const m = MarsData.MISSIONS[state.currentMissionIdx];
    updateRouteToGoal(m.x, m.z, m.zone);
  });
  document.getElementById('btn-route-shelter').addEventListener('click', () => {
    updateRouteToGoal(
      MarsData.SHELTER_SITE.x,
      MarsData.SHELTER_SITE.z,
      MarsData.SHELTER_SITE.zone
    );
  });

  document.getElementById('btn-weather-storm').addEventListener('click', (e) => {
    state.dustStormActive = !state.dustStormActive;
    e.currentTarget.classList.toggle('active', state.dustStormActive);
    e.currentTarget.textContent = state.dustStormActive
      ? '🌪️ STORM ACTIVE (SOLAR -80%)'
      : '🌪️ DUST STORM SIM';
  });

  function cycleRadioStation() {
    const label = MarsAudio.cycleRadio(() => {
      const u = state.units[state.activeUnit];
      return {
        elev: MarsData.getTerrainHeight(u.x, u.z),
        slope: MarsData.getTerrainSlope(u.x, u.z),
        speed: Math.abs(u.speed) * 3.6
      };
    });
    document.getElementById('btn-radio-toggle').textContent = label;
  }

  document.getElementById('btn-radio-toggle').addEventListener('click', cycleRadioStation);

  document.querySelectorAll('.wheel-segment').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchUnit(btn.dataset.unit);
    });
  });

  // Main Physics & Render Loop
  let lastTime = performance.now();
  const camTarget = new THREE.Vector3();

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const u = state.units[state.activeUnit];
    let forwardInput = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
    let turnInput = (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0) - (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0);
    let boost = keys['ShiftLeft'] || keys['ShiftRight'];
    const brake = keys['KeyC'];

    // Poll HTML5 Gamepad API (Xbox / PlayStation Controller Support)
    if (navigator.getGamepads) {
      const pads = navigator.getGamepads();
      const pad = pads && pads[0];
      if (pad) {
        const stickX = Math.abs(pad.axes[0]) > 0.15 ? -pad.axes[0] : 0;
        const stickY = Math.abs(pad.axes[1]) > 0.15 ? -pad.axes[1] : 0;
        const rTrigger = pad.buttons[7]?.value || 0;
        const lTrigger = pad.buttons[6]?.value || 0;
        if (stickY !== 0 || rTrigger > 0.1 || lTrigger > 0.1) {
          forwardInput = rTrigger > 0.1 ? rTrigger : lTrigger > 0.1 ? -lTrigger : stickY;
        }
        if (stickX !== 0) turnInput = stickX;
        if (pad.buttons[0]?.pressed) boost = true;
      }
    }

    // Judge Auto-Tour Autonomous Steering & Feature Showcase
    if (state.autoTourActive) {
      if (forwardInput !== 0 || turnInput !== 0) {
        // Player pressed movement keys -> exit auto-tour gracefully
        toggleAutoTour(false);
      } else {
        const prevTimer = state.autoTourTimer;
        state.autoTourTimer += dt;

        // Periodic LIBS laser scan showcase every 4.5s
        if (Math.floor(prevTimer / 4.5) !== Math.floor(state.autoTourTimer / 4.5)) {
          fireChemCamLaser();
        }
        // Showcase Blue Martian Sunset at 7s
        if (prevTimer < 7.0 && state.autoTourTimer >= 7.0 && state.solPhase === 0) {
          cycleSolPhase(1);
          document.getElementById('autotour-status').textContent =
            'JUDGE AUTO-TOUR: Simulating Mie-Scattering Blue Martian Sunset & Volumetric Headlights';
        }
        // Showcase GTA V Sky-Cam Switch to Ingenuity Helicopter at 15s
        if (prevTimer < 15.0 && state.autoTourTimer >= 15.0 && state.activeUnit === 'rover') {
          switchUnit('heli');
          document.getElementById('autotour-status').textContent =
            'JUDGE AUTO-TOUR: GTA Sky-Cam Transition to Ingenuity Coaxial Mars Helicopter';
        }

        // Steer along current A* GPS path
        const m = MarsData.MISSIONS[state.currentMissionIdx];
        let targetPt = { x: m.x, z: m.z };
        if (state.currentRoute && state.currentRoute.points.length > 1) {
          for (const pt of state.currentRoute.points) {
            if (Math.hypot(pt.x - u.x, pt.z - u.z) > 14) {
              targetPt = pt;
              break;
            }
          }
        }
        const desiredYaw = Math.atan2(targetPt.x - u.x, targetPt.z - u.z);
        let diff = desiredYaw - u.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        turnInput = Math.max(-1, Math.min(1, diff * 2.2));
        forwardInput = 1;
        boost = state.activeUnit === 'heli' && u.altOffset < 12;

        // Auto-salvage when reaching the artifact!
        if (Math.hypot(u.x - m.x, u.z - m.z) < 16) {
          completeArtifactDecision('preserve');
        }
      }
    }

    // Update Active Unit Physics
    const hasNitinol = state.installedUpgrades.has('nitinol_tires');
    if (state.activeUnit === 'rover') {
      const speedMult = hasNitinol ? 1.35 : 1.0;
      const maxSpeed = (boost ? 26 : 15) * speedMult;
      const accel = (boost ? 22 : 13) * speedMult;
      if (forwardInput !== 0) {
        u.speed += forwardInput * accel * dt;
      } else {
        u.speed *= Math.pow(0.18, dt);
      }
      if (brake) u.speed *= Math.pow(0.02, dt);
      u.speed = Math.max(-10, Math.min(maxSpeed, u.speed));

      if (Math.abs(u.speed) > 0.2) {
        u.yaw += turnInput * 1.65 * dt * Math.sign(u.speed);
      }

      u.x += Math.sin(u.yaw) * u.speed * dt;
      u.z += Math.cos(u.yaw) * u.speed * dt;
      u.y = MarsData.getTerrainHeight(u.x, u.z);
      u.mesh.position.set(u.x, u.y, u.z);
      u.mesh.rotation.y = u.yaw;

      const hFront = MarsData.getTerrainHeight(u.x + Math.sin(u.yaw) * 2, u.z + Math.cos(u.yaw) * 2);
      u.mesh.rotation.x = Math.atan2(u.y - hFront, 2.0) * 0.65;

      world.roverWheels.forEach((w) => {
        w.rotation.x += u.speed * dt * 1.4;
      });

      // Stamp persistent 3D tire tracks in Martian regolith every 2.2 meters
      if (Math.hypot(u.x - state.lastTrackPos.x, u.z - state.lastTrackPos.z) > 2.2) {
        world.addRoverTrack(u.x, u.z, u.yaw);
        state.lastTrackPos.x = u.x;
        state.lastTrackPos.z = u.z;
      }
    } else if (state.activeUnit === 'heli') {
      const maxSpeed = 38;
      if (forwardInput !== 0) {
        u.speed += forwardInput * 26 * dt;
      } else {
        u.speed *= Math.pow(0.25, dt);
      }
      u.speed = Math.max(-16, Math.min(maxSpeed, u.speed));
      u.yaw += turnInput * 2.1 * dt;

      if (boost) u.altOffset = Math.min(48, u.altOffset + 15 * dt);
      else if (brake) u.altOffset = Math.max(0, u.altOffset - 15 * dt);
      else if (Math.abs(forwardInput) > 0 && u.altOffset < 6) {
        u.altOffset = Math.min(8, u.altOffset + 10 * dt);
      }

      u.x += Math.sin(u.yaw) * u.speed * dt;
      u.z += Math.cos(u.yaw) * u.speed * dt;
      const groundY = MarsData.getTerrainHeight(u.x, u.z);
      u.y = groundY + u.altOffset;
      u.mesh.position.set(u.x, u.y, u.z);
      u.mesh.rotation.y = u.yaw;
      u.mesh.rotation.x = forwardInput * 0.22;
    } else {
      const walkSpeed = boost ? 14 : 8.5;
      u.speed = forwardInput * walkSpeed;
      u.yaw += turnInput * 2.4 * dt;
      u.x += Math.sin(u.yaw) * u.speed * dt;
      u.z += Math.cos(u.yaw) * u.speed * dt;

      const groundY = MarsData.getTerrainHeight(u.x, u.z);
      if (!u.grounded) {
        u.vy -= 3.721 * dt * 2.2;
        u.y += u.vy * dt;
        if (u.y <= groundY) {
          u.y = groundY;
          u.vy = 0;
          u.grounded = true;
        }
      } else {
        u.y = groundY;
      }
      u.mesh.position.set(u.x, u.y, u.z);
      u.mesh.rotation.y = u.yaw;
    }

    const bound = MarsData.WORLD_SIZE * 0.47;
    u.x = Math.max(-bound, Math.min(bound, u.x));
    u.z = Math.max(-bound, Math.min(bound, u.z));

    // Spin Ingenuity Rotors & Orbit Phobos
    const heliActive = state.activeUnit === 'heli' || state.units.heli.altOffset > 0.2;
    if (heliActive) {
      world.rotorUpper.rotation.y += dt * 32;
      world.rotorLower.rotation.y -= dt * 32;
    }
    world.phobosMesh.position.x = Math.cos(now * 0.00012) * 380;
    world.phobosMesh.position.z = Math.sin(now * 0.00012) * 380;

    // Pulse 3D Ground GPS Chevrons
    world.gpsChevronsGroup.children.forEach((ch, idx) => {
      ch.position.y =
        MarsData.getTerrainHeight(ch.position.x, ch.position.z) +
        1.3 +
        Math.sin(now * 0.006 - idx * 0.5) * 0.35;
    });

    world.artifactMeshes.forEach((item, idx) => {
      item.beacon.rotation.y += dt * 0.8;
      item.beacon.material.opacity =
        idx === state.currentMissionIdx ? 0.32 + Math.sin(now * 0.005) * 0.12 : 0.14;
    });

    const dustPos = world.dustParticles.geometry.attributes.position;
    const windSpeed = state.dustStormActive ? 42 : 9;
    for (let i = 0; i < dustPos.count; i++) {
      let px = dustPos.getX(i) + windSpeed * dt;
      let pz = dustPos.getZ(i) + windSpeed * 0.35 * dt;
      if (px - u.x > 130) px -= 260;
      if (px - u.x < -130) px += 260;
      if (pz - u.z > 130) pz -= 260;
      if (pz - u.z < -130) pz += 260;
      dustPos.setX(i, px);
      dustPos.setZ(i, pz);
    }
    dustPos.needsUpdate = true;

    const targetFog = state.dustStormActive ? 0.0085 : 0.0022;
    world.scene.fog.density += (targetFog - world.scene.fog.density) * dt * 2.5;
    world.dustParticles.material.opacity = state.dustStormActive ? 0.85 : 0.38;

    // Check if inside Octavia Base or Lava Tube Radiation Shelter
    const distToBase = Math.hypot(u.x - 0, u.z - -25);
    const distToShelter = Math.hypot(
      u.x - MarsData.SHELTER_SITE.x,
      u.z - MarsData.SHELTER_SITE.z
    );
    const inSafeZone = distToBase < 22 || distToShelter < 18;

    // Update 5-Star Martian Environmental Hazard Level
    const localSlope = MarsData.getTerrainSlope(u.x, u.z);
    const safeSlopeLimit = hasNitinol ? 27 : 20;
    let stars = 0;
    let reason = inSafeZone ? 'SHELTERED (0.00 mSv)' : 'NOMINAL';

    if (!inSafeZone) {
      if (state.dustStormActive) {
        stars += 3;
        reason = 'REGIONAL DUST STORM (TAU > 2.4)';
      }
      if (state.solPhase === 2) {
        stars = Math.max(stars, 2);
        if (!state.dustStormActive) reason = 'NIGHT THERMAL FREEZE (-86°C)';
      }
      if (localSlope > safeSlopeLimit) {
        stars = Math.max(stars, 4);
        reason = `CRITICAL SLOPE ROLL HAZARD (${localSlope.toFixed(1)}°)`;
        if (state.activeUnit === 'rover') {
          state.health = Math.max(0, state.health - 12 * dt);
        }
      } else if (localSlope > 14) {
        stars = Math.max(stars, 2);
        if (!state.dustStormActive) reason = `STEEP ESCARPMENT (${localSlope.toFixed(1)}°)`;
      }
      if (state.battery < 25 || state.o2 < 25 || state.health < 25) {
        stars = 5;
        reason = 'LIFE SUPPORT / CHASSIS CRITICAL';
      }
    }

    state.hazardStars = Math.min(5, stars);
    document.getElementById('hazard-reason').textContent = `HAZARD LEVEL: ${reason}`;
    document.querySelectorAll('#hazard-stars .star').forEach((sEl) => {
      const idx = parseInt(sEl.dataset.star, 10);
      sEl.classList.toggle('active', idx <= state.hazardStars);
    });

    // Survival Bars & Garage Upgrade Effects
    if (inSafeZone) {
      state.battery = Math.min(100, state.battery + 22 * dt);
      state.o2 = Math.min(100, state.o2 + 25 * dt);
      state.health = Math.min(100, state.health + 20 * dt);
    } else {
      const pwrMult = state.installedUpgrades.has('hybrid_rtg_solar') ? 0.35 : 1.0;
      const shieldMult = state.installedUpgrades.has('aerogel_shield') ? 0.3 : 1.0;
      const stormDrain = state.dustStormActive ? 0.95 : 0.22;
      state.battery = Math.max(
        0,
        state.battery - (Math.abs(u.speed) * 0.014 + stormDrain) * pwrMult * dt
      );
      if (state.activeUnit === 'astro' || state.solPhase === 2) {
        state.o2 = Math.max(0, state.o2 - 0.55 * shieldMult * dt);
      }
    }

    if (state.health <= 0.5) {
      triggerSignalLost('ROVER CHASSIS STRUCTURAL FAILURE ON STEEP ESCARPMENT');
    } else if (state.battery <= 0.5) {
      triggerSignalLost('MMRTG / SOLAR BATTERY DEPLETED DURING EVA');
    }

    document.getElementById('bar-health').style.width = `${state.health}%`;
    document.getElementById('bar-battery').style.width = `${state.battery}%`;
    document.getElementById('bar-o2').style.width = `${state.o2}%`;
    document.getElementById('label-health').textContent = `HULL ${Math.round(state.health)}%`;
    document.getElementById('label-battery').textContent = `PWR ${Math.round(state.battery)}%`;
    document.getElementById('label-o2').textContent = `O₂ ${Math.round(state.o2)}%`;

    // Context Prompt ("Press E to Salvage" or "Press F to Enter Vehicle")
    const promptEl = document.getElementById('context-prompt');
    const promptKey = document.getElementById('context-key');
    const promptText = document.getElementById('context-text');
    let showPrompt = false;

    for (const item of world.artifactMeshes) {
      const m = item.mission;
      if (Math.hypot(u.x - m.x, u.z - m.z) < 19) {
        showPrompt = true;
        promptKey.textContent = 'E';
        promptText.textContent = `INSPECT & SALVAGE ${m.shortName.toUpperCase()} (+${m.rewardMB} MB)`;
        break;
      }
    }

    if (!showPrompt && state.activeUnit === 'astro') {
      const dRover = Math.hypot(u.x - state.units.rover.x, u.z - state.units.rover.z);
      const dHeli = Math.hypot(u.x - state.units.heli.x, u.z - state.units.heli.z);
      if (dRover < 8.5) {
        showPrompt = true;
        promptKey.textContent = 'F';
        promptText.textContent = 'ENTER PERSEVERANCE ROVER';
      } else if (dHeli < 8.5) {
        showPrompt = true;
        promptKey.textContent = 'F';
        promptText.textContent = 'PILOT INGENUITY HELICOPTER';
      }
    }
    promptEl.hidden = !showPrompt;

    // Camera Update (with GTA V Sky-Camera Zoom Transition)
    if (state.skyTransition) {
      state.skyTransition.t += dt * 1.45;
      const t = state.skyTransition.t;
      if (t >= 1) {
        state.skyTransition = null;
      } else {
        const lerpPos = new THREE.Vector3().lerpVectors(
          state.skyTransition.from,
          new THREE.Vector3(u.x, u.y, u.z),
          t
        );
        const skyArc = Math.sin(t * Math.PI) * 95;
        world.camera.position.set(lerpPos.x - 10, lerpPos.y + 8 + skyArc, lerpPos.z - 10);
        world.camera.lookAt(lerpPos.x, lerpPos.y + 1.5, lerpPos.z);
      }
    }

    if (!state.skyTransition) {
      const camDist = state.activeUnit === 'heli' ? 11.5 : state.activeUnit === 'rover' ? 9.5 : 6.2;
      const camHeight = state.activeUnit === 'heli' ? 4.8 : state.activeUnit === 'rover' ? 4.2 : 2.8;
      const desiredCamX = u.x - Math.sin(u.yaw) * camDist;
      const desiredCamZ = u.z - Math.cos(u.yaw) * camDist;
      const groundAtCam = MarsData.getTerrainHeight(desiredCamX, desiredCamZ);
      const desiredCamY = Math.max(groundAtCam + 1.5, u.y + camHeight);

      world.camera.position.lerp(
        new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ),
        Math.min(1, dt * 8)
      );
      camTarget.set(u.x + Math.sin(u.yaw) * 4, u.y + 1.8, u.z + Math.cos(u.yaw) * 4);
      world.camera.lookAt(camTarget);
    }

    const kmh = Math.abs(u.speed * 2.2).toFixed(1);
    document.getElementById('speedo-val').textContent = kmh;
    const coords = MarsData.worldToMarsLatLon(u.x, u.z);
    document.getElementById('coord-readout').textContent = `${coords.lat}°N, ${coords.lon}°E`;
    document.getElementById('alt-readout').textContent =
      `AGL: ${(u.y - MarsData.getTerrainHeight(u.x, u.z)).toFixed(1)}m`;
    document.getElementById('tele-slope').textContent = `${localSlope.toFixed(1)}°`;
    document.getElementById('tele-elev').textContent = `${coords.molaElev} m`;

    const activeMission = MarsData.MISSIONS[state.currentMissionIdx];
    const distToMission = Math.round(Math.hypot(u.x - activeMission.x, u.z - activeMission.z));
    document.getElementById('mission-dist-badge').textContent = `${distToMission} m`;
    document.getElementById('radar-gps-dist').textContent = `GPS: ${distToMission}m`;

    const deg = (((u.yaw * 180) / Math.PI) % 360 + 360) % 360;
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    document.getElementById('radar-compass').textContent = dirs[Math.round(deg / 45) % 8];

    renderRadarMinimap();
    world.renderer.render(world.scene, world.camera);
  }

  setMission(0);
  MarsData.fetchLiveNasaTelemetry();
  requestAnimationFrame(animate);
})();
