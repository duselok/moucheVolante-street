/*************************************************
 * Floater Szene – p5.js
 * Update:
 *   - Micro-Kreis-Gruppe: 40% kleiner (R_RATIO ↓), heller/weißer Rand & Kern.
 *   - Micro-Kreis-Gruppe bekommt Drift & Follow wie Clouds.
 *   - Vollständiger Code (Stand: Micro-Cluster animiert).
 *************************************************/

/* ---------- Globale Skalierung ---------- */
const SCALE = 0.8;
const FAST_EDIT_MODE = true;

/* ---------- Hintergrund ---------- */
const BG_COL_BASE = [246, 248, 253];
const BG_COL_TINT = [130, 148, 200, 10];

/* ---------- Floater-Pfad-Rendering ---------- */
const FLOATER_LAYER_COUNT   = 18;
const FLOATER_BASE_ALPHA    = 0.98;                 // RESET auf Referenz
const FLOATER_STROKE_SCALE  = 2.9;
const FLOATER_LAYER_TINT    = [110, 120, 145];      // RESET auf Referenz

/* Segmentierende Bänder */
const SEG_STEP_DIST         = 40;
const SEG_LENGTH            = 26;
const SEG_THICK             = 4;
const SEG_ALPHA             = 5;

/* Gel-Dots */
const DOT_STEP_DIST         = 32;
const DOT_SIZE_MIN          = 2;
const DOT_SIZE_MAX          = 4;
const DOT_ALPHA_MIN         = 2;
const DOT_ALPHA_MAX         = 9;

/* Floaterkreise (integriert) */
const FP_ALPHA_OUTER        = 4;
const FP_ALPHA_INNER        = 10;
const FP_DIST_MAIN          = 1.2;
const FP_DIST_MAIN_Y        = 0.9;
const FP_DIST_SMALL         = 1.9;
const FP_DIST_SMALL_Y       = 1.8;
const FP_SMALL_SCALE        = 0.6;

/* Externe Floaterkreise – näher zueinander, weiter links/unten, weicher */
const EXT_FP_OFFSET1 = {x: -260 * SCALE, y: 120 * SCALE, scale: 0.90};
const EXT_FP_OFFSET2 = {x: -320 * SCALE, y: 190 * SCALE, scale: 0.70};
const EXT_FP_COLOR   = [120,130,150];
const EXT_FP_ALPHA_OUTER = 8;
const EXT_FP_ALPHA_INNER = 18;

/* Floater Roll/Squish */
const FLOATER_SQUISH_MAX = 0.12;
const FLOATER_ROLL_MAX   = 0.20;
const FLOATER_EASE       = 0.08;

/* Fleck als Mini-Superfleck (lokal am Floater) – RESET auf Referenz */
const FLECK_SUPER_SIZE      = 44;
const FLECK_SUPER_TINT      = [12,12,18];           // dunkler
const FLECK_SUPER_ALPHA     = 0.24;
const FLECK_SUPER_FEATHER   = 1.05;
const FLECK_SUPER_DRAW_W    = 60 * SCALE * 0.9 * 0.9 * 0.9 * 0.9 * 0.9 * 0.82 * 1.06; // etwas größer
const FLECK_SUPER_DRAW_H    = FLECK_SUPER_DRAW_W * 0.88;
const FLECK_SUPER_BLUR_PX   = 1.0;
const FLECK_OFFSET_X        = -43 * SCALE;
const FLECK_OFFSET_Y        = 9;
const BIGGER_MARK_RING_SCALE  = 2.4;
const SMALLER_MARK_RING_SCALE = 1.6;
const BIGGER_RING_COLOR       = [255, 100, 50];
const SMALLER_RING_COLOR      = [255, 60, 200];
const MARK_RING_ALPHA       = 200;
const MARK_RING_WEIGHT      = 3.0;

/* Hilfsbasis */
const BASE_UNIT_RADIUS = 16 * SCALE;

/* Noise-Wolken Basis */
const CLOUD_RES          = FAST_EDIT_MODE ? 128 : 256;
const CLOUD_NOISE_SCALE  = 0.015;
const CLOUD_OCTAVES      = 4;
const CLOUD_FALLOFF      = 0.5;

/* Positionierung – Floater etwas höher (Update) */
const FLOATER_POS_XF = 0.59;
const FLOATER_POS_YF = 0.30;  // höher im Bild (war 0.39)

/* ======= Weißer Superfleck (visuell links, heller) ======= */
const BIGGER_POS_XF         = 0.24;
const BIGGER_POS_YF         = 0.32;
const CLOUD_BIGGER_SIZE     = BASE_UNIT_RADIUS * 2.2 * 5.0 * 5.25 * 0.5 * 0.7 * 0.8 * 3.0 * 1.3 * 0.6 * 1.3 * 1.5 * 0.4 * 0.9 * 0.9;
const CLOUD_BIGGER_TINT     = [90,92,102];   // dunkler/deutlicher
const CLOUD_BIGGER_ALPHA    = 0.16;
const CLOUD_BIGGER_FEATHER  = 1.35;
const BIGGER_FOLLOW_GAIN    = -0.12;
const BIGGER_SPEED_SCALE    = 0.15;

/* ======= Grauer Superfleck (visuell rechts, dunkler) ======= */
const SMALLER_POS_XF          = 0.62;
const SMALLER_POS_YF          = 0.75;
const CLOUD_SMALLER_SIZE      = (BASE_UNIT_RADIUS * 2.2 * 5.0 * 5.25 * 0.5 * 0.7 * 0.8) * 0.75 * 1.5 * 2.0 * 0.9 * 0.9 * 0.9 * 0.86;
const CLOUD_SMALLER_TINT      = [48,48,58];    // dunkler (rechts)
const CLOUD_SMALLER_ALPHA     = 0.075;
const CLOUD_SMALLER_FEATHER   = 3.95;
const SMALLER_FOLLOW_GAIN     = -0.20;
const SMALLER_SPEED_SCALE     = 0.18;

/* Schlieren – heller und transparenter (etwas sichtbarer) */
const BASE_SCHL_COUNT   = 30;
const EXTRA_SCHL_COUNT  = 10;
const SCHL_COUNT        = BASE_SCHL_COUNT + EXTRA_SCHL_COUNT;
const SCHLC_TINT        = [150,150,164];
const SCHLC_ALPHA       = 0.12;  // sehr transparent
const SCHLC_FEATHER     = 3.1;
const SCHLC_LEN_MIN     = 76 * SCALE;
const SCHLC_LEN_MAX     = 300 * SCALE;
const SCHLC_THICK_MIN   = 0.010;
const SCHLC_THICK_MAX   = 0.026;
const SCHLC_SPEED_SCALE = 0.44;
const SCHLC_BLUR_PX     = FAST_EDIT_MODE ? 9 : 16;

/* Hellere Schlieren */
const BRIGHT_SCHL_COUNT = 0;
const BRIGHT_SCHLC_TINT = [160,160,174];
const BRIGHT_SCHLC_ALPHA = 0.12;  // gleich transparent wie Grundschlieren

/* Gelartige Schlieren – wie weiße Flecken, aber transparenter & gelartiger */
const GEL_SCHL_COUNT = 0;
const GEL_SCHLC_TINT = [210,220,238];
const GEL_SCHLC_ALPHA = 0.12;  // gleich transparent wie Grundschlieren
const GEL_SCHLC_FEATHER = 1.0;
const GEL_SCHLC_THICK_MIN = SCHLC_THICK_MIN;
const GEL_SCHLC_THICK_MAX = SCHLC_THICK_MIN;
const GEL_SCHLC_LEN_MIN = 56 * SCALE;
const GEL_SCHLC_LEN_MAX = 165 * SCALE;
const SHOW_SCHLIEREN = true;
const SHOW_SCHLIEREN_NUMBERS = false;
const SHOW_DEBUG_OVERLAY = false;
const SCHLIEREN_FOG_RENDER = true;
const DEBUG_SCHLIEREN_GRID = false;
const HIDDEN_SCHLIEREN_NUMBERS = new Set([3, 6, 9, 12, 15, 18, 21, 24, 27, 30]);
const FLEX_SCHLIEREN_NUMBERS = new Set([4, 9, 14]);
const LARGE_SCHLIEREN_NUMBERS = new Set([]);
const MORPH_SCHLIEREN_NUMBERS = new Set([4, 8, 9, 14, 18, 23, 31, 38]);
const SEM_SCHLIEREN_NUMBERS = new Set([6, 15, 24, 36]);
const EMPHASIS_SCHLIEREN_NUMBERS = new Set([]);
const STRONG_EMPHASIS_SCHLIEREN_NUMBERS = new Set([]);
const MID_THICKEN_SCHLIEREN_NUMBERS = new Set([]);
const DARKER_SCHLIEREN_NUMBERS = new Set([]);
const FLECK_SCHLIEREN_NUMBERS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
const PAIRED_FLECK_SCHLIEREN_NUMBERS = new Set([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
const SHORT_SCHLIEREN_NUMBERS = new Set([7, 13, 21, 29, 37, 45, 53, 61]);
const LONG_SCHLIEREN_NUMBERS = new Set([3, 17, 25, 41, 57]);
const ANGLED_SCHLIEREN_NUMBERS = new Set([11, 19, 33, 49, 65]);
const CENTER_LONG_WAVE_SCHLIEREN_NUMBERS = new Set([27, 35]);
const SMALL_SCHLIEREN_NUMBERS = new Set([1, 2, 6, 7, 12, 13, 16, 20, 21, 26, 28, 29, 32, 37, 42, 45, 48, 53, 56, 61, 64, 67, 70, 73]);
const CENTER_DARK_COMPLEX_SCHLIEREN_NUMBERS = new Set([]);
const F2_STRETCH_SCHLIEREN_COUNT = 0;
const F2_CENTER_COPY_COUNT = 3;

/* ======= Weißer Superfleck links (Update) ======= */
const WHITE_SUPER_POS_XF    = 0.18;
const WHITE_SUPER_POS_YF    = 0.30;
const WHITE_SUPER_SIZE      = CLOUD_SMALLER_SIZE * 0.46 * 0.8 * 1.3;
const WHITE_SUPER_TINT      = [100,100,100];
const WHITE_SUPER_ALPHA     = 0.35;
const WHITE_SUPER_FEATHER   = 1.5;
const WHITE_SUPER_FOLLOW_GAIN = -0.14;
const WHITE_SUPER_SPEED_SCALE = 0.16;  // langsamer

/* Bewegungs-/Drift-Parameter (15% schneller als zuvor, Rampung skaliert mit) */
const DRIFT_DESIRED_SPEED = 13.8;   // zaeher, langsamer
const DRIFT_STEER_LIMIT   = 1.65;   // weicheres Einlenken
const DRIFT_RETURN_NEAR   = 30;
const DRIFT_RETURN_GAIN_N = 0.026;  // weicheres Einpendeln
const DRIFT_RETURN_GAIN_F = 0.008;  // weicheres Zurueckziehen
const DRIFT_DAMP          = 0.945;  // zaehes Nachlaufen
const DRIFT_VEL_LIMIT     = 22.0;

/* =========================================================
 * NUCLEUS DROPS – 3 weiss-transparente Tropfen (Zellkern-Stil)
 * Lose Gruppe, gemeinsam bewegt. Markiert (rot gestrichelt) für
 * Sichtbarkeit im p5js Web Editor – Markierung kann später
 * mit NUCLEUS_DROP_MARK = false ausgeblendet werden.
 * ========================================================= */
const NUCLEUS_DROP_COUNT       = 3;
// Marker für NucleusDrops aus – sie waren NICHT die "weisslichen Elemente links unten"
const NUCLEUS_DROP_BASE_SIZE   = 14 * SCALE;    // 1/5 der vorigen Größe (war 70)
const NUCLEUS_DROP_GROUP_XF    = 0.42;          // Gruppe etwas links der Mitte
const NUCLEUS_DROP_GROUP_YF    = 0.55;
const NUCLEUS_DROP_SPREAD_PX   = 110 * SCALE;   // Abstand der Tropfen zueinander
const NUCLEUS_DROP_SPEED_SCALE = 0.82;
const NUCLEUS_DROP_FOLLOW_GAIN = -0.23;
const NUCLEUS_DROP_MARK        = false;         // Marker aus (waren nicht das gemeinte Element)

class NucleusDrop {
  constructor(x, y, size, shape = 'normal') {
    this.start  = createVector(x, y);
    this.pos    = this.start.copy();
    this.vel    = createVector(0, 0);
    this.acc    = createVector(0, 0);
    this.target = this.pos.copy();
    this.size   = size;
    this.shape  = shape; // 'normal' | 'elongated' | 'round' | 'worm' | 'cells' | 'filament' | 'jelly'
    // Demo-Label (für Variantenvergleich 1/2/3)
    this.demoLabel = null;
    // leichte individuelle Variation
    if (shape === 'elongated') {
      this.aspect = 0.45; // schmal & länglich
    } else if (shape === 'round') {
      this.aspect = 1.0;  // rund
    } else if (shape === 'worm' || shape === 'filament') {
      this.aspect = 0.38; // sehr schlank
    } else if (shape === 'cells' || shape === 'jelly') {
      this.aspect = 1.0;
    } else {
      this.aspect = random(0.92, 1.08);
    }
    this.rot       = random(-0.25, 0.25);
    this.driftRange = random(20, 40);
    this.speedMult  = random(0.85, 1.15);
    this.phase      = random(TWO_PI);

    // Unabhängige Bewegung für Wurmnucleus + alle Demo-Varianten
    if (shape === 'worm' || shape === 'cells' || shape === 'filament' || shape === 'jelly') {
      this.driftRange = random(60, 95);
      this.speedMult  = random(0.55, 0.75);
      this.followGainOwn = 0.16;
      this.wobblePhase   = random(TWO_PI);
      this.wobbleFreqX   = random(0.0035, 0.0055);
      this.wobbleFreqY   = random(0.0028, 0.0042);
      this.wobbleAmp     = random(14, 22);

      // pro-Variante leicht unterschiedliche Eigen-Seeds (für stabile Form)
      this.seed = random(1000);
    }
  }

  update(isMoving, oppositeMovement = null) {
    // Demo-Floater stehen komplett still – keine Eigenbewegung, kein Wobble.
    if (this.demoLabel || this.staticDemo) {
      this.pos.x = this.start.x;
      this.pos.y = this.start.y;
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }
    // Static-Anchor (Nucleus-Gruppen): keine Eigenbewegung, kein Drift,
    // kein Wobble – reagiert NUR auf Mausbewegung wie alle anderen Elemente.
    if (this.staticAnchor) {
      if (isMoving && oppositeMovement) {
        const speedMul = this._speedClass === 'testFast' ? 1.25 : 1.0;
        const mouseDir = p5.Vector.mult(oppositeMovement, -1);
        if (directionChangeBoost > 1.2) this.vel.mult(0.60);
        steerVelocityTowardMouse(this.vel, mouseDir, 0.26);
        this.acc.add(p5.Vector.mult(mouseDir, Math.abs(NUCLEUS_DROP_FOLLOW_GAIN) * speedMul));
      this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.5 * speedMul);
      this.pos.add(this.vel);
      containElementPosition(this.pos, this.vel, this.size || 36);
    } else {
        // sanft zurück zur (verschobenen) Heimat: Ziel = start + restShift
        this.vel.mult(0.30);
        const rsx = (restShift && restShift.x) || 0;
        const rsy = (restShift && restShift.y) || 0;
        const homeX = this.start.x + rsx * 0.85;
        const homeY = this.start.y + rsy * 0.85;
        const toStart = createVector(homeX - this.pos.x, homeY - this.pos.y);
        const d = toStart.mag();
        if (d > 0.01) {
          toStart.normalize().mult(DRIFT_RETURN_GAIN_F * 1.35 * d);
          this.acc.add(toStart);
        } else {
          this.pos.set(homeX, homeY);
          this.vel.set(0, 0);
          this.acc.set(0, 0);
        }
        this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.5);
        this.pos.add(this.vel);
        containElementPosition(this.pos, this.vel, this.size || 36);
      }
      this.acc.mult(0);
      this.vel.mult(DRIFT_DAMP);
      return;
    }
    // Wurmnucleus / Demo-Varianten: eigenes, unabhängiges Verhalten
    if (this.shape === 'worm' || this.shape === 'cells' || this.shape === 'filament' || this.shape === 'jelly') {
      // Kein Wobble/Rotationsanteil: Heimat bleibt linear.
      const wx = 0;
      const wy = 0;
      const homeX = this.start.x + wx;
      const homeY = this.start.y + wy;

      if (isMoving) {
        if (p5.Vector.dist(this.pos, this.target) < 30) {
          this.target.x = this.start.x + random(-this.driftRange, this.driftRange);
          this.target.y = this.start.y + random(-this.driftRange, this.driftRange);
        }
        const desired = p5.Vector.sub(this.target, this.pos)
          .setMag(DRIFT_DESIRED_SPEED * NUCLEUS_DROP_SPEED_SCALE * this.speedMult);
        const steer = p5.Vector.sub(desired, this.vel)
          .limit(DRIFT_STEER_LIMIT * NUCLEUS_DROP_SPEED_SCALE * this.speedMult);
        this.acc.add(steer);

        // Folgt der Mausrichtung (oppositeMovement zeigt von Maus weg → invertieren)
        if (oppositeMovement) {
          const mouseDir = p5.Vector.mult(oppositeMovement, -1);
          steerVelocityTowardMouse(this.vel, mouseDir, 0.24);
          this.acc.add(p5.Vector.mult(mouseDir, this.followGainOwn));
        }
      } else {
        // sanftes Zurückschweben zur (verschobenen) Heimatposition
        const toHome = createVector(homeX - this.pos.x, homeY - this.pos.y);
        const d = toHome.mag();
        if (d < DRIFT_RETURN_NEAR) {
          toHome.normalize().mult(DRIFT_RETURN_GAIN_N * d * 0.75);
          this.vel.mult(0.62);
        } else {
          toHome.normalize().mult(DRIFT_RETURN_GAIN_F * d * 0.95);
        }
        this.acc.add(toHome);
      }

      this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.4);
      this.pos.add(this.vel);
      containElementPosition(this.pos, this.vel, this.size || 36);
      this.acc.mult(0);
      this.vel.mult(DRIFT_DAMP);
      return;
    }

    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 18) {
        this.target.x = this.start.x + random(-this.driftRange, this.driftRange);
        this.target.y = this.start.y + random(-this.driftRange, this.driftRange);
      }
      const desired = p5.Vector.sub(this.target, this.pos)
        .setMag(DRIFT_DESIRED_SPEED * NUCLEUS_DROP_SPEED_SCALE * this.speedMult);
      const steer = p5.Vector.sub(desired, this.vel)
        .limit(DRIFT_STEER_LIMIT * NUCLEUS_DROP_SPEED_SCALE * this.speedMult);
      this.acc.add(steer);

      if (oppositeMovement) {
        const mouseDir = p5.Vector.mult(oppositeMovement, -1);
        steerVelocityTowardMouse(this.vel, mouseDir, 0.24);
        this.acc.add(p5.Vector.mult(mouseDir, Math.abs(NUCLEUS_DROP_FOLLOW_GAIN)));
      }
    } else {
      this.vel.mult(0.30);
      const rsx = (restShift && restShift.x) || 0;
      const rsy = (restShift && restShift.y) || 0;
      const homeX = this.start.x + rsx * 0.85;
      const homeY = this.start.y + rsy * 0.85;
      const toStart = createVector(homeX - this.pos.x, homeY - this.pos.y);
      const d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * 1.25 * d);
        this.vel.mult(0.55);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * 1.35 * d);
      }
      this.acc.add(toStart);
    }

    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.5);
    this.pos.add(this.vel);
    containElementPosition(this.pos, this.vel, this.size || 36);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
  }

  display() {
    const w = this.size * 0.85 * this.aspect;
    const h = this.size * 0.95;

    push();
    translate(this.pos.x, this.pos.y);
    // Static-Anker: KEIN idle-Wobble auf Rotation, sonst leichtes Schwingen wie zuvor
    rotate(0);

    if (this.shape === 'worm') {
      this.displayWorm();
      pop();
      this.drawDemoLabel();
      return;
    }

    if (this.shape === 'glassFiber') {
      this._displayGlassFiber();
      pop();
      return;
    }

    if (!this._skipSimpleGlassRefraction) {
      this._drawSimpleGlassRefraction(w, h);
    }

    // Weiche Außenschicht – verwischt die Kontur (Form läuft noch sanfter aus)
    drawingContext.filter = 'blur(26px)';
    noStroke();
    fill(255, 255, 255, 9);
    ellipse(0, 0, w * 1.7, h * 1.6);
    drawingContext.filter = 'none';

    // Dezente Aura – weicher
    drawingContext.filter = 'blur(16px)';
    fill(255, 255, 255, 11);
    ellipse(0, 0, w * 1.4, h * 1.32);
    drawingContext.filter = 'none';

    // Zell-/Tropfenkontur (Bezier: leichte Spitze oben)
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.moveTo(0, -h * 0.5);
    drawingContext.bezierCurveTo( w * 0.5, -h * 0.45,  w * 0.5, h * 0.5,  0, h * 0.5);
    drawingContext.bezierCurveTo(-w * 0.5,  h * 0.5,  -w * 0.5,-h * 0.45, 0,-h * 0.5);
    drawingContext.closePath();

    // Weicherer Grundfill – wie Regentropfen auf Glas: durchsichtig, aber lichtbrechend
    drawingContext.fillStyle = 'rgba(255,255,255,0.13)';
    drawingContext.fill();

    drawingContext.clip();

    // Plasma-Schichten – innen wolkig, deutlich zurückgenommen
    drawingContext.filter = 'blur(9px)';
    for (let i = 0; i < 4; i++) {
      drawingContext.fillStyle = `rgba(255,255,255,${0.04 + i * 0.022})`;
      drawingContext.beginPath();
      drawingContext.ellipse(0, 0, w * (0.55 - i * 0.07), h * (0.55 - i * 0.07), 0, 0, Math.PI * 2);
      drawingContext.fill();
    }
    drawingContext.filter = 'none';

    // Heller Kern – innen, bleibt sichtbar als Lichtbrechungspunkt
    drawingContext.filter = 'blur(6px)';
    drawingContext.fillStyle = 'rgba(255,255,255,0.26)';
    drawingContext.beginPath();
    drawingContext.ellipse(w * 0.04, -h * 0.02, w * 0.28, h * 0.26, 0, 0, Math.PI * 2);
    drawingContext.fill();
    drawingContext.filter = 'none';

    drawingContext.restore();

    // Lichtkante / Glasschimmer am Rand, damit der Hintergrund wie durch
    // einen Tropfen wahrgenommen wird – statisch, keine Eigenbewegung.
    drawingContext.save();
    drawingContext.filter = 'blur(1.4px)';
    drawingContext.strokeStyle = 'rgba(255,245,220,0.42)';
    drawingContext.lineWidth = Math.max(0.7, this.size * 0.035);
    drawingContext.beginPath();
    drawingContext.moveTo(0, -h * 0.5);
    drawingContext.bezierCurveTo( w * 0.5, -h * 0.45,  w * 0.5, h * 0.5,  0, h * 0.5);
    drawingContext.bezierCurveTo(-w * 0.5,  h * 0.5,  -w * 0.5,-h * 0.45, 0,-h * 0.5);
    drawingContext.closePath();
    drawingContext.stroke();
    drawingContext.strokeStyle = 'rgba(170,205,255,0.28)';
    drawingContext.lineWidth = Math.max(0.5, this.size * 0.022);
    drawingContext.stroke();
    drawingContext.filter = 'none';
    drawingContext.restore();

    // Highlight links oben – als Glanzpunkt der Lichtbrechung
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.moveTo(0, -h * 0.5);
    drawingContext.bezierCurveTo( w * 0.5, -h * 0.45,  w * 0.5, h * 0.5,  0, h * 0.5);
    drawingContext.bezierCurveTo(-w * 0.5,  h * 0.5,  -w * 0.5,-h * 0.45, 0,-h * 0.5);
    drawingContext.closePath();
    drawingContext.clip();
    drawingContext.filter = 'blur(6px)';
    drawingContext.fillStyle = 'rgba(255,255,255,0.18)';
    drawingContext.beginPath();
    drawingContext.ellipse(-w * 0.2, -h * 0.22, w * 0.18, h * 0.12, -0.5, 0, Math.PI * 2);
    drawingContext.fill();
    drawingContext.filter = 'none';
    drawingContext.restore();

    if (this._fiberOverlay) {
      this._drawFiberOverlay(w, h);
    }

    if (this._centerPunchHole) {
      this._drawCenterPunchHole(w, h);
    }

    pop();
  }

  _drawFiberOverlay(w, h) {
    const ctx = drawingContext;
    ctx.save();
    // clip auf Tropfenform
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.5);
    ctx.bezierCurveTo( w * 0.5, -h * 0.45,  w * 0.5, h * 0.5,  0, h * 0.5);
    ctx.bezierCurveTo(-w * 0.5,  h * 0.5,  -w * 0.5,-h * 0.45, 0,-h * 0.5);
    ctx.closePath();
    ctx.clip();
    ctx.filter = 'blur(0.6px)';
    ctx.lineCap = 'round';
    const seed = this._fiberSeed ?? 7;
    const count = 9;
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) - 0.5;       // -0.5..0.5
      const x0 = t * w * 0.9;
      const sway = Math.sin(seed + i * 1.7) * w * 0.08;
      const a = 0.10 + (i % 2) * 0.06;
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = Math.max(0.4, this.size * (0.006 + (i % 3) * 0.002));
      ctx.beginPath();
      ctx.moveTo(x0, -h * 0.55);
      ctx.bezierCurveTo(
        x0 + sway, -h * 0.18,
        x0 - sway,  h * 0.18,
        x0 * 0.8,   h * 0.55
      );
      ctx.stroke();
    }
    ctx.filter = 'none';
    ctx.restore();
  }

  _displayGlassFiber() {
    const ctx = drawingContext;
    // sehr schmal & wurmartig
    const w = this.size * 0.085 * (this.aspect ?? 1);
    const h = this.size * 1.05;
    const seed = this._fiberSeed ?? 13;

    // weiche Aura
    ctx.save();
    ctx.filter = 'blur(22px)';
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 1.6, h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    // langgezogener glasiger Body als Clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.5);
    ctx.bezierCurveTo( w * 0.7, -h * 0.42,  w * 0.7, h * 0.42,  0, h * 0.5);
    ctx.bezierCurveTo(-w * 0.7,  h * 0.42, -w * 0.7,-h * 0.42,  0,-h * 0.5);
    ctx.closePath();

    // sehr dezenter Grund-Fill
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.clip();

    // Fasern: untere Hälfte mehrere Schichten überlappend, obere Hälfte ausdünnend
    ctx.lineCap = 'round';
    ctx.filter = 'blur(0.7px)';

    const layers = [
      { off: -0.30, alpha: 0.18, wMul: 1.0 },
      { off: -0.18, alpha: 0.16, wMul: 0.9 },
      { off: -0.06, alpha: 0.20, wMul: 1.1 },
      { off:  0.06, alpha: 0.16, wMul: 0.9 },
      { off:  0.18, alpha: 0.18, wMul: 1.0 },
      { off:  0.30, alpha: 0.14, wMul: 0.8 },
    ];

    for (let li = 0; li < layers.length; li++) {
      const L = layers[li];
      const x0 = L.off * w * 1.2;
      const sway = Math.sin(seed + li * 1.3) * w * 0.18;
      const lw = Math.max(0.5, this.size * 0.0035 * L.wMul);

      // Verlauf entlang der Faser: oben sehr transparent (ausdünnend),
      // unten dicht und kräftiger.
      const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
      grad.addColorStop(0.00, `rgba(255,255,255,0)`);
      grad.addColorStop(0.30, `rgba(255,255,255,${L.alpha * 0.25})`);
      grad.addColorStop(0.55, `rgba(255,255,255,${L.alpha * 0.7})`);
      grad.addColorStop(1.00, `rgba(255,255,255,${L.alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lw;

      ctx.beginPath();
      ctx.moveTo(x0, -h * 0.55);
      ctx.bezierCurveTo(
        x0 + sway, -h * 0.20,
        x0 - sway,  h * 0.20,
        x0 * 0.6,   h * 0.55
      );
      ctx.stroke();
    }

    // zusätzliche dichte Faserbündel NUR im unteren Bereich
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w, 0, w * 2, h * 0.6);
    ctx.clip();
    for (let i = 0; i < 7; i++) {
      const t = (i / 6) - 0.5;
      const x0 = t * w * 1.1;
      const sway = Math.sin(seed * 0.7 + i * 2.1) * w * 0.14;
      ctx.strokeStyle = `rgba(255,255,255,${0.10 + (i % 2) * 0.06})`;
      ctx.lineWidth = Math.max(0.4, this.size * 0.0028);
      ctx.beginPath();
      ctx.moveTo(x0, -h * 0.05);
      ctx.bezierCurveTo(
        x0 + sway, h * 0.18,
        x0 - sway, h * 0.36,
        x0 * 0.7,  h * 0.55
      );
      ctx.stroke();
    }
    ctx.restore();

    ctx.filter = 'none';

    // Glasrand-Highlight
    ctx.strokeStyle = 'rgba(255,245,220,0.18)';
    ctx.lineWidth = Math.max(0.5, this.size * 0.004);
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.5);
    ctx.bezierCurveTo( w * 0.7, -h * 0.42,  w * 0.7, h * 0.42,  0, h * 0.5);
    ctx.bezierCurveTo(-w * 0.7,  h * 0.42, -w * 0.7,-h * 0.42,  0,-h * 0.5);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  _drawCenterPunchHole(w, h) {
    const ctx = drawingContext;
    const rx = w * (this._holeRx ?? 0.22);
    const ry = h * (this._holeRy ?? 0.20);
    const ox = this._holeOffsetX ?? 0;
    const oy = this._holeOffsetY ?? 0;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'blur(1.2px)';
    ctx.fillStyle = 'rgba(0,0,0,0.96)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    const fillA = this._holeFillAlpha ?? 0.025;
    if (fillA > 0) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'blur(5px)';
      ctx.fillStyle = `rgba(255,255,255,${fillA})`;
      ctx.beginPath();
      ctx.ellipse(ox, oy, rx * 0.95, ry * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.filter = 'none';
      ctx.restore();
    }
  }

  // Wassertropfen-Refraktion: zeichnet den Hintergrund unter dem Tropfen
  // leicht vergrößert und versetzt zurück → optische Verzerrung wie bei
  // einem Wassertropfen auf einer Glasscheibe. Subtil & performant.
  _drawWaterDropRefraction() {
    const ctx     = drawingContext;
    const canvas  = ctx.canvas;
    const pd      = (typeof pixelDensity === 'function') ? pixelDensity() : 1;

    // Ungefähre Body-Ausmaße in lokalen Koordinaten (oily-classic).
    const lenMul  = this._lenMul ?? 1.0;
    const radMul  = this._radMul ?? 1.0;
    const refractScale = this._refractScale ?? 1.0;
    const halfH   = this.size * 8.4 * lenMul * 0.55 * refractScale;
    const halfW   = this.size * 0.32 * radMul * 2.2 * refractScale;

    // 1) Clip auf eine ovale Approximation des Wurmkörpers (lokale Koords).
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
    ctx.clip();

    // 2) Transform zurücksetzen, damit wir in Welt-Pixeln samplen können.
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 3) Sampling-Rechteck um die Welt-Position des Tropfens.
    //    Bissel größer als der Tropfen, damit wir auch beim Versatz
    //    noch genug Hintergrund haben.
    const cx       = this.pos.x;
    const cy       = this.pos.y;
    const sampleW  = Math.max(halfW, halfH) * 2.6;
    const sampleH  = sampleW;
    const zoom     = 1.06;          // leichter Linsen-Zoom
    const shiftX   = -2;            // mini Versatz nach links/oben
    const shiftY   = -1;
    const sw       = sampleW / zoom;
    const sh       = sampleH / zoom;
    // Source: Canvas selbst – Koordinaten in Geräte-Pixel (pixelDensity)
    const sx = (cx - sw / 2 + shiftX) * pd;
    const sy = (cy - sh / 2 + shiftY) * pd;
    try {
      ctx.filter = 'blur(1.6px)';
      ctx.drawImage(
        canvas,
        sx, sy, sw * pd, sh * pd,
        cx - sampleW / 2, cy - sampleH / 2, sampleW, sampleH
      );
      ctx.filter = 'none';
    } catch (e) {
      // Falls drawImage fehlschlägt (z. B. ungültige Source-Rect), still skippen.
    }
    ctx.restore();

    // 4) Lichtbrechungs-Highlight oben links (subtiler Glanzfleck) –
    //    in den ursprünglichen lokalen Koordinaten gezeichnet.
    ctx.save();
    ctx.filter = 'blur(3.5px)';
    ctx.fillStyle = 'rgba(255,255,255,0.26)';
    ctx.beginPath();
    ctx.ellipse(-halfW * 0.40, -halfH * 0.55, halfW * 0.22, halfH * 0.09, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    // Rand-Schimmer: warm oben/rechts, kühl unten/links – subtiler
    // Phasenkontrast wie an einer Glas-/Wassertropfenkante.
    ctx.save();
    ctx.filter = 'blur(1.2px)';
    ctx.strokeStyle = 'rgba(255,238,205,0.42)';
    ctx.lineWidth = Math.max(0.9, this.size * 0.020);
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW * 0.98, halfH * 0.98, 0, -Math.PI * 0.95, Math.PI * 0.15);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150,190,245,0.30)';
    ctx.lineWidth = Math.max(0.8, this.size * 0.018);
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW * 1.01, halfH * 1.01, 0, Math.PI * 0.10, Math.PI * 1.05);
    ctx.stroke();
    ctx.filter = 'none';
    ctx.restore();
  }

  _drawSimpleGlassRefraction(w, h) {
    const ctx    = drawingContext;
    const canvas = ctx.canvas;
    const pd     = (typeof pixelDensity === 'function') ? pixelDensity() : 1;
    const cx     = this.pos.x;
    const cy     = this.pos.y;
    const sample = Math.max(w, h) * 1.75;
    const zoom   = 1.045;
    const sw     = sample / zoom;
    const sh     = sample / zoom;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.5);
    ctx.bezierCurveTo( w * 0.5, -h * 0.45,  w * 0.5, h * 0.5,  0, h * 0.5);
    ctx.bezierCurveTo(-w * 0.5,  h * 0.5,  -w * 0.5,-h * 0.45, 0,-h * 0.5);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.72;
    ctx.filter = 'blur(2.2px)';
    try {
      ctx.drawImage(
        canvas,
        (cx - sw / 2 - 1.5) * pd, (cy - sh / 2 - 1.0) * pd, sw * pd, sh * pd,
        cx - sample / 2, cy - sample / 2, sample, sample
      );
    } catch (e) {}
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Wurmnucleus – stark geleeartiges, sinusförmig gewundenes Element
  // Aufbau: Sinus-Mittellinie + Quer-Polygonkörper, dadurch echter "Wurm"-Look.
  displayWorm() {
    const t     = frameCount * 0.012 + this.phase;
    const ctx   = drawingContext;
    const seed0 = this.seed || 0;
    const rndR = (k) => {
      const v = Math.sin(seed0 * 12.9898 + k * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    // Bakterien-Subvariante steuert Geometrie + Innenleben
    const bSub = this.bacterialSubvariant; // 'bacillus' | 'spirillum' | 'colony' | undefined

    // Outline-Drift-Subvariante (Skizzen-Look): geometrisch unterschiedlich pro Variante
    const isDriftOutline = (this.wormVariant === 'vitreous' && this.vitreousSubvariant === 'drift');
    const dSub = isDriftOutline ? (this.driftSubvariant || 'currents') : null;

    // Oily-Subvarianten (Runde 10): erweitern den oily-Glaskörper-Look formenmäßig
    // 'classic' = Standard-Wurm, 'comma' = gekrümmtes Komma, 'pearl' = mit Plasma-Knoten
    const isOilyDemo = (this.wormVariant === 'vitreous' && this.vitreousSubvariant === 'oily');
    const oSub = isOilyDemo ? (this.oilyVariant || 'classic') : null;

    // ── Wassertropfen-Refraktion / Hintergrund-Unschärfe ──
    // Subtile Linsen-Verzerrung des bereits gezeichneten Hintergrunds:
    // sampled die Canvas-Fläche unter dem Tropfen, zoomt sie leicht und
    // setzt sie versetzt zurück. Wirkt wie ein Wassertropfen auf Glas.
    if (this._waterDropRefract || (isOilyDemo && (this.demoLabel || this.staticDemo))) {
      this._drawWaterDropRefraction();
    }

    // Geometrie-Parameter je nach Subvariante
    let len, rad, waveCount, waveAmp, contourMode;
    if (bSub === 'bacillus') {
      // Stäbchen: kürzer, dicker, kaum gewunden, knotige Hülle
      len = this.size * 6.5; rad = this.size * 0.55; waveCount = 0.6; waveAmp = this.size * 0.18;
      contourMode = 'knobby';
    } else if (bSub === 'spirillum') {
      // Spirille: lang, dünn, stark schraubig
      len = this.size * 8.8; rad = this.size * 0.28; waveCount = 3.4; waveAmp = this.size * 0.85;
      contourMode = 'smooth';
    } else if (bSub === 'colony') {
      // Kette: lang, mit Pinch-Stellen → segmentierte Hülle
      len = this.size * 8.5; rad = this.size * 0.50; waveCount = 0.8; waveAmp = this.size * 0.22;
      contourMode = 'segmented';
    } else if (isDriftOutline) {
      // Runde 12: bakterielle Mikroskop-Geometrien – dicker, dreckiger,
      // unregelmäßig mit Beulen/Einschnürungen statt sauberen Wellen.
      //   1 = currents     → kurzes dickes Bakterium (Kokken-Bazillus)
      //   2 = slowtide     → langes geschwungenes Filament mit Knoten
      //   3 = countercolor → komma-/wurmartige Zelle mit Spore
      if (dSub === 'currents')      { len = this.size * 5.4; rad = this.size * 0.55; waveCount = 0.25; waveAmp = this.size * 0.10; }
      else if (dSub === 'slowtide') { len = this.size * 8.4; rad = this.size * 0.32; waveCount = 1.4;  waveAmp = this.size * 0.55; }
      else                          { len = this.size * 6.4; rad = this.size * 0.42; waveCount = 0.40; waveAmp = this.size * 0.30; }
      contourMode = 'dirty';
    } else if (isOilyDemo) {
      // ── OILY-FILAMENT-VARIANTEN (Runde 15) ──
      // Alle drei Demo-Slots verwenden jetzt den Stil von "Variante 1"
      // (oily/vitreous-Glaskörper, dirty-pearled Kontur). Subtile
      // Variationen pro Slot über _lenMul / _radMul / _waveMul / _ampMul.
      const lenMul  = this._lenMul  ?? 1.0;
      const radMul  = this._radMul  ?? 1.0;
      const waveMul = this._waveMul ?? 1.0;
      const ampMul  = this._ampMul  ?? 1.0;
      if (oSub === 'classic') {
        len = this.size * 8.4 * lenMul;
        rad = this.size * 0.32 * radMul;
        waveCount = 1.4 * waveMul;
        waveAmp   = this.size * 0.55 * ampMul;
        contourMode = 'dirty-pearled';
      } else if (oSub === 'comma') {
        len = this.size * 9.0 * lenMul;
        rad = this.size * 0.28 * radMul;
        waveCount = 1.7 * waveMul;
        waveAmp   = this.size * 0.70 * ampMul;
        contourMode = 'dirty-pearled';
      } else { // 'pearl'
        len = this.size * 8.8 * lenMul;
        rad = this.size * 0.40 * radMul;
        waveCount = 1.2 * waveMul;
        waveAmp   = this.size * 0.50 * ampMul;
        contourMode = 'dirty-pearled';
      }
    } else {
      // Default (vitreous etc.)
      len = this.size * 7.75; rad = this.size * 0.34; waveCount = 1.6; waveAmp = this.size * 0.55;
      contourMode = 'smooth';
    }
    const halfL = len * 0.5;
    const N = 60;
    // Demo-Floater (drift ODER oily-Demo): Form komplett statisch.
    const isDemoStatic = isDriftOutline || isOilyDemo || !!this.demoLabel || !!this.staticDemo;
    const breath = isDemoStatic ? 1.0 : (0.85 + 0.15 * sin(t * 0.7));
    const tForm  = isDemoStatic ? 0   : t;

    const cx = [], cy = [], nx = [], ny = [], rW = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const y = -halfL + u * len;
      let x = sin(u * Math.PI * 2 * waveCount + tForm * 1.1) * waveAmp * breath
            + sin(u * Math.PI + tForm * 0.5) * waveAmp * 0.18;

      // Hook-Form: nur noch für drift 'countercolor' (oily-Filament bleibt gerade)
      if (isDriftOutline && dSub === 'countercolor') {
        const hookStrength = 1.6;
        const hookT = Math.pow(1 - u, 2.6);          // 1 am Kopf, 0 am Schwanz
        x += hookT * this.size * hookStrength;       // seitlicher Schwung in den Hook
      }
      cx[i] = x;
      cy[i] = y;
      const taper = Math.sin(u * Math.PI);    // 0 an Enden, 1 in Mitte
      let r = rad * (0.55 + 0.55 * taper);

      // Konturmodulation – macht die Hülle bakteriell unregelmäßig
      if (contourMode === 'knobby') {
        // Bukkelige Verdickungen (3 Frequenzen, animiert sehr leicht)
        const noise =
          0.18 * Math.sin(u * Math.PI * 9  + rndR(1) * 6 + t * 0.3) +
          0.12 * Math.sin(u * Math.PI * 17 + rndR(2) * 6 + t * 0.5) +
          0.06 * Math.sin(u * Math.PI * 31 + rndR(3) * 6);
        r = r * (1 + noise);
      } else if (contourMode === 'segmented') {
        // 4 Pinch-Stellen → wirkt wie Bakterienkette
        const pinch = Math.abs(Math.sin(u * Math.PI * 4));   // 0 an Pinch, 1 in Segmentmitte
        r = r * (0.55 + 0.55 * pinch);
      } else if (contourMode === 'pearled') {
        // 3 sanfte Verdickungs-Knoten entlang der Länge (Pearl-Look),
        // sehr weich – Hülle bleibt geschlossen, nur leichte Schwellungen
        const knot = Math.cos(u * Math.PI * 3);   // -1..1, 3 Schwellungen
        r = r * (1 + 0.20 * knot);
      } else if (contourMode === 'dirty-pearled') {
        // MIX (Runde 14): Pearl-Knoten (3 Schwellungen → "3 Nuclei")
        // PLUS dreckige Mikroskop-Schlieren (Lumps, Pinch, Rand-Rauschen).
        // Komplett statisch (kein t-Term) – nur Form.
        // 1) Drei klare Knoten / "Nuclei" entlang des Filaments
        const knot = Math.cos(u * Math.PI * 3);
        r = r * (1 + 0.22 * knot);
        // 2) Schmutzige asymmetrische Beulen (mehrere Frequenzen)
        const lump =
          0.18 * Math.sin(u * Math.PI * 4.3 + rndR(1) * 6) +
          0.12 * Math.sin(u * Math.PI * 7.7 + rndR(2) * 6) +
          0.07 * Math.sin(u * Math.PI * 13.1 + rndR(3) * 6) +
          0.04 * Math.sin(u * Math.PI * 23.0 + rndR(4) * 6);
        // 3) Eine lokale Einschnürung zwischen zwei Knoten
        const pinchU = 0.30 + rndR(5) * 0.40;
        const pinch  = Math.exp(-Math.pow((u - pinchU) * 12, 2)) * 0.28;
        r = r * (1 + lump - pinch);
        // 4) Stärkere Verjüngung & saubere runde Endknubbel
        r = r * (0.70 + 0.50 * taper);
        if (u < 0.06) r += rad * 0.18 * (1 - u / 0.06);
        if (u > 0.94) r += rad * 0.22 * ((u - 0.94) / 0.06);
      } else if (contourMode === 'dirty') {
        // Bakterien-Mikroskop-Hülle: stark unregelmäßig mit asymmetrischen
        // Beulen, lokalen Einschnürungen und feinem Rauschen am Rand.
        // STATISCH (kein t-Term) – kein Eigenleben/Wabbeln, nur Form.
        const lump =
          0.22 * Math.sin(u * Math.PI * 4.3 + rndR(1) * 6) +
          0.14 * Math.sin(u * Math.PI * 7.7 + rndR(2) * 6) +
          0.08 * Math.sin(u * Math.PI * 13.1 + rndR(3) * 6) +
          0.05 * Math.sin(u * Math.PI * 23.0 + rndR(4) * 6);
        // Lokale Einschnürung an einer zufälligen Stelle
        const pinchU = 0.30 + rndR(5) * 0.40;
        const pinch  = Math.exp(-Math.pow((u - pinchU) * 12, 2)) * 0.35;
        r = r * (1 + lump - pinch);
        // Stärkere Verjüngung & runde Endknubbel
        r = r * (0.65 + 0.55 * taper);
        // Mini-Endknubbel direkt am Cap
        if (u < 0.06) r += rad * 0.20 * (1 - u / 0.06);
        if (u > 0.94) r += rad * 0.25 * ((u - 0.94) / 0.06);
      }

      // Soft-Body-Drift: Radius über die Länge fast konstant, an den Enden
      // nur ganz leicht verjüngt – wirkt wie ein wattiges Würmchen mit
      // sauber abgerundeten Caps.
      if (isDriftOutline && contourMode !== 'dirty') {
        r = rad * (0.88 + 0.12 * taper);
      }
      rW[i] = r;
    }
    // Normalen aus Tangenten
    for (let i = 0; i <= N; i++) {
      const i0 = Math.max(0, i - 1);
      const i1 = Math.min(N, i + 1);
      const tx = cx[i1] - cx[i0];
      const ty = cy[i1] - cy[i0];
      const m = Math.hypot(tx, ty) || 1;
      nx[i] = -ty / m;
      ny[i] =  tx / m;
    }

    // Pfad-Builder: gepufferter Streifen entlang der Mittellinie
    const buildBodyPath = (rScale = 1) => {
      ctx.beginPath();
      // Vorderkante (rechts entlang der Normalen)
      ctx.moveTo(cx[0] + nx[0] * rW[0] * rScale, cy[0] + ny[0] * rW[0] * rScale);
      for (let i = 1; i <= N; i++) {
        ctx.lineTo(cx[i] + nx[i] * rW[i] * rScale, cy[i] + ny[i] * rW[i] * rScale);
      }
      // Rundung am Endpunkt
      ctx.lineTo(cx[N], cy[N]);
      // Rückkante (links entlang der Normalen)
      for (let i = N; i >= 0; i--) {
        ctx.lineTo(cx[i] - nx[i] * rW[i] * rScale, cy[i] - ny[i] * rW[i] * rScale);
      }
      ctx.closePath();
    };

    // Outline-Drift überspringt komplett Aura, Bodyfill und Clip,
    // damit nur die dünne Outline + freie Bubbles übrig bleiben (Skizzen-Look).
    if (!isDriftOutline) {
      // 1) Weiche Außen-Aura (geleeartiger Halo)
      ctx.filter = 'blur(20px)';
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      buildBodyPath(1.7);
      ctx.fill();
      ctx.filter = 'blur(10px)';
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      buildBodyPath(1.25);
      ctx.fill();
      ctx.filter = 'none';

      // 2) Geleekörper / Bakterien-Plasma – Tint je nach Subvariante
      ctx.save();
      buildBodyPath(1.0);
      let bodyTint = 'rgba(210,235,255,0.14)'; // default: cyan-Glas
      if (bSub === 'bacillus')  bodyTint = 'rgba(225,220,200,0.20)'; // warm/bräunlich, opaker
      if (bSub === 'spirillum') bodyTint = 'rgba(195,215,180,0.18)'; // olivgrünlich
      if (bSub === 'colony')    bodyTint = 'rgba(220,210,225,0.20)'; // leicht mauve-violett
      ctx.fillStyle = bodyTint;
      ctx.fill();
      ctx.clip();
    }

    // === Variantenspezifischer Innen-Render ===
    const variant = this.wormVariant || 'vitreous';
    const seed = this.seed || 0;
    const rnd = (k) => {
      const v = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    // Helper: Längskurve seitlich versetzt (für Glanz/Schatten/Fasern)
    const drawSideCurve = (offsetFn, style, width, blur) => {
      ctx.filter = blur ? `blur(${blur}px)` : 'none';
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const off = offsetFn(i);
        const px = cx[i] + nx[i] * rW[i] * off;
        const py = cy[i] + ny[i] * rW[i] * off;
        if (i === 0) ctx.moveTo(px, py);
        else         ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.filter = 'none';
    };

    // Sanfte innere Tiefenwolken (gemeinsame Basis – sehr dezent)
    if (!isDriftOutline) {
      ctx.filter = 'blur(10px)';
      for (let i = 6; i <= N - 6; i += 6) {
        ctx.fillStyle = `rgba(255,255,255,${(0.04 + 0.025 * Math.sin(t * 1.1 + i * 0.25)).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(cx[i], cy[i], rW[i] * 0.75, rW[i] * 0.55, Math.atan2(ny[i], nx[i]), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.filter = 'none';
    }

    // ──────────────────────────────────────────────────────────────
    // VARIANTE 1 — VITREOUS (glasklar, lichtbrechend)
    // ──────────────────────────────────────────────────────────────
    if (bSub) {
      // ══════════════════════════════════════════════════════════
      // BAKTERIEN-RENDER (3 Subvarianten: bacillus / spirillum / colony)
      // ══════════════════════════════════════════════════════════

      // Gemeinsame innere Plasma-Wolken (organisch, nicht glatt)
      ctx.filter = 'blur(7px)';
      for (let i = 4; i <= N - 4; i += 3) {
        const a = 0.08 + 0.05 * Math.sin(t * 1.1 + i * 0.2 + rndR(i) * 6);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(cx[i], cy[i], rW[i] * 0.6, rW[i] * 0.45, Math.atan2(ny[i], nx[i]), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.filter = 'none';

      if (bSub === 'bacillus') {
        // ── Grobe Granula (Plasma-Einschlüsse) – unregelmäßig groß/klein verteilt
        ctx.filter = 'blur(1.4px)';
        const G = 28;
        for (let k = 0; k < G; k++) {
          const u  = rndR(k * 2 + 1);
          const idx = Math.max(2, Math.min(N - 2, Math.round(u * N)));
          const off = (rndR(k * 2 + 2) - 0.5) * 1.2;
          const sizeBias = 0.4 + Math.pow(rndR(k * 3 + 7), 2) * 1.6; // viele klein, wenige groß
          const rr = rW[idx] * 0.18 * sizeBias;
          const a = 0.18 + 0.12 * Math.sin(t * 1.4 + k);
          // leicht warmes Granulum
          ctx.fillStyle = `rgba(255,240,210,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(
            cx[idx] + nx[idx] * rW[idx] * off,
            cy[idx] + ny[idx] * rW[idx] * off,
            rr, rr * (0.7 + rndR(k * 5 + 3) * 0.5), rndR(k * 7) * Math.PI, 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.filter = 'none';

        // ── Innere Plasma-Wellen (statt Currents-Reflexen) – langsam wandernd
        const drawPlasmaWave = (uPos, sigma, alpha, widthFactor, offBase, color) => {
          const idxG = Math.round(uPos * N);
          ctx.filter = 'blur(3px)';
          ctx.strokeStyle = color || `rgba(255,250,235,${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(1.0, this.size * widthFactor);
          ctx.lineCap = 'round';
          ctx.beginPath();
          const i0 = Math.max(0, idxG - sigma);
          const i1 = Math.min(N, idxG + sigma);
          for (let i = i0; i <= i1; i++) {
            const w = Math.exp(-((i - idxG) ** 2) / (2 * (sigma * 0.5) ** 2));
            const off = offBase + 0.10 * w;
            const px = cx[i] + nx[i] * rW[i] * off;
            const py = cy[i] + ny[i] * rW[i] * off;
            if (i === i0) ctx.moveTo(px, py);
            else          ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.filter = 'none';
        };
        const waves = [
          { speed: 0.20, phase: 0,           sigma: 12, alpha: 0.35, w: 0.030, off:  0.30 },
          { speed: 0.30, phase: Math.PI,     sigma: 10, alpha: 0.28, w: 0.024, off: -0.30 },
          { speed: 0.42, phase: Math.PI/2,   sigma:  8, alpha: 0.22, w: 0.020, off:  0.05 },
        ];
        for (const w of waves) {
          const u = Math.sin(t * w.speed + w.phase) * 0.5 + 0.5;
          drawPlasmaWave(u, w.sigma, w.alpha, w.w, w.off);
        }
      }

      else if (bSub === 'spirillum') {
        // ── Dichte Längs-Striationen (Geißel-Bündel-Look) – viele dünne, parallele Linien
        const lines = 11;
        ctx.filter = 'blur(0.5px)';
        for (let l = 0; l < lines; l++) {
          const baseOff = ((l / (lines - 1)) - 0.5) * 1.40;
          const ph = rndR(l * 11 + 1) * Math.PI * 2;
          const a = 0.18 + Math.abs(baseOff) * 0.20;
          ctx.strokeStyle = `rgba(225,240,210,${a.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.4, this.size * 0.005);
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const u = i / N;
            const off = baseOff + 0.05 * Math.sin(u * Math.PI * 3 + ph + t * 0.5);
            const px = cx[i] + nx[i] * rW[i] * off;
            const py = cy[i] + ny[i] * rW[i] * off;
            if (i === 0) ctx.moveTo(px, py);
            else         ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.filter = 'none';

        // dezenter Mittel-Glanz
        ctx.filter = 'blur(2px)';
        ctx.strokeStyle = 'rgba(255,255,240,0.30)';
        ctx.lineWidth = Math.max(0.8, this.size * 0.014);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const px = cx[i] + nx[i] * rW[i] * 0.0;
          const py = cy[i] + ny[i] * rW[i] * 0.0;
          if (i === 0) ctx.moveTo(px, py);
          else         ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.filter = 'none';
      }

      else if (bSub === 'colony') {
        // ── Pulsierende Plasma-Kerne in jedem Segment (4 Pinch-Stellen → 4 Segmentmitten)
        // Segmentmitten liegen bei u = 0.125, 0.375, 0.625, 0.875 (zwischen den Pinches)
        const segCenters = [0.125, 0.375, 0.625, 0.875];
        ctx.filter = 'blur(4px)';
        for (let s = 0; s < segCenters.length; s++) {
          const u = segCenters[s];
          const idx = Math.round(u * N);
          // synchron pulsierend (alle gemeinsam atmen)
          const pulse = 0.55 + 0.35 * Math.sin(t * 1.3);
          const rr = rW[idx] * 0.55 * pulse;
          // Halo
          ctx.fillStyle = `rgba(255,235,250,${(0.18 * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx[idx], cy[idx], rr * 1.6, rr * 1.4, 0, 0, Math.PI * 2);
          ctx.fill();
          // Kern
          ctx.fillStyle = `rgba(255,250,255,${(0.55 * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx[idx], cy[idx], rr * 0.55, rr * 0.50, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.filter = 'none';

        // Verbindungs-Brücken zwischen Segmenten – dünne dunklere Linie an den Pinches
        ctx.filter = 'blur(0.8px)';
        ctx.strokeStyle = 'rgba(80,60,90,0.22)';
        ctx.lineWidth = Math.max(0.6, this.size * 0.010);
        const pinchUs = [0.25, 0.50, 0.75];
        for (const pu of pinchUs) {
          const idx = Math.round(pu * N);
          const r = rW[idx] * 1.1;
          ctx.beginPath();
          ctx.moveTo(cx[idx] + nx[idx] * r, cy[idx] + ny[idx] * r);
          ctx.lineTo(cx[idx] - nx[idx] * r, cy[idx] - ny[idx] * r);
          ctx.stroke();
        }
        ctx.filter = 'none';
      }

      // Sehr dezente Schattenkante (gibt Volumen, gemeinsam für alle Bakterien)
      ctx.filter = 'blur(2.5px)';
      ctx.strokeStyle = 'rgba(20,30,40,0.18)';
      ctx.lineWidth = Math.max(1.0, this.size * 0.018);
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const off = -0.65;
        const px = cx[i] + nx[i] * rW[i] * off;
        const py = cy[i] + ny[i] * rW[i] * off;
        if (i === 0) ctx.moveTo(px, py);
        else         ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.filter = 'none';
    }
    else if (variant === 'vitreous') {
      const sub = this.vitreousSubvariant || 'base';

      // ─────────────────────────────────────────────────────────
      // DRIFT-Subvarianten (Runde 5, neu nach Referenz-Skizze):
      //   "Outline-Worm" Look – dünne, gleichmäßig helle Outline,
      //   transparenter Innenraum, dezente Schattenkante,
      //   organische Knötchen / Bubbles / Begleiterpunkte.
      //
      //   1 = 'currents'     → Outline Worm (clean, plus 1–2 freie Begleit-Bubbles)
      //   2 = 'slowtide'     → Beaded Worm (Perlenkette: runde Knötchen entlang der Linie)
      //   3 = 'countercolor' → Hooked Worm (große Bubble/Loop am einen Ende, kleiner Punkt am anderen)
      // ─────────────────────────────────────────────────────────
      if (sub === 'drift') {
        const driftSub = this.driftSubvariant || 'currents';

        // ══════════════════════════════════════════════════════════
        // RUNDE 12 – "DIRTY MICROSCOPE GEL"
        // Lebendzelle / Bakterium im Phasenkontrast-Mikroskop:
        //   • dichte dunkle Outline (Phasenring-Effekt)
        //   • volumetrische Gel-Innenschattierung mit hellem Kernbereich
        //     und dunkleren Rändern (3D-Wirkung)
        //   • interne Vakuolen, Granula und Schmutz-Punkte (statisch)
        //   • leicht kontrastreicher Drop-Shadow auf der Schattenseite
        //   • KEINE Animation – komplett statische Aufnahme
        // ══════════════════════════════════════════════════════════

        // Stabile Pseudo-Random pro Instanz (für statische Schmutzpartikel)
        const dseed = (this._driftSeed ??= Math.floor(Math.random() * 9999));
        const sr = (k) => {
          const x = Math.sin(dseed * 91.7 + k * 17.3) * 43758.5453;
          return x - Math.floor(x);
        };

        // Mittellicht-Richtung (Phasenkontrast: Licht von oben-links)
        const lightX = -0.55, lightY = -0.55;

        // ── 1) Drop-Shadow (kompakt, kontrastreich, statisch) ──
        ctx.save();
        ctx.translate(this.size * 0.18, this.size * 0.22);
        ctx.filter = `blur(${this.size * 0.08}px)`;
        ctx.fillStyle = 'rgba(20,35,60,0.42)';
        buildBodyPath(1.04);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();

        // ── 2) Gel-Grundkörper – mittlerer Tonwert (typisch grau-cyan) ──
        ctx.save();
        ctx.fillStyle = 'rgba(180,205,225,0.72)';
        buildBodyPath(1.0);
        ctx.fill();

        // ── 3) Volumetrische Schattierung INNEN (clip auf Body) ──
        ctx.clip();

        // 3a) Dunklerer Rand auf der Schattenseite (radialer Verlauf)
        for (let i = 4; i <= N - 4; i += 2) {
          const px = cx[i], py = cy[i];
          const r  = rW[i];
          // dunkler Rand-Halo, leicht zur Schattenseite versetzt
          const grd = ctx.createRadialGradient(
            px - nx[i] * r * lightX, py - ny[i] * r * lightY, r * 0.05,
            px, py, r * 1.4
          );
          grd.addColorStop(0,    'rgba(255,255,255,0.00)');
          grd.addColorStop(0.55, 'rgba(255,255,255,0.00)');
          grd.addColorStop(1,    'rgba(25,45,75,0.42)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.ellipse(px, py, r * 1.3, r * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3b) Heller Kern-Highlight (linsen-artige Lichtbrechung)
        ctx.filter = `blur(${this.size * 0.10}px)`;
        for (let i = 6; i <= N - 6; i += 3) {
          const px = cx[i] + nx[i] * rW[i] * lightX * 0.4;
          const py = cy[i] + ny[i] * rW[i] * lightY * 0.4;
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.beginPath();
          ctx.ellipse(px, py, rW[i] * 0.45, rW[i] * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.filter = 'none';

        // 3c) Granula / Vakuolen / Schmutzpartikel (statisch, dreckig)
        const granuleCount = Math.floor(28 + sr(0) * 12);
        for (let g = 0; g < granuleCount; g++) {
          const u  = sr(g * 7 + 1);
          const off = (sr(g * 7 + 2) - 0.5) * 1.6; // -0.8..0.8 entlang Normale
          const idx = Math.max(1, Math.min(N - 1, Math.floor(u * N)));
          const px = cx[idx] + nx[idx] * rW[idx] * off;
          const py = cy[idx] + ny[idx] * rW[idx] * off;
          const gr = this.size * (0.018 + sr(g * 7 + 3) * 0.045);
          const isDark = sr(g * 7 + 4) > 0.35; // Mehrheit dunkel (Vakuolen)
          if (isDark) {
            // Dunkler Kern mit hellem Phasenring
            ctx.fillStyle = `rgba(15,25,45,${(0.30 + sr(g*7+5)*0.35).toFixed(2)})`;
            ctx.beginPath();
            ctx.ellipse(px, py, gr, gr * 0.92, 0, 0, Math.PI * 2);
            ctx.fill();
            // Heller Brechungsring außen
            ctx.strokeStyle = `rgba(255,255,255,${(0.18 + sr(g*7+6)*0.22).toFixed(2)})`;
            ctx.lineWidth = Math.max(0.4, this.size * 0.005);
            ctx.beginPath();
            ctx.ellipse(px, py, gr * 1.3, gr * 1.2, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Helles Granulum
            ctx.fillStyle = `rgba(255,255,250,${(0.30 + sr(g*7+7)*0.30).toFixed(2)})`;
            ctx.beginPath();
            ctx.ellipse(px, py, gr * 0.7, gr * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 3d) Längs-Faserstruktur (sehr fein, dezent) – wirkt wie Zellplasma-Streifen
        ctx.strokeStyle = 'rgba(40,60,90,0.10)';
        ctx.lineWidth = Math.max(0.4, this.size * 0.004);
        for (let f = 0; f < 5; f++) {
          const off = (sr(f * 3 + 30) - 0.5) * 1.4;
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const px = cx[i] + nx[i] * rW[i] * off;
            const py = cy[i] + ny[i] * rW[i] * off;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }

        ctx.restore(); // clip Ende

        // ── 4) DUNKLE Outline (Phasenkontrast-Ring, kräftig) ──
        ctx.strokeStyle = 'rgba(20,35,60,0.85)';
        ctx.lineWidth = Math.max(1.2, this.size * 0.018);
        ctx.lineJoin = 'round';
        ctx.lineCap  = 'round';
        buildBodyPath(1.0);
        ctx.stroke();

        // ── 5) Heller "Phasenring" außerhalb der dunklen Outline ──
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = Math.max(0.6, this.size * 0.008);
        buildBodyPath(1.06);
        ctx.stroke();

        // Drift komplett gerendert – kein weiterer vitreous-Code
        return;
      }

      // Liquid-Subvarianten erweitern den Look auf einer Achse
      const isLiquid     = (sub === 'oily' || sub === 'plump' || sub === 'drift' || sub === 'liquid');
      const isCrystal    = (sub === 'crystalline');
      const isThreaded   = (sub === 'threaded');
      const isOily       = (sub === 'oily');
      const isPlump      = (sub === 'plump');
      const isDrift      = (sub === 'drift');

      // Plump: visueller Volumengewinn → alle seitlichen Offsets etwas weiter außen
      const bodyScale = isPlump ? 1.25 : 1.0;
      // Plump atmet langsamer
      const breathT   = isPlump ? t * 0.55 : t;

      // ── Chromatische Brechungskanten ──
      const chromaSpread = isCrystal ? 1.0 : 0.0;

      drawSideCurve(() => (0.62 + chromaSpread * 0.06) * bodyScale,
        'rgba(255,225,195,0.55)', Math.max(1.0, this.size * 0.018), 1.4);
      if (isCrystal) {
        drawSideCurve(() => 0.55 * bodyScale,
          'rgba(255,210,170,0.30)', Math.max(0.6, this.size * 0.010), 1.2);
      }

      // ── Primärer Glanz ──
      if (isLiquid) {
        // Breite, weiche, pulsierende Glanzfläche aus mehreren gestapelten Bändern
        const pulse = 0.55 + 0.20 * Math.sin(breathT * 0.9);

        // Plump: breiter, sanfter; Oily: gleicher Aufbau, aber Bänder kriegen irisierende Tönung
        const widthMult = isPlump ? 1.20 : 1.0;
        const blurMult  = isPlump ? 1.30 : 1.0;

        const bands = [
          { off: 0.82 * bodyScale, alpha: 0.20 * pulse, w: 0.030 * widthMult, blur: 4.0 * blurMult, hue: 'warm' },
          { off: 0.74 * bodyScale, alpha: 0.45 * pulse, w: 0.024 * widthMult, blur: 2.2 * blurMult, hue: 'mid'  },
          { off: 0.66 * bodyScale, alpha: 0.70 * pulse, w: 0.018 * widthMult, blur: 1.0 * blurMult, hue: 'core' },
          { off: 0.58 * bodyScale, alpha: 0.30 * pulse, w: 0.014 * widthMult, blur: 2.6 * blurMult, hue: 'cool' },
        ];
        for (const b of bands) {
          let col;
          if (isOily) {
            // Subtiler Regenbogen-Schimmer (Ölfilm): zarte Tönung pro Band
            if      (b.hue === 'warm') col = `rgba(255,210,170,${b.alpha.toFixed(3)})`;
            else if (b.hue === 'mid')  col = `rgba(255,245,225,${b.alpha.toFixed(3)})`;
            else if (b.hue === 'core') col = `rgba(255,255,255,${b.alpha.toFixed(3)})`;
            else                       col = `rgba(190,220,255,${b.alpha.toFixed(3)})`;
          } else {
            col = `rgba(255,255,255,${b.alpha.toFixed(3)})`;
          }
          drawSideCurve(() => b.off,
            col, Math.max(0.8, this.size * b.w), b.blur);
        }
      } else {
        drawSideCurve(() => 0.78 * bodyScale,
          'rgba(255,255,255,0.85)', Math.max(0.8, this.size * 0.012), 0.6);
      }

      // ── Kühle Brechungs-/Schattenkante (links) ──
      drawSideCurve(() => (-0.72 - chromaSpread * 0.06) * bodyScale,
        'rgba(180,205,230,0.30)', Math.max(1.0, this.size * 0.020), 2.0);
      if (isCrystal) {
        drawSideCurve(() => -0.58 * bodyScale,
          'rgba(160,190,225,0.22)', Math.max(0.6, this.size * 0.010), 1.6);
      }
      drawSideCurve(() => -0.55 * bodyScale,
        'rgba(20,30,55,0.18)', Math.max(1.4, this.size * 0.024), 3.5);

      // ── Innere Längsfasern – Anzahl/Stil je nach Subvariante ──
      let fiberOffsets, fiberAlpha, fiberWidth, fiberBlur, twistAmp, twistFreq;
      if (isThreaded) {
        fiberOffsets = [-0.42, -0.28, -0.12, 0.04, 0.18, 0.32, 0.46];
        fiberAlpha   = 0.16; fiberWidth = 0.005; fiberBlur = 0.5;
        twistAmp = 0.10; twistFreq = 1.6;
      } else if (isLiquid) {
        // alle liquid-Subs: nur dezente Andeutung – der Glanz dominiert
        fiberOffsets = [-0.18, 0.10];
        fiberAlpha   = 0.07; fiberWidth = 0.005; fiberBlur = 1.6;
        twistAmp = 0.06; twistFreq = 0.8;
      } else { // crystalline / fallback
        fiberOffsets = [-0.30, -0.05, 0.22];
        fiberAlpha   = 0.12; fiberWidth = 0.006; fiberBlur = 0.8;
        twistAmp = 0.04; twistFreq = 1.0;
      }
      for (let fi = 0; fi < fiberOffsets.length; fi++) {
        const fo = fiberOffsets[fi] * bodyScale;
        const ph = fi * 0.7;
        drawSideCurve(
          (i) => fo + twistAmp * Math.sin((i / N) * Math.PI * twistFreq + t * 0.6 + ph),
          `rgba(255,255,255,${fiberAlpha})`,
          Math.max(0.4, this.size * fiberWidth),
          fiberBlur
        );
      }

      // ── Crystalline-Extra: feine Brechungslinien an den Wurmenden ──
      if (isCrystal) {
        ctx.filter = 'blur(0.6px)';
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = Math.max(0.5, this.size * 0.008);
        for (const endIdx of [3, N - 3]) {
          for (let s = -2; s <= 2; s++) {
            if (s === 0) continue;
            const r = rW[endIdx] * (0.4 + Math.abs(s) * 0.18);
            const off = s * 0.18;
            ctx.beginPath();
            ctx.moveTo(cx[endIdx] + nx[endIdx] * r * 0.2,
                       cy[endIdx] + ny[endIdx] * r * 0.2);
            ctx.lineTo(cx[endIdx] + nx[endIdx] * r + nx[endIdx] * off * rW[endIdx],
                       cy[endIdx] + ny[endIdx] * r + ny[endIdx] * off * rW[endIdx]);
            ctx.stroke();
          }
        }
        ctx.filter = 'none';
      }

      // ── Wandernder Lichtreflex ──
      // Liquid: trägerer, breiter Reflex. Drift: ZWEI gegenläufige Reflexe.
      // drawReflex erweitert: Farbe + optionales weiches Ausblenden an den Wurmenden
      const drawReflex = (uPos, sigma, alpha, widthFactor, blurPx, offBase, color, fadeEnds) => {
        const idxG = Math.round(uPos * N);
        // End-Fade: Reflex blendet weich aus, wenn er nahe am Ende des Wurms steht
        let endFade = 1;
        if (fadeEnds) {
          const distToEnd = Math.min(idxG, N - idxG) / N;
          endFade = Math.min(1, distToEnd / 0.18); // 0..1 über die letzten 18% Länge
        }
        const a = alpha * endFade;
        if (a < 0.01) return;
        const col = color || `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.filter = `blur(${blurPx}px)`;
        // Falls Farbe bereits Alpha enthält, nutzen wir sie direkt; sonst weißer Reflex
        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(1.2, this.size * widthFactor);
        ctx.beginPath();
        const i0 = Math.max(0, idxG - sigma);
        const i1 = Math.min(N, idxG + sigma);
        for (let i = i0; i <= i1; i++) {
          const w = Math.exp(-((i - idxG) ** 2) / (2 * (sigma * 0.5) ** 2));
          const off = (offBase + 0.06 * w) * bodyScale;
          const px = cx[i] + nx[i] * rW[i] * off;
          const py = cy[i] + ny[i] * rW[i] * off;
          if (i === i0) ctx.moveTo(px, py);
          else          ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.filter = 'none';
      };

      // Drift-Subvarianten (Runde 5): currents | slowtide | countercolor
      const driftSub = this.driftSubvariant || 'currents';

      if (isLiquid) {
        const baseSpeed = isPlump ? 0.20 : 0.28;
        const sigma     = isPlump ? 14 : 12;
        const alpha     = 0.55;
        const width     = isPlump ? 0.040 : 0.034;
        const blurPx    = isPlump ? 6 : 5;

        if (isDrift) {
          if (driftSub === 'currents') {
            // 5 gegenläufige Reflexe in unterschiedlichen Geschwindigkeiten/Lagen
            // Vorzeichen wechselt → manche auf Glanzseite (positiv), manche Schattenseite (negativ)
            const reflexes = [
              { speed: 0.18, phase: 0.0,        sigma: 14, alpha: 0.55, width: 0.034, blur: 5, off:  0.62 },
              { speed: 0.32, phase: Math.PI,    sigma:  9, alpha: 0.40, width: 0.024, blur: 4, off:  0.78 },
              { speed: 0.45, phase: Math.PI/2,  sigma:  7, alpha: 0.32, width: 0.020, blur: 3, off:  0.50 },
              { speed: 0.26, phase: Math.PI*1.3,sigma: 11, alpha: 0.28, width: 0.022, blur: 5, off: -0.60 },
              { speed: 0.38, phase: Math.PI*0.4,sigma:  8, alpha: 0.22, width: 0.018, blur: 4, off: -0.78 },
            ];
            for (const r of reflexes) {
              const u = Math.sin(t * r.speed + r.phase) * 0.5 + 0.5;
              drawReflex(u, r.sigma, r.alpha, r.width, r.blur, r.off, null, true);
            }
          } else if (driftSub === 'slowtide') {
            // Sehr langsam, sehr breit/diffus, weich an den Enden ausblendend
            const u1 = Math.sin(t * 0.07)            * 0.5 + 0.5;
            const u2 = Math.sin(t * 0.09 + Math.PI)  * 0.5 + 0.5;
            drawReflex(u1, 22, 0.50, 0.046, 9, 0.62, null, true);
            drawReflex(u2, 20, 0.38, 0.040, 9, 0.74, null, true);
          } else { // countercolor
            // Zwei gegenläufige Reflexe: einer warm (bernstein), einer kühl (eisblau)
            const u1 = Math.sin(t * 0.22)            * 0.5 + 0.5;
            const u2 = Math.sin(t * 0.30 + Math.PI)  * 0.5 + 0.5;
            drawReflex(u1, 12, 0.65, 0.036, 5, 0.62,
              'rgba(255,190,120,0.65)', true);   // warm / bernstein
            drawReflex(u2, 12, 0.65, 0.036, 5, 0.74,
              'rgba(150,200,255,0.65)', true);   // kühl / eisblau
            // optionaler Mittelschimmer dort wo sie sich kreuzen würden – nicht nötig,
            // weil zwei farbige Reflexe genug visuelle Spannung liefern
          }
        } else {
          const uG = Math.sin(t * baseSpeed) * 0.5 + 0.5;
          drawReflex(uG, sigma, alpha, width, blurPx, 0.62);
        }
      } else if (isCrystal) {
        const uG = Math.sin(t * 0.7) * 0.5 + 0.5;
        drawReflex(uG, 6, 0.85, 0.022, 2, 0.62);
      } else {
        const uG = Math.sin(t * 0.6) * 0.5 + 0.5;
        drawReflex(uG, 6, 0.85, 0.022, 2, 0.62);
      }

      // ── Oily-Subvarianten Extras (Pearl: helle Plasma-Knoten innen) ──
      if (isOilyDemo && oSub === 'pearl') {
        // 3 helle, sanft pulsierende Plasma-Knoten an den Pearl-Schwellungen
        // Knoten-Positionen u so wählen, dass sie auf den Maxima von cos(u*pi*3) liegen:
        //   cos(u*pi*3) = +1 → u ∈ {0, 2/3} ; cos(u*pi*3) = -1 → u ∈ {1/3, 1}
        // Da die Hülle bei cos=+1 dicker ist, setze Knoten bei u = 0.17, 0.5, 0.83
        const knotUs = [0.17, 0.5, 0.83];
        for (let kk = 0; kk < knotUs.length; kk++) {
          const idx = Math.round(knotUs[kk] * N);
          const pulse = 0.55 + 0.35 * Math.sin(t * 1.1 + kk * 1.3);
          const rr = rW[idx] * 0.55 * pulse;
          // Halo
          ctx.filter = 'blur(5px)';
          ctx.fillStyle = `rgba(255,235,210,${(0.30 * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx[idx], cy[idx], rr * 1.5, rr * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();
          // Heller Kern
          ctx.filter = 'blur(2px)';
          ctx.fillStyle = `rgba(255,250,240,${(0.75 * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx[idx], cy[idx], rr * 0.45, rr * 0.40, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.filter = 'none';
        }
      }
    }

    // ──────────────────────────────────────────────────────────────
    // VARIANTE 2 — CELLULAR (Vakuolen mit Kern + Halo, polarisationsartig getönt)
    // ──────────────────────────────────────────────────────────────
    else if (variant === 'cellular') {
      // ~22 organisch verteilte Vakuolen, klar als Zellen lesbar (Halo + Kern)
      const M = 22;
      // Cluster-Verteilung: Poisson-ähnlich entlang u, leicht seitlich versetzt
      for (let k = 0; k < M; k++) {
        const u  = (k + 0.5) / M + (rnd(k * 2 + 1) - 0.5) * (1 / M) * 1.4;
        const uc = Math.max(0.04, Math.min(0.96, u));
        const idx = Math.round(uc * N);
        const sideSpread = 0.55;
        const off = (rnd(k * 3 + 7) - 0.5) * 2 * sideSpread;
        const sizeBias = 0.5 + rnd(k * 5 + 2) * 1.1; // Größenvariation
        const rr = rW[idx] * 0.22 * sizeBias;
        const cxV = cx[idx] + nx[idx] * rW[idx] * off;
        const cyV = cy[idx] + ny[idx] * rW[idx] * off;

        // Polarisations-Tönung: alternierend warm/kühl
        const warm = (k % 2 === 0);
        const haloCol = warm ? 'rgba(255,225,200,' : 'rgba(200,225,255,';
        const coreCol = warm ? 'rgba(255,245,230,' : 'rgba(225,240,255,';

        // Halo
        ctx.filter = 'blur(3.2px)';
        ctx.fillStyle = haloCol + (0.18 + 0.06 * Math.sin(t * 1.4 + k)).toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(cxV, cyV, rr * 1.7, rr * 1.45, rnd(k) * Math.PI, 0, Math.PI * 2);
        ctx.fill();

        // Zellkörper (Membran-Andeutung: leichter Ring durch Differenz)
        ctx.filter = 'blur(1.0px)';
        ctx.fillStyle = haloCol + '0.22)';
        ctx.beginPath();
        ctx.ellipse(cxV, cyV, rr, rr * 0.85, rnd(k * 2) * Math.PI, 0, Math.PI * 2);
        ctx.fill();

        // Kern (klein, dichter Lichtpunkt mit leichter Verschiebung)
        ctx.filter = 'blur(0.6px)';
        ctx.fillStyle = coreCol + (0.55 + 0.15 * Math.sin(t * 1.7 + k * 0.6)).toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(cxV + rr * 0.18, cyV - rr * 0.14, rr * 0.30, rr * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.filter = 'none';

      // Sehr dezenter Glanzkante – die Zellen tragen die Hauptarbeit
      drawSideCurve(() => 0.65,
        'rgba(255,255,255,0.30)', Math.max(0.8, this.size * 0.012), 1.6);
      drawSideCurve(() => -0.65,
        'rgba(20,30,55,0.10)',    Math.max(1.0, this.size * 0.018), 3.0);
    }

    // ──────────────────────────────────────────────────────────────
    // VARIANTE 3 — FIBRILLAR (verflochtene Längsfasern, Kollagen-Look)
    // ──────────────────────────────────────────────────────────────
    else if (variant === 'fibrillar') {
      // 7 längsverlaufende Fasern, jede mit eigener Phase → erzeugt Verflechtungs-Eindruck
      const fibers = 7;
      for (let f = 0; f < fibers; f++) {
        const baseOff = ((f / (fibers - 1)) - 0.5) * 1.40;     // -0.7 .. 0.7
        const ph = rnd(f * 11 + 1) * Math.PI * 2;
        const twistFreq = 1.6 + rnd(f * 11 + 2) * 1.4;
        const twistAmp  = 0.18 + rnd(f * 11 + 3) * 0.18;

        // Jede Faser: weiche Untermalung + scharfe Linie obendrauf
        // Untermalung
        ctx.filter = 'blur(2.4px)';
        ctx.strokeStyle = 'rgba(220,235,255,0.18)';
        ctx.lineWidth = Math.max(1.2, this.size * 0.022);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const off = baseOff + Math.sin(u * Math.PI * twistFreq + ph + t * 0.5) * twistAmp;
          const px = cx[i] + nx[i] * rW[i] * off;
          const py = cy[i] + ny[i] * rW[i] * off;
          if (i === 0) ctx.moveTo(px, py);
          else         ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Scharfe Faserlinie
        ctx.filter = 'blur(0.4px)';
        const bright = 0.40 + 0.25 * Math.abs(baseOff); // äußere Fasern leicht heller
        ctx.strokeStyle = `rgba(255,255,255,${bright.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.5, this.size * 0.008);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const off = baseOff + Math.sin(u * Math.PI * twistFreq + ph + t * 0.5) * twistAmp;
          const px = cx[i] + nx[i] * rW[i] * off;
          const py = cy[i] + ny[i] * rW[i] * off;
          if (i === 0) ctx.moveTo(px, py);
          else         ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.filter = 'none';

      // Knotenpunkte (kleine Verdickungen, wo Fasern sich kreuzen würden)
      const knots = 6;
      ctx.filter = 'blur(1.2px)';
      for (let k = 0; k < knots; k++) {
        const u = (k + 0.5) / knots + (rnd(k + 50) - 0.5) * 0.06;
        const idx = Math.round(u * N);
        const off = (rnd(k + 60) - 0.5) * 0.8;
        const rr = rW[idx] * (0.10 + rnd(k + 70) * 0.08);
        ctx.fillStyle = `rgba(255,255,255,${(0.32 + 0.14 * Math.sin(t * 1.3 + k)).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(
          cx[idx] + nx[idx] * rW[idx] * off,
          cy[idx] + ny[idx] * rW[idx] * off,
          rr, rr * 0.85, 0, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.filter = 'none';

      // Schattenkante (gibt der Faszikel Volumen)
      drawSideCurve(() => -0.78,
        'rgba(20,30,55,0.18)', Math.max(1.4, this.size * 0.024), 3.5);
    }

    ctx.restore();

    // === Außenkontur ===
    if (bSub) {
      // Bakterielle Doppel-Membran: dunklere innere Linie + heller Lipid-Außenring
      // Innere dunkle Membran
      ctx.filter = 'blur(0.5px)';
      ctx.strokeStyle = 'rgba(40,30,50,0.42)';
      ctx.lineWidth  = Math.max(0.9, this.size * 0.014);
      buildBodyPath(1.0);
      ctx.stroke();
      // Heller Lipid-Außenring (außerhalb)
      ctx.strokeStyle = 'rgba(255,250,235,0.22)';
      ctx.lineWidth  = Math.max(0.6, this.size * 0.008);
      buildBodyPath(1.06);
      ctx.stroke();

      // Spirillum-Extra: Flagellen-Andeutung an beiden Enden (peitschende Härchen)
      if (bSub === 'spirillum') {
        ctx.filter = 'blur(0.4px)';
        ctx.strokeStyle = 'rgba(225,240,210,0.45)';
        ctx.lineWidth = Math.max(0.5, this.size * 0.006);
        ctx.lineCap = 'round';
        const drawFlagella = (idx, dirSign) => {
          // Tangente am Ende
          const i0 = Math.max(0, idx - 1), i1 = Math.min(N, idx + 1);
          const tx = (cx[i1] - cx[i0]) * dirSign;
          const ty = (cy[i1] - cy[i0]) * dirSign;
          const tm = Math.hypot(tx, ty) || 1;
          const tnx = tx / tm, tny = ty / tm;
          // 3 peitschende Flagellen mit phasenversetztem Sinus
          for (let f = 0; f < 3; f++) {
            const length = this.size * (1.4 + f * 0.25);
            const phase  = t * 1.6 + f * 0.8;
            const M = 14;
            ctx.beginPath();
            for (let s = 0; s <= M; s++) {
              const u = s / M;
              // entlang Tangente vom Endpunkt weg, mit perpendikularer Sinus-Auslenkung
              const px = cx[idx] + tnx * length * u
                       + (-tny) * Math.sin(u * Math.PI * 3 + phase) * (this.size * 0.18) * u;
              const py = cy[idx] + tny * length * u
                       +  ( tnx) * Math.sin(u * Math.PI * 3 + phase) * (this.size * 0.18) * u;
              if (s === 0) ctx.moveTo(px, py);
              else         ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        };
        drawFlagella(0, -1);  // oberes Ende
        drawFlagella(N,  1);  // unteres Ende
        ctx.filter = 'none';
      }
      ctx.filter = 'none';
    } else {
      // Default (vitreous etc.): hauchige Hülle wie bisher
      ctx.filter = 'blur(0.4px)';
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth  = Math.max(0.7, this.size * 0.010);
      buildBodyPath(1.0);
      ctx.stroke();
      ctx.filter = 'none';
    }

    // ── Oily-Classic Extra: 2 Begleit-Tropfen außerhalb des Wurmkörpers
    //    (Inspiration: Foto-Anhang mit kleinen Mini-Drops drumherum) ──
    if (isOilyDemo && oSub === 'classic' && this.demoLabel) {
      const oseed = (this._oilySeed ??= Math.floor(Math.random() * 9999));
      const osr = (k) => {
        const v = Math.sin(oseed * 91.7 + k * 17.3) * 43758.5453;
        return v - Math.floor(v);
      };
      for (let c = 0; c < 2; c++) {
        const ang  = osr(c * 3 + 1) * Math.PI * 2 + t * 0.06 * (c % 2 === 0 ? 1 : -1);
        const dist = this.size * (2.0 + osr(c * 3 + 2) * 0.9);
        const bpx  = Math.cos(ang) * dist;
        const bpy  = Math.sin(ang) * dist * 0.75;
        const br   = this.size * (0.13 + osr(c * 3 + 3) * 0.06);
        // Drop-Shadow
        ctx.save();
        ctx.translate(this.size * 0.14, this.size * 0.18);
        ctx.filter = 'blur(5px)';
        ctx.fillStyle = 'rgba(35,70,120,0.28)';
        ctx.beginPath();
        ctx.ellipse(bpx, bpy, br * 1.05, br * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
        // Tropfen-Körper (warm-getönt wie der oily-Glanz)
        ctx.filter = 'blur(0.8px)';
        ctx.fillStyle = 'rgba(255,245,225,0.78)';
        ctx.beginPath();
        ctx.ellipse(bpx, bpy, br, br * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        // Mini-Highlight
        ctx.filter = 'blur(1.6px)';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.ellipse(bpx - br * 0.28, bpy - br * 0.28, br * 0.35, br * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
      }
    }

    // ── Wasserbläschen-Overlay (Slot 2 + 3): kleine Bubbles wie im Reagenzglas ──
    //   'inside' → Bubbles innerhalb des Glaskörpers (eingeschlossen)
    //   'around' → Bubbles entlang/um den Körper herum (aufsteigend)
    if (this._bubbleOverlay && isOilyDemo && oSub === 'classic') {
      const mode  = this._bubbleOverlay;
      const bseed = (this._bubbleSeed ??= Math.floor(Math.random() * 9999));
      const bsr = (k) => {
        const v = Math.sin(bseed * 53.7 + k * 27.91) * 43758.5453;
        return v - Math.floor(v);
      };
      const lenMulB = this._lenMul ?? 1.0;
      const radMulB = this._radMul ?? 1.0;
      const halfH   = this.size * 8.4 * lenMulB * 0.55;
      const halfW   = this.size * 0.32 * radMulB * 2.2;

      const drawBubble = (bx, by, br, alphaMul = 1.0) => {
        // weicher Schatten / Brechungsring
        ctx.save();
        ctx.filter = 'blur(1.2px)';
        ctx.fillStyle = `rgba(20,40,80,${0.22 * alphaMul})`;
        ctx.beginPath();
        ctx.ellipse(bx + br * 0.18, by + br * 0.22, br * 1.05, br * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
        // Bläschen-Hülle (sehr transparent, wie eingeschlossene Luftblase)
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${0.55 * alphaMul})`;
        ctx.lineWidth   = Math.max(0.6, br * 0.10);
        ctx.beginPath();
        ctx.ellipse(bx, by, br, br * 0.95, 0, 0, Math.PI * 2);
        ctx.stroke();
        // schwacher Innenfüll
        ctx.fillStyle = `rgba(220,235,255,${0.10 * alphaMul})`;
        ctx.fill();
        ctx.restore();
        // Highlight oben links
        ctx.save();
        ctx.filter = 'blur(0.8px)';
        ctx.fillStyle = `rgba(255,255,255,${0.75 * alphaMul})`;
        ctx.beginPath();
        ctx.ellipse(bx - br * 0.35, by - br * 0.40, br * 0.28, br * 0.18, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
        // Mini-Highlight rechts unten (Brechung)
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${0.35 * alphaMul})`;
        ctx.beginPath();
        ctx.ellipse(bx + br * 0.40, by + br * 0.35, br * 0.10, br * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      if (mode === 'inside') {
        // Eingeschlossene Bubbles INNERHALB des Wurmkörpers
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW * 0.92, halfH * 0.96, 0, 0, Math.PI * 2);
        ctx.clip();
        const N = 9;
        for (let i = 0; i < N; i++) {
          const u    = bsr(i * 5 + 1);
          const v    = bsr(i * 5 + 2);
          const sz   = bsr(i * 5 + 3);
          const drift = Math.sin(t * 0.9 + i * 1.7) * 0.04;
          const bx = (v - 0.5) * halfW * 1.1;
          const by = (u - 0.5) * halfH * 1.7 + drift * halfH;
          const br = this.size * (0.10 + sz * 0.18);
          drawBubble(bx, by, br, 0.95);
        }
        ctx.restore();
      } else if (mode === 'around') {
        // Aufsteigende Bubbles UM den Körper herum (wie im Reagenzglas)
        const N = 12;
        for (let i = 0; i < N; i++) {
          const side = (i % 2 === 0) ? 1 : -1;
          const u    = bsr(i * 7 + 1);
          const sz   = bsr(i * 7 + 2);
          const wob  = bsr(i * 7 + 3);
          // langsames Aufsteigen entlang Y (rein visuell, kein echter "Loop")
          const rise = ((u + t * 0.05) % 1.0);
          const by   = halfH * 1.05 - rise * halfH * 2.10;
          const lateral = halfW * (1.25 + wob * 0.55) + Math.sin(t * 1.2 + i) * halfW * 0.10;
          const bx   = side * lateral;
          const br   = this.size * (0.09 + sz * 0.16);
          // Bubbles am Rand etwas transparenter, oben fast weg
          const fade = Math.min(1, rise * 1.4);
          drawBubble(bx, by, br, 0.55 + 0.45 * (1 - Math.abs(by) / (halfH * 1.1)) - fade * 0.25);
        }
      }
    }
  }


  // Kleines Label "1" / "2" / "3" über dem Demo-Element
  drawDemoLabel() {
    if (!this.demoLabel) return;
    const ctx = drawingContext;
    push();
    ctx.save();
    ctx.font = `${Math.round(14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 3;
    const ly = this.pos.y - this.size * 3.2;
    ctx.strokeText(this.demoLabel, this.pos.x, ly);
    ctx.fillText(this.demoLabel, this.pos.x, ly);
    ctx.restore();
    pop();
  }

  drawMarker(label) {
    const r = Math.max(this.size * 0.9, 14);
    push();
    drawingContext.save();
    drawingContext.lineWidth = 2.2;
    drawingContext.lineCap = 'round';
    drawingContext.strokeStyle = 'rgba(255, 90, 200, 0.95)';
    drawingContext.shadowColor = 'rgba(255, 90, 200, 0.7)';
    drawingContext.shadowBlur = 8;
    drawingContext.beginPath();
    drawingContext.moveTo(this.pos.x - r, this.pos.y - r);
    drawingContext.lineTo(this.pos.x + r, this.pos.y + r);
    drawingContext.moveTo(this.pos.x - r, this.pos.y + r);
    drawingContext.lineTo(this.pos.x + r, this.pos.y - r);
    drawingContext.stroke();
    drawingContext.shadowBlur = 0;
    drawingContext.restore();
    pop();
  }
}

/* -------- Kleine Punkte (3 Stück) --------
*/
class SmallPoint {
  constructor(x, y) {
    this.start = createVector(x, y);
    this.pos = this.start.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.target = this.pos.copy();
    // Zufällige Verzerrung für unförmigere Form
    this.stretchX = random(0.75, 1.25);
    this.stretchY = random(0.75, 1.25);
    this.rotAngle = random(TWO_PI);
    // Individuelle Geschwindigkeit für unabhängige Bewegung
    this.speedMult = random(0.4, 1.0);
    this.driftRange = random(20, 45);
  }

  update(isMoving, oppositeMovement=null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 15) {
        this.target.x = this.start.x + random(-this.driftRange, this.driftRange);
        this.target.y = this.start.y + random(-this.driftRange, this.driftRange);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * 0.6 * this.speedMult);
      let steer = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * 0.6 * this.speedMult);
      this.acc.add(steer);
      
      if (oppositeMovement) {
        this.acc.add(p5.Vector.mult(oppositeMovement, SMALL_POINT_FOLLOW_GAIN));
      }
    } else {
      let toStart = p5.Vector.sub(this.start, this.pos);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * d);
        this.vel.mult(0.9);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * d);
      }
      this.acc.add(toStart);
    }

    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.6);
    this.pos.add(this.vel);
    containElementPosition(this.pos, this.vel, this.size || 80);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotAngle);
    scale(this.stretchX, this.stretchY);
    drawingContext.filter = 'blur(1.5px)';
    // Äußerer transparenter Glow
    noStroke();
    fill(230, 235, 245, 18);
    ellipse(0, 0, SMALL_POINT_RADIUS * 4.5, SMALL_POINT_RADIUS * 4.0);
    // Gel-Membran – schärfer gezeichnet
    stroke(215, 220, 240, 28);
    strokeWeight(SMALL_POINT_RADIUS * 0.25);
    noFill();
    beginShape();
    for (let i = 0; i <= 12; i++) {
      let a = (i / 12) * TWO_PI;
      let rVar = SMALL_POINT_RADIUS * 1.8 * (1 + 0.15 * sin(a * 3 + this.rotAngle));
      curveVertex(cos(a) * rVar, sin(a) * rVar * 0.92);
    }
    endShape(CLOSE);
    // Innere transparente Struktur
    noStroke();
    fill(220, 225, 245, 24);
    ellipse(0, 0, SMALL_POINT_RADIUS * 1.8, SMALL_POINT_RADIUS * 1.6);
    // Kern
    fill(215, 220, 240, 20);
    ellipse(0, 0, SMALL_POINT_RADIUS * 0.8, SMALL_POINT_RADIUS * 0.7);
    drawingContext.filter = 'none';
    pop();
  }
}

const SMALL_POINT_COUNT = 3;
const SMALL_POINT_RADIUS = 9.6 * SCALE;
const SMALL_POINT_ALPHA = 120;
const SMALL_POINT_COLOR = [255, 255, 255];
const SMALL_POINT_FOLLOW_GAIN = -0.10;


/* ======= Helle Floater rechts vom grauen Superfleck ======= */
class LightFloater {
  constructor(x, y, size, segments = 12) {
    this.base = createVector(x, y);
    this.pos = this.base.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.target = this.pos.copy();
    this.size = size;
    this.segments = segments;
    this.rotation = 0;
    this.baseRotation = 0;
    this.squashFactor = 1.0;
    this.followGain = -0.08;
    this.speedScale = 0.6;
    
    // Längliche Form für helle Floater
    this.shapePoints = this.buildLightFloaterShape();
  }

  buildLightFloaterShape() {
    let points = [];
    for (let i = 0; i <= this.segments; i++) {
      let t = i / this.segments;
      // Längliche, leicht geschwungene Form
      let x = (t - 0.5) * this.size * 1.5; // länglicher
      let y = sin(t * PI) * this.size * 0.2; // sanfte Kurve
      points.push({x: x, y: y});
    }
    return points;
  }

  update(isMoving, oppositeMovement=null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 25) {
        this.target.x = this.base.x + random(-30, 30);
        this.target.y = this.base.y + random(-30, 30);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * this.speedScale);
      let steer = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * this.speedScale);
      this.acc.add(steer);

      if (oppositeMovement) {
        this.acc.add(p5.Vector.mult(oppositeMovement, this.followGain));
      }
    } else {
      let toBase = p5.Vector.sub(this.base, this.pos);
      let d = toBase.mag();
      if (d < DRIFT_RETURN_NEAR) {
        toBase.normalize().mult(DRIFT_RETURN_GAIN_N * d);
        this.vel.mult(0.9);
      } else {
        toBase.normalize().mult(DRIFT_RETURN_GAIN_F * d);
      }
      this.acc.add(toBase);
    }

    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.6);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    drawingContext.filter = 'blur(3px)';

    // Äußerer transparenter Glow – weisslich-geisterhaft
    noStroke();
    fill(230, 235, 245, 14);
    ellipse(0, 0, this.size * 0.65, this.size * 0.45);
    // Gel-Membran – weisslich transparent
    stroke(220, 225, 240, 20);
    strokeWeight(this.size * 0.015);
    noFill();
    beginShape();
    for (let i = 0; i <= 12; i++) {
      let a = (i / 12) * TWO_PI;
      let rx = this.size * 0.22 * (1 + 0.12 * sin(a * 3));
      let ry = this.size * 0.16 * (1 + 0.12 * cos(a * 2));
      curveVertex(cos(a) * rx, sin(a) * ry);
    }
    endShape(CLOSE);
    // Innere transparente Struktur – weisslich
    noStroke();
    fill(225, 230, 245, 16);
    ellipse(0, 0, this.size * 0.22, this.size * 0.15);
    fill(220, 225, 240, 12);
    ellipse(0, 0, this.size * 0.1, this.size * 0.07);

    drawingContext.filter = 'none';
    pop();
  }
}

/* -------- Micro-Kreis-Gruppe (6 Kreise) --------
   Update: 40% kleiner, heller/weißer, drift+follow.
*/
const MICRO_CIRCLE_COUNT        = 7;
const MICRO_CLUSTER_POS_XF      = 0.45;
const MICRO_CLUSTER_POS_YF      = 0.75;
const MICRO_CLUSTER_RADIUS_PX   = 38;    // näher zusammen
const MICRO_CIRCLE_BASE_R_RATIO = 0.12;  // kleiner
const MICRO_CIRCLE_JITTER_R     = 0.25;  // weniger Jitter = rundlicher
const MICRO_CIRCLE_JITTER_A     = 0.25;  // weniger Winkel-Jitter
/* Farben – einheitlich weiß, glänzend */
const MICRO_CIRCLE_EDGE_DARK    = [255,255,255];
const MICRO_CIRCLE_FILL_LIGHT   = [255,255,255];
const MICRO_CIRCLE_EDGE_ALPHA   = 55;   // glänzender
const MICRO_CIRCLE_FILL_ALPHA   = 90;   // glänzender
/* Bewegung */
const MICRO_CLUSTER_SPEED_SCALE = 0.8;
const MICRO_CLUSTER_FOLLOW_GAIN = -0.15;

/* =========================================================
 * GLOBAL STATE
 * ========================================================= */
let mouseMoving = false;
let initialKickFrames = 0; // kein Startkick ohne Mausbewegung
let prevMouse;
// Sanftes Anrampen für Nicht-Schlieren-Elemente:
// 0 (Ruhe) -> über ~30 Frames auf 1.1 (Boost) -> dann zurück auf 1.0 (Cruise)
let nonSchlierRampPhase = 'idle'; // 'idle' | 'rampUp' | 'overshoot' | 'cruise'
let nonSchlierScale = 0;          // aktueller Multiplikator
let nonSchlierRampFrames = 0;     // Frame-Counter seit Bewegungsstart
let prevMovementDir = null;
let directionChangeBoost = 1;
let mouseContainPos = null;
let mouseContainDir = null;
let mouseContainDirSmooth = null;
// Geglätteter Mausgeschwindigkeits-Multiplikator (1 = neutral).
// langsame Maus -> ~0.4, schnelle Maus -> ~1.7
// Startet am Idle-Floor (nicht 1.0), sonst dauert es bei träger Smoothing
// ewig, bis die Elemente bei ruhiger Maus tatsächlich langsam werden.
let mouseSpeedScale = 0.03;
let floater;             // FloaterPath instance
let biggerCloud;
// greyCoreCloud entfernt – biggerCloud ist jetzt ein einzelner Fleck
let smallerCloud;
let upperLeftGreyCloud;
let f2CenterCopies = [];
let whiteSuperfleck;          // neuer weißer Superfleck auf der linken Seite
let schlierClouds = [];
let brightSchlierClouds = []; // hellere Schlieren
let floaterFleckCloud;   // Mini NoiseCloud for floater fleck
let microCluster;        // 6er-Kreisgruppe
let smallPoints = [];    // 3 kleine Punkte
let lightFloater1;       // heller Floater rechts vom grauen Superfleck
let lightFloater2;       // zweiter heller Floater
let elongCircleCluster1;
let elongCircleCluster2;
let darkFleckLeft;
let gelSchlierClouds = [];   // gelartige Schlieren
let gelBlobChains = [];      // kettenartige Gel-Flecken
let blobPatches = [];        // flächige, leicht transparente Patches
let lFloater;                // L-förmiger Mini-Floater
let bgParallaxX = 0;         // Hintergrund-Parallax X-Offset
let bgParallaxY = 0;         // Hintergrund-Parallax Y-Offset
let roundTestPos = null;
let roundTestVel = null;
let neutestPos = null;
let neutestVel = null;
let slimeTestPos = null;
let slimeTestVel = null;
let fleckSchlierePairs = [];

// Wo der Mauszeiger tendenziell hingeht: lerpt langsam zur aktuellen Mausposition,
// solange die Maus bewegt wird. Bei Stillstand bleibt sie liegen.
// Wird als globales Rückstell-Ziel UND als Strudel-Zentrum benutzt.
let mouseRestPos = null;
// Offset (mouseRestPos - Bildmitte) als createVector – jeden Frame neu berechnet.
let restShift = null;

function containElementPosition(pos, vel = null, radius = 36) {
  const margin = max(24, radius);
  pos.x = constrain(pos.x, margin, width - margin);
  pos.y = constrain(pos.y, margin, height - margin);
}

function steerVelocityTowardMouse(vel, mouseDir, amount = 0.18) {
  if (!vel || !mouseDir || vel.mag() < 0.01 || mouseDir.mag() < 0.01) return;
  const speed = vel.mag();
  const desired = p5.Vector.mult(mouseDir.copy().normalize(), speed);
  vel.lerp(desired, amount);
}

// Inline-Glasfaser-Renderer (für Hauptfloater-Kopie). Identisch zur
// Konstruktion in NucleusDrop._displayGlassFiber, aber als freie Funktion.
function _drawGlassFiberStrokes(cx, cy, w, h, seed, rotAng) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotAng);
  ctx.filter = 'blur(22px)';
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 1.6, h * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.5);
  ctx.bezierCurveTo( w * 0.7, -h * 0.42,  w * 0.7, h * 0.42,  0, h * 0.5);
  ctx.bezierCurveTo(-w * 0.7,  h * 0.42, -w * 0.7,-h * 0.42,  0,-h * 0.5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.clip();
  ctx.lineCap = 'round';
  ctx.filter = 'blur(0.7px)';
  const layers = [
    { off: -0.30, alpha: 0.18, wMul: 1.0 },
    { off: -0.18, alpha: 0.16, wMul: 0.9 },
    { off: -0.06, alpha: 0.20, wMul: 1.1 },
    { off:  0.06, alpha: 0.16, wMul: 0.9 },
    { off:  0.18, alpha: 0.18, wMul: 1.0 },
    { off:  0.30, alpha: 0.14, wMul: 0.8 },
  ];
  for (let li = 0; li < layers.length; li++) {
    const L = layers[li];
    const x0 = L.off * w * 1.2;
    const sway = Math.sin(seed + li * 1.3) * w * 0.18;
    const lw = Math.max(0.5, h * 0.0035 * L.wMul);
    const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
    grad.addColorStop(0.00, `rgba(255,255,255,0)`);
    grad.addColorStop(0.30, `rgba(255,255,255,${L.alpha * 0.25})`);
    grad.addColorStop(0.55, `rgba(255,255,255,${L.alpha * 0.7})`);
    grad.addColorStop(1.00, `rgba(255,255,255,${L.alpha})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(x0, -h * 0.55);
    ctx.bezierCurveTo(x0 + sway, -h * 0.20, x0 - sway, h * 0.20, x0 * 0.6, h * 0.55);
    ctx.stroke();
  }
  ctx.filter = 'none';
  ctx.restore();
}

// Kleines Nuclei-artiges Element (weicher heller Ring mit hellem Kern),
// gezeichnet direkt auf den Canvas an (x,y). Wird pro Schliere in der Mitte gerendert.
// Mini grey super-fleck: wie greycloud (biggerCloud), aber sehr klein
// (~halbe Größe des schwarzen Hauptfloater-Flecks) und transparenter.
function drawMiniNucleusAt(x, y, r, opts = {}) {
  const ctx = drawingContext;
  const aspect = opts.aspect != null ? opts.aspect : 1.0; // >1 = länglich
  const rot    = opts.rot    != null ? opts.rot    : 0;
  const aMul   = opts.aMul   != null ? opts.aMul   : 1.0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(aspect, 1 / Math.sqrt(aspect));
  // weicher äußerer Halo (deutlich transparenter)
  ctx.filter = 'blur(6px)';
  ctx.fillStyle = `rgba(105,107,116,${0.10 * aMul})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  // dichterer Kern (deutlich transparenter)
  ctx.filter = 'blur(3px)';
  ctx.fillStyle = `rgba(95,98,108,${0.20 * aMul})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  ctx.restore();
}
function drawSceneLabel(label, x, y) {
  if (!SHOW_LABELS) return;
  drawingContext.save();
  drawingContext.font = '600 13px system-ui, -apple-system, sans-serif';
  drawingContext.fillStyle = '#22c55e';
  drawingContext.shadowColor = 'rgba(0,0,0,0.55)';
  drawingContext.shadowBlur = 4;
  drawingContext.textBaseline = 'middle';
  drawingContext.fillText(label, x + 18, y - 4);
  drawingContext.restore();
}

function drawTestMoucheElement(x, y, s = 1) {
  const ctx = drawingContext;
  const t = frameCount * 0.012;
  const driftX = sin(t) * 2.2;
  const driftY = cos(t * 0.8) * 1.6;

  ctx.save();
  ctx.translate(x + driftX, y + driftY);
  ctx.rotate(-0.07 + sin(t * 0.7) * 0.015);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function trace(offsetX, offsetY) {
    ctx.beginPath();
    ctx.moveTo(24 + offsetX, -92 + offsetY);
    ctx.bezierCurveTo(4 + offsetX, -82 + offsetY, -1 + offsetX, -45 + offsetY, -11 + offsetX, -22 + offsetY);
    ctx.bezierCurveTo(-21 + offsetX, 2 + offsetY, 12 + offsetX, 15 + offsetY, 0 + offsetX, 36 + offsetY);
    ctx.bezierCurveTo(-9 + offsetX, 54 + offsetY, -25 + offsetX, 70 + offsetY, -42 + offsetX, 92 + offsetY);
  }

  ctx.filter = 'blur(7px)';
  ctx.strokeStyle = 'rgba(210,235,245,0.28)';
  ctx.lineWidth = 19;
  trace(0, 0);
  ctx.stroke();

  ctx.filter = 'blur(2.5px)';
  ctx.strokeStyle = 'rgba(70,105,120,0.26)';
  ctx.lineWidth = 13;
  trace(0, 0);
  ctx.stroke();

  ctx.filter = 'none';
  ctx.strokeStyle = 'rgba(225,250,255,0.62)';
  ctx.lineWidth = 4.4;
  trace(0, 0);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(45,80,95,0.42)';
  ctx.lineWidth = 1.8;
  trace(-4, 2);
  ctx.stroke();
  trace(5, -1);
  ctx.stroke();

  ctx.filter = 'blur(2px)';
  ctx.strokeStyle = 'rgba(255,255,255,0.48)';
  ctx.lineWidth = 1.5;
  trace(10, -2);
  ctx.stroke();
  ctx.filter = 'none';

  ctx.fillStyle = 'rgba(200,235,245,0.30)';
  ctx.beginPath();
  ctx.ellipse(-16, 12, 17, 13, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(55,90,105,0.50)';
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.ellipse(-16, 12, 8, 6.5, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(230,255,255,0.70)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-18, 10, 3.4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  drawSceneLabel('Testelement', x + 34 * s, y - 94 * s);
}

function drawMoucheBead(x, y, r, alpha = 1) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.filter = 'blur(1.6px)';
  ctx.fillStyle = `rgba(230,245,250,${0.10 * alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  ctx.strokeStyle = `rgba(55,85,95,${0.28 * alpha})`;
  ctx.lineWidth = Math.max(0.8, r * 0.18);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(245,255,255,${0.44 * alpha})`;
  ctx.lineWidth = Math.max(0.6, r * 0.10);
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.25, r * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTinyMoucheBead(x, y, r, alpha = 1) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.filter = 'blur(0.8px)';
  ctx.fillStyle = `rgba(230,245,250,${0.05 * alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  ctx.strokeStyle = `rgba(70,90,95,${0.13 * alpha})`;
  ctx.lineWidth = Math.max(0.35, r * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(245,255,255,${0.20 * alpha})`;
  ctx.lineWidth = Math.max(0.25, r * 0.05);
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.24, r * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMoucheBeadChain(label, x, y, points, s = 1) {
  const ctx = drawingContext;
  const t = frameCount * 0.01;
  ctx.save();
  ctx.translate(x + sin(t) * 1.6, y + cos(t * 0.8) * 1.1);
  ctx.scale(s, s);

  ctx.save();
  ctx.filter = 'blur(4px)';
  ctx.strokeStyle = 'rgba(210,235,245,0.14)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p[0], p[1]);
    else ctx.lineTo(p[0], p[1]);
  });
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    drawMoucheBead(p[0], p[1], p[2] || 6, 0.9);
  }

  ctx.restore();
  drawSceneLabel(label, x + 34 * s, y - 48 * s);
}

function drawReferenceMoucheElements() {
  drawMoucheBeadChain('Testelement', width * 0.48, height * 0.48, [
    [-54,-36,6],[-43,-45,6],[-31,-50,6],[-18,-47,6],[-5,-39,6],
    [4,-26,6],[8,-12,6],[-2,0,6],[-16,4,6],[-30,0,6],
    [-42,-10,6],[-50,-22,6]
  ], 1.15);

  drawMoucheBeadChain('Testelement 2', width * 0.57, height * 0.57, [
    [-56,10,5],[-44,4,5],[-32,-1,5],[-20,-4,5],[-8,-4,5],
    [4,0,5],[15,8,5],[26,18,5],[38,16,5],[50,7,5],
    [58,-5,5],[67,-16,5]
  ], 1.2);

  drawMoucheBeadChain('Testelement 3', width * 0.52, height * 0.38, [
    [0,-34,6],[0,-21,6],[2,-8,6],[5,5,6],[8,18,6],[11,31,6]
  ], 1.05);
}

function drawCombinedMoucheElement(x, y, s = 1) {
  const ctx = drawingContext;
  const t = frameCount * 0.01;
  const pts = [
    [-48,-20,5.2],[-36,-26,5.5],[-24,-27,5.6],[-12,-22,5.8],
    [-3,-12,5.8],[2,0,6.0],[11,8,5.8],[24,7,5.5],
    [36,0,5.2],[44,-11,5.0]
  ];

  ctx.save();
  ctx.translate(x + sin(t) * 1.4, y + cos(t * 0.9) * 1.0);
  ctx.rotate(0.12 + sin(t * 0.8) * 0.012);
  ctx.scale(s, s);

  ctx.save();
  ctx.filter = 'blur(6px)';
  ctx.strokeStyle = 'rgba(205,230,240,0.18)';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(45,75,90,0.20)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();

  pts.forEach((p, i) => {
    drawMoucheBead(p[0], p[1] + sin(t * 2 + i) * 0.6, p[2], 0.82);
  });

  ctx.filter = 'blur(2px)';
  ctx.strokeStyle = 'rgba(35,65,80,0.22)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(8, -48, 15, 15, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'none';
  ctx.strokeStyle = 'rgba(230,250,255,0.42)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(8, -48, 19, 19, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  drawSceneLabel('Kombi-Testelement', x + 38 * s, y - 56 * s);
}

function drawHybridMoucheElement(label, x, y, s, variant = 0) {
  const ctx = drawingContext;
  const t = frameCount * 0.01 + variant;
  const pts = variant === 0
    ? [[-58,-18],[-42,-30],[-22,-28],[-8,-14],[0,4],[18,12],[38,4],[54,-14]]
    : [[-46,26],[-34,10],[-18,0],[-2,-4],[14,-1],[30,10],[42,28],[54,44]];

  ctx.save();
  ctx.translate(x + sin(t) * 1.4, y + cos(t * 0.8) * 1.0);
  ctx.rotate((variant === 0 ? 0.10 : -0.45) + sin(t * 0.7) * 0.012);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function path(offsetX = 0, offsetY = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + offsetX, pts[0][1] + offsetY);
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i];
      const n = pts[i + 1];
      ctx.quadraticCurveTo(p[0] + offsetX, p[1] + offsetY, (p[0] + n[0]) * 0.5 + offsetX, (p[1] + n[1]) * 0.5 + offsetY);
    }
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    ctx.quadraticCurveTo(a[0] + offsetX, a[1] + offsetY, b[0] + offsetX, b[1] + offsetY);
  }

  ctx.filter = 'blur(9px)';
  ctx.strokeStyle = 'rgba(205,225,240,0.20)';
  ctx.lineWidth = 28;
  path();
  ctx.stroke();

  ctx.filter = 'blur(4px)';
  ctx.strokeStyle = 'rgba(70,90,115,0.16)';
  ctx.lineWidth = 18;
  path();
  ctx.stroke();

  ctx.filter = 'none';
  ctx.strokeStyle = 'rgba(235,250,255,0.36)';
  ctx.lineWidth = 5.5;
  path();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(60,82,100,0.32)';
  ctx.lineWidth = 2.0;
  path(-4, 2);
  ctx.stroke();
  path(5, -2);
  ctx.stroke();

  pts.forEach((p, i) => {
    if (i % 2 === 0 || variant === 0) {
      drawMoucheBead(p[0], p[1], variant === 0 ? 5.5 : 4.8, 0.65);
    }
  });

  const ringX = variant === 0 ? 18 : -20;
  const ringY = variant === 0 ? -52 : -28;
  ctx.filter = 'blur(2px)';
  ctx.strokeStyle = 'rgba(45,70,88,0.23)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.ellipse(ringX, ringY, 15, 15, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'none';
  ctx.strokeStyle = 'rgba(235,252,255,0.42)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(ringX, ringY, 20, 20, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  drawSceneLabel(label, x + 42 * s, y - 58 * s);
}

function drawVirusTestElement(x, y, s = 1) {
  const ctx = drawingContext;
  const t = frameCount * 0.01;
  const pts = [
    [-110, 16],[-86, 4],[-62, -2],[-38, 2],[-12, 12],
    [18, 20],[48, 12],[76, -8],[98, -30]
  ];

  ctx.save();
  ctx.translate(x + sin(t) * 1.2, y + cos(t * 0.8) * 1.0);
  ctx.rotate(-0.08 + sin(t * 0.6) * 0.01);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function filament(offset = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + offset);
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i], n = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1] + offset, (p[0] + n[0]) * 0.5, (p[1] + n[1]) * 0.5 + offset);
    }
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    ctx.quadraticCurveTo(a[0], a[1] + offset, b[0], b[1] + offset);
  }

  ctx.filter = 'blur(8px)';
  ctx.strokeStyle = 'rgba(210,225,230,0.18)';
  ctx.lineWidth = 28;
  filament(0);
  ctx.stroke();

  ctx.filter = 'blur(2.5px)';
  ctx.strokeStyle = 'rgba(80,88,92,0.24)';
  ctx.lineWidth = 17;
  filament(0);
  ctx.stroke();

  ctx.filter = 'none';
  ctx.strokeStyle = 'rgba(230,238,238,0.36)';
  ctx.lineWidth = 6;
  filament(-2.5);
  ctx.stroke();
  filament(2.5);
  ctx.stroke();

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    drawMoucheBead(p[0], p[1] + sin(t * 2 + i) * 0.8, 5.2, 0.42);
  }

  const hx = 100, hy = -34;
  ctx.filter = 'blur(7px)';
  ctx.fillStyle = 'rgba(215,225,225,0.18)';
  ctx.beginPath();
  ctx.ellipse(hx, hy, 34, 31, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(185,198,198,0.18)';
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = 28 + (i % 2) * 5;
    const px = hx + cos(a) * r;
    const py = hy + sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,82,86,0.30)';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.strokeStyle = 'rgba(210,220,220,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + cos(a) * 28, hy + sin(a) * 25);
    ctx.lineTo(hx + cos(a) * 40, hy + sin(a) * 36);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(235,245,245,0.30)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(hx - 4, hy - 3, 16, 12, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  drawSceneLabel('Virus-Testelement', x + 70 * s, y - 76 * s);
}

function drawSoftVirusFilament(label, x, y, s = 1, variant = 0) {
  const ctx = drawingContext;
  const t = frameCount * 0.009 + variant;
  const pts = variant === 0
    ? [[-95,18],[-70,8],[-45,2],[-18,5],[8,13],[36,8],[62,-8],[82,-28]]
    : [[-88,-12],[-60,-4],[-34,10],[-8,17],[18,12],[42,-2],[66,-12],[90,-8]];

  ctx.save();
  ctx.translate(x + sin(t) * 1.1, y + cos(t * 0.7) * 0.9);
  ctx.rotate((variant === 0 ? -0.08 : 0.16) + sin(t) * 0.01);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function path(off = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + off);
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i], n = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1] + off, (p[0] + n[0]) * 0.5, (p[1] + n[1]) * 0.5 + off);
    }
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    ctx.quadraticCurveTo(a[0], a[1] + off, b[0], b[1] + off);
  }

  ctx.filter = 'blur(12px)';
  ctx.strokeStyle = 'rgba(225,235,230,0.07)';
  ctx.lineWidth = 30;
  path();
  ctx.stroke();
  ctx.filter = 'blur(5px)';
  ctx.strokeStyle = 'rgba(110,120,118,0.08)';
  ctx.lineWidth = 14;
  path(-1.8);
  ctx.stroke();
  path(1.8);
  ctx.stroke();
  ctx.filter = 'blur(1.8px)';
  ctx.strokeStyle = 'rgba(238,244,240,0.14)';
  ctx.lineWidth = 3.2;
  path(-2.6);
  ctx.stroke();
  path(2.6);
  ctx.stroke();
  ctx.filter = 'blur(0.8px)';
  ctx.strokeStyle = 'rgba(255,255,255,0.62)';
  ctx.lineWidth = 1.4;
  path(0);
  ctx.stroke();
  ctx.filter = 'none';

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const steps = 3;
    for (let j = 0; j < steps; j++) {
      const u = j / steps;
      const px = lerp(a[0], b[0], u);
      const py = lerp(a[1], b[1], u);
      drawTinyMoucheBead(px, py, 3.2, 0.22);
    }
  }
  const last = pts[pts.length - 1];
  drawTinyMoucheBead(last[0], last[1], 3.2, 0.22);

  ctx.restore();
  drawSceneLabel(label, x + 62 * s, y - 42 * s);
}

function drawGlassGelFilament(label, x, y, s = 1, variant = 0) {
  const ctx = drawingContext;
  const t = frameCount * 0.008 + variant;
  const pts = variant === 0
    ? [[-78,12],[-56,4],[-34,0],[-12,4],[10,11],[34,6],[56,-8],[70,-22]]
    : [[-72,-8],[-50,-2],[-28,8],[-6,13],[16,10],[38,0],[58,-6],[74,-3]];

  ctx.save();
  ctx.translate(x + sin(t) * 0.8, y + cos(t * 0.7) * 0.6);
  ctx.rotate((variant === 0 ? -0.08 : 0.15) + sin(t) * 0.008);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function path(off = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + off);
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i], n = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1] + off, (p[0] + n[0]) * 0.5, (p[1] + n[1]) * 0.5 + off);
    }
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    ctx.quadraticCurveTo(a[0], a[1] + off, b[0], b[1] + off);
  }

  ctx.filter = 'blur(10px)';
  ctx.strokeStyle = 'rgba(240,250,255,0.09)';
  ctx.lineWidth = 24;
  path();
  ctx.stroke();

  ctx.filter = 'blur(3.5px)';
  ctx.strokeStyle = 'rgba(105,128,142,0.10)';
  ctx.lineWidth = 15;
  path();
  ctx.stroke();

  ctx.filter = 'blur(1.2px)';
  ctx.strokeStyle = 'rgba(235,252,255,0.26)';
  ctx.lineWidth = 3.8;
  path(-2.0);
  ctx.stroke();
  path(2.0);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(120,155,175,0.14)';
  ctx.lineWidth = 1.4;
  path(-4.0);
  ctx.stroke();
  path(4.0);
  ctx.stroke();
  ctx.filter = 'none';

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.1;
  path(0);
  ctx.stroke();

  ctx.restore();
  drawSceneLabel(label, x + 48 * s, y - 32 * s);
}

function drawRoundGlassTest(label, x, y, r = 64, opts = {}) {
  const ctx = drawingContext;
  const t = opts.static ? 0 : frameCount * 0.008;
  const innerAlpha = opts.innerAlpha ?? 0.09;
  const edgeAlpha = opts.edgeAlpha ?? 0.42;
  const px = x + (opts.static ? 0 : sin(t) * 0.8);
  const py = y + (opts.static ? 0 : cos(t * 0.7) * 0.6);
  ctx.save();
  ctx.translate(px, py);

  if (!opts.noRefraction) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2);
    ctx.clip();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.38;
    ctx.filter = 'brightness(1.12) blur(0.9px)';
    try {
      const pd = (typeof pixelDensity === 'function') ? pixelDensity() : 1;
      const sample = r * 2.05;
      const zoom = 1.06;
      const sw = sample / zoom;
      const sh = sample / zoom;
      ctx.drawImage(
        ctx.canvas,
        (px - sw / 2) * pd, (py - sh / 2) * pd, sw * pd, sh * pd,
        px - sample / 2, py - sample / 2, sample, sample
      );
    } catch (e) {}
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  ctx.filter = 'blur(5px)';
  ctx.fillStyle = `rgba(245,252,255,${innerAlpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'blur(0.8px)';
  ctx.strokeStyle = `rgba(75,82,90,${edgeAlpha})`;
  ctx.lineWidth = 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(245,252,255,0.34)';
  ctx.lineWidth = 0.25;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
  ctx.stroke();

  ctx.filter = 'blur(7px)';
  ctx.fillStyle = 'rgba(55,60,68,0.38)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';

  ctx.restore();
  drawSceneLabel(label, x + r * 0.78, y - r * 0.72);
}

function drawNeutest(label, x, y, r = 64) {
  drawRoundGlassTest('', x, y, r * 0.72, { innerAlpha: 0.18, edgeAlpha: 0.58 });
  drawRoundGlassTest('', x, y, r * 0.58, { innerAlpha: 0.18, edgeAlpha: 0.58 });
  drawRoundGlassTest('', x, y, r * 0.42, { innerAlpha: 0.20, edgeAlpha: 0.48 });
  const ctx = drawingContext;
  ctx.save();
  ctx.filter = 'blur(4px)';
  ctx.fillStyle = 'rgba(45,50,58,0.56)';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.30, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'blur(1.4px)';
  ctx.fillStyle = 'rgba(135,142,150,0.28)';
  ctx.beginPath();
  ctx.arc(x - r * 0.04, y - r * 0.04, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawSceneLabel(label, x + r * 0.9, y - r * 0.82);
}

function drawSlimeDrop(label, x, y, r = 28, shadow = false, seed = 0, mode = 'lens') {
  const ctx = drawingContext;
  const t = frameCount * 0.008 + seed;
  const px = x + sin(t) * 0.6;
  const py = y + cos(t * 0.7) * 0.45;
  ctx.save();
  ctx.translate(px, py);

  function blobPath(scale = 1) {
    ctx.beginPath();
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const wobble = 1 + 0.045 * sin(a * 3 + seed) + 0.025 * cos(a * 5 - seed);
      const px = cos(a) * r * scale * wobble;
      const py = sin(a) * r * scale * (0.94 + 0.03 * sin(seed)) * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  if (shadow) {
    ctx.save();
    const innerComposite = ctx.globalCompositeOperation;
    ctx.translate(r * 0.22, r * 0.25);
    ctx.filter = 'blur(1.8px)';
    ctx.fillStyle = 'rgba(14,18,24,0.50)';
    blobPath(0.98);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'blur(0.4px)';
    ctx.translate(-r * 0.22, -r * 0.25);
    blobPath(1.03);
    ctx.fill();
    ctx.globalCompositeOperation = innerComposite;
    ctx.filter = 'none';
    ctx.restore();
  }

  if (mode === 'lens') {
    ctx.save();
    blobPath(0.96);
    ctx.clip();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.58;
    ctx.filter = 'brightness(1.22) blur(1.0px)';
    try {
      const pd = (typeof pixelDensity === 'function') ? pixelDensity() : 1;
      const sample = r * 2.25;
      const zoom = 1.045;
      const sw = sample / zoom;
      const sh = sample / zoom;
      ctx.drawImage(
        ctx.canvas,
        (px - sw / 2) * pd, (py - sh / 2) * pd, sw * pd, sh * pd,
        px - sample / 2, py - sample / 2, sample, sample
      );
    } catch (e) {}
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  ctx.filter = 'blur(3.8px)';
  ctx.fillStyle = mode === 'debugYellow' ? 'rgba(255,225,30,0.72)' : 'rgba(250,254,255,0.06)';
  blobPath(0.88);
  ctx.fill();

  ctx.filter = 'blur(1.2px)';
  ctx.fillStyle = mode === 'debugYellow' ? 'rgba(255,245,120,0.42)' : 'rgba(255,255,255,0.035)';
  blobPath(0.66);
  ctx.fill();

  ctx.filter = 'blur(0.9px)';
  ctx.strokeStyle = 'rgba(170,190,205,0.20)';
  ctx.lineWidth = 0.5;
  blobPath(1.0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(250,255,255,0.34)';
  ctx.lineWidth = 0.45;
  blobPath(0.9);
  ctx.stroke();

  ctx.filter = 'blur(3.5px)';
  ctx.fillStyle = 'rgba(10,12,16,0.54)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';

  ctx.restore();
  drawSceneLabel(label, x + r * 0.65, y - r * 0.7);
}

function drawSlimeBufferTest(label, x, y, r = 28, seed = 0, opts = {}) {
  const t = frameCount * 0.008 + seed;
  const px = x + sin(t) * 0.6;
  const py = y + cos(t * 0.7) * 0.45;
  const bodyAlpha = opts.bodyAlpha ?? 45;
  const coreAlpha = opts.coreAlpha ?? 24;
  const edgeAlpha = opts.edgeAlpha ?? 90;
  const spotAlpha = opts.spotAlpha ?? 130;
  const shadowAlpha = opts.shadowAlpha ?? 120;
  const roundMix = opts.roundMix ?? 0;
  const size = Math.ceil(r * 4.4);
  const pg = createGraphics(size, size);
  pg.pixelDensity(1);
  const cx = size / 2;
  const cy = size / 2;

  function path(g, ox = 0, oy = 0, scale = 1) {
    g.beginShape();
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const wobbleRaw = 1 + 0.045 * Math.sin(a * 3 + seed) + 0.025 * Math.cos(a * 5 - seed);
      const wobble = lerp(wobbleRaw, 1, roundMix);
      const bx = Math.cos(a) * r * scale * wobble;
      const by = Math.sin(a) * r * scale * lerp(0.94 + 0.03 * Math.sin(seed), 1, roundMix) * wobble;
      g.vertex(cx + ox + bx, cy + oy + by);
    }
    g.endShape(CLOSE);
  }

  pg.clear();
  pg.noStroke();
  pg.drawingContext.filter = 'blur(2px)';
  pg.fill(10, 14, 22, shadowAlpha);
  path(pg, r * 0.24, r * 0.28, 0.98);
  pg.drawingContext.filter = 'none';
  pg.drawingContext.globalCompositeOperation = 'destination-out';
  pg.fill(0, 0, 0, 255);
  path(pg, 0, 0, 1.03);
  pg.drawingContext.globalCompositeOperation = 'source-over';

  pg.drawingContext.filter = 'blur(3px)';
  pg.fill(250, 254, 255, bodyAlpha);
  path(pg, 0, 0, 0.92);
  pg.drawingContext.filter = 'blur(1px)';
  pg.fill(255, 255, 255, coreAlpha);
  path(pg, 0, 0, 0.66);
  pg.noFill();
  pg.drawingContext.filter = 'blur(0.5px)';
  pg.stroke(230, 248, 255, edgeAlpha);
  pg.strokeWeight(0.8);
  path(pg, 0, 0, 1.0);
  if (roundMix > 0) {
    pg.stroke(78, 84, 92, 52);
    pg.strokeWeight(0.35);
    path(pg, 0, 0, 0.98);
    pg.stroke(248, 253, 255, 62);
    pg.strokeWeight(0.25);
    path(pg, 0, 0, 0.86);
  }
  pg.drawingContext.filter = 'blur(3px)';
  pg.noStroke();
  pg.fill(10, 12, 16, spotAlpha);
  pg.circle(cx, cy, r * 0.25);
  pg.drawingContext.filter = 'none';

  imageMode(CENTER);
  image(pg, px, py, size, size);
  drawSceneLabel(label, px + r * 0.65, py - r * 0.7);
}

function updateRoundTestMotion(pos, vel, homeX, homeY, isMoving, followVec) {
  if (!pos) pos = createVector(homeX, homeY);
  if (!vel) vel = createVector(0, 0);
  const acc = createVector(0, 0);
  if (isMoving && followVec) {
    const mouseDir = p5.Vector.mult(followVec, -1);
    if (directionChangeBoost > 1.2) vel.mult(0.60);
    steerVelocityTowardMouse(vel, mouseDir, 0.26);
    acc.add(p5.Vector.mult(mouseDir, Math.abs(NUCLEUS_DROP_FOLLOW_GAIN) * 1.55));
  } else {
    const rsx = (restShift && restShift.x) || 0;
    const rsy = (restShift && restShift.y) || 0;
    const home = createVector(homeX + rsx * 0.85, homeY + rsy * 0.85);
    const toHome = p5.Vector.sub(home, pos);
    const d = toHome.mag();
    if (d > 0.01) {
      toHome.normalize().mult((d < DRIFT_RETURN_NEAR ? DRIFT_RETURN_GAIN_N * 1.25 : DRIFT_RETURN_GAIN_F * 1.35) * d);
      acc.add(toHome);
    }
    vel.mult(0.30);
  }
  vel.add(acc).limit(DRIFT_VEL_LIMIT * 0.62);
  pos.add(vel);
  containElementPosition(pos, vel, 34);
  vel.mult(DRIFT_DAMP);
  return { pos, vel };
}

function drawSoftVirusHead(label, x, y, s = 1) {
  const ctx = drawingContext;
  const t = frameCount * 0.008;
  ctx.save();
  ctx.translate(x + sin(t) * 0.9, y + cos(t * 0.8) * 0.8);
  ctx.scale(s, s);

  ctx.filter = 'blur(14px)';
  ctx.fillStyle = 'rgba(220,230,230,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 48, 42, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'blur(5px)';
  ctx.fillStyle = 'rgba(125,135,135,0.16)';
  ctx.beginPath();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 34 + sin(i * 2.1) * 5;
    const px = cos(a) * r;
    const py = sin(a) * r * 0.88;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.strokeStyle = 'rgba(230,238,236,0.13)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cos(a) * 31, sin(a) * 28);
    ctx.lineTo(cos(a) * 47, sin(a) * 42);
    ctx.stroke();
  }

  ctx.filter = 'blur(2px)';
  ctx.strokeStyle = 'rgba(245,250,248,0.24)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(-5, -5, 21, 15, -0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(45,50,55,0.38)';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.ellipse(-5, -5, 16, 11.5, -0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,80,185,0.75)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.ellipse(-5, -5, 18.5, 13.2, -0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'none';

  ctx.restore();
  drawSceneLabel(label, x + 42 * s, y - 48 * s);
}

function drawSmallVirusDots(label, x, y, s = 1) {
  const pts = [[-88,-12],[-60,-4],[-34,10],[-8,17],[18,12],[42,-2],[66,-12],[90,-8]];
  const t = frameCount * 0.01;
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x + sin(t) * 0.7, y + cos(t * 0.8) * 0.5);
  ctx.rotate(0.16 + sin(t) * 0.01);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function path(off = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + off);
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i], n = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1] + off, (p[0] + n[0]) * 0.5, (p[1] + n[1]) * 0.5 + off);
    }
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    ctx.quadraticCurveTo(a[0], a[1] + off, b[0], b[1] + off);
  }

  ctx.filter = 'blur(9px)';
  ctx.strokeStyle = 'rgba(225,238,238,0.12)';
  ctx.lineWidth = 28;
  path();
  ctx.stroke();

  ctx.filter = 'blur(3px)';
  ctx.strokeStyle = 'rgba(95,110,112,0.16)';
  ctx.lineWidth = 16;
  path();
  ctx.stroke();

  ctx.filter = 'blur(1px)';
  ctx.strokeStyle = 'rgba(238,248,248,0.25)';
  ctx.lineWidth = 5;
  path(-2);
  ctx.stroke();
  path(2);
  ctx.stroke();
  ctx.filter = 'none';

  pts.forEach((p, i) => {
    drawMoucheBead(p[0], p[1] + sin(t * 2 + i) * 0.5, 3.8, 0.22);
  });
  ctx.restore();
  drawSceneLabel(label, x + 30 * s, y - 20 * s);
}

function drawVirusFloaterMix(label, x, y, s = 1) {
  const ctx = drawingContext;
  const t = frameCount * 0.009;
  const pts = [[-88,-12],[-60,-4],[-34,10],[-8,17],[18,12],[42,-2],[66,-12],[90,-8]];

  ctx.save();
  ctx.translate(x + sin(t) * 1.0, y + cos(t * 0.8) * 0.8);
  ctx.rotate(0.16 + sin(t) * 0.01);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function path(scaleY = 1, offY = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] * scaleY + offY);
    for (let i = 1; i < pts.length - 2; i++) {
      const p = pts[i], n = pts[i + 1];
      ctx.quadraticCurveTo(
        p[0], p[1] * scaleY + offY,
        (p[0] + n[0]) * 0.5, ((p[1] + n[1]) * 0.5) * scaleY + offY
      );
    }
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    ctx.quadraticCurveTo(a[0], a[1] * scaleY + offY, b[0], b[1] * scaleY + offY);
  }

  ctx.filter = 'blur(10px)';
  ctx.strokeStyle = 'rgba(185,205,220,0.13)';
  ctx.lineWidth = 34;
  path(1.15);
  ctx.stroke();

  ctx.filter = 'blur(3px)';
  for (let i = 7; i > 0; i--) {
    ctx.strokeStyle = `rgba(150,165,185,${0.018 + i * 0.006})`;
    ctx.lineWidth = i * 3.0;
    path(1.04);
    ctx.stroke();
  }

  ctx.filter = 'blur(0.9px)';
  ctx.strokeStyle = 'rgba(215,228,238,0.28)';
  ctx.lineWidth = 2.2;
  path(0.78, -3);
  ctx.stroke();
  path(0.78, 3);
  ctx.stroke();
  ctx.filter = 'none';

  pts.forEach((p, i) => {
    if (i % 2 === 0) drawMoucheBead(p[0], p[1], 4.8, 0.30);
  });

  ctx.restore();
  drawSceneLabel(label, x + 72 * s, y - 42 * s);
}

let sceneBuildQueue = [];    // gestaffelter Szenenaufbau für p5-Editor
let sceneReady = false;      // Szene erst rendern, wenn alle schweren Objekte gebaut sind
let nucleusDrops = [];       // 3 weiss-transparente Zellkern-Tropfen (lose Gruppe)
const SHOW_LABELS = false;
const SHOW_ELEMENTS = true;
const SHOW_CLOUDS = true;
const SHOW_CLOUD_LABELS = false;
const ELEMENT_ALPHA = 1.00;

function compareSlot(index, variant='orig') {
  if (variant === true) variant = 'slime';
  if (variant === false) variant = 'orig';
  const xMap = { orig: 0.19, hf: 0.25, slime: 0.31, tube: 0.37, sem: 0.66 };
  const rowStep = max(58, height * 0.075);
  const extraY = index >= 6 ? height * 0.08 : 0;
  return createVector(
    width * (xMap[variant] || xMap.orig),
    height * 0.08 + index * rowStep + extraY
  );
}

function comparePlacedSlot(label, variant, index, fallback) {
  const p = fallback ? fallback.copy() : compareSlot(index, variant);
  const placed = {
    'Nucleus 1': {
      orig: [0.16, 0.28],
      hf: [0.34, 0.39],
      tube: [0.29, 0.94]
    },
    'Nucleus 2': {
      orig: [0.80, 0.60]
    },
    'Nuclei-Gruppe': {
      orig: [0.32, 0.72],
      slime: [0.32, 0.72]
    },
    'Dreieck': {
      orig: [0.47, 0.82],
      slime: [0.47, 0.82]
    }
  };
  const hit = placed[label] && placed[label][variant];
  if (hit) return createVector(width * hit[0], height * hit[1]);
  return p;
}

function compareMotionOffset() {
  if (!floater) return createVector(0, 0);
  return createVector(
    (floater.pos.x - floater.base.x) * 1.18,
    (floater.pos.y - floater.base.y) * 1.18
  );
}

function elementFlowOffset(key, amp = 11) {
  let seed = 0;
  const s = String(key);
  for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) % 9973;
  const t = frameCount * 0.014;
  return createVector(
    Math.sin(t * (0.72 + (seed % 7) * 0.045) + seed * 0.017) * amp,
    Math.cos(t * (0.58 + (seed % 11) * 0.035) + seed * 0.013) * amp * 0.72
  );
}

function flowedPoint(base, key, amp = 11) {
  return p5.Vector.add(base, elementFlowOffset(key, amp));
}

function distributeSchlieren(list, startNumber) {
  const f2StretchItems = list.filter(sc => sc._f2StretchSchliere);
  const total = Math.max(1, list.length);
  const colCount = Math.ceil(Math.sqrt(total * 1.35));
  const rowCount = Math.ceil(total / colCount);
  list.forEach((sc, i) => {
    const n = startNumber + i;
    const col = i % colCount;
    const row = Math.floor(i / colCount);
    const rowShift = row % 2 ? 0.045 : 0;
    const x = DEBUG_SCHLIEREN_GRID
      ? width * ((col + 0.5) / colCount)
      : width * ((col + 0.5) / colCount + rowShift * 0.45) + Math.sin(n * 2.17) * width * 0.020;
    const y = DEBUG_SCHLIEREN_GRID
      ? height * ((row + 0.5) / rowCount)
      : height * ((row + 0.5) / rowCount) + Math.cos(n * 1.73) * height * 0.026;
    if (sc._f2StretchSchliere) {
      const idx = f2StretchItems.indexOf(sc);
      const a = (idx / Math.max(1, f2StretchItems.length)) * TWO_PI;
      const x = width * 0.50 + Math.cos(a) * width * 0.10 + Math.sin(idx * 1.9) * width * 0.025;
      const y = height * 0.52 + Math.sin(a) * height * 0.08 + Math.cos(idx * 2.1) * height * 0.022;
      sc.start.set(x, y);
      sc.pos.set(x, y);
      sc.target.set(x, y);
      return;
    }
    if (sc._softCenterExtra) {
      const k = n - BASE_SCHL_COUNT;
      const ring = k % 10;
      const cx = width * (0.50 + Math.sin(ring * 1.7) * 0.15);
      const cy = height * (0.52 + Math.cos(ring * 1.3) * 0.12);
      sc.start.set(cx, cy);
      sc.pos.set(cx, cy);
      sc.target.set(cx, cy);
      return;
    }
    if (CENTER_DARK_COMPLEX_SCHLIEREN_NUMBERS.has(n)) {
      const pairOffset = n === 30 ? -0.035 : 0.035;
      sc.start.set(width * (0.5 + pairOffset), height * (0.50 + pairOffset * 0.55));
      sc.pos.set(sc.start.x, sc.start.y);
      sc.target.set(sc.start.x, sc.start.y);
      return;
    }
    sc.start.set(x, y);
    sc.pos.set(x, y);
    sc.target.set(x, y);
  });
  return startNumber + list.length;
}

function drawSchliereNumber(n, x, y) {
  if (!SHOW_SCHLIEREN_NUMBERS) return;
  if (HIDDEN_SCHLIEREN_NUMBERS.has(n)) return;
  drawingContext.save();
  drawingContext.font = '700 11px system-ui, -apple-system, sans-serif';
  drawingContext.fillStyle = 'rgba(255,70,190,0.95)';
  drawingContext.strokeStyle = 'rgba(255,255,255,0.72)';
  drawingContext.lineWidth = 2;
  drawingContext.shadowColor = 'rgba(255,70,190,0.55)';
  drawingContext.shadowBlur = 5;
  drawingContext.textBaseline = 'middle';
  drawingContext.strokeText(String(n), x + 10, y - 10);
  drawingContext.fillText(String(n), x + 10, y - 10);
  drawingContext.restore();
}

function drawSchlierenDebugGrid() {
  if (!DEBUG_SCHLIEREN_GRID) return;
  drawingContext.save();
  drawingContext.strokeStyle = 'rgba(255,70,190,0.16)';
  drawingContext.lineWidth = 1;
  drawingContext.strokeStyle = 'rgba(255,70,190,0.55)';
  drawingContext.lineWidth = 2;
  drawingContext.strokeRect(8, 8, width - 16, height - 16);
  drawingContext.strokeStyle = 'rgba(255,70,190,0.16)';
  drawingContext.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const x = width * i / 8;
    drawingContext.beginPath();
    drawingContext.moveTo(x, 0);
    drawingContext.lineTo(x, height);
    drawingContext.stroke();
  }
  for (let i = 1; i < 7; i++) {
    const y = height * i / 7;
    drawingContext.beginPath();
    drawingContext.moveTo(0, y);
    drawingContext.lineTo(width, y);
    drawingContext.stroke();
  }
  drawingContext.restore();
}

function drawCloudLabel(label, cloud, dx = 0, dy = 0) {
  if (!SHOW_CLOUD_LABELS || !SHOW_CLOUDS || !cloud) return;
  drawingContext.save();
  drawingContext.font = '800 16px system-ui, -apple-system, sans-serif';
  drawingContext.textAlign = 'center';
  drawingContext.textBaseline = 'middle';
  drawingContext.fillStyle = 'rgba(255,70,190,0.98)';
  drawingContext.strokeStyle = 'rgba(255,255,255,0.78)';
  drawingContext.lineWidth = 3;
  drawingContext.shadowColor = 'rgba(255,70,190,0.65)';
  drawingContext.shadowBlur = 7;
  drawingContext.strokeText(label, cloud.pos.x + dx, cloud.pos.y + dy);
  drawingContext.fillText(label, cloud.pos.x + dx, cloud.pos.y + dy);
  drawingContext.restore();
}

function markGreyCloudVariant(label, x, y, w, h) {
  if (!SHOW_CLOUDS) return;
  drawingContext.save();
  drawingContext.strokeStyle = 'rgba(255,70,190,0.92)';
  drawingContext.lineWidth = 2.4;
  drawingContext.beginPath();
  drawingContext.moveTo(x - w * 0.18, y - h * 0.18);
  drawingContext.lineTo(x + w * 0.18, y + h * 0.18);
  drawingContext.moveTo(x + w * 0.18, y - h * 0.18);
  drawingContext.lineTo(x - w * 0.18, y + h * 0.18);
  drawingContext.stroke();
  drawingContext.font = '800 15px system-ui, -apple-system, sans-serif';
  drawingContext.textAlign = 'center';
  drawingContext.textBaseline = 'middle';
  drawingContext.fillStyle = 'rgba(255,70,190,0.98)';
  drawingContext.strokeStyle = 'rgba(255,255,255,0.82)';
  drawingContext.lineWidth = 3;
  drawingContext.strokeText(label, x, y - h * 0.58);
  drawingContext.fillText(label, x, y - h * 0.58);
  drawingContext.restore();
}

function drawGreyCloudFleckSchliereStyle(cloud) {
}

function drawHFStyleCloudFleck(cloud, sizeMul = 1, softnessMul = 1) {
  if (!SHOW_CLOUDS || !cloud) return;
  const x = cloud.pos.x;
  const y = cloud.pos.y + cloud.size * 0.00;
  const w = cloud.size * 0.78 * sizeMul;
  const h = cloud.size * 0.58 * sizeMul;
  drawingContext.save();
  if (floaterFleckCloud) {
    imageMode(CENTER);
    drawingContext.filter = `blur(${FLECK_SUPER_BLUR_PX * 5.4 * softnessMul}px)`;
    tint(255, Math.round(255 / Math.max(1, softnessMul * 0.78)));
    image(floaterFleckCloud.pg, x, y, w, h);
    noTint();
  } else {
    drawingContext.translate(x, y);
    noStroke();
    drawingContext.filter = 'blur(4px)';
    fill(22, 22, 28, 38);
    ellipse(0, 0, w, h);
  }
  drawingContext.filter = 'none';
  drawingContext.restore();
}

function drawHaloSemReplica(x, y, r, angleDeg = 28) {
  drawingContext.save();
  drawingContext.translate(x, y);
  drawingContext.rotate(radians(angleDeg));
  drawingContext.scale(0.84, 1);
  noStroke();
  const part = (px, py, sx, sy, rot = 0) => {
    drawingContext.save();
    drawingContext.translate(px, py);
    drawingContext.rotate(rot);
    drawingContext.filter = 'blur(19px)';
    fill(136, 138, 148, 8);
    ellipse(0, 0, sx * 1.36, sy * 1.24);
    drawingContext.filter = 'blur(10px)';
    fill(166, 168, 176, 11);
    ellipse(0, 0, sx * 0.94, sy * 0.90);
    drawingContext.filter = 'blur(3px)';
    fill(205, 207, 214, 8);
    ellipse(sx * 0.04, -sy * 0.02, sx * 0.60, sy * 0.54);
    drawingContext.filter = 'none';
    drawingContext.restore();
  };
  part(-r * 0.38, r * 0.36, r * 0.80, r * 0.48, -0.22);
  part(r * 0.10, -r * 0.04, r * 0.72, r * 0.42, 0.10);
  part(r * 0.28, -r * 0.56, r * 0.62, r * 0.62, 0);
  drawingContext.restore();
}

function drawAttachedThinSchliere(x, y, angle, len, alpha = 0.34, label = '') {
  drawingContext.save();
  drawingContext.translate(x, y);
  drawingContext.rotate(angle);
  drawingContext.filter = 'blur(3px)';
  drawingContext.globalAlpha *= alpha;
  noFill();
  stroke(92, 94, 108, 128);
  strokeWeight(1.35);
  beginShape();
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const px = (t - 1) * len;
    const py = sin(t * PI * 1.4 + frameCount * 0.012) * 4 + sin(t * PI * 3.2) * 1.6;
    vertex(px, py);
  }
  endShape();
  drawingContext.filter = 'none';
  drawingContext.restore();

  if (label) {
    drawingContext.save();
    drawingContext.font = '800 12px system-ui, -apple-system, sans-serif';
    drawingContext.textAlign = 'center';
    drawingContext.textBaseline = 'middle';
    drawingContext.fillStyle = 'rgba(255,70,190,0.98)';
    drawingContext.strokeStyle = 'rgba(255,255,255,0.72)';
    drawingContext.lineWidth = 2.5;
    const lx = x + cos(angle) * (len * 0.18);
    const ly = y + sin(angle) * (len * 0.18) - 10;
    drawingContext.strokeText(label, lx, ly);
    drawingContext.fillText(label, lx, ly);
    drawingContext.restore();
  }
}

function schliereThicknessMul(sc) {
  return 1.0;
}

function schliereAlphaMul(sc) {
  return 1.30;
}

function drawSchlierePinkX(sc) {
  drawingContext.save();
  drawingContext.strokeStyle = 'rgba(255,70,190,0.96)';
  drawingContext.lineWidth = 2.2;
  drawingContext.shadowColor = 'rgba(255,70,190,0.55)';
  drawingContext.shadowBlur = 5;
  const s = 9;
  drawingContext.beginPath();
  drawingContext.moveTo(sc.pos.x - s, sc.pos.y - s);
  drawingContext.lineTo(sc.pos.x + s, sc.pos.y + s);
  drawingContext.moveTo(sc.pos.x + s, sc.pos.y - s);
  drawingContext.lineTo(sc.pos.x - s, sc.pos.y + s);
  drawingContext.stroke();
  drawingContext.restore();
}

function drawDebugOverlay(extra = {}) {
  if (!SHOW_DEBUG_OVERLAY) return;
  const count = (schlierClouds ? schlierClouds.length : 0)
    + (brightSchlierClouds ? brightSchlierClouds.length : 0)
    + (gelSchlierClouds ? gelSchlierClouds.length : 0);
  const all = [
    ...(schlierClouds || []),
    ...(brightSchlierClouds || []),
    ...(gelSchlierClouds || [])
  ];
  const ramp = all.length
    ? all.reduce((sum, sc) => sum + (sc._motionRamp || 0), 0) / all.length
    : 0;
  const speed = typeof extra.mouseSpeedScale === 'number' ? extra.mouseSpeedScale : 0;
  drawingContext.save();
  drawingContext.font = '700 12px system-ui, -apple-system, sans-serif';
  drawingContext.textAlign = 'left';
  drawingContext.textBaseline = 'top';
  const lines = [
    `FPS ${nf(frameRate(), 2, 1)}`,
    `Schlieren ${count}`,
    `moving ${mouseMoving ? 'true' : 'false'}`,
    `ramp ${ramp.toFixed(2)}`,
    `speed ${speed.toFixed(2)}`
  ];
  const x = 12;
  const y = 12;
  const w = 142;
  const h = lines.length * 17 + 12;
  drawingContext.fillStyle = 'rgba(255,255,255,0.78)';
  drawingContext.fillRect(x - 6, y - 6, w, h);
  drawingContext.strokeStyle = 'rgba(60,60,70,0.22)';
  drawingContext.strokeRect(x - 6, y - 6, w, h);
  drawingContext.fillStyle = 'rgba(40,42,52,0.92)';
  lines.forEach((line, i) => drawingContext.fillText(line, x, y + i * 17));
  drawingContext.restore();
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function drawFleckSchlierePair(state, isMoving, oppositeMovement) {
  const home = createVector(width * state.home[0], height * state.home[1]);
  const acc = p5.Vector.sub(home, state.pos).mult(isMoving ? 0.005 : 0.016);
  if (isMoving && oppositeMovement) {
    const mouseDir = p5.Vector.mult(oppositeMovement, -1);
    if (mouseDir.mag() > 0.001) {
      const targetAngle = atan2(mouseDir.y, mouseDir.x) + state.angleBias;
      state.angle = lerpAngle(state.angle, targetAngle, 0.048);
      acc.add(mouseDir.mult(0.020 + state.follow));
    }
  }
  state.vel.add(acc).limit(1.55 + state.scale * 0.35);
  state.pos.add(state.vel);
  state.vel.mult(isMoving ? 0.92 : 0.83);

  const len = min(width, height) * 0.17 * state.lenMul;
  const dia = max(8, min(width, height) * 0.016 * state.scale);
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(state.pos.x, state.pos.y);
  ctx.rotate(state.angle);

  ctx.save();
  ctx.filter = 'blur(7px)';
  noFill();
  stroke(158, 160, 168, 15);
  strokeWeight(max(3, dia * 0.38));
  beginShape();
  for (let i = 0; i <= 34; i++) {
    const t = i / 34;
    const x = -len * 0.50 + t * len;
    const y = sin(t * PI * state.waveA + frameCount * 0.018 + state.phase) * dia * 0.42
      + sin(t * PI * state.waveB + frameCount * 0.011 + state.phase * 0.7) * dia * 0.16;
    curveVertex(x, y);
  }
  endShape();
  ctx.filter = 'blur(2.6px)';
  stroke(212, 214, 222, 10);
  strokeWeight(max(0.7, dia * 0.09));
  beginShape();
  for (let i = 0; i <= 34; i++) {
    const t = i / 34;
    const x = -len * 0.50 + t * len;
    const y = sin(t * PI * state.waveA + frameCount * 0.018 + state.phase) * dia * 0.42
      + sin(t * PI * state.waveB + frameCount * 0.011 + state.phase * 0.7) * dia * 0.16;
    curveVertex(x, y);
  }
  endShape();
  ctx.restore();

  const blobLag = sin(frameCount * 0.012 + state.phase) * dia * 0.28;
  const blobX = -len * (0.54 + state.blobShift);
  const blobY = blobLag;
  ctx.filter = 'blur(8px)';
  noStroke();
  fill(150, 152, 160, 13);
  ellipse(blobX, blobY, dia * 2.2, dia * 1.3);
  ctx.filter = 'blur(3.2px)';
  fill(196, 198, 205, 10);
  ellipse(blobX, blobY, dia * 1.55, dia * 0.86);
  ctx.filter = 'none';
  ctx.restore();
}

function drawFleckSchlierePairs(isMoving, oppositeMovement) {
  if (!fleckSchlierePairs.length) {
    const configs = [
      { home: [0.45, 0.45], scale: 1.00, lenMul: 1.00, angleBias: -0.16, phase: 0.2, waveA: 1.15, waveB: 3.00, follow: 0.000, blobShift: 0.02 },
      { home: [0.55, 0.45], scale: 0.82, lenMul: 0.86, angleBias: 0.10, phase: 1.7, waveA: 1.34, waveB: 2.60, follow: 0.004, blobShift: -0.03 },
      { home: [0.46, 0.56], scale: 1.14, lenMul: 1.12, angleBias: 0.22, phase: 3.1, waveA: 1.05, waveB: 3.35, follow: 0.002, blobShift: 0.04 },
      { home: [0.57, 0.56], scale: 0.94, lenMul: 1.24, angleBias: -0.28, phase: 4.4, waveA: 1.48, waveB: 2.85, follow: 0.006, blobShift: -0.01 }
    ];
    fleckSchlierePairs = configs.map(c => ({
      ...c,
      pos: createVector(width * c.home[0], height * c.home[1]),
      vel: createVector(0, 0),
      angle: c.angleBias
    }));
  }
  fleckSchlierePairs.forEach(pair => drawFleckSchlierePair(pair, isMoving, oppositeMovement));
}

function drawVariantLetters(index) {
  const labels = [['a', 'orig'], ['b', 'hf'], ['c', 'slime'], ['d', 'tube']];
  drawingContext.save();
  drawingContext.font = '600 13px system-ui, -apple-system, sans-serif';
  drawingContext.fillStyle = '#22c55e';
  drawingContext.shadowColor = 'rgba(0,0,0,0.55)';
  drawingContext.shadowBlur = 4;
  drawingContext.textBaseline = 'middle';
  labels.forEach(([letter, variant]) => {
    const p = compareSlot(index, variant);
    drawingContext.fillText(letter, p.x - 8, p.y - 18);
  });
  drawingContext.restore();
}

function drawVariantLetter(letter, x, y) {
  if (!SHOW_LABELS) return;
  drawingContext.save();
  drawingContext.font = '600 13px system-ui, -apple-system, sans-serif';
  drawingContext.fillStyle = '#22c55e';
  drawingContext.shadowColor = 'rgba(0,0,0,0.55)';
  drawingContext.shadowBlur = 4;
  drawingContext.textBaseline = 'middle';
  drawingContext.fillText(letter, x + 14, y - 16);
  drawingContext.restore();
}

function compareVariantVisible(label, variant) {
  if (label === 'Nucleus 1') return variant === 'orig' || variant === 'hf' || variant === 'tube';
  if (label === 'Nucleus 2') return variant === 'orig';
  if (label === 'Nucleus 3') return false;
  if (label === 'Nucleus 4') return false;
  if (label === 'Nuclei-Gruppe') return variant === 'orig';
  if (label === 'Nuclei-Gruppe 2') return false;
  if (label === 'Dreieck') return variant === 'slime';
  return false;
}

function uniqueElementLetter(label, variant) {
  if (label === 'Rundtest' && variant === 'orig') return 'r';
  if (label === 'Rundtest' && variant === 'hf') return 'u';
  if (label === 'Rundtest' && variant === 'tube') return 'v';
  if (label === 'Sem1') return 's';
  if (label === 'Nucleus 1' && variant === 'orig') return 'a';
  if (label === 'Nucleus 1' && variant === 'hf') return 'b';
  if (label === 'Nucleus 1' && variant === 'tube') return 'c';
  if (label === 'Nucleus 2' && variant === 'orig') return 'e';
  if (label === 'Nuclei-Gruppe' && variant === 'slime') return 'm';
  if (label === 'Dreieck' && variant === 'slime') return 'q';
  if (label === 'HF1') return 'h';
  if (label === 'A-copy-1') return 'i';
  if (label === 'A-copy-2') return 'j';
  if (label === 'B-copy-1') return 'k';
  if (label === 'B-copy-2') return 'l';
  return '?';
}

function drawHFStyleBlobReplica(label, x, y, r, aspect = 1.0) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(aspect, 1);
  ctx.filter = 'blur(5px)';
  ctx.strokeStyle = 'rgba(230,240,252,0.10)';
  ctx.lineWidth = r * 0.56;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.72, r * 0.82, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'blur(1.2px)';
  ctx.strokeStyle = 'rgba(34,38,46,0.26)';
  ctx.lineWidth = Math.max(0.5, r * 0.035);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.02, r * 1.12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.46, r * 0.54, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'blur(0.8px)';
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = Math.max(0.45, r * 0.026);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.70, r * 0.80, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'none';
  ctx.restore();
  if (label) drawSceneLabel(label, x + r * 0.78, y - r * 0.72);
}

function drawSlimeStyleBlobReplica(label, x, y, r, aspect = 1.0, seed = 0) {
  const ctx = drawingContext;
  const t = frameCount * 0.008 + seed;
  ctx.save();
  ctx.translate(x + sin(t) * 0.45, y + cos(t * 0.7) * 0.35);
  ctx.scale(aspect, 1);

  function blobPath(scale = 1) {
    ctx.beginPath();
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const wobble = 1;
      const px = Math.cos(a) * r * scale * wobble;
      const py = Math.sin(a) * r * scale * 0.94 * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  ctx.filter = 'blur(2.4px)';
  ctx.fillStyle = 'rgba(10,14,22,0.24)';
  blobPath(1.0);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,0.95)';
  blobPath(0.98);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.filter = 'blur(3px)';
  ctx.fillStyle = 'rgba(250,254,255,0.18)';
  blobPath(0.92);
  ctx.fill();
  ctx.filter = 'blur(1px)';
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  blobPath(0.66);
  ctx.fill();
  ctx.noFill;
  ctx.filter = 'blur(0.5px)';
  ctx.strokeStyle = 'rgba(230,248,255,0.36)';
  ctx.lineWidth = Math.max(0.45, r * 0.028);
  blobPath(1.0);
  ctx.stroke();
  ctx.filter = 'blur(2.4px)';
  ctx.fillStyle = 'rgba(10,12,16,0.42)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.20, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  ctx.restore();
  if (label) drawSceneLabel(label, x + r * 0.78, y - r * 0.72);
}

function drawTubeStyleBlobReplica(label, x, y, r, aspect = 1.0) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(aspect, 1);

  ctx.filter = 'blur(5px)';
  ctx.strokeStyle = 'rgba(230,240,252,0.10)';
  ctx.lineWidth = r * 0.58;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.72, r * 0.82, 0, 0, Math.PI * 2);
  ctx.stroke();

  const beadD = r * 0.52;
  const count = max(3, floor((r * 1.55) / (beadD * 0.82)));
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const bx = lerp(-r * 0.55, r * 0.55, t);
    const by = sin((t - 0.5) * PI) * r * 0.06;
    ctx.filter = 'blur(3.8px)';
    ctx.fillStyle = 'rgba(246,250,255,0.16)';
    ctx.beginPath();
    ctx.ellipse(bx, by, beadD * 0.62, beadD * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'blur(2px)';
    ctx.strokeStyle = 'rgba(42,46,55,0.22)';
    ctx.lineWidth = Math.max(0.45, r * 0.025);
    ctx.beginPath();
    ctx.ellipse(bx, by, beadD * 0.54, beadD * 0.54, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.filter = 'blur(1px)';
  ctx.strokeStyle = 'rgba(26,30,38,0.28)';
  ctx.lineWidth = Math.max(0.5, r * 0.035);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.02, r * 1.10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.42, r * 0.50, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = 'none';
  ctx.restore();
  if (label) drawSceneLabel(label, x + r * 0.78, y - r * 0.72);
}

function drawSemicolonStyleReplica(label, x, y, r, aspect = 1.0, angleDeg = 0) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(radians(angleDeg));
  ctx.scale(aspect, 1);

  const leftCells = [
    [-1.46, -1.22, 0.40, 0.68, -0.42],
    [-1.48, -0.58, 0.44, 0.72, -0.34],
    [-1.50, 0.10, 0.46, 0.74, -0.26],
    [-1.49, 0.76, 0.40, 0.64, -0.18]
  ];
  const rightCells = [
    [0.18, 1.48, 0.46, 0.58, 0.72],
    [0.72, 1.72, 0.55, 0.46, 0.62],
    [1.30, 1.82, 0.64, 0.38, 0.52],
    [1.84, 1.84, 0.46, 0.32, 0.42]
  ];
  function rotateGroup(cells, angle) {
    const cx = cells.reduce((sum, c) => sum + c[0], 0) / cells.length;
    const cy = cells.reduce((sum, c) => sum + c[1], 0) / cells.length;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    return cells.map(c => {
      const dx = c[0] - cx;
      const dy = c[1] - cy;
      return [cx + dx * ca - dy * sa, cy + dx * sa + dy * ca, c[2], c[3], c[4] + angle];
    });
  }
  const leftSemCells = rotateGroup(leftCells, Math.PI / 2 + radians(100));
  const rightSemCells = rotateGroup(rightCells, Math.PI / 2 + radians(30));
  const verticalComp = -radians(angleDeg) + radians(20);
  leftSemCells.forEach(c => { c[0] += 1.55; });
  rightSemCells.forEach(c => { c[0] -= 2.88; c[1] += 1.50; });

  function nucleusCell(cx, cy, rx, ry, dark = false, angle = 0) {
    const px = cx * r;
    const py = cy * r;
    const rw = rx * r;
    const rh = ry * r;
    ctx.filter = 'blur(4.8px)';
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath();
    ctx.ellipse(px, py, rw * 0.96, rh * 0.96, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'blur(1.2px)';
    ctx.strokeStyle = 'rgba(96,104,118,0.34)';
    ctx.lineWidth = Math.max(0.55, r * 0.032);
    ctx.beginPath();
    ctx.ellipse(px, py, rw, rh, angle, 0, Math.PI * 2);
    ctx.stroke();
    ctx.filter = 'blur(2.4px)';
    ctx.fillStyle = 'rgba(255,255,255,0.36)';
    ctx.beginPath();
    ctx.ellipse(px - rw * 0.04, py - rh * 0.04, rw * 0.50, rh * 0.50, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'blur(2.0px)';
    ctx.fillStyle = dark ? 'rgba(92,98,112,0.20)' : 'rgba(255,255,255,0.26)';
    ctx.beginPath();
    ctx.ellipse(px + rw * 0.08, py + rh * 0.03, rw * 0.28, rh * 0.28, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  function markSemMiddle(c, alpha = 0.95, color = '255, 70, 190') {
    const px = c[0] * r;
    const py = c[1] * r;
    ctx.save();
    ctx.filter = 'none';
    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
    ctx.lineWidth = Math.max(1.4, r * 0.055);
    ctx.beginPath();
    ctx.ellipse(px, py, c[2] * r * 1.18, c[3] * r * 1.18, c[4], 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  leftSemCells.forEach((c, i) => nucleusCell(c[0], c[1], c[2], c[3], i < 2, c[4]));
  rightSemCells.forEach((c, i) => nucleusCell(c[0], c[1], c[2], c[3], i >= 2, c[4]));

  ctx.filter = 'none';
  ctx.restore();
  if (label) drawSceneLabel(label, x + r * 0.82, y - r * 0.78);
}

function drawRoundStyleSemReplica(label, x, y, r, aspect = 1.0, angleDeg = 0) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(radians(angleDeg));
  ctx.scale(aspect, 1);

  const cells = [
    [-0.88, -1.20, 0.40, 0.58, -0.52],
    [-0.86, -0.62, 0.43, 0.62, -0.38],
    [-0.82, -0.02, 0.46, 0.66, -0.24],
    [-0.76,  0.58, 0.42, 0.58, -0.10],
    [ 0.52,  1.16, 0.48, 0.56,  0.58],
    [ 1.02,  1.40, 0.55, 0.46,  0.48],
    [ 1.54,  1.48, 0.58, 0.38,  0.38]
  ];

  cells.forEach((c, i) => {
    const px = c[0] * r;
    const py = c[1] * r;
    const rw = c[2] * r;
    const rh = c[3] * r;
    const a = c[4];
    ctx.filter = 'blur(5px)';
    ctx.fillStyle = 'rgba(245,252,255,0.14)';
    ctx.beginPath();
    ctx.ellipse(px, py, rw * 1.08, rh * 1.08, a, 0, Math.PI * 2);
    ctx.fill();

    ctx.filter = 'blur(0.9px)';
    ctx.strokeStyle = 'rgba(78,86,96,0.30)';
    ctx.lineWidth = Math.max(0.32, r * 0.010);
    ctx.beginPath();
    ctx.ellipse(px, py, rw, rh, a, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245,252,255,0.24)';
    ctx.lineWidth = Math.max(0.25, r * 0.007);
    ctx.beginPath();
    ctx.ellipse(px, py, rw * 0.90, rh * 0.90, a, 0, Math.PI * 2);
    ctx.stroke();

    ctx.filter = 'blur(5.5px)';
    ctx.fillStyle = i < 3 ? 'rgba(58,64,74,0.22)' : 'rgba(70,76,86,0.15)';
    ctx.beginPath();
    ctx.ellipse(px + rw * 0.08, py + rh * 0.03, rw * 0.28, rh * 0.28, a, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.filter = 'none';
  ctx.restore();
  if (label) drawSceneLabel(label, x + r * 0.82, y - r * 0.78);
}

function drawStaticRoundTestReplica(label, x, y, r = 64) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);

  ctx.filter = 'blur(5px)';
  ctx.fillStyle = 'rgba(245,252,255,0.09)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'blur(0.8px)';
  ctx.strokeStyle = 'rgba(75,82,90,0.42)';
  ctx.lineWidth = 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(245,252,255,0.34)';
  ctx.lineWidth = 0.25;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
  ctx.stroke();

  ctx.filter = 'blur(7px)';
  ctx.fillStyle = 'rgba(55,60,68,0.38)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'none';
  ctx.restore();
  if (label) drawSceneLabel(label, x + r * 0.78, y - r * 0.72);
}

function drawHFRightVariant(f, x, y, label, mode) {
  const ctx = drawingContext;
  push();
  translate(x, y);
  scale(mode === 'nucleusTube' ? 0.72 : 0.48, mode === 'nucleusTube' ? 0.78 : 0.48);
  noFill();

  if (mode === 'slime') {
    drawingContext.filter = 'blur(7px)';
    stroke(250, 254, 255, 16);
    strokeWeight(24);
    beginShape();
    f.shape.forEach(p => curveVertex(p.x, p.y));
    endShape();
    drawingContext.filter = 'blur(2px)';
    stroke(10, 14, 22, 26);
    strokeWeight(8);
    beginShape();
    f.shape.forEach(p => curveVertex(p.x + 8, p.y + 9));
    endShape();
    drawingContext.filter = 'none';
    stroke(232, 248, 255, 72);
    strokeWeight(1.4);
    beginShape();
    f.shape.forEach(p => curveVertex(p.x, p.y));
    endShape();
  } else {
    const tubeRadius = 6.0;
    const beadD = tubeRadius * 1.86;

    const drawOffsetPath = (dist) => {
      beginShape();
      f.shape.forEach((p, i) => {
        const prev = f.shape[max(0, i - 1)];
        const next = f.shape[min(f.shape.length - 1, i + 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = max(0.001, sqrt(dx * dx + dy * dy));
        curveVertex(p.x + (-dy / len) * dist, p.y + (dx / len) * dist);
      });
      endShape();
    };

    drawingContext.filter = 'blur(8px)';
    stroke(230, 240, 252, 10);
    strokeWeight(tubeRadius * 3.2);
    beginShape();
    f.shape.forEach(p => curveVertex(p.x, p.y));
    endShape();

    drawingContext.filter = 'blur(2.4px)';
    stroke(245, 250, 255, 20);
    strokeWeight(tubeRadius * 1.6);
    beginShape();
    f.shape.forEach(p => curveVertex(p.x, p.y));
    endShape();

    drawingContext.filter = 'none';

    const samples = [];
    for (let i = 1; i < f.shape.length; i++) {
      const a = f.shape[i - 1];
      const b = f.shape[i];
      const segLen = p5.Vector.dist(a, b);
      const count = max(1, floor(segLen / (beadD * 0.92)));
      for (let j = 0; j < count; j++) {
        const t = j / count;
        samples.push(createVector(lerp(a.x, b.x, t), lerp(a.y, b.y, t)));
      }
    }
    samples.push(f.shape[f.shape.length - 1].copy());

    samples.forEach((p, i) => {
      const wob = 1;
      drawingContext.filter = 'blur(4.4px)';
      noStroke();
      fill(246, 250, 255, 17);
      ellipse(p.x, p.y, beadD * 1.18 * wob, beadD * 1.18 * wob);
      drawingContext.filter = 'blur(2.3px)';
      noFill();
      stroke(42, 46, 55, 24);
      strokeWeight(1.2);
      ellipse(p.x, p.y, beadD * 1.02 * wob, beadD * 1.02 * wob);
      drawingContext.filter = 'blur(3.7px)';
      noStroke();
      fill(48, 52, 60, 8);
      ellipse(p.x, p.y, beadD * 0.50, beadD * 0.50);
      drawingContext.filter = 'none';
    });

    drawingContext.filter = 'blur(1.0px)';
    noFill();
    stroke(48, 54, 64, 24);
    strokeWeight(0.62);
    drawOffsetPath(tubeRadius);
    drawOffsetPath(-tubeRadius);
    drawingContext.filter = 'none';

    drawingContext.filter = `blur(${FLECK_SUPER_BLUR_PX}px)`;
    imageMode(CENTER);
    image(floaterFleckCloud.pg, f.fleckLocal.x, f.fleckLocal.y + 6, FLECK_SUPER_DRAW_W * 1.12, FLECK_SUPER_DRAW_H * 1.12);
    drawingContext.filter = 'none';
  }

  pop();
  drawSceneLabel(label, x + 58, y - 34);
}

/* =========================================================
 * NOISE-CLOUD CLASS
 * ========================================================= */
class NoiseCloud {
  constructor(cx, cy, size, tintRGB, alphaBase, feather=1.3) {
    this.start = createVector(cx, cy);
    this.pos   = this.start.copy();
    this.vel   = createVector(0,0);
    this.acc   = createVector(0,0);
    this.target= this.pos.copy();

    this.size  = size;
    this.tint  = tintRGB;
    this.alphaBase = alphaBase; // 0..1
    this.feather   = feather;

    this.pg = createGraphics(CLOUD_RES, CLOUD_RES);
    this.pg.pixelDensity(1);
    this.buildTexture();
  }

  buildTexture() {
    this.pg.loadPixels();
    const w = this.pg.width;
    const h = this.pg.height;
    const cx = w/2;
    const cy = h/2;
    const maxR = min(cx, cy);
    noiseDetail(CLOUD_OCTAVES, CLOUD_FALLOFF);

    for (let y=0; y<h; y++){
      for (let x=0; x<w; x++){
        const dx = (x - cx)/maxR;
        const dy = (y - cy)/maxR;
        const r2 = dx*dx + dy*dy;
        let mask = max(0, 1 - pow(r2, this.feather));
        if (mask <= 0) continue;
        const n = noise(x * CLOUD_NOISE_SCALE, y * CLOUD_NOISE_SCALE);
        const v = max(0, n * mask);
        const idx = 4 * (y*w + x);
        this.pg.pixels[idx  ] = this.tint[0];
        this.pg.pixels[idx+1] = this.tint[1];
        this.pg.pixels[idx+2] = this.tint[2];
        this.pg.pixels[idx+3] = floor(v * this.alphaBase * 255);
      }
    }
    this.pg.updatePixels();
  }

  update(isMoving, xRange=[0,1], yRange=[0,1], speedScale=0.8, followVec=null, followGain=0) {
    if (isMoving){
      if (p5.Vector.dist(this.pos, this.target) < 40) {
        this.target.x = map(random(),0,1,width * xRange[0], width * xRange[1]);
        this.target.y = map(random(),0,1,height*yRange[0], height*yRange[1]);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * speedScale);
      let steer   = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * speedScale);
      this.acc.add(steer);
    } else {
      let toStart = p5.Vector.sub(this.start, this.pos);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR*2) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N*0.6*d);
        this.vel.mult(0.92);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F*0.8*d);
      }
      this.acc.add(toStart);
    }

    if (followVec && followGain !== 0) {
      this.acc.add(p5.Vector.mult(followVec, followGain));
    }

    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.8);
    this.pos.add(this.vel);
    containElementPosition(this.pos, this.vel, this.size * 0.5 || 80);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
  }

  displayAt(x, y, w, h, blurPx=12) {
    push();
    translate(x, y);
    drawingContext.filter = `blur(${blurPx}px)`;
    imageMode(CENTER);
    image(this.pg, 0, 0, w, h);
    drawingContext.filter = 'none';
    pop();
  }

  display() {
    this.displayAt(this.pos.x, this.pos.y, this.size, this.size, 12);
  }
}


/* =========================================================
 * SCHLIER-CLOUDLET – gestreckte NoiseCloud
 * ========================================================= */
class SchlierCloud {
  constructor() {
    this.len   = random(SCHLC_LEN_MIN, SCHLC_LEN_MAX);
    const thickRatio = SCHLC_THICK_MIN;
    this.thick = this.len * thickRatio;

    this.start = createVector(random(width), random(height));
    this.pos   = this.start.copy();
    this.vel   = createVector(0,0);
    this.acc   = createVector(0,0);
    this.target= this.pos.copy();

    this.ang = random(TWO_PI);
    
    // Individuelle Geschwindigkeitsvariation
    this.speedMult = random(0.5, 1.5);

    // Form-Deformation bei Bewegung
    this.curveMagBase = this.len * 0.06;
    this.curveMagTarget = this.curveMagBase;
    this.curveMagCurrent = this.curveMagBase;
    this.thickTarget = this.thick;
    this.thickCurrent = this.thick;
    this.wavePhase = random(TWO_PI);
    this.waveSpeed = random(0.015, 0.04);

    const thisAlpha = SCHLC_ALPHA;
    this.cloud = new NoiseCloud(0,0, CLOUD_RES, SCHLC_TINT, thisAlpha, SCHLC_FEATHER);

    // Verdickung an zufälliger Stelle entlang der Schliere – ca. 40% bekommen eine.
    // Visuell: zweite Image-Zeichnung der gleichen NoiseCloud, an einer Stelle entlang
    // der Mittellinie, etwas dicker → wirkt wie eine lokale Schwellung.
    this._hasThicken    = false;
    this._thickenT      = random(-0.35, 0.35);   // Position entlang Länge (-0.5..0.5)
    this._thickenLen    = random(0.18, 0.32);    // Länge der Verdickung als Anteil von len
    this._thickenScale  = random(2.2, 3.4);      // wie viel dicker
  }

  update(isMoving, oppositeMovement=null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 20) {
        this.target.x = random(width);
        this.target.y = random(height);
      }
      const ramp = this._motionRamp == null ? 1 : this._motionRamp;
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * SCHLC_SPEED_SCALE * this.speedMult * (0.35 + ramp * 0.95));
      let steer   = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * SCHLC_SPEED_SCALE * this.speedMult * (0.45 + ramp * 0.95));
      this.acc.add(steer);
      if (oppositeMovement) {
        const mouseFollow = p5.Vector.mult(oppositeMovement, -0.11 * (0.35 + ramp));
        this.acc.add(mouseFollow);
      }
      
      // STRUDEL: Schlieren rotieren um einen gemeinsamen Mittelpunkt (Bildmitte).
      // oppositeMovement = -movement → Vorzeichen umkehren ergibt echte Mausrichtung.
      // Maus nach links (mouseDx < 0) → Drehung gegen den Uhrzeigersinn.
      // Maus nach rechts (mouseDx > 0) → Drehung mit Uhrzeigersinn.
      if (oppositeMovement) {
        const mouseDx = -oppositeMovement.x;
        // Strudel-Zentrum: nicht exakt Bildmitte, sondern verschoben Richtung
        // Maus-Tendenz (mouseRestPos). Fällt zurück zu Bildmitte wenn keine Tendenz.
        const cx = (mouseRestPos ? mouseRestPos.x : width  * 0.5);
        const cy = (mouseRestPos ? mouseRestPos.y : height * 0.5);
        const rx = this.pos.x - cx;
        const ry = this.pos.y - cy;
        const r  = Math.max(40, Math.sqrt(rx * rx + ry * ry));
        // Nur HORIZONTALE Mausrichtung erzeugt Rotation. Maus links → CCW, Maus rechts → CW.
        const dir = mouseDx < 0 ? 1 : -1;
        // Stärke skaliert mit horizontaler Mausgeschwindigkeit (nicht der Gesamtmag),
        // damit reine Vertikalbewegung NICHT rotiert.
        const horizSpeed = Math.abs(mouseDx);
        const strength = (horizSpeed * 0.10) / Math.sqrt(r / 200);
        const tx = (-ry / r) * strength * dir;
        const ty = ( rx / r) * strength * dir;
        this.acc.add(tx, ty);
        // Dezenter radialer "Atem" – nur horizontaler Anteil
        this.acc.add((rx / r) * horizSpeed * 0.004, (ry / r) * horizSpeed * 0.004);
      }
    } else {
      // Rückstellen: Ziel = start + restShift (dorthin wo Mauszeiger zum Stehen kam).
      // Gleichzeitig wirkt das natürliche Rückrotieren um das Strudel-Zentrum.
      const rsx = (restShift && restShift.x) || 0;
      const rsy = (restShift && restShift.y) || 0;
      const homeX = this.start.x + rsx * 0.28;
      const homeY = this.start.y + rsy * 0.12;
      let toStart = createVector(homeX - this.pos.x, homeY - this.pos.y);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * SCHLC_SPEED_SCALE * 0.62 * d);
        this.vel.mult(0.965);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * SCHLC_SPEED_SCALE * 0.62 * d);
      }
      this.acc.add(toStart);
    }

    const velRamp = this._motionRamp == null ? 1 : this._motionRamp;
    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * SCHLC_SPEED_SCALE * this.speedMult * (0.72 + velRamp * 1.05));
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);

    // Form-Deformation: Biegung und Dicke ändern sich bei Bewegung
    const speed = this.vel.mag();
    const flex = this._flexBend ? 2.25 : (this._morphBend ? 2.05 : 1.9);
    if (isMoving && speed > 0.5) {
      const morphPulse = this._morphBend ? 1 + 0.28 * sin(this.wavePhase * 0.62 + this._morphSeed) : 1;
      this.curveMagTarget = this.curveMagBase * flex * morphPulse * (1.25 + sin(this.wavePhase) * 1.05);
      this.thickTarget = this.thick;
      this.wavePhase += this.waveSpeed * 0.70 + speed * (this._flexBend || this._morphBend ? 0.010 : 0.004);
    } else {
      this.curveMagTarget = this.curveMagBase;
      this.thickTarget = this.thick;
      this.wavePhase += this.waveSpeed * 0.3;
    }
    this.curveMagCurrent = lerp(this.curveMagCurrent, this.curveMagTarget, 0.045);
    this.thickCurrent = lerp(this.thickCurrent, this.thickTarget, 0.045);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.ang);
    drawingContext.filter = `blur(${SCHLC_BLUR_PX}px)`;
    if (this._midThicken) {
      drawingContext.filter = `contrast(0.86) brightness(0.92) blur(${SCHLC_BLUR_PX + 6}px)`;
    } else if (this._centerDarkComplex) {
      drawingContext.filter = `contrast(1.16) brightness(0.78) blur(${SCHLC_BLUR_PX + 2}px)`;
    } else if (this._f2StretchSchliere) {
      drawingContext.filter = `contrast(0.82) brightness(0.94) blur(${SCHLC_BLUR_PX + 8}px)`;
    } else if (this._fleckSchliere) {
      drawingContext.filter = `contrast(0.88) brightness(1.00) blur(${SCHLC_BLUR_PX + 4}px)`;
    } else if (this._softCenterExtra) {
      drawingContext.filter = `contrast(0.88) brightness(1.04) blur(${SCHLC_BLUR_PX + 5}px)`;
    } else if (this._darker) {
      drawingContext.filter = `contrast(1.12) brightness(0.86) blur(${SCHLC_BLUR_PX}px)`;
    }
    imageMode(CENTER);
    // Gebogene Darstellung mit animierter Form
    const lengthMorph = this._morphBend ? 1 + 0.18 * sin(this.wavePhase * 0.52 + this._morphSeed) : 1;
    const shortScale = this._shortSchliere ? 0.42 : 1;
    const smallScale = this._smallSchliere ? 0.52 : 1;
    const longScale = this._centerLongWave ? 2.35 : (this._longSchliere ? 1.48 : 1);
    const angledStretch = this._angledSchliere ? (1.12 + 0.24 * sin(this.wavePhase * 0.42 + this._shapeSeed)) : 1;
    const complexScale = this._centerDarkComplex ? 1.72 : 1;
    const visualScale = (this._visualScale || 1) * lengthMorph * (this._midThicken ? 1.58 : 1) * shortScale * smallScale * longScale * angledStretch * complexScale * (this._f2StretchSchliere ? 1.16 : 1);
    const segments = 42;
    const drawLen = this.len * visualScale;
    const segLen = drawLen / segments;
    const segThick = this.thickCurrent;
    const curveMag = this.curveMagCurrent * visualScale;
    push();
    translate(-drawLen / 2, 0);
    if (SCHLIEREN_FOG_RENDER) {
      if (this._fleckSchliere) {
        if (this._pairedFleckSchliere) {
          drawingContext.save();
          const pairScale = this._pairedSizeMul || 1;
          const pairLen = max(drawLen * (0.42 + 0.24 * abs(sin(this._shapeSeed))) * pairScale, segThick * 12);
          const dia = max(6, segThick * (3.6 + 2.1 * abs(cos(this._shapeSeed * 0.7))) * pairScale);
          const phase = this._shapeSeed || 0;
          const blobX = drawLen * 0.48 - pairLen * 0.55;
          const blobY = sin(frameCount * 0.012 + phase) * dia * 0.28;

          const pairAlphaMul = this._extraPairedSchliere ? 0.45 : 1;
          drawingContext.filter = 'blur(7px)';
          noFill();
          stroke(124, 126, 136, 21 * pairAlphaMul);
          strokeWeight(max(3, dia * 0.38));
          beginShape();
          for (let i = 0; i <= 34; i++) {
            const t = i / 34;
            const x = drawLen * 0.48 - pairLen * 0.50 + t * pairLen;
            const y = sin(t * PI * 1.2 + frameCount * 0.018 + phase) * dia * 0.42
              + sin(t * PI * 3.1 + frameCount * 0.011 + phase * 0.7) * dia * 0.16;
            curveVertex(x, y);
          }
          endShape();

          drawingContext.filter = 'blur(2.6px)';
          stroke(182, 184, 194, 13 * pairAlphaMul);
          strokeWeight(max(0.7, dia * 0.09));
          beginShape();
          for (let i = 0; i <= 34; i++) {
            const t = i / 34;
            const x = drawLen * 0.48 - pairLen * 0.50 + t * pairLen;
            const y = sin(t * PI * 1.2 + frameCount * 0.018 + phase) * dia * 0.42
              + sin(t * PI * 3.1 + frameCount * 0.011 + phase * 0.7) * dia * 0.16;
            curveVertex(x, y);
          }
          endShape();

          drawingContext.filter = 'blur(8px)';
          noStroke();
          fill(122, 124, 134, 19 * pairAlphaMul);
          ellipse(blobX, blobY, dia * 2.2, dia * 1.3);
          drawingContext.filter = 'blur(3.2px)';
          fill(170, 172, 182, 12 * pairAlphaMul);
          ellipse(blobX, blobY, dia * 1.55, dia * 0.86);
          drawingContext.filter = 'none';
          drawingContext.restore();
          pop();
          pop();
          return;
        }
        drawingContext.save();
        noStroke();
        const t = 0.5;
        const wave =
          sin(t * PI * 0.86 + this._shapeSeed * 0.17) * 0.38 +
          sin((t - 0.18) * PI * 2.35 + this._shapeSeed * 0.31) * 0.16 +
          sin(t * PI * 4.2 + this.wavePhase * 0.18) * 0.045;
        const px = t * drawLen;
        const py = wave * curveMag;
        const fleckScale = this._fleckSizeMul || 1;
        const dia = max(5, segThick * (4.0 + 1.9 * abs(sin(this._shapeSeed))) * fleckScale);
        const visibleLen = dia * (1.00 + 0.18 * abs(cos(this._shapeSeed * 0.53)));
        drawingContext.filter = 'blur(7px)';
        fill(122, 124, 134, 19);
        ellipse(px, py, visibleLen, dia);
        drawingContext.filter = 'blur(2.8px)';
        fill(162, 164, 174, 14);
        ellipse(px, py, visibleLen * 0.78, dia * 0.78);
        drawingContext.filter = 'none';
        drawingContext.restore();
        pop();
        pop();
        return;
      }
      drawingContext.save();
      drawingContext.filter = 'blur(8.5px)';
      noFill();
      stroke(124, 126, 136, 19);
      strokeWeight(Math.max(3.8, segThick * 3.4));
      beginShape();
      for (let j = 0; j <= 36; j++) {
        const t = j / 36;
        const wave =
          sin(t * PI * 0.86 + this._shapeSeed * 0.17) * 0.38 +
          sin((t - 0.18) * PI * 2.35 + this._shapeSeed * 0.31) * 0.16 +
          sin(t * PI * 4.2 + this.wavePhase * 0.18) * 0.045;
        curveVertex(t * drawLen, wave * curveMag);
      }
      endShape();
      drawingContext.filter = 'blur(2.4px)';
      stroke(180, 182, 192, 12);
      strokeWeight(Math.max(0.62, segThick * 0.58));
      beginShape();
      for (let j = 0; j <= 36; j++) {
        const t = j / 36;
        const wave =
          sin(t * PI * 0.86 + this._shapeSeed * 0.17) * 0.38 +
          sin((t - 0.18) * PI * 2.35 + this._shapeSeed * 0.31) * 0.16 +
          sin(t * PI * 4.2 + this.wavePhase * 0.18) * 0.045;
        curveVertex(t * drawLen, wave * curveMag);
      }
      endShape();
      drawingContext.filter = 'none';
      drawingContext.restore();
      pop();
      pop();
      return;
    }
    drawingContext.save();
    drawingContext.globalAlpha *= this._fleckSchliere ? 0.24 : 0.18;
    noFill();
    if (this._f2StretchSchliere) stroke(70, 72, 84, 44);
    else if (this._centerDarkComplex) stroke(72, 74, 88, 112);
    else if (this._centerLongWave) stroke(112, 114, 128, 76);
    else if (this._midThicken) stroke(88, 90, 104, 78);
    else if (this._darker) stroke(112, 112, 126, 70);
    else stroke(150, 150, 164, 46);
    strokeWeight(Math.max(0.45, segThick * (this._fleckSchliere ? 0.48 : 0.36)));
    beginShape();
    for (let j = 0; j <= 36; j++) {
      const t = j / 36;
      const wave = this._flexBend
        ? (this._midThicken
          ? (
              sin(t * PI * 0.72 + this.wavePhase * 0.32) * (0.38 + 0.34 * t) +
              sin((t - 0.22) * PI * 2.9 - this.wavePhase * 0.21) * (0.18 + t * 0.36) +
              (t > 0.62 ? sin((t - 0.62) * PI * 3.4 + this._shapeSeed) * 0.26 : 0) -
              (t < 0.28 ? sin((0.28 - t) * PI * 2.7 + this._shapeSeed) * 0.18 : 0)
            )
          : (
            sin(t * PI * 1.08 + this.wavePhase * 0.46) * (0.58 + 0.42 * t) +
            sin(t * PI * 2.65 - this.wavePhase * 0.34) * (0.12 + abs(t - 0.5) * 0.62) +
            sin((t - 0.18) * PI * 4.1 + this.wavePhase * 0.22) * 0.16 * t +
            sin(t * PI * 6.0 + this._shapeSeed) * 0.055
          ))
        : (this._centerDarkComplex
          ? (
              sin(t * PI * 0.58 + this.wavePhase * 0.18) * (0.18 + t * 0.40) +
              sin((t - 0.32) * PI * 3.4 - this.wavePhase * 0.20) * (0.22 + abs(t - 0.5) * 0.26) +
              (t > 0.56 ? sin((t - 0.56) * PI * 5.0 + this._shapeSeed) * 0.22 : 0) -
              (t < 0.22 ? sin((0.22 - t) * PI * 4.0 + this._shapeSeed) * 0.16 : 0)
            )
          : (this._centerLongWave
          ? (
              sin(t * PI * 3.6 + this.wavePhase * 0.18) * 0.34 +
              sin(t * PI * 6.8 - this.wavePhase * 0.12 + this._shapeSeed) * 0.18 +
              sin(t * PI * 1.2 + this._shapeSeed) * 0.10
            )
          : (this._angledSchliere
          ? (
              (t < 0.38
                ? sin(t * PI * 0.42 + this.wavePhase * 0.18) * 0.18 + t * 0.95
                : 0.36 + sin((t - 0.38) * PI * 0.70 + this.wavePhase * 0.22) * 0.20 - (t - 0.38) * 0.34) +
              sin(t * PI * 3.8 + this._shapeSeed) * 0.045
            )
          : (
            sin(t * PI * 0.82 + this.wavePhase * 0.36) * (0.28 + 0.32 * t) +
            sin((t - 0.18) * PI * 2.7 - this.wavePhase * 0.18) * (0.10 + abs(t - 0.55) * 0.34) +
            (t > 0.68 ? sin((t - 0.68) * PI * 3.2 + this._shapeSeed) * 0.16 : 0) -
            (t < 0.24 ? sin((0.24 - t) * PI * 2.5 + this._shapeSeed) * 0.10 : 0)
          ))));
      vertex(t * drawLen, wave * curveMag);
    }
    endShape();
    drawingContext.restore();
    for (let i = 0; i < segments; i++) {
      const t = (i + 0.5) / segments;
      const wave = this._flexBend
        ? (this._midThicken
          ? (
              sin(t * PI * 0.72 + this.wavePhase * 0.32) * (0.38 + 0.34 * t) +
              sin((t - 0.22) * PI * 2.9 - this.wavePhase * 0.21) * (0.18 + t * 0.36) +
              (t > 0.62 ? sin((t - 0.62) * PI * 3.4 + this._shapeSeed) * 0.26 : 0) -
              (t < 0.28 ? sin((0.28 - t) * PI * 2.7 + this._shapeSeed) * 0.18 : 0)
            )
          : (
            sin(t * PI * 1.08 + this.wavePhase * 0.46) * (0.58 + 0.42 * t) +
            sin(t * PI * 2.65 - this.wavePhase * 0.34) * (0.12 + abs(t - 0.5) * 0.62) +
            sin((t - 0.18) * PI * 4.1 + this.wavePhase * 0.22) * 0.16 * t +
            sin(t * PI * 6.0 + this._shapeSeed) * 0.055
          ))
        : (this._centerDarkComplex
          ? (
              sin(t * PI * 0.58 + this.wavePhase * 0.18) * (0.18 + t * 0.40) +
              sin((t - 0.32) * PI * 3.4 - this.wavePhase * 0.20) * (0.22 + abs(t - 0.5) * 0.26) +
              (t > 0.56 ? sin((t - 0.56) * PI * 5.0 + this._shapeSeed) * 0.22 : 0) -
              (t < 0.22 ? sin((0.22 - t) * PI * 4.0 + this._shapeSeed) * 0.16 : 0)
            )
          : (this._centerLongWave
          ? (
              sin(t * PI * 3.6 + this.wavePhase * 0.18) * 0.34 +
              sin(t * PI * 6.8 - this.wavePhase * 0.12 + this._shapeSeed) * 0.18 +
              sin(t * PI * 1.2 + this._shapeSeed) * 0.10
            )
          : (this._angledSchliere
          ? (
              (t < 0.38
                ? sin(t * PI * 0.42 + this.wavePhase * 0.18) * 0.18 + t * 0.95
                : 0.36 + sin((t - 0.38) * PI * 0.70 + this.wavePhase * 0.22) * 0.20 - (t - 0.38) * 0.34) +
              sin(t * PI * 3.8 + this._shapeSeed) * 0.045
            )
          : (
            sin(t * PI * 0.82 + this.wavePhase * 0.36) * (0.28 + 0.32 * t) +
            sin((t - 0.18) * PI * 2.7 - this.wavePhase * 0.18) * (0.10 + abs(t - 0.55) * 0.34) +
            (t > 0.68 ? sin((t - 0.68) * PI * 3.2 + this._shapeSeed) * 0.16 : 0) -
            (t < 0.24 ? sin((0.24 - t) * PI * 2.5 + this._shapeSeed) * 0.10 : 0)
          ))));
      const curveY = wave * curveMag;
      const localRot = cos(t * PI * 1.5 + this.wavePhase * 0.36) * (this._flexBend ? 0.055 : 0.04);
      const segThickVar = segThick * (1 + 0.05 * sin(t * PI * 2 + this.wavePhase));
      const sx = i * segLen;
      push();
      translate(sx + segLen / 2, curveY);
      rotate(localRot);
      image(
        this.cloud.pg,
        0,
        0,
        this._f2StretchSchliere ? segLen * 6.2 : (this._fleckSchliere ? segLen * 4.4 : segLen * 3.25),
        this._f2StretchSchliere ? segThickVar * 1.15 : (this._fleckSchliere ? segThickVar * 0.94 : segThickVar * 0.58)
      );
      pop();
    }
    // Optional: lokale Verdickung an zufälliger Stelle (40% der Schlieren).
    if (this._hasThicken) {
      // tx in [-0.5, 0.5] → in lokalen Koord (nach -len/2 Translate): tx*len + len/2 = (tx+0.5)*len
      const tx = (this._thickenT + 0.5) * drawLen;
      const ty = sin((this._thickenT + 0.5) * PI + this.wavePhase * 0.3) * curveMag;
      const tw = drawLen * this._thickenLen;
      const th = segThick * this._thickenScale;
      image(this.cloud.pg, tx, ty, tw, th);
    }
    if (this._semInside) {
      const t = 0.48 + 0.12 * sin(this.wavePhase * 0.28 + this._semSeed);
      const wave = this._flexBend
        ? (
            sin(t * PI * 1.08 + this.wavePhase * 0.46) * (0.58 + 0.42 * t) +
            sin(t * PI * 2.65 - this.wavePhase * 0.34) * (0.12 + abs(t - 0.5) * 0.62) +
            sin((t - 0.18) * PI * 4.1 + this.wavePhase * 0.22) * 0.16 * t
          )
        : sin(t * PI * 1.28 + this.wavePhase * 0.48) + sin(t * PI * 2.0 - this.wavePhase * 0.22) * 0.18;
      const sx = t * drawLen;
      const sy = wave * curveMag;
      drawingContext.save();
      drawingContext.globalAlpha *= 0.48;
      drawingContext.filter = 'blur(1.1px)';
      noFill();
      stroke(126, 126, 142, 80);
      strokeWeight(Math.max(0.45, segThick * 0.34));
      const rr = Math.max(3, segThick * 0.95);
      ellipse(sx - rr * 0.72, sy - rr * 0.12, rr * 1.05, rr * 0.68);
      ellipse(sx + rr * 0.62, sy + rr * 0.18, rr * 0.86, rr * 0.58);
      drawingContext.filter = 'none';
      drawingContext.restore();
    }
    if (this._midThicken) {
      const t = 0.48 + 0.06 * sin(this.wavePhase * 0.33 + this._shapeSeed);
      const wave = this._flexBend
        ? (this._midThicken
          ? (
              sin(t * PI * 0.72 + this.wavePhase * 0.32) * (0.38 + 0.34 * t) +
              sin((t - 0.22) * PI * 2.9 - this.wavePhase * 0.21) * (0.18 + t * 0.36) +
              (t > 0.62 ? sin((t - 0.62) * PI * 3.4 + this._shapeSeed) * 0.26 : 0) -
              (t < 0.28 ? sin((0.28 - t) * PI * 2.7 + this._shapeSeed) * 0.18 : 0)
            )
          : (
            sin(t * PI * 1.08 + this.wavePhase * 0.46) * (0.58 + 0.42 * t) +
            sin(t * PI * 2.65 - this.wavePhase * 0.34) * (0.12 + abs(t - 0.5) * 0.62) +
            sin((t - 0.18) * PI * 4.1 + this.wavePhase * 0.22) * 0.16 * t +
            sin(t * PI * 6.0 + this._shapeSeed) * 0.055
          ))
        : (this._centerDarkComplex
          ? (
              sin(t * PI * 0.58 + this.wavePhase * 0.18) * (0.18 + t * 0.40) +
              sin((t - 0.32) * PI * 3.4 - this.wavePhase * 0.20) * (0.22 + abs(t - 0.5) * 0.26) +
              (t > 0.56 ? sin((t - 0.56) * PI * 5.0 + this._shapeSeed) * 0.22 : 0) -
              (t < 0.22 ? sin((0.22 - t) * PI * 4.0 + this._shapeSeed) * 0.16 : 0)
            )
          : (this._centerLongWave
          ? (
              sin(t * PI * 3.6 + this.wavePhase * 0.18) * 0.34 +
              sin(t * PI * 6.8 - this.wavePhase * 0.12 + this._shapeSeed) * 0.18 +
              sin(t * PI * 1.2 + this._shapeSeed) * 0.10
            )
          : (this._angledSchliere
          ? (
              (t < 0.38
                ? sin(t * PI * 0.42 + this.wavePhase * 0.18) * 0.18 + t * 0.95
                : 0.36 + sin((t - 0.38) * PI * 0.70 + this.wavePhase * 0.22) * 0.20 - (t - 0.38) * 0.34) +
              sin(t * PI * 3.8 + this._shapeSeed) * 0.045
            )
          : (
            sin(t * PI * 0.82 + this.wavePhase * 0.36) * (0.28 + 0.32 * t) +
            sin((t - 0.18) * PI * 2.7 - this.wavePhase * 0.18) * (0.10 + abs(t - 0.55) * 0.34) +
            (t > 0.68 ? sin((t - 0.68) * PI * 3.2 + this._shapeSeed) * 0.16 : 0) -
            (t < 0.24 ? sin((0.24 - t) * PI * 2.5 + this._shapeSeed) * 0.10 : 0)
          ))));
      drawingContext.save();
      drawingContext.globalAlpha *= 0.28;
      image(this.cloud.pg, t * drawLen, wave * curveMag, drawLen * 0.16, segThick * 1.05);
      drawingContext.restore();
    }
    pop();
    drawingContext.filter = 'none';
    pop();
  }
}


/* =========================================================
 * BLOB PATCH – flächige, leicht transparente Patches
 * Statt länglicher Schlieren: rundlich-organische Flecken.
 * Jedes Patch bewegt sich individuell (eigene Speed/Drift/Phase).
 * ========================================================= */
const BLOB_PATCH_COUNT     = 10;
const BLOB_PATCH_TINT      = [150, 158, 178];
const BLOB_PATCH_ALPHA_MIN = 0.20;
const BLOB_PATCH_ALPHA_MAX = 0.34;
const BLOB_PATCH_SIZE_MIN  = 130 * SCALE;
const BLOB_PATCH_SIZE_MAX  = 240 * SCALE;
const BLOB_PATCH_FEATHER   = 1.3;
const BLOB_PATCH_BLUR_PX   = 10;

class BlobPatch {
  constructor(cx, cy) {
    this.start  = createVector(cx, cy);
    this.pos    = this.start.copy();
    this.vel    = createVector(0, 0);
    this.acc    = createVector(0, 0);
    this.target = this.pos.copy();

    this.size       = random(BLOB_PATCH_SIZE_MIN, BLOB_PATCH_SIZE_MAX);
    this.aspect     = random(0.75, 1.35); // leicht oval, aber flächig
    this.rotation   = random(TWO_PI);
    this.rotSpeed   = random(-0.0035, 0.0035);

    // Individuelle Bewegungs-Charakteristik – jedes Patch unterschiedlich
    this.speedMult    = random(0.35, 1.05);
    this.steerMult    = random(0.4, 1.1);
    this.driftRange   = random(60, 140);
    this.followGain   = random(0.06, 0.20) * (random() < 0.5 ? -1 : 1);
    this.wobblePhase  = random(TWO_PI);
    this.wobbleSpeed  = random(0.006, 0.018);
    this.wobbleAmp   = random(0.4, 1.1);

    const a = random(BLOB_PATCH_ALPHA_MIN, BLOB_PATCH_ALPHA_MAX);
    // leichte Tint-Variation pro Patch
    const tVar = random(-12, 12);
    const tint = [
      constrain(BLOB_PATCH_TINT[0] + tVar, 120, 220),
      constrain(BLOB_PATCH_TINT[1] + tVar, 120, 220),
      constrain(BLOB_PATCH_TINT[2] + tVar, 130, 230)
    ];
    this.cloud = new NoiseCloud(0, 0, CLOUD_RES, tint, a, BLOB_PATCH_FEATHER);
  }

  update(isMoving, oppositeMovement = null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 25) {
        this.target.x = this.start.x + random(-this.driftRange, this.driftRange);
        this.target.y = this.start.y + random(-this.driftRange, this.driftRange);
      }
      const desired = p5.Vector.sub(this.target, this.pos)
        .setMag(DRIFT_DESIRED_SPEED * 0.4 * this.speedMult);
      const steer = p5.Vector.sub(desired, this.vel)
        .limit(DRIFT_STEER_LIMIT * 0.5 * this.steerMult);
      this.acc.add(steer);

      if (oppositeMovement) {
        // sanftes Wobble überlagert: jedes Patch hat eigene Phase
        const wob = sin(this.wobblePhase) * this.wobbleAmp;
        const followed = oppositeMovement.copy().mult(this.followGain);
        followed.add(cos(this.wobblePhase) * wob, sin(this.wobblePhase * 0.7) * wob);
        this.acc.add(followed);
      }
    } else {
      const toStart = p5.Vector.sub(this.start, this.pos);
      const d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR * 2) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * 0.5 * d);
        this.vel.mult(0.92);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * 0.7 * d);
      }
      this.acc.add(toStart);
    }

    this.wobblePhase += this.wobbleSpeed;
    this.rotation   += this.rotSpeed;

    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.5 * this.speedMult);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    drawingContext.filter = `blur(${BLOB_PATCH_BLUR_PX}px)`;
    imageMode(CENTER);
    image(this.cloud.pg, 0, 0, this.size * this.aspect, this.size);
    drawingContext.filter = 'none';
    pop();
  }
}



/* =========================================================
 * MICRO-CIRCLE CLUSTER (6 Kreise) – drift + follow
 * ========================================================= */
class MicroCircleCluster {
  constructor(cx, cy, baseR, circleR) {
    this.start  = createVector(cx, cy);
    this.pos    = this.start.copy();
    this.vel    = createVector(0,0);
    this.acc    = createVector(0,0);
    this.target = this.pos.copy();

    this.baseR  = baseR;
    this.circleR= circleR;
    this.points = [];
    this.build();
  }

  build() {
    this.points = [];
    const stepA = TWO_PI / MICRO_CIRCLE_COUNT;
    for (let i=0;i<MICRO_CIRCLE_COUNT;i++){
      const a = stepA*i + random(-stepA*MICRO_CIRCLE_JITTER_A, stepA*MICRO_CIRCLE_JITTER_A);
      const r = this.baseR * (1 + random(-MICRO_CIRCLE_JITTER_R, MICRO_CIRCLE_JITTER_R));
      const x = cos(a)*r;
      const y = sin(a)*r;
      // Individuelle Drift pro Punkt
      this.points.push({
        x, y, baseX: x, baseY: y,
        offsetX: 0, offsetY: 0,
        driftSpeed: random(0.005, 0.02),
        driftRadius: random(2, 6),
        driftPhase: random(TWO_PI)
      });
    }
  }

  update(isMoving, xRange=[0,1], yRange=[0,1], speedScale=MICRO_CLUSTER_SPEED_SCALE, followVec=null, followGain=0) {
    if (isMoving){
      if (p5.Vector.dist(this.pos, this.target) < 30) {
        this.target.x = map(random(),0,1,width  * xRange[0], width  * xRange[1]);
        this.target.y = map(random(),0,1,height * yRange[0], height * yRange[1]);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * speedScale);
      let steer   = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * speedScale);
      this.acc.add(steer);
    } else {
      // sanft zurück zur Startposition
      let toStart = p5.Vector.sub(this.start, this.pos);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR*2) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N*0.6*d);
        this.vel.mult(0.92);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F*0.8*d);
      }
      this.acc.add(toStart);
    }

    if (followVec && followGain !== 0) {
      this.acc.add(p5.Vector.mult(followVec, followGain));
    }

    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.8);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
    
    // Individuelle Punkt-Drift
    this.points.forEach(pt => {
      pt.driftPhase += pt.driftSpeed;
      pt.x = pt.baseX + cos(pt.driftPhase) * pt.driftRadius;
      pt.y = pt.baseY + sin(pt.driftPhase * 0.7) * pt.driftRadius;
    });
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    drawingContext.filter = 'blur(2.5px)';
    this.points.forEach(pt=>{
      // Äußerer transparenter Glow – weisslich
      noStroke();
      fill(230, 235, 245, 12);
      ellipse(pt.x, pt.y, this.circleR*4.5, this.circleR*4.2);
      // Gel-Membran – weisslich transparent
      stroke(220, 225, 240, 18);
      strokeWeight(this.circleR*0.2);
      noFill();
      ellipse(pt.x, pt.y, this.circleR*3.0, this.circleR*2.8);
      // Innere transparente Struktur – weisslich
      noStroke();
      fill(225, 230, 245, 14);
      ellipse(pt.x, pt.y, this.circleR*1.4, this.circleR*1.3);
    });
    drawingContext.filter = 'none';
    pop();
  }
}


/* =========================================================
 * ELONGATED CIRCLE CLUSTER – längliche Kreismuster
 * ========================================================= */
class ElongatedCircleCluster {
  constructor(cx, cy, countCircles, length, angle) {
    this.start = createVector(cx, cy);
    this.pos   = this.start.copy();
    this.vel   = createVector(0,0);
    this.acc   = createVector(0,0);
    this.target= this.pos.copy();
    this.angle = angle;
    this.length = length;
    this.circleCount = countCircles;
    this.circleR = 4 * SCALE;
    this.points = this.buildPoints();
  }

  buildPoints() {
    let pts = [];
    for (let i = 0; i < this.circleCount; i++) {
      let t = (i / (this.circleCount - 1)) - 0.5;
      let x = t * this.length;
      let y = sin(t * PI * 2) * this.length * 0.08 + random(-3, 3);
      pts.push({x, y, baseX: x, baseY: y,
        driftSpeed: random(0.005, 0.02),
        driftRadius: random(1.5, 4),
        driftPhase: random(TWO_PI)
      });
    }
    return pts;
  }

  update(isMoving, followVec=null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 30) {
        this.target.x = this.start.x + random(-35, 35);
        this.target.y = this.start.y + random(-35, 35);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * 0.6);
      let steer = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * 0.6);
      this.acc.add(steer);
      if (followVec) {
        this.acc.add(p5.Vector.mult(followVec, -0.12));
      }
    } else {
      let toStart = p5.Vector.sub(this.start, this.pos);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR * 2) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * 0.6 * d);
        this.vel.mult(0.92);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * 0.8 * d);
      }
      this.acc.add(toStart);
    }
    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.6);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
    // Individuelle Punkt-Drift
    this.points.forEach(pt => {
      pt.driftPhase += pt.driftSpeed;
      pt.x = pt.baseX + cos(pt.driftPhase) * pt.driftRadius;
      pt.y = pt.baseY + sin(pt.driftPhase * 0.8) * pt.driftRadius;
    });
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    drawingContext.filter = 'blur(2.5px)';
    this.points.forEach(pt => {
      // Äußerer transparenter Glow – weisslich
      noStroke();
      fill(230, 235, 245, 12);
      ellipse(pt.x, pt.y, this.circleR * 4.5, this.circleR * 4.2);
      // Gel-Membran – weisslich transparent
      stroke(220, 225, 240, 18);
      strokeWeight(this.circleR * 0.2);
      noFill();
      beginShape();
      for (let i = 0; i <= 10; i++) {
        let a = (i / 10) * TWO_PI;
        let rVar = this.circleR * 1.8 * (1 + 0.15 * sin(a * 3 + pt.x));
        curveVertex(pt.x + cos(a) * rVar, pt.y + sin(a) * rVar * 0.9);
      }
      endShape(CLOSE);
      // Innere transparente Struktur – weisslich
      noStroke();
      fill(225, 230, 245, 14);
      ellipse(pt.x, pt.y, this.circleR * 1.4, this.circleR * 1.3);
    });
    drawingContext.filter = 'none';
    pop();
  }
}

/* ======= Dunkler Fleck links – Parameter ======= */
const DARK_FLECK_LEFT_POS_XF    = 0.25;
const DARK_FLECK_LEFT_POS_YF    = 0.57;
const DARK_FLECK_LEFT_SIZE      = CLOUD_SMALLER_SIZE * 0.50 * 0.8;  // kleiner
const DARK_FLECK_LEFT_TINT      = [140,140,140];  // dunkler
const DARK_FLECK_LEFT_ALPHA     = 0.28;  // dunkler
const DARK_FLECK_LEFT_FEATHER   = 1.7;
const DARK_FLECK_LEFT_FOLLOW    = -0.10;
const DARK_FLECK_LEFT_SPEED     = 0.20;
const DARK_FLECK_LEFT_ASPECT    = 1.6;  // horizontal gestreckt

/* =========================================================
 * GEL BLOB CHAIN – kettenartige Gel-Flecken (3 zusammengedrückt)
 * ========================================================= */
class GelBlobChain {
  constructor(cx, cy, angle) {
    this.start = createVector(cx, cy);
    this.pos   = this.start.copy();
    this.vel   = createVector(0,0);
    this.acc   = createVector(0,0);
    this.target= this.pos.copy();
    this.angle = angle;
    // 3 Blobs wie zusammengedrückte Kreise
    this.blobs = [];
    const spacing = random(12, 20) * SCALE;
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * spacing;
      const rx = random(5, 10) * SCALE * 2.5;
      const ry = random(4, 8) * SCALE * 2.5;
      const perpOff = random(-4, 4) * SCALE;
      this.blobs.push({x: offset, y: perpOff, rx, ry});
    }
  }

  update(isMoving, followVec=null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 30) {
        this.target.x = this.start.x + random(-35, 35);
        this.target.y = this.start.y + random(-35, 35);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED * 0.5);
      let steer = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT * 0.5);
      this.acc.add(steer);
      if (followVec) {
        this.acc.add(p5.Vector.mult(followVec, -0.10));
      }
    } else {
      let toStart = p5.Vector.sub(this.start, this.pos);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR * 2) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * 0.6 * d);
        this.vel.mult(0.92);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * 0.8 * d);
      }
      this.acc.add(toStart);
    }
    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT * 0.5);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    drawingContext.filter = 'blur(3px)';
    this.blobs.forEach(b => {
      // Äußerer transparenter Glow – weisslich-geisterhaft
      noStroke();
      fill(230, 235, 245, 12);
      ellipse(b.x, b.y, b.rx * 3.5, b.ry * 3.5);
      // Transparente Membran – weisslich
      stroke(220, 225, 240, 18);
      strokeWeight(1.0 * SCALE);
      noFill();
      ellipse(b.x, b.y, b.rx * 2.2, b.ry * 2.2);
      // Transparenter Kern – weisslich
      noStroke();
      fill(225, 230, 245, 14);
      ellipse(b.x, b.y, b.rx * 1.3, b.ry * 1.3);
    });
    drawingContext.filter = 'none';
    pop();
  }
}

/* =========================================================
 * FLOATER-PFAD (gelartig, segmentiert)
 * ========================================================= */
class FloaterPath {
  constructor(x, y) {
    this.base = createVector(x,y);
    this.pos  = this.base.copy();
    this.vel  = createVector(0,0);
    this.acc  = createVector(0,0);
    this.target = this.pos.copy();

    this.shape = this.buildCustomShapeFromImage();
    this.segments = this.buildGelSegments(this.shape, SEG_STEP_DIST);
    this.dots     = this.buildGelDots(this.shape, DOT_STEP_DIST);

    this.fleckLocal = createVector(FLECK_OFFSET_X, FLECK_OFFSET_Y);
    this.fleckCenterLocal = createVector(FLECK_OFFSET_X, FLECK_OFFSET_Y); // Feste Position für Fleck

    this.squish = 1;
    this.roll   = 0;
    this.lengthStretch = 1; // Längsstreckung für Gummispiral-Effekt
    this.rotation = 0; // Rotation gegen Uhrzeigersinn
    this.baseRotation = 0;
    this.rotationFromSquish = 0; // Zusätzliche Rotation während Stauchung

    this.pathThickness = FLOATER_LAYER_COUNT * FLOATER_STROKE_SCALE * 2.0;
  }

  update(isMoving, mouseVelMag, mouseDXNorm, oppositeMovement=null) {
    if (isMoving) {
      if (p5.Vector.dist(this.pos, this.target) < 20) {
        this.target.x = random(width);
        this.target.y = random(height);
      }
      let desired = p5.Vector.sub(this.target, this.pos).setMag(DRIFT_DESIRED_SPEED);
      let steer   = p5.Vector.sub(desired, this.vel).limit(DRIFT_STEER_LIMIT);
      this.acc.add(steer);
      
      // Floater bewegt sich IN Mausrichtung mit (zusätzlich zur bestehenden Physik).
      // oppositeMovement ist der invertierte Maus-Vektor → re-invertieren für Mausrichtung.
      if (oppositeMovement) {
        if (directionChangeBoost > 1.2) this.vel.mult(0.60);
        const mouseDir = p5.Vector.mult(oppositeMovement, -1);
        steerVelocityTowardMouse(this.vel, mouseDir, 0.26);
        // Hauptbeitrag: in Mausrichtung
        this.acc.add(p5.Vector.mult(mouseDir, 0.14));
        // Schwacher Rest des originalen Gegenzugs für Trägheits-Charakter
        this.acc.add(p5.Vector.mult(oppositeMovement, 0.03));

        // Richtungsabhängige Rotation: links = gegen Uhrzeigersinn, rechts = im Uhrzeigersinn
        this.baseRotation = 0;

        // Stauchungs-Rotation kombiniert (1/3 Umdrehung bei starker Bewegung)
        this.rotationFromSquish = 0;
      }
    } else {
      const rsx = (restShift && restShift.x) || 0;
      const rsy = (restShift && restShift.y) || 0;
      const home = createVector(this.base.x + rsx * 0.85, this.base.y + rsy * 0.85);
      let toStart = p5.Vector.sub(home, this.pos);
      let d = toStart.mag();
      if (d < DRIFT_RETURN_NEAR) {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_N * 1.25 * d);
        this.vel.mult(0.55);
      } else {
        toStart.normalize().mult(DRIFT_RETURN_GAIN_F * 1.35 * d);
      }
      this.acc.add(toStart);
      
      // Zurück zu normaler Rotation
      this.baseRotation = 0;
      this.rotationFromSquish = 0;
    }

    this.rotation = 0;
    this.vel.add(this.acc).limit(DRIFT_VEL_LIMIT);
    this.pos.add(this.vel);
    containElementPosition(this.pos, this.vel, this.pathThickness || 60);
    this.acc.mult(0);
    this.vel.mult(DRIFT_DAMP);

    const ms = constrain(mouseVelMag/32, 0, 1);
    const targetSquish = 1 - FLOATER_SQUISH_MAX * ms * 2.0; // stärkere Stauchung
    this.squish = 1;
    this.roll = 0;
    
    // Stärkere Längsstreckung basierend auf Bewegung - Gummispiral-Effekt
    const targetLengthStretch = isMoving ? (1 - ms * 0.5) : 1; // stärkere Stauchung
    this.lengthStretch = 1;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(1, 1);

    this.displayFloater();
    
    // Unscharfer Fleck wird um rotationFromSquish rotiert
    push();
    translate(this.fleckLocal.x, this.fleckLocal.y);
    translate(-this.fleckLocal.x, -this.fleckLocal.y);
    this.drawFleckLocal(this.fleckLocal.x, this.fleckLocal.y);
    pop();
    
    pop();
  }

  displayFloater() {
    push();
    scale(this.lengthStretch * 0.92, 1);  // minimal horizontal zusammengestaucht

    // 1) Äußerster Gel-Glow – breit, sichtbar transparent, leicht weisslicher
    drawingContext.filter = 'blur(8px)';
    noFill();
    stroke(180, 188, 205, 2.5);
    strokeWeight(20);
    beginShape();
    this.shape.forEach(p => curveVertex(p.x, p.y));
    endShape();
    drawingContext.filter = 'none';

    // 2) Mittlerer Gel-Body – schärfer, weisslicher
    drawingContext.filter = 'blur(2.6px)';
    noFill();
    for (let s = 8; s > 0; s--) {
      stroke(165, 175, 195, 2 + s * 0.42);
      strokeWeight(s * 1.56);
      beginShape();
      this.shape.forEach(p => curveVertex(p.x, p.y));
      endShape();
    }
    drawingContext.filter = 'none';

    // 3) Innere Membran-Kontur – deutlich schärfer
    drawingContext.filter = 'blur(1.2px)';
    stroke(180, 188, 205, 22);
    strokeWeight(1.7);
    noFill();
    beginShape();
    this.shape.forEach(p => curveVertex(p.x, p.y));
    endShape();

    // 4) Zweite feinere Membran-Linie innen – noch schärfer
    drawingContext.filter = 'blur(0.55px)';
    stroke(205, 212, 225, 20);
    strokeWeight(0.9);
    beginShape();
    this.shape.forEach(p => curveVertex(p.x * 0.92, p.y * 0.92));
    endShape();
    drawingContext.filter = 'none';

    // 5) Segmentbänder – bakterienartige Querstreifen
    stroke(120, 135, 160, 6);
    strokeWeight(SEG_THICK * 0.8);
    noFill();
    this.segments.forEach(seg => {
      push();
      translate(seg.cx, seg.cy);
      rotate(seg.angle + HALF_PI);
      line(-SEG_LENGTH * 0.4, 0, SEG_LENGTH * 0.4, 0);
      pop();
    });

    // 6) Gel-Dots – Organellen im Inneren
    noStroke();
    this.dots.forEach((d, i) => {
      const ph = (frameCount * 0.02 + d.phase) % TWO_PI;
      const a = lerp(3, 8, (sin(ph) + 1) * 0.5);
      fill(130, 145, 170, a);
      ellipse(d.x, d.y, d.r * 2, d.r * 2);
    });

    // Durchgehender duenner Rahmen um die helle wurstige Linie.
    const drawOffsetPath = (dist) => {
      beginShape();
      this.shape.forEach((p, i) => {
        const prev = this.shape[max(0, i - 1)];
        const next = this.shape[min(this.shape.length - 1, i + 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = max(0.001, sqrt(dx * dx + dy * dy));
        const nx = -dy / len;
        const ny = dx / len;
        curveVertex(p.x + nx * dist, p.y + ny * dist);
      });
      endShape();
    };

    drawingContext.filter = 'blur(1.05px)';
    noFill();
    stroke(28, 32, 40, 26);
    strokeWeight(0.72);
    drawOffsetPath(5.4);
    drawOffsetPath(-5.4);
    drawingContext.filter = 'none';

    pop();
  }

  displayHFClone(offsetY, label, mode='soft') {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.roll);
    scale(this.squish, 1 + (1 - this.squish) * 0.15);
    translate(0, offsetY);
    scale(this.lengthStretch * 0.92, 1);
    noFill();

    drawingContext.filter = 'blur(3.2px)';
    for (let s = 7; s > 0; s--) {
      stroke(190, 202, 218, mode === 'old' ? 2.3 + s * 0.28 : 1.6 + s * 0.22);
      strokeWeight(s * (mode === 'old' ? 1.25 : 1.05));
      beginShape();
      this.shape.forEach(p => curveVertex(p.x, p.y));
      endShape();
    }
    if (mode === 'old') {
      drawingContext.filter = 'blur(0.45px)';
      stroke(16, 18, 24, 54);
      strokeWeight(0.62);
      beginShape();
      this.shape.forEach(p => curveVertex(p.x * 1.035, p.y * 1.035));
      endShape();
      stroke(16, 18, 24, 46);
      strokeWeight(0.52);
      beginShape();
      this.shape.forEach(p => curveVertex(p.x * 0.935, p.y * 0.935));
      endShape();
    } else {
      drawingContext.filter = 'blur(0.8px)';
      stroke(58, 62, 72, 24);
      strokeWeight(1.0);
      beginShape();
      this.shape.forEach(p => curveVertex(p.x, p.y));
      endShape();
    }

    if (mode !== 'old') {
      drawingContext.filter = 'blur(1px)';
      noStroke();
      this.dots.forEach((d, i) => {
        if (i % 2 !== 0) return;
        fill(100, 116, 140, 5.5);
        ellipse(d.x, d.y, d.r * 2.0, d.r * 1.6);
      });
    }
    drawingContext.filter = 'none';

    pop();
    drawSceneLabel(label, this.pos.x + 34, this.pos.y + offsetY - 34);
  }

  displayGlassUnderlay() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.roll);
    scale(this.squish, 1 + (1 - this.squish) * 0.15);
    scale(this.lengthStretch * 0.92, 1);
    noFill();

    drawingContext.filter = 'blur(0.9px)';
    noStroke();
    this.shape.forEach((p, i) => {
      if (i % 2 !== 0) return;
      const jitter = sin(i * 12.9898) * 2.1;
      const side = (i % 4 < 2) ? 1 : -1;
      fill(18, 22, 30, 58);
      ellipse(p.x + jitter, p.y + side * (1.4 + abs(jitter) * 0.35), 2.2, 1.7);
      if (i % 6 === 0) {
        fill(235, 248, 255, 20);
        ellipse(p.x - jitter * 0.5, p.y - side * 1.1, 1.8, 1.3);
      }
    });
    drawingContext.filter = 'none';

    pop();
  }

  drawFleckLocal(lx, ly) {
    if (!floaterFleckCloud) return;
    push();
    translate(lx, ly);
    drawingContext.filter = `blur(${FLECK_SUPER_BLUR_PX}px)`;
    imageMode(CENTER);
    image(floaterFleckCloud.pg, 0, 0, FLECK_SUPER_DRAW_W, FLECK_SUPER_DRAW_H);
    drawingContext.filter = 'none';
    pop();
  }

  drawFloaterCircles() {
    const [tr, tg, tb] = FLOATER_LAYER_TINT;
    const floaterDiam = this.pathThickness;
    const rMain  = floaterDiam * 0.5;
    const rSmall = rMain * FP_SMALL_SCALE;
    const px1 = -rMain * FP_DIST_MAIN;
    const py1 =  rMain * FP_DIST_MAIN_Y;
    const px2 = -rMain * FP_DIST_SMALL;
    const py2 =  rMain * FP_DIST_SMALL_Y;

    stroke(tr, tg, tb, FP_ALPHA_OUTER);
    strokeWeight(rMain * 0.9);
    noFill();
    ellipse(px1, py1, rMain * 2, rMain * 2);
    noStroke();
    fill(tr, tg, tb, FP_ALPHA_INNER);
    ellipse(px1, py1, rMain * 1.1, rMain * 1.1);

    stroke(tr, tg, tb, FP_ALPHA_OUTER);
    strokeWeight(rSmall * 0.9);
    noFill();
    ellipse(px2, py2, rSmall * 2, rSmall * 2);
    noStroke();
    fill(tr, tg, tb, FP_ALPHA_INNER);
    ellipse(px2, py2, rSmall * 1.1, rSmall * 1.1);
  }

  drawExternalBubbles() {
    const [tr, tg, tb] = FLOATER_LAYER_TINT;
    const rBase = this.pathThickness * 0.5;
    [EXT_FP_OFFSET2].forEach(b=>{
      const bx = this.pos.x + b.x;
      const by = this.pos.y + b.y;
      const r  = rBase * b.scale;
      stroke(tr,tg,tb,EXT_FP_ALPHA_OUTER);
      strokeWeight(r*0.9);
      noFill();
      ellipse(bx,by,r*2,r*2);
      noStroke();
      fill(tr,tg,tb,EXT_FP_ALPHA_INNER);
      ellipse(bx,by,r*1.15,r*1.15);
    });
  }

  buildGelSegments(path, stepDist) {
    const segs = [];
    const cum = [0];
    for (let i = 1; i < path.length; i++) {
      cum[i] = cum[i - 1] + p5.Vector.dist(path[i - 1], path[i]);
    }
    const total = cum[cum.length - 1];
    for (let s = stepDist; s < total; s += stepDist) {
      let idx = 0;
      while (idx < cum.length - 1 && cum[idx + 1] < s) idx++;
      const segStart = cum[idx];
      const segEnd   = cum[idx + 1];
      const t = (s - segStart) / (segEnd - segStart);
      const a = path[idx];
      const b = path[idx + 1];
      const cx = lerp(a.x, b.x, t);
      const cy = lerp(a.y, b.y, t);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const angle = atan2(dy, dx);
      segs.push({ cx, cy, angle });
    }
    return segs;
  }

  buildGelDots(path, stepDist) {
    const dots = [];
    const cum = [0];
    for (let i = 1; i < path.length; i++) {
      cum[i] = cum[i - 1] + p5.Vector.dist(path[i - 1], path[i]);
    }
    const total = cum[cum.length - 1];
    for (let s = 0; s <= total; s += stepDist) {
      let idx = 0;
      while (idx < cum.length - 1 && cum[idx + 1] < s) idx++;
      const segStart = cum[idx];
      const segEnd   = cum[idx + 1];
      const t = (s - segStart) / (segEnd - segStart);
      const a = path[idx];
      const b = path[idx + 1];
      const x = lerp(a.x, b.x, t);
      const y = lerp(a.y, b.y, t);
      const posNorm = s / total;
      const r = lerp(DOT_SIZE_MAX, DOT_SIZE_MIN, posNorm);
      dots.push({ x, y, r, phase: random(TWO_PI) });
    }
    return dots;
  }

  buildCustomShapeFromImage() {
    let shape = [];
    shape.push(createVector(-220, -10));
    shape.push(createVector(-210, -15));
    shape.push(createVector(-200,  -5));
    shape.push(createVector(-180,   5));
    shape.push(createVector(-160,  20));
    shape.push(createVector(-150,   0));
    shape.push(createVector(-140,  25));
    shape.push(createVector(-120,   5));
    shape.push(createVector( -80, -10));
    shape.push(createVector( -40,  20));
    shape.push(createVector( -10,  -5));
    shape.push(createVector(  40,   0));
    shape.push(createVector(  80,  -5));
    shape.push(createVector( 120,  10));
    shape.push(createVector( 160,  15));
    shape.push(createVector( 200,  20));

    const vX = -10, vY = -5;
    shape = shape.map(p => createVector((p.x - vX)*SCALE, (p.y - vY)*SCALE));

    const angle = radians(-10);
    shape = shape.map(p => {
      const x = p.x * cos(angle) - p.y * sin(angle);
      const y = p.x * sin(angle) + p.y * cos(angle);
      return createVector(x, y);
    });

    return shape;
  }
}


/* =========================================================
 * DEBUG MARKER (generic, currently unused)
 * ========================================================= */

/* =========================================================
 * KLEINER RUNDLICHER FLOATER (ähnlich groß wie weißliche Elemente)
 * ========================================================= */
class LFloaterPath extends FloaterPath {
  constructor(x, y) {
    super(x, y);
  }

  buildCustomShapeFromImage() {
    let shape = [];
    const s = SCALE * 0.08; // sehr klein, ähnlich wie weißliche Punkte
    // Annähernd runde/ovale Form
    const segments = 14;
    const rx = 80 * s;
    const ry = 70 * s;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * TWO_PI;
      const jx = random(-3, 3) * s;
      const jy = random(-3, 3) * s;
      shape.push(createVector(cos(a) * rx + jx, sin(a) * ry + jy));
    }

    return shape;
  }
}

function drawDebugX(x, y, size, r, g, b, a=255, weight=2) {
  push();
  stroke(r,g,b,a);
  strokeWeight(weight);
  line(x-size, y-size, x+size, y+size);
  line(x-size, y+size, x+size, y-size);
  pop();
}


/* =========================================================
 * p5 SETUP
 * ========================================================= */
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  prevMouse = createVector(mouseX, mouseY);
  mouseRestPos = createVector(width * 0.5, height * 0.5);
  restShift = createVector(0, 0);
  noiseSeed(floor(random(1e9)));
  queueSceneBuild();
}


/* =========================================================
 * Hilfsfunktion: Micro-Cluster neu aufbauen (Setup & Resize)
 * ========================================================= */
function buildMicroCluster() {
  // Radius der einzelnen Kreise relativ zur Floaterdicke
  const circleR = (floater ? floater.pathThickness : 20) * MICRO_CIRCLE_BASE_R_RATIO;
  const cx = width * MICRO_CLUSTER_POS_XF;
  const cy = height * MICRO_CLUSTER_POS_YF;
  microCluster = new MicroCircleCluster(cx, cy, MICRO_CLUSTER_RADIUS_PX, circleR);
}

function queueSceneBuild() {
  sceneReady = false;
  sceneBuildQueue = [];

  biggerCloud = null;
  smallerCloud = null;
  upperLeftGreyCloud = null;
  f2CenterCopies = [];
  whiteSuperfleck = null;
  floaterFleckCloud = null;
  microCluster = null;
  smallPoints = [];
  lightFloater1 = null;
  lightFloater2 = null;
  elongCircleCluster1 = null;
  elongCircleCluster2 = null;
  darkFleckLeft = null;
  schlierClouds = [];
  brightSchlierClouds = [];
  gelSchlierClouds = [];
  gelBlobChains = [];
  blobPatches = [];
  lFloater = null;
  nucleusDrops = [];
  roundTestPos = null;
  roundTestVel = null;
  neutestPos = null;
  neutestVel = null;
  slimeTestPos = null;
  slimeTestVel = null;

  sceneBuildQueue.push(() => {
    floater = new FloaterPath(width * FLOATER_POS_XF, height * FLOATER_POS_YF);
  });
  sceneBuildQueue.push(() => {
    biggerCloud = new NoiseCloud(
      width * SMALLER_POS_XF,
      height * SMALLER_POS_YF,
      CLOUD_SMALLER_SIZE,
      CLOUD_SMALLER_TINT,
      CLOUD_SMALLER_ALPHA * 0.86,
      CLOUD_SMALLER_FEATHER * 1.32
    );
    upperLeftGreyCloud = new NoiseCloud(
      width * 0.18,
      height * 0.82,
      CLOUD_SMALLER_SIZE * 0.42,
      CLOUD_SMALLER_TINT,
      CLOUD_SMALLER_ALPHA * 0.58,
      CLOUD_SMALLER_FEATHER * 1.18
    );
    for (let i = 0; i < F2_CENTER_COPY_COUNT; i++) {
      const offsets = [
        [-0.055, -0.025],
        [0.020, 0.020],
        [0.080, -0.010]
      ][i] || [0, 0];
      const copySizes = [0.24, 0.18, 0.29];
      f2CenterCopies.push(new NoiseCloud(
        width * (0.50 + offsets[0]),
        height * (0.52 + offsets[1]),
        CLOUD_SMALLER_SIZE * copySizes[i],
        CLOUD_SMALLER_TINT,
        CLOUD_SMALLER_ALPHA * random(0.62, 0.76),
        CLOUD_SMALLER_FEATHER * 1.26
      ));
    }
  });
  sceneBuildQueue.push(() => {
    smallerCloud = new NoiseCloud(
      width * BIGGER_POS_XF,
      height * BIGGER_POS_YF,
      CLOUD_BIGGER_SIZE * 0.5,
      CLOUD_BIGGER_TINT,
      CLOUD_BIGGER_ALPHA,
      CLOUD_BIGGER_FEATHER
    );
  });
  // whiteSuperfleck entfernt (User-Request)
  // microCluster + smallPoints entfernt (weisse runde Elemente weg)
  // darkFleckLeft entfernt (User-Request)

  // Nucleus-Tropfen: Nucleus1 (Cluster), Nucleus2 (Semikolon), Nucleus3 (Ring) + Mini-Cluster-Gruppe
  sceneBuildQueue.push(() => {
    const gx = width  * NUCLEUS_DROP_GROUP_XF;
    const gy = height * NUCLEUS_DROP_GROUP_YF;
    const dropSize = NUCLEUS_DROP_BASE_SIZE;

    // === NUCLEUS 1 (3 verteilte Instanzen, jede aus 3 überlappenden Kreisen) ===
    const drop1Size = dropSize * 1.00 * 2.0 * 0.9 * 0.8;  // -20%
    function buildN1(cx, cy, label, seedBase) {
      const head = new NucleusDrop(cx, cy, drop1Size, 'normal');
      head.staticAnchor = true;
      head._alphaMul = 0.72;
      if (label) head._label = label;
      head._fiberOverlay = true;
      head._fiberSeed = seedBase;
      nucleusDrops.push(head);
      const o1x =  drop1Size * 0.18, o1y = -drop1Size * 0.20;
      const c1 = new NucleusDrop(cx + o1x, cy + o1y, drop1Size, 'normal');
      c1._alphaMul = 0.65;
      c1.semiTiedTo = head;
      c1.semiOffset = createVector(o1x, o1y);
      c1._fiberOverlay = true;
      c1._fiberSeed = seedBase + 2.6;
      nucleusDrops.push(c1);
      const o2x = -drop1Size * 0.14, o2y =  drop1Size * 0.16;
      const c2 = new NucleusDrop(cx + o2x, cy + o2y, drop1Size * 0.96, 'normal');
      c2._alphaMul = 0.60;
      c2.semiTiedTo = head;
      c2.semiOffset = createVector(o2x, o2y);
      c2._fiberOverlay = true;
      c2._fiberSeed = seedBase + 5.2;
      nucleusDrops.push(c2);
      return head;
    }
    // 3 N1-Instanzen, im Bild verteilt
    buildN1(gx - NUCLEUS_DROP_SPREAD_PX * 1.35, gy - NUCLEUS_DROP_SPREAD_PX * 0.55, 'Nucleus 1', 3.1);

    // === NUCLEUS 3 – Ring-Look (oberer Kreis kleiner, mittig, sichtbarer Rand) ===
    // 20% kleiner, weiter unten als zuvor.
    const n3Size = dropSize * 1.00 * 2.0 * 0.8 * 0.8;  // -20%
    const n3 = new NucleusDrop(
      gx - NUCLEUS_DROP_SPREAD_PX * 0.15,
      gy + NUCLEUS_DROP_SPREAD_PX * 0.95,                 // weiter unten
      n3Size,
      'normal'
    );
    n3.staticAnchor = true;
    n3.aspect = 0.99;            // fast rund
    n3.rot = 0;                  // keine Schräglage
    n3._alphaMul = 0.72;
    n3._label = 'Nucleus 3';
    nucleusDrops.push(n3);
    // Ring-Top: größer als das alte Top, mit ausgestanztem Zentrum,
    // sodass innen der Untergrund (n3) durchscheint und außen ein Ring bleibt.
    const n3RingSize = n3Size * 0.92;
    const n3Top = new NucleusDrop(n3.pos.x, n3.pos.y, n3RingSize, 'normal');
    n3Top.aspect = 0.99;
    n3Top.rot = 0;
    n3Top._alphaMul = 0.78;
    n3Top.staticAnchor = true;
    n3Top._skipSimpleGlassRefraction = true;
    n3Top._centerPunchHole = true;
    n3Top._holeRx = 0.62;
    n3Top._holeRy = 0.60;
    n3Top._holeFillAlpha = 0; // komplett offen, n3 darunter scheint durch
    n3Top.semiTiedTo = n3;
    n3Top.semiOffset = createVector(0, 0);
    nucleusDrops.push(n3Top);

    // === NUCLEUS 4 – 3 verteilte Instanzen, jede 20% kleiner ===
    const n4Size = (dropSize * 1.00 * 2.0 * 0.8) * 1.18 * 0.7 * 0.8;  // -20% gegenüber zuvor
    function buildN4(cx, cy, label) {
      const n4 = new NucleusDrop(cx, cy, n4Size, 'normal');
      n4.staticAnchor = true;
      n4.aspect = 1.24;
      n4.rot = 0;
      n4._alphaMul = 0.70;
      if (label) n4._label = label;
      n4._centerPunchHole = true;
      n4._holeRx = 0.46;
      n4._holeRy = 0.44;
      n4._holeFillAlpha = 0.008;
      n4._holeOffsetY = 0;
      nucleusDrops.push(n4);
      const n4TopSize = n4Size * 0.76;
      const n4TopOffY = n4Size * 0.12;
      const n4Top = new NucleusDrop(n4.pos.x, n4.pos.y + n4TopOffY, n4TopSize, 'normal');
      n4Top.aspect = 1.24;
      n4Top.rot = 0;
      n4Top._alphaMul = 0.74;
      n4Top.staticAnchor = true;
      n4Top._skipSimpleGlassRefraction = true;
      n4Top.semiTiedTo = n4;
      n4Top.semiOffset = createVector(0, n4TopOffY);
      nucleusDrops.push(n4Top);
      return n4;
    }
    buildN4(n3.pos.x + NUCLEUS_DROP_SPREAD_PX * 0.25, n3.pos.y + NUCLEUS_DROP_SPREAD_PX * 1.10, 'Nucleus 4');


    // === NUCLEUS 2 – Mini-Semikolon (zwei fix übereinanderliegende Kopien) ===
    // 10% kleiner insgesamt, Überlappungen etwas reduziert.
    // Startposition: etwas weiter unten, etwas links, recht mittig im Bild.
    const semiScale     = 2.0 * 0.9 * 0.8 * 0.5;           // Nucleus 2 50% kleiner
    const semiGap       = dropSize * 0.85;
    const semiGapTight  = semiGap * semiScale * 0.95;
    const semiBottomShiftX = -dropSize * 0.15;
    const semiShiftTight   = semiBottomShiftX * semiScale * 0.5;

    // Etwas tiefer im Bild positioniert
    const n2cx = width  * 0.46;
    const n2cy = height * 0.74;


    let _miniSemiAnchor = null;
    function buildMiniSemicolon(offsetX, offsetY, alphaMul, isFirst) {
      const baseTopX = n2cx + offsetX;
      const baseTopY = n2cy - semiGapTight * 0.5 + offsetY;
      const dTop = new NucleusDrop(baseTopX, baseTopY,
        dropSize * 0.85 * semiScale, 'round');
      dTop._alphaMul = alphaMul;
      dTop._speedClass = 'testFast';
      if (isFirst) {
        dTop.semiAnchor = true;
        dTop.staticAnchor = true;
        dTop._label = 'Nucleus 2';
        _miniSemiAnchor = dTop;
      } else {
        dTop.semiTiedTo = _miniSemiAnchor;
        dTop.semiOffset = createVector(
          baseTopX - _miniSemiAnchor.pos.x,
          baseTopY - _miniSemiAnchor.pos.y
        );
      }
      nucleusDrops.push(dTop);

      const baseBotX = n2cx + semiShiftTight + offsetX;
      const baseBotY = n2cy + semiGapTight * 0.5 + offsetY;
      const dBot = new NucleusDrop(baseBotX, baseBotY,
        dropSize * 1.15 * semiScale, 'elongated');
      dBot._speedClass = 'testFast';
      dBot.semiTiedTo = _miniSemiAnchor;
      dBot.semiOffset = createVector(
        baseBotX - _miniSemiAnchor.pos.x,
        baseBotY - _miniSemiAnchor.pos.y
      );
      dBot.rot = 0.6;
      dBot.phase = 0;
      dBot._alphaMul = alphaMul;
      nucleusDrops.push(dBot);

      // Runder Punkt am OBEREN Ende – Überlappung etwas reduziert
      const topExtraOffY = -dropSize * 0.62 * semiScale;   // war 0.55 → mehr Abstand
      const baseExX = n2cx + offsetX;
      const baseExY = n2cy - semiGapTight * 0.5 + offsetY + topExtraOffY;
      const dTopExtra = new NucleusDrop(baseExX, baseExY,
        dropSize * 0.78 * semiScale, 'round');
      dTopExtra._speedClass = 'testFast';
      dTopExtra.semiTiedTo = _miniSemiAnchor;
      dTopExtra.semiOffset = createVector(
        baseExX - _miniSemiAnchor.pos.x,
        baseExY - _miniSemiAnchor.pos.y
      );
      dTopExtra._alphaMul = alphaMul * 0.85;
      nucleusDrops.push(dTopExtra);
    }

    buildMiniSemicolon(0, 0, 0.70, true);
    // Versatz der zweiten Kopie etwas reduziert (weniger Überlapp - bzw. konsistent dichter)
    const dupOffsetX = dropSize * 0.16;
    const dupOffsetY = -dropSize * 0.19;
    buildMiniSemicolon(dupOffsetX, dupOffsetY, 0.55, false);

    // === Nuclei-Gruppe (kreisflächig-eiartig angeordnet, 14 Elemente, -10% gegenüber zuvor) ===
    const clusterCx = width  * 0.34;
    const clusterCy = height * 0.68;
    const miniBase  = dropSize * 1.00 * 2.0 * 0.20 * 2.0 * 1.24;
    let _clusterAnchor = null;

    // Hilfsfunktion: N1-artiges Trio (3 überlappende Kreise)
    function addMiniN1(offX, offY, scl = 1.0) {
      const s = miniBase * scl;
      const a = new NucleusDrop(clusterCx + offX, clusterCy + offY, s, 'normal');
      a.aspect = 1.0;
      a._alphaMul = 0.50;
      a._skipSimpleGlassRefraction = false;
      if (!_clusterAnchor) {
        a.staticAnchor = true;
        a._label = 'Nuclei-Gruppe';
        _clusterAnchor = a;
      } else {
        a.semiTiedTo = _clusterAnchor;
        a.semiOffset = createVector(offX, offY);
      }
      nucleusDrops.push(a);
      const b = new NucleusDrop(clusterCx + offX + s * 0.34, clusterCy + offY - s * 0.34, s, 'normal');
      b.aspect = 1.0;
      b._alphaMul = 0.44;
      b._skipSimpleGlassRefraction = false;
      b.semiTiedTo = _clusterAnchor;
      b.semiOffset = createVector(offX + s * 0.34, offY - s * 0.34);
      nucleusDrops.push(b);
      const c = new NucleusDrop(clusterCx + offX - s * 0.30, clusterCy + offY + s * 0.30, s * 0.96, 'normal');
      c.aspect = 1.0;
      c._alphaMul = 0.40;
      c._skipSimpleGlassRefraction = false;
      c.semiTiedTo = _clusterAnchor;
      c.semiOffset = createVector(offX - s * 0.30, offY + s * 0.30);
      nucleusDrops.push(c);
    }
    function addMiniN3(offX, offY, scl = 1.0) {
      const s = miniBase * scl;
      const a = new NucleusDrop(clusterCx + offX, clusterCy + offY, s, 'normal');
      a.aspect = 1.0;
      a._alphaMul = 0.50;
      a._skipSimpleGlassRefraction = false;
      if (!_clusterAnchor) {
        a.staticAnchor = true;
        a._label = 'Nuclei-Gruppe';
        _clusterAnchor = a;
      } else {
        a.semiTiedTo = _clusterAnchor;
        a.semiOffset = createVector(offX, offY);
      }
      nucleusDrops.push(a);
      const top = new NucleusDrop(clusterCx + offX, clusterCy + offY, s * 0.78, 'normal');
      top.aspect = 1.0;
      top._alphaMul = 0.46;
      top._skipSimpleGlassRefraction = false;
      top.semiTiedTo = _clusterAnchor;
      top.semiOffset = createVector(offX, offY);
      nucleusDrops.push(top);
    }

    // Eiförmige Anordnung: leicht elongiert horizontal, mit Asymmetrie (spitzer links, runder rechts).
    // Halbachsen in Einheiten von miniBase.
    const u = miniBase;
    // Vertikal ausgerichtetes Ei, ~15% kompakter als zuvor
    const rx = u * 4.20;
    const ry = u * 3.95;
    // 14 Positionen: 1 Zentrum + 4 mittlerer Ring + 9 Außenring.
    // Egg-Funktion: x = rx*cos(t)*(1 + 0.12*cos(t)),  y = ry*sin(t)
    function egg(t, rs = 1.0) {
      const cx = Math.cos(t), sy = Math.sin(t);
      // Asymmetrie nun entlang y (spitzer oben, runder unten) für vertikale Eiform
      return [rx * rs * cx, ry * rs * sy * (1 + 0.14 * sy)];
    }
    // Zentrum (Anker)
    addMiniN1(0, 0, 1.00);
    // Innerer Ring (4 Elemente)
    for (let i = 0; i < 4; i++) {
      const t = (i / 4) * Math.PI * 2 + 0.4;
      const [x, y] = egg(t, 0.45);
      if (i % 2 === 0) addMiniN1(x, y, 0.86);
      else             addMiniN3(x, y, 0.86);
    }
    // Äußerer Ring (9 Elemente)
    for (let i = 0; i < 3; i++) {
      const t = (i / 3) * Math.PI * 2;
      const [x, y] = egg(t, 1.0);
      if (i % 2 === 0) addMiniN3(x, y, 0.86);
      else             addMiniN1(x, y, 0.88);
    }

    // === Dreieck: Nuclei-Gruppen-Stil, 4 Positionen pro Seite + Schwänze ===
    const triCx = width * 0.56;
    const triCy = height * 0.63;
    const triBase = miniBase * 0.82;
    const triStep = miniBase * 2.05;
    const triRot = -0.07;
    let _triAnchor = null;
    function rotTri(x, y) {
      return [
        x * Math.cos(triRot) - y * Math.sin(triRot),
        x * Math.sin(triRot) + y * Math.cos(triRot)
      ];
    }
    function addTriangleBlob(offX, offY, scl = 1.0, alpha = 0.72, mode = 0) {
      const [rxp, ryp] = rotTri(offX, offY);
      const s = triBase * scl;
      const d = new NucleusDrop(triCx + rxp, triCy + ryp, s, 'normal');
      d.aspect = 1.0;
      d._alphaMul = 0.42;
      d._speedClass = 'testFast';
      d._skipSimpleGlassRefraction = true;
      if (!_triAnchor) {
        d.staticAnchor = true;
        d._label = 'Dreieck';
        _triAnchor = d;
      } else {
        d.semiTiedTo = _triAnchor;
      d.semiOffset = createVector(rxp, ryp);
      }
      nucleusDrops.push(d);
      const outward = createVector(rxp, ryp);
      if (outward.mag() < 0.01) outward.set(0, -1);
      outward.normalize();
      const offsets = mode % 2 === 0
        ? [
            [0.18 + outward.x * 0.18, -0.18 + outward.y * 0.18, 1.0, 0.65],
            [-0.16 + outward.x * 0.14, 0.16 + outward.y * 0.14, 0.96, 0.60],
            [0.02 + outward.x * 0.10, 0.02 + outward.y * 0.10, 0.78, 0.78]
          ]
        : [
            [0.08 + outward.x * 0.18, -0.08 + outward.y * 0.18, 1.0, 0.65],
            [-0.08 + outward.x * 0.14, 0.08 + outward.y * 0.14, 0.96, 0.60],
            [outward.x * 0.10, outward.y * 0.10, 0.78, 0.78]
          ];
      offsets.forEach(o => {
        const child = new NucleusDrop(triCx + rxp + s * o[0], triCy + ryp + s * o[1], s * o[2], 'normal');
        child.aspect = 1.0;
        child._alphaMul = o[3] * 0.58;
        child._speedClass = 'testFast';
        child._skipSimpleGlassRefraction = true;
        child.semiTiedTo = _triAnchor;
        child.semiOffset = createVector(rxp + s * o[0], ryp + s * o[1]);
        nucleusDrops.push(child);
      });
    }
    const vA = createVector(-1.45 * triStep, 0.95 * triStep);
    const vB = createVector(1.35 * triStep, 1.02 * triStep);
    const vC = createVector(0.05 * triStep, -1.48 * triStep);
    const triPoints = [];
    function addSide(a, b) {
      for (let i = 0; i < 4; i++) {
        const t = i / 3;
        const x = lerp(a.x, b.x, t);
        const y = lerp(a.y, b.y, t);
        if (!triPoints.some(p => dist(p[0], p[1], x, y) < 0.1)) triPoints.push([x, y]);
      }
    }
    addSide(vA, vB);
    addSide(vB, vC);
    addSide(vC, vA);
    triPoints.forEach((p, i) => addTriangleBlob(p[0], p[1], i % 2 === 0 ? 0.86 : 0.88, 0.72, i));
    const tail2 = createVector(1, -0.16).normalize();
    for (let i = 1; i <= 4; i++) {
      addTriangleBlob(vB.x + tail2.x * triStep * 0.78 * i, vB.y + tail2.y * triStep * 0.78 * i, 0.88, 0.72, i);
    }
    const tail7 = createVector(cos(PI * 0.82), sin(PI * 0.82));
    for (let i = 1; i <= 2; i++) {
      addTriangleBlob(vA.x + tail7.x * triStep * 0.78 * i, vA.y + tail7.y * triStep * 0.78 * i, 0.86, 0.72, i);
    }

    function addNucleusPath(label, anchorX, anchorY, points, baseSize, seed, opts = {}) {
      let anchor = null;
      const pathScale = opts.pathScale || 1;
      const alphaMul = opts.alphaMul || 0.56;
      points.forEach((p, i) => {
        const offX = p[0] * pathScale;
        const offY = p[1] * pathScale;
        const d = new NucleusDrop(anchorX + offX, anchorY + offY, baseSize * (p[2] || 1), 'normal');
        d._speedClass = 'testFast';
        d._alphaMul = alphaMul;
        d._skipSimpleGlassRefraction = opts.skipRefraction != null ? opts.skipRefraction : i % 3 !== 0;
        d._fiberOverlay = true;
        d._fiberSeed = seed + i * 1.7;
        d.aspect = 0.92 + ((i % 3) * 0.06);
        d.rot = p[3] || 0;
        if (i === 0) {
          d.staticAnchor = true;
          d._label = label;
          anchor = d;
        } else {
          d.semiTiedTo = anchor;
          d.semiOffset = createVector(offX, offY);
        }
        nucleusDrops.push(d);
      });
    }

    // === Nuclei-Gruppe 2: wie Nuclei-Gruppe angeordnet, aber als Testgruppe ===
    const cluster2Cx = width * 0.56;
    const cluster2Cy = height * 0.84;
    const miniBase2 = miniBase * 1.25;
    let _cluster2Anchor = null;
    function addMini2(offX, offY, scl = 1.0, pair = false) {
      const s = miniBase2 * scl;
      const a = new NucleusDrop(cluster2Cx + offX, cluster2Cy + offY, s, 'normal');
      a.aspect = 1.0;
      a._speedClass = 'testFast';
      a._alphaMul = 0.82;
      a._skipSimpleGlassRefraction = true;
      a._fiberOverlay = true;
      a._fiberSeed = 47.6 + offX * 0.03 + offY * 0.02;
      if (!_cluster2Anchor) {
        a.staticAnchor = true;
        a._label = 'Nuclei-Gruppe 2';
        _cluster2Anchor = a;
      } else {
        a.semiTiedTo = _cluster2Anchor;
        a.semiOffset = createVector(offX, offY);
      }
      nucleusDrops.push(a);
      if (pair) {
        const top = new NucleusDrop(cluster2Cx + offX, cluster2Cy + offY, s * 0.78, 'normal');
        top.aspect = 1.0;
        top._speedClass = 'testFast';
        top._alphaMul = 0.76;
        top._skipSimpleGlassRefraction = true;
        top.semiTiedTo = _cluster2Anchor;
        top.semiOffset = createVector(offX, offY);
        nucleusDrops.push(top);
      }
    }
    const u2 = miniBase2;
    const rx2 = u2 * 1.28;
    const ry2 = u2 * 2.34;
    function egg2(t, rs = 1.0) {
      const cx = Math.cos(t), sy = Math.sin(t);
      return [rx2 * rs * cx, ry2 * rs * sy * (1 + 0.14 * sy)];
    }
    addMini2(0, 0, 1.00, false);
    for (let i = 0; i < 4; i++) {
      const t = (i / 4) * Math.PI * 2 + 0.4;
      const [x, y] = egg2(t, 0.45);
      addMini2(x, y, 0.86, i % 2 !== 0);
    }
    for (let i = 0; i < 6; i++) {
      const t = (i / 6) * Math.PI * 2;
      const [x, y] = egg2(t, 1.0);
      addMini2(x, y, i % 2 === 0 ? 0.86 : 0.88, i % 2 === 0);
    }

    const labelledRoots = nucleusDrops.filter(d => d._label);
    labelledRoots.forEach((root, idx) => {
      const p = comparePlacedSlot(root._label, 'orig', idx, compareSlot(idx, false));
      const dx = p.x - root.start.x;
      const dy = p.y - root.start.y;
      root.start.set(p.x, p.y);
      root.pos.set(p.x, p.y);
      root.target.set(p.x, p.y);
      root._compareCopy = idx;
      root._compareLabel = root._label;
      nucleusDrops.forEach(d => {
        if (d.semiTiedTo === root) {
          d.start.add(dx, dy);
          d.pos.add(dx, dy);
          d.target.add(dx, dy);
          d._compareCopy = idx;
          d._compareLabel = root._label;
        }
      });
    });

  });

  sceneBuildQueue.push(() => {
    floaterFleckCloud = new NoiseCloud(
      0, 0,
      FLECK_SUPER_SIZE,
      FLECK_SUPER_TINT,
      FLECK_SUPER_ALPHA,
      FLECK_SUPER_FEATHER
    );
  });
  // lightFloater1/2 entfernt (User-Request)
  // elongCircleCluster1/2 entfernt (User-Request)

  for (let i = 0; i < SCHL_COUNT; i++) {
    sceneBuildQueue.push(() => {
      const sc = new SchlierCloud();
      const leftStyle = i % 2 === 0;
      const colCount = 6;
      const rowCount = Math.ceil(SCHL_COUNT / colCount);
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const xFrac = (col + 0.5) / colCount + random(-0.018, 0.018);
      const yFrac = (row + 0.5) / rowCount + random(-0.018, 0.018);
      sc.len = width * random(0.115, 0.235);
      sc.thick = max(0.9, width * random(0.00135, 0.00235));
      sc.thickTarget = sc.thick;
      sc.thickCurrent = sc.thick;
      sc.curveMagBase = sc.len * random(0.028, 0.074);
      sc.curveMagTarget = sc.curveMagBase;
      sc.curveMagCurrent = sc.curveMagBase;
      sc.ang = random(-PI, PI);
      sc.start.set(width * xFrac, height * yFrac);
      sc.pos.set(sc.start.x, sc.start.y);
      sc.target.set(sc.start.x, sc.start.y);
      schlierClouds.push(sc);
    });
  }

  for (let i = 0; i < F2_STRETCH_SCHLIEREN_COUNT; i++) {
    sceneBuildQueue.push(() => {
      const sc = new SchlierCloud();
      sc._f2StretchSchliere = true;
      sc._fleckSchliere = true;
      sc.len = CLOUD_SMALLER_SIZE * random(0.46, 0.68);
      sc.thick = CLOUD_SMALLER_SIZE * random(0.050, 0.075);
      sc.thickTarget = sc.thick;
      sc.thickCurrent = sc.thick;
      sc.curveMagBase = sc.len * random(0.025, 0.050);
      sc.curveMagTarget = sc.curveMagBase;
      sc.curveMagCurrent = sc.curveMagBase;
      sc.speedMult = random(0.65, 1.05);
      sc.cloud = new NoiseCloud(
        0,
        0,
        CLOUD_RES,
        CLOUD_SMALLER_TINT,
        CLOUD_SMALLER_ALPHA * random(0.36, 0.58),
        CLOUD_SMALLER_FEATHER * 1.18
      );
      const clusterX = width * (0.50 + random(-0.12, 0.12));
      const clusterY = height * (0.52 + random(-0.10, 0.10));
      sc.start.set(clusterX, clusterY);
      sc.pos.set(clusterX, clusterY);
      sc.target.set(clusterX, clusterY);
      schlierClouds.push(sc);
    });
  }

  for (let i = 0; i < BRIGHT_SCHL_COUNT; i++) {
    sceneBuildQueue.push(() => {
      let brightSchlier = new SchlierCloud();
      const brightAlphaVar = random(0.5, 1.5);
      brightSchlier.cloud = new NoiseCloud(0, 0, CLOUD_RES, BRIGHT_SCHLC_TINT, BRIGHT_SCHLC_ALPHA * brightAlphaVar, SCHLC_FEATHER);
      brightSchlierClouds.push(brightSchlier);
    });
  }

  for (let i = 0; i < GEL_SCHL_COUNT; i++) {
    sceneBuildQueue.push(() => {
      let gelSchlier = new SchlierCloud();
      gelSchlier.len = random(GEL_SCHLC_LEN_MIN, GEL_SCHLC_LEN_MAX);
      gelSchlier.thick = gelSchlier.len * random(GEL_SCHLC_THICK_MIN, GEL_SCHLC_THICK_MAX);
      const gelAlphaVar = random(0.5, 1.8);
      gelSchlier.cloud = new NoiseCloud(0, 0, CLOUD_RES, GEL_SCHLC_TINT, GEL_SCHLC_ALPHA * gelAlphaVar, GEL_SCHLC_FEATHER);
      gelSchlierClouds.push(gelSchlier);
    });
  }

  // 10 zusätzliche, echte Schlieren – gleichmäßig über die Fläche verteilt
  // (5x2 Grid + Jitter). Stilistisch wie die Original-Schlieren (SchlierCloud),
  // damit sie nicht als Fremdkörper auffallen. Werden in schlierClouds gepusht,
  // damit sie genauso animiert/gezeichnet werden wie die ursprünglichen.
  const cols = 0;
  const rows = FAST_EDIT_MODE ? 1 : 3;
  const cellW = 1 / cols;
  const cellH = 1 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellCxF = (c + 0.5) * cellW;
      const cellCyF = (r + 0.5) * cellH;
      sceneBuildQueue.push(() => {
        const jx = (random() - 0.5) * cellW * 0.7;
        const jy = (random() - 0.5) * cellH * 0.7;
        const x = (cellCxF + jx) * width;
        const y = (cellCyF + jy) * height;
        const sc = new SchlierCloud();
        sc.len *= random(0.62, 0.86);
        sc.curveMagBase = sc.len * 0.055;
        sc.start.set(x, y);
        sc.pos.set(x, y);
        sc.target.set(x, y);
        schlierClouds.push(sc);
      });
    }
  }

  // 7 zusätzliche RUNDLICHE Flecken-Schlieren (~4x Größe des aktuellen Floater-Flecks)
  // Werden ebenfalls in schlierClouds gepusht und damit identisch animiert/gerendert.
  // Trick: len ≈ thick und curveMag = 0 → die längliche Schliere wird zu einem runden Fleck.
  const ROUND_SCHL_COUNT = 0;
  const ROUND_SCHL_SIZE  = 60 * SCALE * 0.9 * 0.9 * 0.9 * 0.9 * 0.9 * 4; // ~4x Floater-Fleck
  for (let i = 0; i < ROUND_SCHL_COUNT; i++) {
    sceneBuildQueue.push(() => {
      const x = random(width);
      const y = random(height);
      const sc = new SchlierCloud();
      // rundliche Form
      const sizeVar = ROUND_SCHL_SIZE * random(0.85, 1.15);
      sc.len   = sizeVar;
      sc.thick = sizeVar * random(0.85, 1.0); // leicht ovale Variation
      // keine Biegung → bleibt rund
      sc.curveMagBase = 0;
      sc.curveMagTarget = 0;
      sc.curveMagCurrent = 0;
      sc.thickTarget = sc.thick;
      sc.thickCurrent = sc.thick;
      sc.start.set(x, y);
      sc.pos.set(x, y);
      sc.target.set(x, y);
      schlierClouds.push(sc);
    });
  }

  // gelBlobChains entfernt (User-Request)
  // lFloater entfernt
}

function processSceneBuildQueue(stepsPerFrame = 1) {
  for (let i = 0; i < stepsPerFrame && sceneBuildQueue.length > 0; i++) {
    const task = sceneBuildQueue.shift();
    task();
  }

  if (sceneBuildQueue.length === 0) {
    if (!sceneReady) {
      let n = 1;
      n = distributeSchlieren(schlierClouds, n);
      n = distributeSchlieren(brightSchlierClouds, n);
      distributeSchlieren(gelSchlierClouds, n);
    }
    sceneReady = true;
  }
}


/* =========================================================
 * p5 DRAW
 * ========================================================= */
function draw() {
  if (!sceneReady) {
    processSceneBuildQueue(1);
    if (!sceneReady || !floater) {
      clear();
      return;
    }
  }

  // Mausbewegung
  let currentMouse = createVector(mouseX, mouseY);
  let movement = p5.Vector.sub(currentMouse, prevMouse);
  prevMouse = currentMouse;
  mouseContainPos = currentMouse.copy();
  mouseContainDir = null;
  const mdx = movement.x;
  const mdy = movement.y;
  const mMag = movement.mag();
  if (mMag > 1.2) {
    const currentDir = movement.copy().normalize();
    if (prevMovementDir) {
      const dot = currentDir.dot(prevMovementDir);
      directionChangeBoost = dot < 0.2 ? 1.25 : 1.0;
    }
    prevMovementDir = currentDir;
  } else {
    directionChangeBoost = 1.0;
  }
  // Höhere Schwelle: kleine Mausbewegungen zählen als "still", damit
  // langsame Mausbewegung NICHT das volle Federsystem (neue Targets,
  // Anrampen) auslöst. Erst spürbare Bewegung -> mouseMoving=true.
  mouseMoving = mMag > 0.65;

  // mouseRestPos: lerpt langsam zur Mausposition, solange Maus bewegt wird.
  // Bleibt bei Stillstand stehen → wirkt als "wo der Mauszeiger zum Stehen kommt".
  if (mouseRestPos) {
    if (mouseMoving) {
      mouseRestPos.x = lerp(mouseRestPos.x, currentMouse.x, 0.075);
      mouseRestPos.y = lerp(mouseRestPos.y, currentMouse.y, 0.075);
    }
    if (!restShift) restShift = createVector(0, 0);
    restShift.x = mouseRestPos.x - width  * 0.5;
    restShift.y = mouseRestPos.y - height * 0.5;
  }

  // Simulierte kleine Linksbewegung bei Programmstart
  if (initialKickFrames > 0) {
    initialKickFrames--;
    mouseMoving = true;
    const kickStrength = initialKickFrames / 30 * 3; // abklingend
    movement = createVector(-kickStrength, kickStrength * 0.3);
  }

  const mouseDXNorm = constrain(movement.x/width*5, -1, 1);
  if (movement.mag() > 0.001) {
    mouseContainDir = movement.copy().normalize();
    if (!mouseContainDirSmooth) {
      mouseContainDirSmooth = mouseContainDir.copy();
    } else {
      mouseContainDirSmooth.lerp(mouseContainDir, 0.16);
      if (mouseContainDirSmooth.mag() > 0.001) mouseContainDirSmooth.normalize();
    }
  } else if (mouseContainDirSmooth) {
    mouseContainDirSmooth.mult(0.96);
    if (mouseContainDirSmooth.mag() < 0.12) mouseContainDirSmooth = null;
  }

  // Entgegengesetzte Mausbewegung + spiralförmige Drehung
  let oppositeMovement = createVector(0, 0);
  if (mouseMoving) {
    // Entgegengesetzte Richtung der Mausbewegung
    oppositeMovement = p5.Vector.mult(movement, -1);
    
    // Spiralförmige Drehung im Uhrzeigersinn hinzufügen
  }

  // ---- Mausgeschwindigkeits-Sensitivität ----
  // Fließende Kurve OHNE Sprung am mouseMoving-Threshold.
  // Steile Potenz (2.6) + hohe Normalisierung (35 px/Frame) sorgen dafür,
  // dass langsame UND mittlere Geschwindigkeiten alle "recht langsam" sind
  // und erst wirklich schnelle Mausbewegungen sichtbar beschleunigen.
  //   mMag  1 px/Frame (extrem langsam) -> ~0.08
  //   mMag  3 px/Frame (langsam)        -> ~0.10
  //   mMag  6 px/Frame (gemütlich)      -> ~0.13
  //   mMag 12 px/Frame (mittel)         -> ~0.22
  //   mMag 18 px/Frame (zügig)          -> ~0.40
  //   mMag 25 px/Frame (schnell)        -> ~0.75
  //   mMag 35 px/Frame (sehr schnell)   -> ~1.50
  //   mMag >=42 px/Frame (rasend)       -> ~1.90 (gedeckelt)
  const speedNorm = constrain(mMag / 35, 0, 1.2);
  // Zurück zu Exponent 2.6 (linearere Reaktion als 3.0).
  const speedCurve = Math.pow(speedNorm, 2.6);
  // Floor weiter abgesenkt 0.07 -> 0.03 für noch ruhigeres Verhalten bei langsamer Maus.
  const targetSpeedScale = mouseMoving ? constrain(0.006 + speedCurve * 0.82, 0.006, 0.86) : 0;
  // Bootsphysik: leichte, gleichmäßige Trägheit – linear, unabhängig vom Delta.
  // Hochgehen 0.07 -> ~6-10 Frames Verzögerung. Runtergehen 0.10 -> sanftes Ausgleiten.
  const speedSmoothing = targetSpeedScale > mouseSpeedScale ? 0.105 : 0.055;
  mouseSpeedScale = lerp(mouseSpeedScale, targetSpeedScale, speedSmoothing);

  // Anwenden auf die rohe Bewegung
  oppositeMovement.mult(mouseSpeedScale * directionChangeBoost);

  // ---- Sanftes Anrampen für Nicht-Schlieren-Elemente ----
  // Phase 1 (rampUp, 0..18 Frames): 0 -> 1.1 mit easeOut
  // Phase 2 (overshoot, 18..36 Frames): 1.1 -> 1.0 mit easeInOut
  // Phase 3 (cruise): konstant 1.0
  // Bei Stillstand: zurück zu 0 mit sanftem Decay
  if (mouseMoving) {
    if (nonSchlierRampPhase === 'idle') {
      nonSchlierRampPhase = 'rampUp';
      nonSchlierRampFrames = 0;
    }
    nonSchlierRampFrames++;
    if (nonSchlierRampPhase === 'rampUp') {
      const t = constrain(nonSchlierRampFrames / 8, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      nonSchlierScale = eased * 1.1;
      if (t >= 1) nonSchlierRampPhase = 'overshoot';
    } else if (nonSchlierRampPhase === 'overshoot') {
      const t = constrain((nonSchlierRampFrames - 8) / 10, 0, 1);
      const eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; // easeInOutQuad
      nonSchlierScale = lerp(1.1, 1.0, eased);
      if (t >= 1) nonSchlierRampPhase = 'cruise';
    } else {
      nonSchlierScale = 1.0;
    }
  } else {
    // sanfter Decay zurück zu 0
    nonSchlierScale = lerp(nonSchlierScale, 0, 0.11);
    if (nonSchlierScale < 0.01) {
      nonSchlierScale = 0;
      nonSchlierRampPhase = 'idle';
      nonSchlierRampFrames = 0;
    }
  }
  // Skaliertes oppositeMovement nur für Nicht-Schlieren-Elemente
  const oppositeMovementNS = p5.Vector.mult(oppositeMovement, nonSchlierScale * 0.82);

  // Floater updaten (verwendet die geskalierte Variante)
  floater.update(mouseMoving, mMag * nonSchlierScale, mouseDXNorm * nonSchlierScale, oppositeMovementNS);

  // Transparenter Hintergrund - blauer Himmel scheint durch
  clear();

  // Hintergrund-Parallax: Mausposition steuert Blickrichtung
  // BG ist 140vw/140vh, mit -20vw/-20vh Offset → 10vw Reserve nach jeder Seite (sicherer Spielraum).
  // Maximale Parallax-Auslenkung wird darauf geclamped, damit NIE der weiße Editor-Rand sichtbar wird.
  const mouseXNorm = (mouseX / width - 0.5) * 2;  // -1 bis +1
  const mouseYNorm = (mouseY / height - 0.5) * 2; // -1 bis +1
  // Reserve = 10vw / 10vh → maximal 9vw / 9vh Parallax (etwas Puffer lassen)
  const maxBgX = window.innerWidth * 0.09;
  const maxBgY = window.innerHeight * 0.09;
  // Invertiert: Maus nach links/oben (POV blickt links/oben) → Welt verschiebt sich nach rechts/unten
  const targetBgX = constrain(-mouseXNorm * window.innerWidth  * 0.09, -maxBgX, maxBgX);
  const targetBgY = constrain(-mouseYNorm * window.innerHeight * 0.09, -maxBgY, maxBgY);
  // Interpolation: schneller bei Mausbewegung, ruhiges Nachschwingen bei Stillstand
  const bgLerp = mouseMoving ? 0.18 : 0.045;
  const bgMaxStep = window.innerWidth * 0.0042;
  bgParallaxX += constrain((targetBgX - bgParallaxX) * bgLerp, -bgMaxStep, bgMaxStep);
  bgParallaxY += constrain((targetBgY - bgParallaxY) * bgLerp, -bgMaxStep, bgMaxStep);
  const bgEl = document.getElementById('bg');
  if (bgEl) {
    bgEl.style.transform = `translate(${bgParallaxX}px, ${bgParallaxY}px)`;
  }

  /* --- Dunkler Fleck links: entfernt --- */
  /* --- Weißer Superfleck links: entfernt --- */
  /* --- Micro-Kreis-Gruppe: entfernt --- */
  /* --- Kleine Punkte: entfernt --- */

  /* --- Grauer Superfleck ganz hinten --- */
  // Eigener Bewegungsvektor: leicht rotierte + skalierte Variante des Maus-Vektors,
  // damit biggerCloud NICHT identisch zu smallerCloud läuft.
  // WICHTIG: oppositeMovementNS zeigt VON der Maus weg → invertieren, damit Cloud
  // der Blickrichtung (Maus) folgt, genau wie der Hauptfloater.
  const mouseDirNS = p5.Vector.mult(oppositeMovementNS, -1);
  const biggerAngle = 0.6;  // ~34° Rotation gegenüber smallerCloud
  const biggerDriftX = sin(frameCount * 0.011 + 1.7) * 0.12;
  const biggerDriftY = cos(frameCount * 0.009 + 0.4) * 0.12;
  const biggerFollow = createVector(
    mouseDirNS.x * cos(biggerAngle) - mouseDirNS.y * sin(biggerAngle) + biggerDriftX,
    mouseDirNS.x * sin(biggerAngle) + mouseDirNS.y * cos(biggerAngle) + biggerDriftY
  );
  biggerCloud.update(
    mouseMoving,
    [SMALLER_POS_XF-0.04, SMALLER_POS_XF+0.04],
    [SMALLER_POS_YF-0.22, SMALLER_POS_YF+0.04],
    BIGGER_SPEED_SCALE,
    biggerFollow,
    1.4
  );
  // Superflecken temporÃ¤r ausgeblendet.
  // Kern weich angeglichen an Corona: größer, diffuser, geringerer Alpha
  // → keine harte Trennung mehr zwischen heller Corona und dunklem Kern
  {
    drawHFStyleCloudFleck(biggerCloud, 1.0);
    drawCloudLabel('F1', biggerCloud);
    if (upperLeftGreyCloud) {
      const f2Follow = createVector(
        mouseDirNS.x * cos(-0.45) - mouseDirNS.y * sin(-0.45) + sin(frameCount * 0.010 + 4.1) * 0.08,
        mouseDirNS.x * sin(-0.45) + mouseDirNS.y * cos(-0.45) + cos(frameCount * 0.012 + 1.6) * 0.08
      );
      upperLeftGreyCloud.update(
        mouseMoving,
        [0.12, 0.26],
        [0.72, 0.90],
        SMALLER_SPEED_SCALE * 0.82,
        f2Follow,
        1.15
      );
    }
    drawHFStyleCloudFleck(upperLeftGreyCloud, 1.0, 2.15);
    drawCloudLabel('F2', upperLeftGreyCloud);
    if (SHOW_CLOUDS) {
      f2CenterCopies.forEach((c, i) => {
        const follow = createVector(
          mouseDirNS.x * 0.72 + sin(frameCount * 0.010 + i) * 0.06,
          mouseDirNS.y * 0.72 + cos(frameCount * 0.012 + i) * 0.06
        );
        c.update(mouseMoving, [0.39, 0.61], [0.42, 0.62], SMALLER_SPEED_SCALE * 0.75, follow, 0.95);
        drawHFStyleCloudFleck(c, 1.0, 2.15);
      });
    }
  }

  drawSchlierenDebugGrid();

  /* --- Schlieren (mittlere Ebene)
     Ein Drittel wird stärker gezeichnet, der Rest variiert fein/normal.
     Pro Schliere zusätzlich ein kleines (zufällig längliches, sehr transparentes)
     Nuclei-Element in der Mitte. --- */
  let schliereNumber = 1;
  let visibleSchliereNumber = 1;
  let visibleFleckSchliereNumber = 0;
  const schlierRampTarget = mouseMoving ? 1 : 0;
  if (SHOW_SCHLIEREN) schlierClouds.forEach((sc, i) => {
    const n = schliereNumber++;
    sc._flexBend = FLEX_SCHLIEREN_NUMBERS.has(n);
    sc._visualScale = LARGE_SCHLIEREN_NUMBERS.has(n) ? 2.0 : 1.0;
    sc._morphBend = MORPH_SCHLIEREN_NUMBERS.has(n);
    sc._morphSeed = n * 0.73;
    sc._semInside = SEM_SCHLIEREN_NUMBERS.has(n);
    sc._semSeed = n * 1.19;
    sc._emphasis = EMPHASIS_SCHLIEREN_NUMBERS.has(n);
    sc._strongEmphasis = STRONG_EMPHASIS_SCHLIEREN_NUMBERS.has(n);
    sc._midThicken = MID_THICKEN_SCHLIEREN_NUMBERS.has(n);
    sc._darker = DARKER_SCHLIEREN_NUMBERS.has(n);
    sc._shortSchliere = SHORT_SCHLIEREN_NUMBERS.has(n);
    sc._longSchliere = LONG_SCHLIEREN_NUMBERS.has(n);
    sc._angledSchliere = ANGLED_SCHLIEREN_NUMBERS.has(n);
    sc._centerLongWave = CENTER_LONG_WAVE_SCHLIEREN_NUMBERS.has(n);
    sc._smallSchliere = SMALL_SCHLIEREN_NUMBERS.has(n);
    sc._centerDarkComplex = CENTER_DARK_COMPLEX_SCHLIEREN_NUMBERS.has(n);
    sc._softCenterExtra = sc._softCenterExtra || false;
    sc._f2StretchSchliere = sc._f2StretchSchliere || false;
    sc._fleckSchliere = sc._f2StretchSchliere || FLECK_SCHLIEREN_NUMBERS.has(n);
    sc._pairedFleckSchliere = PAIRED_FLECK_SCHLIEREN_NUMBERS.has(n);
    sc._extraPairedSchliere = n > BASE_SCHL_COUNT;
    sc._shapeSeed = n * 2.31;
    sc._fleckSizeMul = 0.68 + 0.64 * abs(sin(n * 1.73));
    sc._pairedSizeMul = 0.72 + 0.58 * abs(cos(n * 1.19));
    sc._motionRamp = lerp(sc._motionRamp || 0, schlierRampTarget, schlierRampTarget ? 0.78 : 0.11);
    sc.update(mouseMoving, oppositeMovement);
    if (HIDDEN_SCHLIEREN_NUMBERS.has(n)) return;
    if (sc._fleckSchliere) {
      visibleFleckSchliereNumber++;
      sc._fleckLenMul = visibleFleckSchliereNumber % 2 === 0 ? 2 : 1;
    } else {
      sc._fleckLenMul = 1;
    }
    const labelN = visibleSchliereNumber++;
    const _origThick = sc.thickCurrent;
    sc.thickCurrent *= schliereThicknessMul(sc);
    drawingContext.save();
    drawingContext.globalAlpha *= schliereAlphaMul(sc);
    sc.display();
    if (sc._centerDarkComplex) drawSchlierePinkX(sc);
    drawingContext.restore();
    sc.thickCurrent = _origThick;
    // Stabile Pseudo-Zufallswerte pro Schliere für Form/Drehung
    if (sc._miniAspect == null) {
      const s = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = s - Math.floor(s);
      const s2 = Math.sin(i * 78.233) * 43758.5453;
      const r2 = s2 - Math.floor(s2);
      sc._miniAspect = 1.4 + r1 * 2.2;       // 1.4 .. 3.6 → deutlich länglich
      sc._miniRot    = r2 * Math.PI * 2;
    }
    drawSchliereNumber(labelN, sc.pos.x, sc.pos.y);
  });

  /* --- Hellere Schlieren --- */
  if (SHOW_SCHLIEREN) brightSchlierClouds.forEach(sc=>{
    const n = schliereNumber++;
    sc._flexBend = FLEX_SCHLIEREN_NUMBERS.has(n);
    sc._visualScale = LARGE_SCHLIEREN_NUMBERS.has(n) ? 2.0 : 1.0;
    sc._morphBend = MORPH_SCHLIEREN_NUMBERS.has(n);
    sc._morphSeed = n * 0.73;
    sc._semInside = SEM_SCHLIEREN_NUMBERS.has(n);
    sc._semSeed = n * 1.19;
    sc._emphasis = EMPHASIS_SCHLIEREN_NUMBERS.has(n);
    sc._strongEmphasis = STRONG_EMPHASIS_SCHLIEREN_NUMBERS.has(n);
    sc._midThicken = MID_THICKEN_SCHLIEREN_NUMBERS.has(n);
    sc._darker = DARKER_SCHLIEREN_NUMBERS.has(n);
    sc._shortSchliere = SHORT_SCHLIEREN_NUMBERS.has(n);
    sc._longSchliere = LONG_SCHLIEREN_NUMBERS.has(n);
    sc._angledSchliere = ANGLED_SCHLIEREN_NUMBERS.has(n);
    sc._centerLongWave = CENTER_LONG_WAVE_SCHLIEREN_NUMBERS.has(n);
    sc._smallSchliere = SMALL_SCHLIEREN_NUMBERS.has(n);
    sc._centerDarkComplex = CENTER_DARK_COMPLEX_SCHLIEREN_NUMBERS.has(n);
    sc._softCenterExtra = sc._softCenterExtra || false;
    sc._f2StretchSchliere = sc._f2StretchSchliere || false;
    sc._fleckSchliere = sc._f2StretchSchliere || FLECK_SCHLIEREN_NUMBERS.has(n);
    sc._shapeSeed = n * 2.31;
    sc._motionRamp = lerp(sc._motionRamp || 0, schlierRampTarget, schlierRampTarget ? 0.78 : 0.11);
    sc.update(mouseMoving, oppositeMovement);
    if (HIDDEN_SCHLIEREN_NUMBERS.has(n)) return;
    const labelN = visibleSchliereNumber++;
    const _origThick = sc.thickCurrent;
    sc.thickCurrent *= schliereThicknessMul(sc);
    drawingContext.save();
    drawingContext.globalAlpha *= schliereAlphaMul(sc);
    sc.display();
    if (sc._centerDarkComplex) drawSchlierePinkX(sc);
    drawingContext.restore();
    sc.thickCurrent = _origThick;
    drawSchliereNumber(labelN, sc.pos.x, sc.pos.y);
  });

  /* --- Gelartige Schlieren --- */
  if (SHOW_SCHLIEREN) gelSchlierClouds.forEach(sc=>{
    const n = schliereNumber++;
    sc._flexBend = FLEX_SCHLIEREN_NUMBERS.has(n);
    sc._visualScale = LARGE_SCHLIEREN_NUMBERS.has(n) ? 2.0 : 1.0;
    sc._morphBend = MORPH_SCHLIEREN_NUMBERS.has(n);
    sc._morphSeed = n * 0.73;
    sc._semInside = SEM_SCHLIEREN_NUMBERS.has(n);
    sc._semSeed = n * 1.19;
    sc._emphasis = EMPHASIS_SCHLIEREN_NUMBERS.has(n);
    sc._strongEmphasis = STRONG_EMPHASIS_SCHLIEREN_NUMBERS.has(n);
    sc._midThicken = MID_THICKEN_SCHLIEREN_NUMBERS.has(n);
    sc._darker = DARKER_SCHLIEREN_NUMBERS.has(n);
    sc._shortSchliere = SHORT_SCHLIEREN_NUMBERS.has(n);
    sc._longSchliere = LONG_SCHLIEREN_NUMBERS.has(n);
    sc._angledSchliere = ANGLED_SCHLIEREN_NUMBERS.has(n);
    sc._centerLongWave = CENTER_LONG_WAVE_SCHLIEREN_NUMBERS.has(n);
    sc._smallSchliere = SMALL_SCHLIEREN_NUMBERS.has(n);
    sc._centerDarkComplex = CENTER_DARK_COMPLEX_SCHLIEREN_NUMBERS.has(n);
    sc._softCenterExtra = sc._softCenterExtra || false;
    sc._f2StretchSchliere = sc._f2StretchSchliere || false;
    sc._fleckSchliere = sc._f2StretchSchliere || FLECK_SCHLIEREN_NUMBERS.has(n);
    sc._shapeSeed = n * 2.31;
    sc._motionRamp = lerp(sc._motionRamp || 0, schlierRampTarget, schlierRampTarget ? 0.78 : 0.11);
    sc.update(mouseMoving, oppositeMovement);
    if (HIDDEN_SCHLIEREN_NUMBERS.has(n)) return;
    const labelN = visibleSchliereNumber++;
    const _origThick = sc.thickCurrent;
    sc.thickCurrent *= schliereThicknessMul(sc);
    drawingContext.save();
    drawingContext.globalAlpha *= schliereAlphaMul(sc);
    sc.display();
    if (sc._centerDarkComplex) drawSchlierePinkX(sc);
    drawingContext.restore();
    sc.thickCurrent = _origThick;
    drawSchliereNumber(labelN, sc.pos.x, sc.pos.y);
  });

  // Mittel-Testpaare deaktiviert: der Stil wird jetzt von beweglichen Schlieren selbst getragen.
  drawDebugOverlay({ mouseSpeedScale });

  /* --- Blob-Patches: entfernt (durch echte Schlieren ersetzt) --- */

  /* --- Kettenartige Gel-Flecken: entfernt --- */

  if (SHOW_ELEMENTS) {
  /* --- Weißer Superfleck (subtil, abgeschwächt) --- */
  // Eigener Bewegungsvektor: gegenläufig rotiert + andere Sinus-Phase
  // → läuft asynchron zu biggerCloud
  const smallerAngle = -0.9;  // ~-52° Rotation (entgegengesetzt zu grey)
  const smallerDriftX = sin(frameCount * 0.007 + 3.2) * 0.15;
  const smallerDriftY = cos(frameCount * 0.013 + 2.1) * 0.15;
  const smallerFollow = createVector(
    mouseDirNS.x * cos(smallerAngle) - mouseDirNS.y * sin(smallerAngle) + smallerDriftX,
    mouseDirNS.x * sin(smallerAngle) + mouseDirNS.y * cos(smallerAngle) + smallerDriftY
  );
  smallerCloud.update(
    mouseMoving,
    [BIGGER_POS_XF-0.05, BIGGER_POS_XF+0.05],
    [BIGGER_POS_YF-0.05, BIGGER_POS_YF+0.05],
    SMALLER_SPEED_SCALE,
    smallerFollow,
    1.6
  );
  drawHFStyleCloudFleck(smallerCloud, 1.0, 2.15);
  drawCloudLabel('F3', smallerCloud);
  // Weisser Superfleck temporÃ¤r ausgeblendet.
  /* Markierungsring + Beschriftung entfernt */
  const cmpMotion = compareMotionOffset();
  {
    const rh = flowedPoint(p5.Vector.add(createVector(width * 0.43, height * 0.23), cmpMotion), 'rund-u', 13);
    const rsem = flowedPoint(p5.Vector.add(createVector(width * 0.58, height * 0.58), cmpMotion), 'sem-s', 16);
    drawingContext.save();
    drawingContext.globalAlpha = 0.72 * ELEMENT_ALPHA;
    drawingContext.filter = 'none';
    drawHFStyleBlobReplica('', rh.x, rh.y, NUCLEUS_DROP_BASE_SIZE * 0.74 * 0.8, 1);
    drawingContext.restore();
    drawingContext.save();
    drawingContext.globalAlpha *= ELEMENT_ALPHA * 0.96;
    drawRoundStyleSemReplica('', rsem.x, rsem.y, NUCLEUS_DROP_BASE_SIZE * 0.74 * 0.8 * 2.028 * 0.8 * 0.85, 0.84, 28);
    drawingContext.restore();
    drawingContext.save();
    drawingContext.globalAlpha *= ELEMENT_ALPHA;
    drawHaloSemReplica(rsem.x + NUCLEUS_DROP_BASE_SIZE * 1.5, rsem.y, NUCLEUS_DROP_BASE_SIZE * 0.74 * 0.8 * 2.028 * 0.8 * 0.85, 28);
    drawingContext.restore();
    drawingContext.filter = 'none';
    drawingContext.filter = 'none';
    drawVariantLetter(uniqueElementLetter('Rundtest', 'hf'), rh.x + 14, rh.y - 10);
    drawVariantLetter(uniqueElementLetter('Sem1'), rsem.x, rsem.y);
  }

  /* --- Helle Floater: entfernt --- */
  /* --- elongCircleCluster: entfernt --- */
  /* --- L-förmiger Mini-Floater: entfernt --- */

  /* --- Nucleus-Tropfen (3 Stück, Drop 2+3 als fix verankertes Semikolon) --- */
  nucleusDrops.forEach(d => {
    if (d.semiTiedTo) {
      // Position fest an Anker koppeln, kein eigenes update
      const a = d.semiTiedTo;
      const loosen = elementFlowOffset(
        `${a._label || a._compareLabel || 'group'}-${d.semiOffset.x.toFixed(1)}-${d.semiOffset.y.toFixed(1)}`,
        d._label === 'Dreieck' || a._label === 'Dreieck' ? 5.5 : 4.5
      );
      d.pos.set(a.pos.x + d.semiOffset.x + loosen.x, a.pos.y + d.semiOffset.y + loosen.y);
      d.vel.set(0, 0);
      d.acc.set(0, 0);
    } else if (typeof d._compareCopy === 'number') {
      const compareLabel = d._compareLabel || d._label;
      const p = flowedPoint(
        p5.Vector.add(comparePlacedSlot(compareLabel, 'orig', d._compareCopy, compareSlot(d._compareCopy, 'orig')), cmpMotion),
        `${compareLabel}-orig-${d.semiOffset ? d.semiOffset.x : 0}-${d.semiOffset ? d.semiOffset.y : 0}`,
        12
      );
      d.pos.set(p.x, p.y);
      d.vel.set(0, 0);
      d.acc.set(0, 0);
    } else {
      d.update(mouseMoving, oppositeMovementNS);
    }
  });
  nucleusDrops.forEach(d => {
    const a = (typeof d._alphaMul === 'number') ? d._alphaMul : 1;
    let s = (typeof d._compareCopy === 'number') ? 0.9 : 1;
    const compareLabel = d._compareLabel || d._label;
    if (typeof d._compareCopy === 'number' && !compareVariantVisible(compareLabel, 'orig')) return;
    if (compareLabel === 'Nucleus 1') s *= 0.85;
    const faded = compareLabel === 'Nucleus 1' || compareLabel === 'Nucleus 2';
    if (a !== 1 || s !== 1) {
      drawingContext.save();
      if (faded) drawingContext.globalAlpha *= 0.86;
      drawingContext.globalAlpha *= a * ELEMENT_ALPHA;
      if (s !== 1) {
        translate(d.pos.x, d.pos.y);
        scale(s);
        translate(-d.pos.x, -d.pos.y);
      }
      d.display();
      drawingContext.restore();
    } else {
      drawingContext.save();
      if (faded) drawingContext.globalAlpha *= 0.86;
      drawingContext.globalAlpha *= ELEMENT_ALPHA;
      d.display();
      drawingContext.restore();
    }
  });
  nucleusDrops.forEach(d => {
    if (typeof d._compareCopy !== 'number') return;
    const compareLabel = d._compareLabel || d._label;
    const r = (d.size || 20) * 0.62 * 0.8;
    const origSlot = comparePlacedSlot(compareLabel, 'orig', d._compareCopy, compareSlot(d._compareCopy, 'orig'));
    const ox = d.pos.x - (origSlot.x + cmpMotion.x);
    const oy = d.pos.y - (origSlot.y + cmpMotion.y);
    const hp = flowedPoint(p5.Vector.add(comparePlacedSlot(compareLabel, 'hf', d._compareCopy, compareSlot(d._compareCopy, 'hf')), cmpMotion), `${compareLabel}-hf-${d._compareCopy}`, 13);
    const sp = flowedPoint(p5.Vector.add(comparePlacedSlot(compareLabel, 'slime', d._compareCopy, compareSlot(d._compareCopy, 'slime')), cmpMotion), `${compareLabel}-slime-${d._compareCopy}`, compareLabel === 'Dreieck' || compareLabel === 'Nuclei-Gruppe' ? 17 : 13);
    const tp = flowedPoint(p5.Vector.add(comparePlacedSlot(compareLabel, 'tube', d._compareCopy, compareSlot(d._compareCopy, 'tube')), cmpMotion), `${compareLabel}-tube-${d._compareCopy}`, 13);
    let variantR = compareLabel === 'Nucleus 1' ? r * 0.5 : r;
    if (compareLabel === 'Nucleus 1') variantR *= 0.85;
    const faded = compareLabel === 'Nucleus 1' || compareLabel === 'Nucleus 2';
    if (compareVariantVisible(compareLabel, 'hf')) {
      if (faded) drawingContext.save(), drawingContext.globalAlpha *= 0.72;
      drawingContext.save();
      drawingContext.globalAlpha *= ELEMENT_ALPHA;
      drawHFStyleBlobReplica('', hp.x + ox, hp.y + oy, variantR, d.aspect || 1);
      drawingContext.restore();
      if (faded) drawingContext.restore();
    }
    if (compareVariantVisible(compareLabel, 'slime')) {
      if (compareLabel === 'Dreieck') {
        drawingContext.save();
        drawingContext.globalAlpha *= 0.085 * ELEMENT_ALPHA;
        drawingContext.filter = 'brightness(1.86) contrast(0.58) blur(2.2px)';
        drawSlimeStyleBlobReplica('', sp.x + ox, sp.y + oy, r * 1.04, d.aspect || 1, 18 + d._compareCopy);
        drawingContext.filter = 'none';
        drawingContext.restore();
      } else if (compareLabel === 'Nuclei-Gruppe') {
        drawingContext.save();
        drawingContext.globalAlpha *= 0.82 * ELEMENT_ALPHA;
        drawingContext.save();
        drawingContext.globalAlpha *= ELEMENT_ALPHA;
        drawSlimeStyleBlobReplica('', sp.x + ox, sp.y + oy, r, d.aspect || 1, 18 + d._compareCopy);
        drawingContext.restore();
        drawingContext.restore();
      } else {
        drawSlimeStyleBlobReplica('', sp.x + ox, sp.y + oy, r, d.aspect || 1, 18 + d._compareCopy);
      }
    }
    if (compareVariantVisible(compareLabel, 'tube')) {
      if (faded) drawingContext.save(), drawingContext.globalAlpha *= 0.72;
      drawingContext.save();
      drawingContext.globalAlpha *= ELEMENT_ALPHA;
      drawTubeStyleBlobReplica('', tp.x + ox, tp.y + oy, variantR, d.aspect || 1);
      drawingContext.restore();
      if (faded) drawingContext.restore();
    }
    if (d._label) {
      const shortLabel = compareLabel === 'Nucleus 1' ? 'Nuc1' : compareLabel === 'Nucleus 2' ? 'Nuc2' : compareLabel;
      if (compareVariantVisible(compareLabel, 'orig')) drawVariantLetter(uniqueElementLetter(compareLabel, 'orig'), d.pos.x, d.pos.y);
      if (compareVariantVisible(compareLabel, 'hf')) drawVariantLetter(uniqueElementLetter(compareLabel, 'hf'), hp.x + ox, hp.y + oy);
      if (compareVariantVisible(compareLabel, 'slime')) {
        if (compareLabel === 'Dreieck') {
          drawSceneLabel(uniqueElementLetter(compareLabel, 'slime'), sp.x + ox + r * 2.2, sp.y + oy - r * 1.4);
        } else {
          drawVariantLetter(uniqueElementLetter(compareLabel, 'slime'), sp.x + ox, sp.y + oy);
          if (compareLabel !== 'Nuclei-Gruppe') drawSceneLabel(uniqueElementLetter(compareLabel, 'slime'), sp.x + ox + r * 0.9, sp.y + oy - r * 0.65);
        }
      }
      if (compareVariantVisible(compareLabel, 'tube')) drawVariantLetter(uniqueElementLetter(compareLabel, 'tube'), tp.x + ox, tp.y + oy);
    }
  });

  function drawNucleus1Copy(cx, cy, copyScale, angle, label) {
    const items = nucleusDrops.filter(d => (d._compareLabel || d._label) === 'Nucleus 1' && typeof d._compareCopy === 'number');
    if (!items.length) return;
    const base = comparePlacedSlot('Nucleus 1', 'orig', items[0]._compareCopy, compareSlot(items[0]._compareCopy, 'orig'));
    const sourceCenter = p5.Vector.add(base, cmpMotion);
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    items.forEach(d => {
      const oldPos = d.pos.copy();
      const dx = (d.pos.x - sourceCenter.x) * copyScale;
      const dy = (d.pos.y - sourceCenter.y) * copyScale;
      d.pos.set(cx + dx * ca - dy * sa, cy + dx * sa + dy * ca);
      drawingContext.save();
      drawingContext.globalAlpha *= ((typeof d._alphaMul === 'number') ? d._alphaMul : 1) * 0.92 * ELEMENT_ALPHA;
      d.display();
      drawingContext.restore();
      d.pos.set(oldPos.x, oldPos.y);
    });
    drawVariantLetter(label, cx, cy);
  }

  const ac2 = flowedPoint(createVector(width * 0.80 + cmpMotion.x, height * 0.88 + cmpMotion.y), 'a-copy-2', 13);
  drawNucleus1Copy(ac2.x, ac2.y, 0.85, Math.PI, uniqueElementLetter('A-copy-2'));
  {
    const b1 = flowedPoint(p5.Vector.add(createVector(width * 0.15, height * 0.82), cmpMotion), 'b-copy-1', 13);
    const b2 = flowedPoint(p5.Vector.add(createVector(width * 0.23, height * 0.91), cmpMotion), 'b-copy-2', 13);
    drawingContext.save();
    drawingContext.globalAlpha *= ELEMENT_ALPHA;
    drawHFStyleBlobReplica('', b1.x, b1.y, NUCLEUS_DROP_BASE_SIZE * 0.74 * 0.8 * 0.5, 1);
    drawHFStyleBlobReplica('', b2.x, b2.y, NUCLEUS_DROP_BASE_SIZE * 0.74 * 0.8 * 0.5, 1);
    drawingContext.restore();
    drawVariantLetter(uniqueElementLetter('B-copy-1'), b1.x, b1.y);
    drawVariantLetter(uniqueElementLetter('B-copy-2'), b2.x, b2.y);
  }

  if (NUCLEUS_DROP_MARK) {
    nucleusDrops.forEach((d, i) => d.drawMarker(String(i + 1)));
  }
  // Gruene Labels fuer Nuclei-Anker
  if (SHOW_LABELS) {
    drawingContext.save();
    drawingContext.font = '600 15px system-ui, -apple-system, sans-serif';
    drawingContext.fillStyle = '#22c55e';
    drawingContext.shadowColor = 'rgba(0,0,0,0.55)';
    drawingContext.shadowBlur = 4;
    drawingContext.textBaseline = 'middle';
    nucleusDrops.forEach(d => {
      if (d._label) {
        const compareLabel = d._compareLabel || d._label;
        if (typeof d._compareCopy === 'number' && !compareVariantVisible(compareLabel, 'orig')) return;
        if (compareLabel === 'Nuclei-Gruppe') return;
        const r = (d.size || 20) * 0.9 + 10;
        drawingContext.fillText(d._label === 'Dreieck' ? uniqueElementLetter('Dreieck', 'slime') : uniqueElementLetter('Nuclei-Gruppe', 'slime'), d.pos.x + r, d.pos.y - r * 0.6);
      }
    });
    drawingContext.restore();
  }

  const hfMotionX = (floater.pos.x - floater.base.x) * 1.45;
  const hfMotionY = (floater.pos.y - floater.base.y) * 1.45;
  const hfBaseX = width * 0.66;
  const hf1BaseY = height * 0.27;

  /* --- Floater vorn --- */
  {
    const oldPos = floater.pos.copy();
    floater.pos.set(hfBaseX + hfMotionX, hf1BaseY + hfMotionY);
    push();
    drawingContext.save();
    drawingContext.globalAlpha *= 0.64;
    drawingContext.filter = 'contrast(1.16) brightness(1.03)';
    translate(floater.pos.x, floater.pos.y);
    scale(0.80, 0.93);
    translate(-floater.pos.x, -floater.pos.y);
    floater.display();
    drawingContext.save();
    drawingContext.globalAlpha = 1;
    translate(floater.pos.x, floater.pos.y);
    floater.drawFleckLocal(floater.fleckLocal.x, floater.fleckLocal.y);
    drawingContext.restore();
    drawingContext.filter = 'none';
    drawingContext.restore();
    pop();
    drawSceneLabel(uniqueElementLetter('HF1'), floater.pos.x + 34, floater.pos.y - 34);
    floater.pos.set(oldPos.x, oldPos.y);
  }
  }

  /* Debug-Markierungen entfernt */
}



/* =========================================================
 * p5 RESIZE
 * ========================================================= */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  prevMouse = createVector(mouseX, mouseY);
  bgParallaxX = 0;
  bgParallaxY = 0;
  queueSceneBuild();
}
