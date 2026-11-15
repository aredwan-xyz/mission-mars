# 🏆 Official 2026 NASA Space Apps Challenge Submission Kit
**Project Title:** Mission Mars: Grand Theft Rover — Open-World Jezero Crater Survival, Navigation & Heritage Sandbox
**Theme:** *The Next Frontier (2026)*
**Primary Challenge:** *Interplanetary Survival Guide: Martian Map*
**Cross-Cutting Challenges:**
- *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*
- *Space Mission Design Game*
- *The Earth/Space Information Jukebox*

---

## 📋 1. Copy-Paste Fields for `spaceappschallenge.org` Project Page

### A. High-Level Project Summary (Max 150 words)
> **Mission Mars: Grand Theft Rover** transforms NASA's Martian topography, atmospheric telemetry, and historical hardware archives into a playable, browser-based **3D open-world survival, navigation, and engineering game** set in Jezero Crater ($18.4447^\circ\text{N}, 77.4508^\circ\text{E}$).
>
> Instead of inspecting flat 2D GIS maps, users seamlessly switch via a GTA-style sky-camera wheel between the **Perseverance Rover**, the **Ingenuity Mars Helicopter**, and an on-foot **EVA Astronaut** in $0.38g$ gravity. A real-time **60×60 A\* Terrain Pathfinder** evaluates MOLA/HiRISE slope gradients ($\nabla z$) to project glowing 3D route chevrons around lethal $>18^\circ$ cliffs and toward a Lava Tube Radiation Shelter during 5-star Dust Storms. Players fire a live **SuperCam LIBS Laser Spectrometer** (240–850 nm atomic emission spectra), customize rover mass/power trade-offs in the **Octavia Engineering Garage**, listen to **DSN Radio FM** terrain sonification, and locate 5 real discarded NASA artifacts to either **Preserve as Space Heritage Monuments** or **Recycle for Survival**.

---

### B. Project Details (How It Works, Features & Impact)
> ### Why We Built Mission Mars
> Navigating the Martian surface is a multi-variable survival challenge governed by slope stability, solar irradiance, dust storms, $-86^\circ\text{C}$ night freezes, and radiation exposure. At the same time, over 7,000 kg of historical NASA entry, descent, and landing (EDL) hardware rests across Mars—acting as both priceless archaeological monuments and potential in-situ salvage repositories. Traditional 2D contour maps fail to convey these 3D spatial hazards to students, mission planners, and citizen scientists.
>
> ### Core Technical & Scientific Systems
> 1. **60×60 MOLA/HiRISE DEM & A\* Slope-Safe Pathfinder:**
>    - Models the Octavia E. Butler landing floor, Neretva Vallis river delta escarpment, Kodiak Butte, Belva Crater, and South Seitah ridge.
>    - Computes central finite-difference slope gradients ($\nabla z$) across a 60×60 navigation mesh, heavily penalizing slopes $>18^\circ$ to generate energy-optimal EVA/rover routes displayed both on a tilted GTA-style radar minimap and as **3D glowing chevrons on the Martian surface**.
>    - Full-screen **Tactical Map (`M`)** switches between **MOLA Elevation**, **Slope Hazard ($>18^\circ$)**, and **SWIM Subsurface Water-Ice Depth** layers.
> 2. **GTA V Sky-Camera Multi-Unit Sandbox (`1`/`2`/`3` or `Tab`):**
>    - **Perseverance Rover:** 6×6 rocker-bogie terrain pitch/roll alignment, persistent wheel tracks in the regolith, volumetric headlights (`L`), and live **SuperCam LIBS Laser Spectroscopy (`Space`)**.
>    - **Ingenuity Mars Helicopter:** Coaxial counter-rotating rotorcraft flight (`Shift`/`C`) to scout steep delta cliffs from the air.
>    - **Commander Val (EVA Astronaut):** On-foot exploration in $0.38g$ ($3.721\text{ m/s}^2$) gravity with vehicle embark/disembark (`F`).
> 3. **Abandoned But Not Forgotten — Space Archaeology & Weathering (`E`):**
>    - Features 5 real NASA Mars 2020 artifacts: *PICA-X Heat Shield*, *Backshell & 21.5m Supersonic Parachute*, *Sky Crane Descent Stage*, *Ingenuity Flight 72 Final Airfield ("Valinor Hills")*, and *Three Forks Titanium Sample Depot*.
>    - Inspects UV degradation, perchlorate dust coat, and micrometeorite pitting since Feb 2021, challenging players to choose between **Preserving as a Heritage Monument** or **Recycling Titanium & Sensors** for habitat survival.
> 4. **Octavia Base Engineering Garage (`G`) & LIBS Atomic Spectrum Analyzer:**
>    - Firing the laser renders a real-time **240 nm – 850 nm Atomic Emission Spectrum** ($\text{Si}, \text{Fe}, \text{Mg}, \text{Ca}, \text{Ti}, \text{H}\alpha$) and Mastcam-Z PIP micro-imager.
>    - Science Data (`MB`) unlocks real NASA engineering upgrades (*NASA Glenn Nitinol Shape-Memory Mesh Tires*, *Dual MMRTG + GaAs Solar Wing*, *SuperCam Raman + RIMFAX Radar*, and *Silica Aerogel Shielding*) with authentic mass ($\text{kg}$), power ($\text{W}$), speed, and max-slope trade-offs.
> 5. **Martian Sol Cycle (`T`), Lava Tube Shelter & DSN Telemetry Sonification (`R`):**
>    - Transitions between Noon ($540\text{ W/m}^2$), NASA's famous **Mie-Scattering Blue Martian Sunset** ($-61^\circ\text{C}$), and Starry Night ($-86^\circ\text{C}$) with orbiting Phobos.
>    - Includes a zero-dependency **WebAudio Synthesizer** that translates live MOLA elevation and local slope into multi-track ambient audio.

---

### C. Space Agency Data & APIs Used
- **NASA Mars Rover Photos & Mission Manifest API (`api.nasa.gov`):** Live REST integration retrieving Perseverance Rover active Sol, total downlinked science frames, and active instrument manifests.
- **NASA MOLA (Mars Orbiter Laser Altimeter) & HiRISE Jezero Crater DEM:** Baseline elevation and slope relief modeling for $18.4447^\circ\text{N}, 77.4508^\circ\text{E}$ (Octavia E. Butler landing site, Belva Crater, Kodiak Butte, and Neretva Vallis delta).
- **NASA Mars 2020 / Ingenuity EDL Heritage Coordinates & MEDLI2 / MEDA Telemetry:** Used to model the 5 discarded hardware sites, atmospheric pressure ($742\text{ Pa}$), diurnal temperature swings ($-18^\circ\text{C}$ to $-86^\circ\text{C}$), and RAD surface radiation dose rates ($0.21\text{ mGy/day}$).
- **SWIM (Subsurface Water Ice Mapping) & SuperCam LIBS Spectral Databases:** Used to model subsurface water-ice depth contours and atomic emission lines ($240\text{ nm} - 850\text{ nm}$).

---

## 🎬 2. 240-Second (4-Minute) Video Voiceover Script
*(Tip: Open `http://localhost:8080/`, click **🎬 JUDGE AUTO-TOUR [P]**, and screen-record while reading this script!)*

- **0:00 – 0:35 | The Hook:**
  *"What if exploring real NASA Mars data felt like playing Grand Theft Auto V? Navigating Jezero Crater is lethal—steep 20-degree crater walls roll rovers, dust storms choke solar arrays, and minus-86-degree nights freeze electronics. Meanwhile, tons of historic NASA spacecraft hardware lie scattered across the Martian dust. Welcome to Mission Mars: Grand Theft Rover."*
- **0:35 – 1:25 | 3D A\* Terrain Pathfinding & Tactical DEM (`M`):**
  *"Built on a 60-by-60 MOLA and HiRISE Digital Elevation Model of Jezero Crater, our game runs a real-time A-star pathfinder that calculates local slope gradients and projects glowing 3D GPS chevrons right onto the Martian terrain. Pressing M opens the Tactical Map, where mission planners can switch between MOLA Elevation, Slope Hazards over 18 degrees, and SWIM Subsurface Water-Ice depth, or click anywhere to compute a slope-safe route."*
- **1:25 – 2:15 | SuperCam LIBS Spectroscopy & Abandoned Hardware (`Space` & `E`):**
  *"As we drive Perseverance, our wheels leave tracks in the regolith. Firing the SuperCam LIBS laser zaps Martian outcrops and renders a real-time 240-to-850 nanometer atomic emission spectrum showing Silicon, Iron, Magnesium, and hydrated clay peaks alongside a Mastcam-Z Picture-in-Picture feed. When we reach one of five real discarded NASA artifacts—like Perseverance's PICA-X Heat Shield or Ingenuity's final airfield at Valinor Hills—we inspect its UV and perchlorate weathering since 2021 and face a real ethical choice: Preserve it as a Space Heritage Monument or Recycle its titanium and sensors for survival."*
- **2:15 – 3:15 | GTA Sky-Cam Unit Switch, Blue Sunset & Engineering Garage (`Tab`, `T`, `G`):**
  *"With one tap, the camera zooms into the Martian sky—GTA V style—letting us switch seamlessly between the Perseverance Rover, the coaxial Ingenuity Helicopter flying above crater cliffs, and Commander Val on foot in 0.38g gravity. Pressing T cycles through the Martian Sol—from noon to NASA's famous Mie-scattering Blue Martian Sunset with volumetric headlights, to a minus-86-degree night freeze where we can take cover inside a basalt Lava Tube Radiation Shelter. And in the Octavia Engineering Garage, we spend earned Science Data to test real mission trade-offs like NASA Glenn Nitinol shape-memory mesh tires and triple-junction solar wings."*
- **3:15 – 4:00 | Live NASA API, Sonification & Impact (`R` & `I`):**
  *"Finally, Mission Mars connects to NASA's live Perseverance Manifest API and includes DSN Radio FM, a WebAudio synthesizer that sonifies live elevation and slope into ambient music. Everything runs at 60 FPS in any desktop or mobile browser with zero installation. Thank you—and welcome to The Next Frontier!"*

---

## 🌐 3. Instant Deployment Commands (Pick Any One)

### Option A: Deploy to Vercel (Fastest — 15 Seconds)
```bash
cd /Users/aredwan/Developer/mission-mars
npx vercel --prod
```

### Option B: Deploy to GitHub Pages
```bash
cd /Users/aredwan/Developer/mission-mars
gh repo create mission-mars-spaceapps-2026 --public --source=. --remote=origin --push
```
*(Then enable GitHub Pages on the `main` branch in your repo Settings → Pages).*
