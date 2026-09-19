/* Butterfly Field v4 — image-textured wings with pose-driven 3D kinematics.
 * No spritesheet, frame crossfade, SVG butterfly, framework, CDN or network request.
 * Transparent raster textures now come from FOUR tightly controlled butterfly variants. Each butterfly still uses one rig, but picks one photo-textured wing/body set at birth.
 * Naturalism comes from a four-phase wingbeat plus steering-based flight intentions: short traverses, altitude corrections, glides and beat-linked impulses.
 * Each wing also gets coherent feathering (pitch), sweep, camber and a tiny spanwise lag.
 * There is no cloth/spring solver: the motion is analytic, deterministic and GPU-deformed.
 * This is an art-directed kinematic model, not a species-calibrated aerodynamic simulation.
 * Edit DEFAULTS below, or set window.BUTTERFLY_OPTIONS before this script.
 */
(() => {
  'use strict';
  const ASSET_SETS = [{"forewing":"/butterflies/master_forewing.webp","hindwing":"/butterflies/master_hindwing.webp","body":"/butterflies/master_body.webp"},{"forewing":"/butterflies/softA_forewing.webp","hindwing":"/butterflies/softA_hindwing.webp","body":"/butterflies/softA_body.webp"},{"forewing":"/butterflies/softB_forewing.webp","hindwing":"/butterflies/softB_hindwing.webp","body":"/butterflies/softB_body.webp"},{"forewing":"/butterflies/softC_forewing.webp","hindwing":"/butterflies/softC_hindwing.webp","body":"/butterflies/softC_body.webp"}];
  const DEFAULTS = Object.freeze({
    seed: 49177,
    count: 0,                      // 0: responsive; desktop 7–9, phone 4.
    speed: 1,                      // Translation multiplier; NOT the wing rate.
    wingSpeed: 1,                  // Independent wing-rate multiplier.
    minWingSpan: 48,               // Projected upper-wing length in CSS px.
    maxWingSpan: 104,
    maxPixelRatio: 1.75,
    maxRenderPixels: 3000000,      // Pixel budget for HiDPI/large screens.
    wingArticulation: 1,           // Feathering/sweep/camber. 0 = simple hinged flap.
    wingFlex: .72,                 // Small spanwise lag. Kept deliberately subtle.
    exposure: 1.14,
    grain: 0.78,
    bloom: 0.14,
    gradient: 1,
    butterflyBlur: 1.80,          // Base blur in px/texel space applied directly to butterflies.
    butterflyDepthBlur: 2.15,     // Extra blur for distant butterflies.
    butterflyMotionBlur: 0.62,    // Extra blur when wing/body motion is faster.

    allowGlides: true,
    respectReducedMotion: true,
  });
  const cfg = { ...DEFAULTS };
  let canvas = document.getElementById('butterfly-field');
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = x => { x = clamp(x, 0, 1); return x*x*(3-2*x); };
  const smoother = x => { x = clamp(x,0,1); return x*x*x*(x*(x*6-15)+10); };
  const fract = x => x - Math.floor(x);
  const damp = (a,b,rate,dt) => mix(a,b,1-Math.exp(-rate*dt));
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  const numericOptions = {
    count:[0,28], speed:[0,3], wingSpeed:[.15,3], minWingSpan:[16,150], maxWingSpan:[24,240],
    maxPixelRatio:[.5,2.5], maxRenderPixels:[300000,8300000],
    exposure:[.3,2], grain:[0,2], bloom:[0,.5], gradient:[0,2],
    butterflyBlur:[0,6], butterflyDepthBlur:[0,6], butterflyMotionBlur:[0,3],
    wingArticulation:[0,1.6], wingFlex:[0,1.5]
  };
  function applyOptions(options) {
    if(!options || typeof options!=='object')return;
    for(const [key,[lo,hi]] of Object.entries(numericOptions))
      if(Object.prototype.hasOwnProperty.call(options,key))cfg[key]=clamp(finite(options[key],cfg[key]),lo,hi);
    for(const k of ['allowGlides','respectReducedMotion'])
      if(typeof options[k]==='boolean')cfg[k]=options[k];
    if(Object.prototype.hasOwnProperty.call(options,'seed'))cfg.seed=finite(options.seed,cfg.seed)>>>0;
    cfg.count=Math.round(cfg.count);
    if(cfg.minWingSpan>cfg.maxWingSpan)cfg.minWingSpan=cfg.maxWingSpan;
  }
  applyOptions(window.BUTTERFLY_OPTIONS);

  class Random {
    constructor(seed) { this.state = seed >>> 0; }
    next() {
      let t = this.state += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    range(a,b) { return mix(a,b,this.next()); }
  }
  function hash(n,s) { return fract(Math.sin(n*127.1+s*31.79)*43758.5453); }
  function noise(t,s) {
    const i=Math.floor(t), f=fract(t);
    return mix(hash(i,s),hash(i+1,s),smoother(f))*2-1;
  }

  // A butterfly wingbeat is not a sinusoid. The important visual events are the
  // fast power stroke, the rapid pitch flip at the bottom, the slower recovery,
  // and a second pitch flip while the wing briefly hangs at the top.
  // Values are art-directed for this side-profile artwork.
  function wingCycle(phase) {
    const p=fract(phase);
    const downEnd=.34, bottomFlipEnd=.415, upEnd=.91;
    let angle, feather, sweep, camber, power=0;
    if(p<downEnd) {
      const s=smoother(p/downEnd);
      angle=mix(1.14,-.50,s);
      feather=mix(.36,.24,smooth(s));
      sweep=mix(-.030,.050,s);
      camber=.052*Math.sin(Math.PI*s);
      power=Math.pow(Math.sin(Math.PI*s),1.55);
    } else if(p<bottomFlipEnd) {
      const s=smoother((p-downEnd)/(bottomFlipEnd-downEnd));
      // The stroke almost stops while the wing rapidly pronates.
      angle=-.50+.022*Math.sin(Math.PI*s);
      feather=mix(.24,-.31,s);
      sweep=mix(.050,.035,s);
      camber=mix(.012,-.008,s);
    } else if(p<upEnd) {
      const s=smoother((p-bottomFlipEnd)/(upEnd-bottomFlipEnd));
      angle=mix(-.50,1.14,s);
      feather=mix(-.31,-.20,smooth(s));
      sweep=mix(.035,-.035,s);
      camber=-.024*Math.sin(Math.PI*s);
    } else {
      const s=smoother((p-upEnd)/(1-upEnd));
      // Supination happens while the wing is almost stationary at the top.
      angle=1.14-.014*Math.sin(Math.PI*s);
      feather=mix(-.20,.36,s);
      sweep=mix(-.035,-.030,s);
      camber=mix(-.006,0,s);
    }
    return {angle,feather,sweep,camber,power};
  }

  function glidePose(t,seed) {
    return {
      angle:.82+.025*noise(t*.42,seed+72),
      feather:.055+.018*noise(t*.31,seed+19),
      sweep:-.018,
      camber:.010,
      power:0
    };
  }

  let width=1, height=1, dpr=1, time=0, accumulator=0;
  const MOTION_STORAGE_KEY='portfolio.butterflies.paused';
  const storedPausePreference=(()=>{try{return localStorage.getItem(MOTION_STORAGE_KEY)!=='false';}catch{return true;}})();
  let birds=[], ordered=[], raf=0, lastTimestamp=0, paused=storedPausePreference, destroyed=false;
  let ready=false, lost=false, renderer=null, images=null;
  let cameraY=window.scrollY;
  const VARIANT_COUNT = ASSET_SETS ? ASSET_SETS.length : 0;
  const params = new URLSearchParams(location.search);
  const solo = params.get('solo') === '1'; // Inspection mode, no added interface.
  const manual = params.get('manual') === '1';
  const fixedDT = 1/120;
  const maxSubsteps = 6;
  const stats={frames:0,physicsTotal:0,physicsMax:0,submitTotal:0,frameIntervals:0,
    intervalCount:0,discardedCatchups:0,simulationSteps:0};
  const byDepth=(a,b)=>a.depth-b.depth;
  function drawOrder() {
    ordered.length=birds.length;
    for(let i=0;i<birds.length;i++)ordered[i]=birds[i];
    return ordered.sort(byDepth);
  }

  class Butterfly {
    constructor(index, count) {
      this.id=index;
      this.random=new Random((cfg.seed ^ Math.imul(index+1,2654435761))>>>0);
      this.seed=this.random.range(1,9999);
      this.depth=clamp((index+.5)/count+this.random.range(-.055,.055),.1,.92);
      this.view={};
      this.reset(true);
    }
    chooseBurst() {
      this.beatsRemaining=Math.floor(this.random.range(2,10));
      this.burstRate=this.rate*this.random.range(.78,1.18);
    }
    pickWaypoint(force=false, reason='cruise') {
      const r=this.random;
      const marginTop=this.flightCeiling ?? Math.min(height*.18, this.span+42);
      const marginBottom=this.flightFloor ?? Math.max(marginTop+60,height-marginTop);
      const bandCenter=(this.cruiseY ?? this.y);
      const centerPull=clamp((bandCenter-this.y)*0.40,-52,52);
      let dy=0;
      if(this.gliding) {
        dy=r.range(6,34)+centerPull*0.35;
        if(this.y < marginTop+24) dy=Math.max(dy, r.range(18,54));
      } else if(reason==='climb') {
        dy=r.range(-72,-22)+centerPull;
      } else if(reason==='descend') {
        dy=r.range(20,78)+centerPull;
      } else if(reason==='correct-top') {
        dy=r.range(28,84);
      } else if(reason==='correct-bottom') {
        dy=r.range(-84,-28);
      } else if(reason==='initial') {
        dy=r.range(-16,16);
      } else {
        const pick=r.next();
        if(this.y < marginTop+36) dy=r.range(20,70);
        else if(this.y > marginBottom-36) dy=r.range(-70,-20);
        else if(pick<.22) dy=r.range(-60,-18)+centerPull;
        else if(pick<.44) dy=r.range(18,60)+centerPull;
        else dy=r.range(-24,24)+centerPull*0.65;
      }
      const ahead=r.range(this.span*1.8,this.span*4.0)*clamp(width/1000,.82,1.2);
      this.targetX=this.x+this.direction*ahead;
      this.targetY=clamp(this.y+dy,marginTop,marginBottom);
      this.segmentRemaining=this.gliding?r.range(.42,1.0):r.range(.22,.66);
      const pace=(this.gliding?r.range(.58,.86):r.range(.78,1.16));
      this.desiredSpeed=this.baseSpeed*cfg.speed*pace;
      this.segmentKind=reason;
      if(force){ this.targetY=clamp(this.targetY,marginTop,marginBottom); }
    }
    reset(initial=false) {
      const r=this.random;
      this.direction = initial ? (this.id%2===0?1:-1) : (r.next()<.5?1:-1);
      this.depth=clamp(this.depth+r.range(-.035,.035),.1,.92);
      const mobileScale=clamp(width/850,.70,1);
      this.span=mix(cfg.minWingSpan,cfg.maxWingSpan,this.depth)*r.range(.94,1.06)*mobileScale;
      this.scale=this.span/326;
      // Stable individual pace, independent of apparent depth.
      this.baseSpeed=mix(33,78,this.depth)*mix(.65,1.45,hash(this.id,this.seed+127))*mobileScale;
      this.opacity=mix(.47,.95,this.depth);
      // Frequency belongs to the animal, not to display depth. The old slow 2.5–3.5 Hz
      // cycle read like a mechanical flap; this range gives a short, crisp butterfly beat.
      this.rate=r.range(4.15,5.25);
      this.phase=r.next();
      this.age=r.range(0,30);
      this.gliding=false;
      this.glideRemaining=0;
      this.glideBlend=0;
      this.chooseBurst();
      if(!Number.isInteger(this.variantIndex)) this.variantIndex=Math.floor(this.random.next()*Math.max(1,VARIANT_COUNT));
      const pose=wingCycle(this.phase);
      this.angle=pose.angle;this.feather=pose.feather;this.sweep=pose.sweep;this.camber=pose.camber;
      this.power=pose.power;
      this.tipFlex=0;
      this.angularVelocity=0;
      this.angularAcceleration=0;
      this.pitch=r.range(-.045,.045);
      this.yaw=r.range(.10,.27);
      this.elevation=r.range(.13,.23);
      const yMargin=Math.min(height*.18, this.span+42);
      this.flightCeiling=yMargin;
      this.flightFloor=Math.max(this.flightCeiling+60,height-yMargin);
      this.cruiseY=r.range(this.flightCeiling,this.flightFloor);
      this.y=this.cruiseY;
      this.vy=r.range(-3,3);
      this.vx=this.direction*this.baseSpeed*cfg.speed;
      this.heading=0;
      this.desiredSpeed=this.baseSpeed*cfg.speed;
      this.targetX=0; this.targetY=this.y; this.segmentRemaining=0; this.segmentKind='cruise';
      this.x = initial ? width*fract(.11+this.id*.61803398875+r.range(-.028,.028))
                       : (this.direction>0 ? -this.span*2.7 : width+this.span*2.7);
      if (initial) {
        this.cruiseY=height*mix(.18,.82,fract(.27+this.id*.38196601125+r.range(-.075,.075)));
        this.y=this.cruiseY;
      }
      if(solo) {
        this.direction=1; this.depth=.9; this.opacity=.94;
        this.span=height*.34; this.scale=this.span/326;
        this.x=width*.54; this.y=height*.54; this.cruiseY=this.y;
      }
      this.pickWaypoint(true, 'initial');
      this.capturePrevious();
    }
    capturePrevious() {
      this.previousX=this.x;this.previousY=this.y;this.previousAngle=this.angle;
      this.previousPitch=this.pitch;this.previousYaw=this.yaw;this.previousVelocity=this.angularVelocity;
      this.previousFeather=this.feather;this.previousSweep=this.sweep;this.previousCamber=this.camber;
      this.previousTipFlex=this.tipFlex;
    }
    pose(alpha=1) {
      const v=this.view;
      v.x=mix(this.previousX??this.x,this.x,alpha);v.y=mix(this.previousY??this.y,this.y,alpha);
      if(!solo) {
        // Recycle only beyond the viewport, keeping scroll reversible and flight intact.
        const margin=this.span*3.1,period=height+margin*2;
        const worldY=v.y-cameraY*(isReduced()?1:mix(.35,.85,this.depth));
        const band=Math.floor((worldY+margin)/period);
        v.y=worldY-band*period;
        if(band!==0)v.x=width*fract(v.x/width+hash(band,this.seed+149)*.6);
      }
      v.angle=mix(this.previousAngle??this.angle,this.angle,alpha);
      v.pitch=mix(this.previousPitch??this.pitch,this.pitch,alpha);
      v.yaw=mix(this.previousYaw??this.yaw,this.yaw,alpha);
      v.angularVelocity=mix(this.previousVelocity??this.angularVelocity,this.angularVelocity,alpha);
      v.feather=mix(this.previousFeather??this.feather,this.feather,alpha);
      v.sweep=mix(this.previousSweep??this.sweep,this.sweep,alpha);
      v.camber=mix(this.previousCamber??this.camber,this.camber,alpha);
      v.tipFlex=mix(this.previousTipFlex??this.tipFlex,this.tipFlex,alpha);
      v.elevation=this.elevation;v.depth=this.depth;v.opacity=this.opacity;v.seed=this.seed;
      v.span=this.span;v.scale=this.scale;v.direction=this.direction;v.gliding=this.gliding;
      v.variantIndex=Number.isInteger(this.variantIndex)?this.variantIndex:0;
      return v;
    }
    update(dt) {
      this.capturePrevious();
      this.age+=dt;
      const t=this.age;

      // Bursts end only at the top reversal. A glide can therefore never freeze an
      // arbitrary mid-stroke pose, which was a major source of mechanical-looking motion.
      if(this.gliding) {
        this.glideRemaining-=dt;
        if(this.glideRemaining<=0) {
          this.gliding=false;this.phase=0;this.chooseBurst();
        }
      } else {
        // Continuous, individual tempo drift rather than per-frame random jitter.
        const tempo=1+.19*noise(t*.73,this.seed+103)+.08*noise(t*1.91,this.seed+107);
        const advance=dt*this.burstRate*tempo*cfg.wingSpeed;
        const total=this.phase+advance;
        const wraps=Math.floor(total);
        this.phase=fract(total);
        if(wraps>0) {
          this.beatsRemaining-=wraps;
          if(!solo && this.random.next()<.52) {
            const reason=this.random.next()<.27 ? (this.random.next()<.5?'climb':'descend') : 'cruise';
            this.pickWaypoint(false,reason);
          }
          if(cfg.allowGlides && this.beatsRemaining<=0) {
            this.gliding=true;this.phase=0;
            this.glideRemaining=this.random.range(.22,.95);
            if(!solo) this.pickWaypoint(false,'glide');
          } else if(this.beatsRemaining<=0) this.chooseBurst();
        }
      }
      this.glideBlend=damp(this.glideBlend,this.gliding?1:0,13,dt);

      const flap=wingCycle(this.phase), glide=glidePose(t,this.seed);
      const g=this.glideBlend;
      // Vary stroke depth smoothly while keeping both wings mechanically coupled.
      const amplitude=.88+.12*noise(t*.61,this.seed+113);
      const nextAngle=mix(.32+(flap.angle-.32)*amplitude,glide.angle,g);
      const nextFeather=mix(flap.feather,glide.feather,g)*cfg.wingArticulation;
      const nextSweep=mix(flap.sweep,glide.sweep,g)*cfg.wingArticulation;
      const nextCamber=mix(flap.camber,glide.camber,g)*cfg.wingArticulation;
      this.power=flap.power*amplitude*(1-g);

      const lastVelocity=this.angularVelocity;
      this.angularVelocity=(nextAngle-this.angle)/dt;
      this.angularAcceleration=(this.angularVelocity-lastVelocity)/dt;
      this.angle=nextAngle;this.feather=nextFeather;this.sweep=nextSweep;this.camber=nextCamber;
      // A tiny velocity-derived spanwise lag: the root changes direction first, the tip
      // follows by only a few degrees. No oscillation is stored, so it cannot become rubbery.
      const flexTarget=clamp(-this.angularVelocity*.0048*cfg.wingFlex,-.125,.125);
      this.tipFlex=damp(this.tipFlex,flexTarget,32,dt);

      if(!solo) {
        this.segmentRemaining-=dt;
        const reached = this.direction>0 ? this.x>=this.targetX : this.x<=this.targetX;
        if(this.y < this.flightCeiling+10) this.pickWaypoint(false,'correct-top');
        else if(this.y > this.flightFloor-10) this.pickWaypoint(false,'correct-bottom');
        else if(this.segmentRemaining<=0 || reached) this.pickWaypoint();
      }

      const dx=this.targetX-this.x;
      const dy=this.targetY-this.y;
      const wander=(!this.gliding?noise(t*.43,this.seed+51)*0.055:noise(t*.33,this.seed+51)*0.02);
      const desiredHeading=clamp(Math.atan2(-dy,Math.abs(dx)||1)+wander,-.34,.34);
      this.heading=damp(this.heading,desiredHeading,this.gliding?1.25:2.2,dt);
      const desiredVX=this.direction*Math.cos(this.heading)*this.desiredSpeed*(1+.12*noise(t*.37,this.seed+11));
      const desiredVY=-Math.sin(this.heading)*this.desiredSpeed + (this.gliding?7.0:0.0);
      this.vx=damp(this.vx,desiredVX,this.gliding?1.15:3.2,dt);
      this.vy=damp(this.vy,desiredVY,this.gliding?1.05:1.85,dt);

      // Stroke-linked thrust and recovery drag produce short accelerations.
      // Scale with individual pace; zero translation speed still means no thrust.
      const thrust=this.baseSpeed*cfg.speed;
      this.vx+=this.direction*thrust*4.2*this.power*dt;
      this.vy+=thrust*(-1.8*this.power+.26*(1-g)+.12*g)*dt;
      this.vy=clamp(this.vy,-92,92);
      this.y+=this.vy*dt;
      this.x+=this.vx*dt;
      // Body attitude follows the flight path with inertia, not a separate wobble.
      const targetPitch=clamp(Math.atan2(-this.vy,Math.max(Math.abs(this.vx),20))*.58
        +.045*this.power-.025*g,-.22,.22);
      this.pitch=damp(this.pitch,targetPitch,3.4,dt);
      const turn=clamp(desiredHeading-this.heading,-.25,.25);
      this.yaw=damp(this.yaw,.17+.38*turn+.025*noise(t*.16,this.seed+90)+.018*g,1.8,dt);
      if(solo) { this.x=width*.54; this.y=height*.56; }
      const margin=this.span*3.1;
      if(!solo && ((this.direction>0 && this.x>width+margin) || (this.direction<0 && this.x<-margin)))
        this.reset(false);
    }
  }

  const VERTEX = `
    precision highp float;
    attribute vec2 a_xy;
    attribute vec2 a_uv;
    uniform vec2 u_resolution;
    uniform vec2 u_origin;
    uniform float u_scale, u_direction, u_pitch, u_yaw, u_elevation;
    uniform float u_angle, u_velocity, u_side, u_part, u_time;
    uniform vec4 u_kinematic; // feather, sweep, camber, spanwise phase lag
    varying vec2 v_uv;
    varying float v_facing;
    void main() {
      float x=a_xy.x;
      float y=-a_xy.y;
      float z=0.0;
      v_facing=1.0;
      if(u_part>0.5) {
        float span=max(y,0.0);
        float spanLimit=u_part>1.5?185.0:333.0;
        float radial=clamp(span/spanLimit,0.0,1.0);
        float r2=radial*radial;
        float leading=u_part>1.5?(-38.0*radial-48.0*r2):(145.0*radial-75.0*r2);
        float chord=u_part>1.5?242.0*sin(2.0420352*radial):175.0*sin(2.5132741*radial);
        chord=max(chord,18.0);
        float trailing=clamp((leading-x)/chord,0.0,1.0);
        float vein=leading-.20*chord;
        float chordOffset=x-vein;

        // 1) Fore/aft sweep: a coherent whole-wing degree of freedom.
        float sweepFactor=.20+.80*radial;
        x+=u_kinematic.y*span*sweepFactor;
        vein+=u_kinematic.y*span*sweepFactor;

        // 2) Feathering/pronation: rotate the chord around the spanwise venation axis.
        // The root is stiff, while the outer/trailing membrane follows the pitch flip.
        float feather=u_kinematic.x*(.30+.70*r2)*(.72+.28*trailing);
        float normal=-chordOffset*sin(feather);
        x=vein+chordOffset*cos(feather);

        // 3) Camber is quasi-static and reverses with the aerodynamic stroke.
        normal+=u_kinematic.z*chord*1.15*trailing*(1.0-trailing)*smoothstep(.05,.42,radial);

        // 4) The tip lags the hinge by a few degrees. This is intentionally not a
        // spring/cloth mode; it is a bounded spanwise phase lag tied to stroke speed.
        float localAngle=u_angle+u_kinematic.w*(.10*radial+.90*r2);
        x-=span*.030;
        y=span*sin(localAngle)+normal*cos(localAngle);
        z=u_side*(span*cos(localAngle)-normal*sin(localAngle)+4.0);

        // Edge-on wing sections are slightly dimmer. Projection already provides the
        // actual silhouette change, so this remains a restrained photometric cue.
        float chordFacing=.68+.32*abs(cos(feather));
        float flapFacing=.80+.20*abs(sin(localAngle+u_side*u_elevation));
        v_facing=chordFacing*flapFacing;
      } else {
        float tail=clamp(-x/150.0,0.0,1.0);
        y+=tail*tail*(1.6*sin(u_time*2.7)+u_velocity*.055);
        float antenna=clamp((x-50.0)/140.0,0.0,1.0);
        y+=antenna*antenna*1.6*sin(u_time*3.7);
      }
      float cx=x*cos(u_yaw)+z*sin(u_yaw);
      float cz=-x*sin(u_yaw)+z*cos(u_yaw);
      float cy=y*cos(u_elevation)-cz*sin(u_elevation);
      float depth=y*sin(u_elevation)+cz*cos(u_elevation);
      float perspective=1400.0/(1400.0-depth);
      vec2 q=vec2(cx,cy)*perspective*u_scale;
      vec2 rotated=vec2(q.x*cos(u_pitch)-q.y*sin(u_pitch), q.x*sin(u_pitch)+q.y*cos(u_pitch));
      vec2 screen=u_origin+vec2(rotated.x*u_direction,-rotated.y);
      gl_Position=vec4(screen.x/u_resolution.x*2.0-1.0,1.0-screen.y/u_resolution.y*2.0,0.0,1.0);
      v_uv=a_uv;
    }
  `;
  const FRAGMENT = `
    precision highp float;
    uniform sampler2D u_texture;
    uniform float u_opacity, u_exposure, u_softness, u_blur;
    uniform vec2 u_texel;
    varying vec2 v_uv;
    varying float v_facing;
    void main() {
      // A lightweight separable-style blur is applied directly in the butterfly material.
      vec2 d=u_texel*u_blur;
      vec4 texel=texture2D(u_texture,v_uv,u_softness)*0.16;
      texel+=texture2D(u_texture,v_uv+vec2(d.x,0.0),u_softness)*0.12;
      texel+=texture2D(u_texture,v_uv-vec2(d.x,0.0),u_softness)*0.12;
      texel+=texture2D(u_texture,v_uv+vec2(0.0,d.y),u_softness)*0.12;
      texel+=texture2D(u_texture,v_uv-vec2(0.0,d.y),u_softness)*0.12;
      texel+=texture2D(u_texture,v_uv+d,u_softness)*0.08;
      texel+=texture2D(u_texture,v_uv-d,u_softness)*0.08;
      texel+=texture2D(u_texture,v_uv+vec2(d.x,-d.y),u_softness)*0.08;
      texel+=texture2D(u_texture,v_uv+vec2(-d.x,d.y),u_softness)*0.08;
      if(u_blur>1.1){
        vec2 d2=d*2.0;
        texel+=texture2D(u_texture,v_uv+vec2(d2.x,0.0),u_softness)*0.03;
        texel+=texture2D(u_texture,v_uv-vec2(d2.x,0.0),u_softness)*0.03;
        texel+=texture2D(u_texture,v_uv+vec2(0.0,d2.y),u_softness)*0.03;
        texel+=texture2D(u_texture,v_uv-vec2(0.0,d2.y),u_softness)*0.03;
        texel+=texture2D(u_texture,v_uv+d2,u_softness)*0.02;
        texel+=texture2D(u_texture,v_uv-d2,u_softness)*0.02;
        texel+=texture2D(u_texture,v_uv+vec2(d2.x,-d2.y),u_softness)*0.02;
        texel+=texture2D(u_texture,v_uv+vec2(-d2.x,d2.y),u_softness)*0.02;
      }
      if(texel.a<.002) discard;
      gl_FragColor=vec4(texel.rgb*u_exposure*v_facing*u_opacity,texel.a*u_opacity);
    }
  `;
  const SCREEN_VERTEX = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.0,1.0);}
  `;
  const BACKGROUND_FRAGMENT = `
    precision highp float;
    varying vec2 v_uv;
    uniform float u_gradient;
    void main() {
      vec2 p=(v_uv-vec2(.50,.53))*vec2(1.03,1.0);
      float glow=exp(-dot(p,p)*6.0);
      float core=exp(-dot(p-vec2(-.07,.04),p-vec2(-.07,.04))*13.0);
      vec3 col=vec3(.0009,.0017,.0033)+vec3(.016,.041,.068)*glow*u_gradient
        +vec3(.002,.008,.013)*core*u_gradient;
      gl_FragColor=vec4(col,1.0);
    }
  `;
  const POST_FRAGMENT = `
    precision highp float;
    uniform sampler2D u_scene;
    uniform vec2 u_pixels;
    uniform float u_time,u_grain,u_bloom;
    varying vec2 v_uv;
    float random(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
    vec3 lightAt(vec2 uv){vec3 s=texture2D(u_scene,uv).rgb;return max(s-vec3(.23),vec3(0.0));}
    void main(){
      vec3 c=texture2D(u_scene,v_uv).rgb;
      vec2 d=u_pixels*2.2;
      if(u_bloom>.0001) {
      vec3 halo=lightAt(v_uv+vec2(d.x,0.0))+lightAt(v_uv-vec2(d.x,0.0))
        +lightAt(v_uv+vec2(0.0,d.y))+lightAt(v_uv-vec2(0.0,d.y));
      halo+=.5*(lightAt(v_uv+d*2.0)+lightAt(v_uv-d*2.0)
        +lightAt(v_uv+vec2(d.x,-d.y)*2.0)+lightAt(v_uv+vec2(-d.x,d.y)*2.0));
      c+=halo*(u_bloom/6.0);
      }
      float l=dot(c,vec3(.2126,.7152,.0722));
      float tick=floor(u_time*16.0);
      float grain=random(gl_FragCoord.xy+vec2(tick*7.1,tick*13.7))-.5;
      c+=grain*(.009+min(l,.8)*.32)*u_grain;
      vec2 p=v_uv-vec2(.5);
      float vignette=1.0-.26*smoothstep(.16,.64,length(p));
      gl_FragColor=vec4(max(c*vignette,vec3(0.0)),1.0);
    }
  `;

  class Renderer {
    constructor() {
      this.kind='webgl';
      this.gl=canvas.getContext('webgl',{
        alpha:false,antialias:true,premultipliedAlpha:true,depth:false,
        stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'
      });
      if(!this.gl) throw new Error('WebGL is not available.');
      const g=this.gl;
      this.resources=[];
      this.wing=this.program(VERTEX,FRAGMENT,['a_xy','a_uv'],[
        'u_resolution','u_origin','u_scale','u_direction','u_pitch','u_yaw','u_elevation',
        'u_angle','u_velocity','u_side','u_part','u_time','u_opacity','u_exposure','u_softness','u_blur','u_texel','u_texture','u_kinematic'
      ]);
      this.background=this.program(SCREEN_VERTEX,BACKGROUND_FRAGMENT,['a_position'],['u_gradient']);
      this.post=this.program(SCREEN_VERTEX,POST_FRAGMENT,['a_position'],['u_scene','u_pixels','u_time','u_grain','u_bloom']);
      this.quad=g.createBuffer(); this.resources.push(['Buffer',this.quad]);
      g.bindBuffer(g.ARRAY_BUFFER,this.quad);
      g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);
      // Both wing textures use the same UV rectangle: the grids are shared.
      // Distance changes tessellation, not the simulated material properties.
      this.meshes={
        low:this.mesh([-275,-365,160,8],8,6),
        medium:this.mesh([-275,-365,160,8],12,8),
        high:this.mesh([-275,-365,160,8],16,12),
        body:this.mesh([-190,-155,218,136],10,6)
      };
      this.textures=images.map(set=>({
        forewing:this.texture(set.forewing),
        hindwing:this.texture(set.hindwing),
        body:this.texture(set.body)
      }));
      this.scene=g.createTexture(); this.resources.push(['Texture',this.scene]);
      g.bindTexture(g.TEXTURE_2D,this.scene);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
      this.framebuffer=g.createFramebuffer(); this.resources.push(['Framebuffer',this.framebuffer]);
      g.disable(g.DEPTH_TEST);g.disable(g.CULL_FACE);
    }
    program(vs,fs,attribs,uniforms) {
      const g=this.gl, p=g.createProgram();
      for(const [type,source] of [[g.VERTEX_SHADER,vs],[g.FRAGMENT_SHADER,fs]]) {
        const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);
        if(!g.getShaderParameter(s,g.COMPILE_STATUS)) {
          const log=g.getShaderInfoLog(s);g.deleteShader(s);throw new Error(log);
        }
        g.attachShader(p,s);g.deleteShader(s);
      }
      g.linkProgram(p);
      if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(p));
      this.resources.push(['Program',p]);
      const loc={};
      attribs.forEach(n=>loc[n]=g.getAttribLocation(p,n));
      uniforms.forEach(n=>loc[n]=g.getUniformLocation(p,n));
      return {p,...loc};
    }
    mesh(rect,nx,ny) {
      const g=this.gl, data=[], indices=[];
      for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++) {
        const u=x/nx,v=y/ny;
        data.push(mix(rect[0],rect[2],u),mix(rect[1],rect[3],v),u,v);
      }
      for(let y=0;y<ny;y++)for(let x=0;x<nx;x++) {
        const a=y*(nx+1)+x,b=a+1,c=a+nx+1,d=c+1;
        indices.push(a,c,b,b,c,d);
      }
      const vertices=g.createBuffer(),elements=g.createBuffer();
      this.resources.push(['Buffer',vertices],['Buffer',elements]);
      g.bindBuffer(g.ARRAY_BUFFER,vertices);g.bufferData(g.ARRAY_BUFFER,new Float32Array(data),g.STATIC_DRAW);
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,elements);g.bufferData(g.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),g.STATIC_DRAW);
      return {vertices,elements,count:indices.length,vertexCount:(nx+1)*(ny+1)};
    }
    texture(image) {
      const g=this.gl,t=g.createTexture();this.resources.push(['Texture',t]);
      g.bindTexture(g.TEXTURE_2D,t);
      g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,false);
      g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,image);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR);
      g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
      g.generateMipmap(g.TEXTURE_2D);
      return t;
    }
    resize() {
      const g=this.gl;
      canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
      g.bindTexture(g.TEXTURE_2D,this.scene);
      g.texImage2D(g.TEXTURE_2D,0,g.RGBA,canvas.width,canvas.height,0,g.RGBA,g.UNSIGNED_BYTE,null);
      g.bindFramebuffer(g.FRAMEBUFFER,this.framebuffer);
      g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,this.scene,0);
      if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE)
        throw new Error('Unable to create the render target.');
      g.bindFramebuffer(g.FRAMEBUFFER,null);
    }
    fullScreen(p) {
      const g=this.gl;
      g.bindBuffer(g.ARRAY_BUFFER,this.quad);
      g.enableVertexAttribArray(p.a_position);
      g.vertexAttribPointer(p.a_position,2,g.FLOAT,false,0,0);
      g.drawArrays(g.TRIANGLES,0,6);
      g.disableVertexAttribArray(p.a_position);
    }
    meshFor(b,part) {
      return part<.5?this.meshes.body:this.meshes[b.span*dpr>145?'high':b.span*dpr>65?'medium':'low'];
    }
    part(b,name,side,part,angle,opacity) {
      const g=this.gl,p=this.wing,m=this.meshFor(b,part);
      const hind=part>1.5;
      const sideScale=side<0?.985:1.015;
      if(part>.5) g.uniform4f(p.u_kinematic,
        b.feather*(hind?.84:1)*sideScale,
        b.sweep*(hind?.78:1),
        b.camber*(hind?1.12:1),
        b.tipFlex*(hind?.86:1));
      else g.uniform4f(p.u_kinematic,0,0,0,0);
      this.vertexCount+=m.vertexCount;this.drawCalls++;
      g.uniform1f(p.u_angle,angle);g.uniform1f(p.u_side,side);g.uniform1f(p.u_part,part);
      g.uniform1f(p.u_opacity,opacity);
      const softness=mix(.55,-.28,b.depth)+(part>.5?Math.abs(b.angularVelocity)*.0045:0);
      g.uniform1f(p.u_softness,softness);
      const blur=clamp(cfg.butterflyBlur + (1-b.depth)*cfg.butterflyDepthBlur + Math.abs(b.angularVelocity)*cfg.butterflyMotionBlur*0.018, 0.0, 6.0);
      g.uniform1f(p.u_blur,blur);
      g.uniform2f(p.u_texel,1/512,1/512);
      const textureSet=this.textures[(b.variantIndex??0) % this.textures.length] || this.textures[0];
      g.bindTexture(g.TEXTURE_2D,textureSet[name]);
      g.bindBuffer(g.ARRAY_BUFFER,m.vertices);g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,m.elements);
      g.enableVertexAttribArray(p.a_xy);g.enableVertexAttribArray(p.a_uv);
      g.vertexAttribPointer(p.a_xy,2,g.FLOAT,false,16,0);
      g.vertexAttribPointer(p.a_uv,2,g.FLOAT,false,16,8);
      g.drawElements(g.TRIANGLES,m.count,g.UNSIGNED_SHORT,0);
    }
    draw(t,alpha=1) {
      const g=this.gl;
      this.vertexCount=0;this.drawCalls=2;
      g.viewport(0,0,canvas.width,canvas.height);
      g.bindFramebuffer(g.FRAMEBUFFER,this.framebuffer);
      g.disable(g.BLEND);g.useProgram(this.background.p);
      g.uniform1f(this.background.u_gradient,cfg.gradient);
      this.fullScreen(this.background);
      g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA);
      const p=this.wing;g.useProgram(p.p);
      g.uniform2f(p.u_resolution,width,height);
      g.uniform1f(p.u_exposure,cfg.exposure);
      g.uniform1i(p.u_texture,0);g.activeTexture(g.TEXTURE0);
      // Depth is coherent: a distant animal is smaller, dimmer and softer, not a random giant.
      for(const bird of drawOrder()) {
        const b=bird.pose(alpha);
        if(b.x < -b.span*2.7 || b.x > width+b.span*2.7)continue;
        g.uniform2f(p.u_origin,b.x,b.y);
        g.uniform1f(p.u_scale,b.scale);g.uniform1f(p.u_direction,b.direction);
        g.uniform1f(p.u_pitch,b.pitch);g.uniform1f(p.u_yaw,b.yaw);
        g.uniform1f(p.u_elevation,b.elevation);
        g.uniform1f(p.u_velocity,b.angularVelocity);
        g.uniform1f(p.u_time,t+b.seed);
        // Fore- and hindwings are mechanically coupled: no fake asynchronous flapping.
        // Tiny anatomical offsets only prevent perfect coplanar overlap.
        const rearAngle=b.angle-.018;
        this.part(b,'hindwing',-1,2,rearAngle-.006,b.opacity*.66);
        this.part(b,'forewing',-1,1,b.angle-.005,b.opacity*.69);
        this.part(b,'hindwing',1,2,rearAngle+.006,b.opacity*.93);
        this.part(b,'forewing',1,1,b.angle+.005,b.opacity);
        this.part(b,'body',0,0,0,b.opacity);
      }
      g.disableVertexAttribArray(p.a_xy);g.disableVertexAttribArray(p.a_uv);
      g.disable(g.BLEND);g.bindFramebuffer(g.FRAMEBUFFER,null);
      const q=this.post;g.useProgram(q.p);
      g.bindTexture(g.TEXTURE_2D,this.scene);g.uniform1i(q.u_scene,0);
      g.uniform2f(q.u_pixels,1/canvas.width,1/canvas.height);
      g.uniform1f(q.u_time,t);g.uniform1f(q.u_grain,cfg.grain);g.uniform1f(q.u_bloom,cfg.bloom);
      this.fullScreen(q);
    }
    destroy() {
      for(const [type,obj] of this.resources)this.gl[`delete${type}`](obj);
      this.resources=[];
    }
  }

  /** The same wing rig in a lower-cost CPU renderer when WebGL is unavailable.
   * Projected raster strips approximate the flexible mesh; no pose images are swapped.
   */
  class CanvasRenderer {
    constructor() {
      this.kind='canvas2d';this.resources=[];
      this.ctx=canvas.getContext('2d',{alpha:false});
      if(!this.ctx){const replacement=canvas.cloneNode();canvas.replaceWith(replacement);canvas=replacement;this.ctx=canvas.getContext('2d',{alpha:false});}
      if(!this.ctx)throw new Error('No canvas rendering context is available.');
      this.layer=document.createElement('canvas');this.lc=this.layer.getContext('2d');
      this.back=document.createElement('canvas');
      this.textures=images.map(set=>{
        const out={};
        for(const name of ['forewing','hindwing','body']){
          const image=set[name],tex=document.createElement('canvas');tex.width=512;tex.height=512;
          const tc=tex.getContext('2d');tc.filter=`brightness(${cfg.exposure})`;tc.drawImage(image,0,0);
          out[name]=tex;
        }
        return out;
      });
      this.grain=document.createElement('canvas');this.grain.width=this.grain.height=192;
      const gc=this.grain.getContext('2d'),data=gc.createImageData(192,192),r=new Random(91331);
      for(let i=0;i<data.data.length;i+=4){const n=Math.floor(r.next()*40);data.data[i]=n*.72;data.data[i+1]=n*.86;data.data[i+2]=n;data.data[i+3]=255;}
      gc.putImageData(data,0,0);this.pattern=this.ctx.createPattern(this.grain,'repeat');
    }
    resize(){
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      this.back.width=canvas.width;this.back.height=canvas.height;
      const ctx=this.back.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.fillStyle='#010204';ctx.fillRect(0,0,width,height);
      ctx.save();ctx.translate(width*.50,height*.47);ctx.scale(width*.76,height*.83);
      const g=ctx.createRadialGradient(0,0,0,0,0,1);
      const k=cfg.gradient;g.addColorStop(0,`rgb(${Math.round(5*k)},${Math.round(14*k)},${Math.round(24*k)})`);
      g.addColorStop(.45,`rgb(${Math.round(2*k)},${Math.round(6*k)},${Math.round(10*k)})`);g.addColorStop(1,'#000102');
      ctx.fillStyle=g;ctx.fillRect(-2,-2,4,4);ctx.restore();
    }
    project(v,b,side,part,angle,t){
      let x=v.x,y=-v.y,z=0;
      if(part>.5){
        const limit=part>1.5?185:333,span=Math.max(y,0),r=clamp(span/limit,0,1),r2=r*r;
        const leading=part>1.5?-38*r-48*r2:145*r-75*r2;
        const chord=Math.max(18,part>1.5?242*Math.sin(2.0420352*r):175*Math.sin(2.5132741*r));
        const trailing=clamp((leading-x)/chord,0,1);let vein=leading-.20*chord;const offset=x-vein;
        const hind=part>1.5,feather=b.feather*(hind?.84:1)*(.30+.70*r2)*(.72+.28*trailing);
        const sweep=b.sweep*(hind?.78:1);
        x+=sweep*span*(.20+.80*r);vein+=sweep*span*(.20+.80*r);
        let normal=-offset*Math.sin(feather);
        x=vein+offset*Math.cos(feather);
        normal+=b.camber*(hind?1.12:1)*chord*1.15*trailing*(1-trailing)*smooth(r/.42);
        const localAngle=angle+b.tipFlex*(hind?.86:1)*(.10*r+.90*r2);
        x-=span*.030;
        y=span*Math.sin(localAngle)+normal*Math.cos(localAngle);
        z=side*(span*Math.cos(localAngle)-normal*Math.sin(localAngle)+4);
      }else{
        const tail=clamp(-x/150,0,1),antenna=clamp((x-50)/140,0,1);
        y+=tail*tail*(1.6*Math.sin(t*2.7)+b.angularVelocity*.055)+antenna*antenna*1.6*Math.sin(t*3.7);
      }
      const cx=x*Math.cos(b.yaw)+z*Math.sin(b.yaw),cz=-x*Math.sin(b.yaw)+z*Math.cos(b.yaw);
      const cy=y*Math.cos(b.elevation)-cz*Math.sin(b.elevation),depth=y*Math.sin(b.elevation)+cz*Math.cos(b.elevation);
      const k=b.scale*1400/(1400-depth),qx=cx*k,qy=cy*k;
      return {x:(qx*Math.cos(b.pitch)-qy*Math.sin(b.pitch))*b.direction,
        y:-(qx*Math.sin(b.pitch)+qy*Math.cos(b.pitch)),u:v.u,v:v.v};
    }
    part(b,name,side,part,angle,opacity,t,origin){
      const textureSet=this.textures[(b.variantIndex??0) % this.textures.length] || this.textures[0];
      const tex=textureSet[name];
      const rect=name==='body'?[-190,-155,218,136]:[-275,-365,160,8];
      const count=part>.5?24:4;
      const context=this.lc;
      const facing=part>.5?.80+.20*Math.abs(Math.sin(angle+side*b.elevation)):1;
      context.globalAlpha=opacity*facing;
      // Continuous 3D strip projection. Cropped raster strips avoid thousands of
      // CPU clipping operations; every strip still follows the hinged/flexible wing.
      const middleX=(rect[0]+rect[2])/2;
      for(let row=0;row<count;row++){
        const v0=row/count,v1=(row+1)/count,vm=(v0+v1)/2;
        const sy=v0*512,sh=(v1-v0)*512;
        const p0=this.project({x:middleX,y:mix(rect[1],rect[3],v0)},b,side,part,angle,t+b.seed);
        const p1=this.project({x:middleX,y:mix(rect[1],rect[3],v1)},b,side,part,angle,t+b.seed);
        const left=this.project({x:rect[0],y:mix(rect[1],rect[3],vm)},b,side,part,angle,t+b.seed);
        const right=this.project({x:rect[2],y:mix(rect[1],rect[3],vm)},b,side,part,angle,t+b.seed);
        const A=(right.x-left.x)/512,B=(right.y-left.y)/512,C=(p1.x-p0.x)/sh,D=(p1.y-p0.y)/sh;
        if(Math.abs(A*D-B*C)<.000003)continue;
        const E=p0.x-A*256-C*sy,F=p0.y-B*256-D*sy;
        context.setTransform(A*dpr,B*dpr,C*dpr,D*dpr,(E+origin)*dpr,(F+origin)*dpr);
        // A half source pixel of overlap closes subpixel rasterization cracks.
        const overlap=.50,top=Math.max(0,sy-overlap),bottom=Math.min(512,sy+sh+overlap);
        context.drawImage(tex,0,top,512,bottom-top,0,top,512,bottom-top);
      }
    }
    draw(t,alpha=1){
      const ctx=this.ctx;
      ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';
      ctx.drawImage(this.back,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
      let maxSpan=1;for(const b of birds)maxSpan=Math.max(maxSpan,b.span);
      const logicalSize=Math.ceil(maxSpan*3.8),size=Math.ceil(logicalSize*dpr),origin=logicalSize/2;
      if(this.layer.width!==size){this.layer.width=this.layer.height=size;}
      for(const bird of drawOrder()){
        const b=bird.pose(alpha);
        if(b.x < -b.span*2.7 || b.x > width+b.span*2.7)continue;
        this.lc.setTransform(1,0,0,1,0,0);this.lc.clearRect(0,0,size,size);
        const rear=b.angle-.018;
        this.part(b,'hindwing',-1,2,rear-.006,b.opacity*.66,t,origin);
        this.part(b,'forewing',-1,1,b.angle-.005,b.opacity*.69,t,origin);
        this.part(b,'hindwing',1,2,rear+.006,b.opacity*.93,t,origin);
        this.part(b,'forewing',1,1,b.angle+.005,b.opacity,t,origin);
        this.part(b,'body',0,0,0,b.opacity,t,origin);
        const blur=clamp(cfg.butterflyBlur + (1-b.depth)*cfg.butterflyDepthBlur + Math.abs(b.angularVelocity)*cfg.butterflyMotionBlur*0.22, 0, 6);
        ctx.globalAlpha=1;ctx.filter=`blur(${(blur*1.15).toFixed(2)}px)`;ctx.drawImage(this.layer,b.x-origin,b.y-origin,logicalSize,logicalSize);
      }
      ctx.filter='none';ctx.globalCompositeOperation='screen';ctx.globalAlpha=cfg.grain*.07;ctx.fillStyle=this.pattern;
      const dx=(Math.floor(t*16)*37)%192,dy=(Math.floor(t*16)*73)%192;
      ctx.translate(-dx,-dy);ctx.fillRect(0,0,width+192,height+192);ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    }
    refreshTextures(){
      for(let i=0;i<this.textures.length;i++)for(const name of ['forewing','hindwing','body']){
        const tex=this.textures[i][name],ctx=tex.getContext('2d');
        ctx.clearRect(0,0,512,512);ctx.filter=`brightness(${cfg.exposure})`;ctx.drawImage(images[i][name],0,0);
      }
    }
    destroy(){this.layer.width=this.layer.height=this.back.width=this.back.height=1;}
  }

  function countForViewport() {
    if(solo)return 1;
    if(cfg.count>0)return clamp(Math.round(cfg.count),1,28);
    return clamp(Math.round(width*height/175000),width<700?4:6,9);
  }
  function reset() {
    time=0;accumulator=0;
    const n=countForViewport();birds=Array.from({length:n},(_,i)=>new Butterfly(i,n));
    // Bring motion and wing activation into a settled state without moving across the field.
    for(let j=0;j<36;j++)for(const b of birds) {
      const x=b.x,y=b.y;b.update(fixedDT);b.x=x;b.y=y;
    }
    for(const b of birds)b.capturePrevious();
  }
  function isReduced() {return cfg.respectReducedMotion&&reducedQuery.matches;}
  function resize() {
    if(destroyed)return;
    const oldW=width,oldH=height;
    width=Math.max(1,innerWidth);height=Math.max(1,innerHeight);
    dpr=Math.min(devicePixelRatio||1,cfg.maxPixelRatio,Math.sqrt(cfg.maxRenderPixels/(width*height)));
    if(renderer&&renderer.kind==='canvas2d')dpr=Math.min(dpr,1);
    if(!birds.length)reset();
    else {
      for(const b of birds) {
        b.x*=width/oldW;b.y*=height/oldH;b.homeY*=height/oldH;
        const scaleRatio=clamp(width/850,.70,1)/clamp(oldW/850,.70,1);
        b.span*=scaleRatio;b.scale=b.span/326;b.baseSpeed*=scaleRatio;
        b.capturePrevious();
      }
      const n=countForViewport();
      if(n<birds.length)birds.length=n;
      while(birds.length<n)birds.push(new Butterfly(birds.length,n));
    }
    if(renderer) {renderer.resize();renderer.draw(time);}
    else if(images)drawFallback();
  }
  function step(dt) { time+=dt;for(const b of birds)b.update(dt); }
  function renderFrame(timestamp) {
    raf=0;if(destroyed||lost||paused||document.hidden||!ready||isReduced()||manual)return;
    const rawDT=lastTimestamp?Math.max(0,(timestamp-lastTimestamp)/1000):1/60;
    if(lastTimestamp){stats.frameIntervals+=rawDT*1000;stats.intervalCount++;}
    if(rawDT>fixedDT*maxSubsteps)stats.discardedCatchups++;
    lastTimestamp=timestamp;accumulator+=Math.min(rawDT,fixedDT*maxSubsteps);
    const start=performance.now();
    let steps=0;
    while(accumulator>=fixedDT && steps<maxSubsteps){step(fixedDT);accumulator-=fixedDT;steps++;}
    if(accumulator>=fixedDT)accumulator%=fixedDT;
    const afterPhysics=performance.now();
    const alpha=clamp(accumulator/fixedDT,0,1);
    renderer.draw(Math.max(0,time-fixedDT+accumulator),alpha);
    stats.frames++;stats.simulationSteps+=steps;
    const cpu=afterPhysics-start;stats.physicsTotal+=cpu;stats.physicsMax=Math.max(stats.physicsMax,cpu);
    stats.submitTotal+=performance.now()-afterPhysics;
    raf=requestAnimationFrame(renderFrame);
  }
  function play() {
    paused=false;lastTimestamp=0;
    if(renderer&&ready&&!raf&&!destroyed&&!lost&&!document.hidden&&!isReduced()&&!manual)
      raf=requestAnimationFrame(renderFrame);
  }
  function pause() {paused=true;cancelAnimationFrame(raf);raf=0;lastTimestamp=0;}
  function visibilityChange() {
    if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTimestamp=0;}
    else if(!paused)play();
  }
  function motionChange() {
    if(isReduced()){cancelAnimationFrame(raf);raf=0;if(renderer)renderer.draw(time);}
    else if(!paused)play();
  }
  function drawFallback() {
    // A static raster composition, never a broken/slideshow imitation of the rig.
    let target=canvas;
    if(canvas.getContext('webgl')){
      target=canvas.cloneNode();canvas.replaceWith(target);
    }
    const ctx=target.getContext('2d');if(!ctx)return;
    target.width=Math.round(width*dpr);target.height=Math.round(height*dpr);
    ctx.scale(dpr,dpr);
    const gradient=ctx.createRadialGradient(width*.5,height*.48,0,width*.5,height*.48,Math.max(width,height)*.66);
    gradient.addColorStop(0,'#091927');gradient.addColorStop(.55,'#02070c');gradient.addColorStop(1,'#000');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
    for(const b of birds) {
      ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.direction*b.scale,b.scale);
      ctx.globalAlpha=b.opacity;
      const set=images[(b.variantIndex??0) % images.length] || images[0];
      for(const [name,r] of Object.entries({hindwing:[-275,-365,435,373],forewing:[-275,-365,435,373],body:[-190,-155,408,291]}))
        ctx.drawImage(set[name],...r);
      ctx.restore();
    }
  }
  const api={
    ready:false,
    pause,play,
    reseed(seed=cfg.seed+173){cfg.seed=(finite(seed,cfg.seed))>>>0;reset();if(renderer)renderer.draw(time);},
    setOptions(options={}) {
      if(!options||typeof options!=='object')return {...cfg};
      const before={...cfg};applyOptions(options);
      const rebuild=['seed','count','speed','wingSpeed','minWingSpan','maxWingSpan']
        .some(k=>before[k]!==cfg[k]);
      if(rebuild)reset();
      if(renderer&&renderer.kind==='canvas2d'&&before.exposure!==cfg.exposure)renderer.refreshTextures();
      if(before.maxPixelRatio!==cfg.maxPixelRatio||before.maxRenderPixels!==cfg.maxRenderPixels||rebuild)resize();
      else if(renderer)renderer.draw(time);
      motionChange();return {...cfg};
    },
    // Deterministic capture/testing helper. Calling it pauses real-time playback.
    renderAt(seconds) {
      if(!ready)throw new Error('Wait for butterflyField.ready first.');
      seconds=clamp(finite(seconds,0),0,3600);pause();
      if(seconds<time)reset();
      while(time+fixedDT<=seconds+1e-7)step(fixedDT);
      if(renderer)renderer.draw(time);
      return this.getState();
    },
    getState(){return {version:"7.3",time,width,height,paused,renderer:renderer?renderer.kind:'static',reducedMotion:isReduced(),
      config:{...cfg},butterflies:birds.map(b=>({id:b.id,x:b.x,y:b.y,direction:b.direction,depth:b.depth,
        span:b.span,variantIndex:b.variantIndex,phase:b.phase,angle:b.angle,feather:b.feather,sweep:b.sweep,camber:b.camber,tipFlex:b.tipFlex,
        angularVelocity:b.angularVelocity,gliding:b.gliding,beatsRemaining:b.beatsRemaining}))};},
    getPerformance(){return {
      renderer:renderer?renderer.kind:'static',frames:stats.frames,simulationHz:1/fixedDT,
      oscillators:0,physicsMsPerFrame:stats.physicsTotal/Math.max(1,stats.frames),
      physicsMaxMs:stats.physicsMax,renderSubmissionMsPerFrame:stats.submitTotal/Math.max(1,stats.frames),
      averageFrameIntervalMs:stats.frameIntervals/Math.max(1,stats.intervalCount),
      simulatedSteps:stats.simulationSteps,discardedCatchups:stats.discardedCatchups,
      backingWidth:canvas.width,backingHeight:canvas.height,pixelRatio:dpr,
      submittedVertices:renderer?.vertexCount??null,drawCalls:renderer?.drawCalls??null,
      note:'CPU timings and rAF intervals only, not a GPU time measurement or FPS guarantee.'
    };},
    resetPerformance(){for(const k of Object.keys(stats))stats[k]=0;},
    destroy() {
      pause();destroyed=true;removeEventListener('resize',resize);
      removeEventListener('scroll',scrollChange);
      document.removeEventListener('visibilitychange',visibilityChange);reducedQuery.removeEventListener('change',motionChange);
      canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
      if(renderer)renderer.destroy();
    }
  };
  window.butterflyField=api;
  function scrollChange() {
    cameraY=window.scrollY;
    // Scrolling changes the viewpoint, never the simulation clock or pause state.
    if(ready&&renderer&&!destroyed&&!lost&&!document.hidden&&(paused||isReduced()||manual))
      renderer.draw(time);
  }
  function contextLost(e){e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;}
  function contextRestored(){lost=false;try{renderer=new Renderer();resize();if(!paused)play();}catch(e){console.error(e);}}
  function loadImage(src) {
    return new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('A butterfly texture variant could not be loaded.'));
      image.src=src;
    });
  }
  async function init() {
    try {
      canvas=document.getElementById('butterfly-field');
      if(!canvas)throw new Error('Butterfly canvas is unavailable.');
      images=await Promise.all(ASSET_SETS.map(async set=>{
        const entries=await Promise.all(Object.entries(set).map(async([name,url])=>[name,await loadImage(url)]));
        return Object.fromEntries(entries);
      }));
      try{if(params.get('renderer')!=='webgl')throw new Error('Canvas 2D source renderer selected.');renderer=new Renderer();}catch(error){console.info('Using the Canvas 2D wing-rig renderer:',error.message);renderer=new CanvasRenderer();}
      resize();ready=true;api.ready=true;
      addEventListener('resize',resize,{passive:true});
      addEventListener('scroll',scrollChange,{passive:true});
      document.addEventListener('visibilitychange',visibilityChange);
      reducedQuery.addEventListener('change',motionChange);
      if(renderer){renderer.draw(time);if(!paused)play();}
      dispatchEvent(new Event('butterflyfieldready'));
    }catch(error){
      console.error(error);
    }
  }
  if('requestIdleCallback' in window) {
    window.requestIdleCallback(() => { void init(); }, {timeout:1200});
  } else {
    window.setTimeout(() => { void init(); }, 0);
  }
})();
