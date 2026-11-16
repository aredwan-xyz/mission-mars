# MISSION MARS: Grand Theft Rover (Jezero Crater Open-World Survival, Salvage & Mission Design)

**2026 NASA International Space Apps Challenge ("The Next Frontier")**

▶ **Play it live:** https://mission-mars-game.vercel.app (Chrome/Edge desktop recommended. Press `P` for the autonomous Judge Auto-Tour.)
- **Primary Challenge:** *Interplanetary Survival Guide: Martian Map*
- **Cross-Cutting Challenges:**
  - *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*
  - *Space Mission Design Game*
  - *The Earth/Space Information Jukebox*

---

## 🚀 Project Summary & All 8 Championship Upgrades
**Mission Mars** transforms complex NASA Martian topography, environmental telemetry, and spacecraft heritage records into a playable, browser-based **3D open-world survival, salvage, and engineering game**.

### Featured Systems:
1. **3D Glowing A* GPS Chevrons & Persistent Rover Tire Tracks:** Computes energy-optimal routes across a 60×60 MOLA/HiRISE elevation grid, rendering glowing 3D chevron arrows directly on the Martian surface and stamping rover wheel tracks into the regolith.
2. **Martian Sol Cycle (Noon → Famous Blue Martian Sunset → $-86^\circ\text{C}$ Starry Night) + Volumetric Headlights (`T` & `L`):** Models forward-scattering Mie dust during the iconic blue Martian sunset, orbiting Phobos, and twin volumetric rover SpotLight cones.
3. **SuperCam LIBS Atomic Spectrum Analyzer + Mastcam-Z PIP (`Space` / Click):** Firing the laser renders a live **240 nm – 850 nm Atomic Emission Spectrum** ($\text{Si}, \text{Fe}, \text{Mg}, \text{Ca}, \text{Ti}, \text{H}\alpha$) alongside a simulated Mastcam-Z micro-imager picture-in-picture feed.
4. **Octavia Base Engineering Garage (`G`):** Spend earned Science Data (`MB`) to customize your rover loadout with real engineering trade-offs (Mass $\text{kg}$, Power $\text{W}$, Top Speed, and Max Safe Slope):
   - *NASA Glenn Nitinol Shape-Memory Mesh Tires*
   - *Dual MMRTG + Triple-Junction GaAs Solar Wing*
   - *SuperCam Raman + RIMFAX Subsurface Radar Boost*
   - *Silica Aerogel + Polyethylene Crew Shielding*
5. **Interactive Heritage vs. Salvage Decision (`E`):** At each of the 5 real discarded NASA artifacts in Jezero Crater, inspect UV degradation, perchlorate dust coat, and micrometeorite pitting since Feb 2021, then choose to **Preserve as a Heritage Monument** or **Recycle Titanium & Sensors** for survival.
6. **Lava Tube Radiation Shelter & "SIGNAL LOST" Recovery:** Seek cover inside the Belva Basalt Overhang Lava Tube (`0.00 mSv`) during 5-star Dust Storms, or recover at Octavia Base if your rover rolls on $>28^\circ$ cliffs.
7. **🎬 Judge Auto-Tour / Autonomous AI Showcase (`P`):** One-click autonomous demo mode that drives along the A* route, scans boulders with LIBS, transitions to the Blue Martian Sunset with headlights on, and switches via the Sky-Cam to the Ingenuity Helicopter.

---

## 🎮 Controls
- **`W A S D` / Arrow Keys:** Drive / Fly / Walk
- **`Shift` / `C`:** Boost / Helicopter Ascend & Descend
- **`Space` or Left Click:** Fire SuperCam LIBS Laser (or Low-G Jump in EVA mode)
- **`F`:** Disembark / Enter Vehicle
- **`E`:** Inspect & Preserve/Salvage Discarded NASA Hardware
- **`1` / `2` / `3` or `Tab`:** Sky-Camera Unit Switch (Rover / Helicopter / Astronaut)
- **`G`:** Open Octavia Base Engineering Garage
- **`T`:** Cycle Martian Sol Time (Noon / Blue Sunset / Night)
- **`L`:** Toggle Volumetric Rover Headlights
- **`P`:** Toggle 🎬 Judge Auto-Tour Mode
- **`M`:** Open Full-Screen Jezero Tactical Map & A* Route Planner
- **`R`:** Cycle DSN Telemetry Sonification Radio

---

## 🛰️ NASA Data & Honest Notes
- **Live from NASA:** Perseverance/Ingenuity photographs and the HiRISE/CTX Jezero orbital mosaic (PIA23720) load at runtime from `images-api.nasa.gov`. The mosaic textures the terrain and is pixel-sampled for fine relief.
- **Modelled:** the large-scale Jezero terrain, the LIBS spectra, and the SWIM water-ice layer are simplified educational models based on public NASA references, not mission-grade data products.
- Imagery credit: NASA/JPL-Caltech. No NASA logos or insignia are used.

## ▶ Run locally
No build step: `python3 -m http.server 8080`, then open http://localhost:8080.
