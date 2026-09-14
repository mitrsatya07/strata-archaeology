import * as THREE from './assets/three.module.js';

const canvas = document.querySelector('#world');
const loading = document.querySelector('#loading');
const chapters = [...document.querySelectorAll('.chapter')];
const railLinks = [...document.querySelectorAll('.rail-link')];
const progressLine = document.querySelector('#progress');
const progressLabel = document.querySelector('#progress-label');
const depthLabel = document.querySelector('#depth');
const coordinate = document.querySelector('#coordinate');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.07;
renderer.setClearColor(0x090b0c, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x090b0c, 0.020);
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 260);
scene.add(camera);

const ambient = new THREE.HemisphereLight(0x71848b, 0x27180f, 1.2);
scene.add(ambient);
const moonLight = new THREE.DirectionalLight(0x8aa0a5, 1.45);
moonLight.position.set(-8, 14, 5);
scene.add(moonLight);
const travelerLight = new THREE.PointLight(0xf4c66f, 1.35, 25, 2);
travelerLight.position.set(0, 1.2, -2);
camera.add(travelerLight);

const root = new THREE.Group();
scene.add(root);
const clock = new THREE.Clock();
const mouse = new THREE.Vector2();
const camPos = new THREE.Vector3(11, 8, 18);
const target = new THREE.Vector3(0, 0, 0);
const desiredPos = camPos.clone();
const desiredTarget = target.clone();
let scrollProgress = 0;
let activeIndex = 0;

const palette = {
  sand: 0xa6764f,
  clay: 0x7d3f2a,
  limestone: 0x9d8060,
  charcoal: 0x171b1b,
  bronze: 0xb88447,
  gold: 0xe2c278,
  cyan: 0x72cdd0,
  ink: 0x090b0c,
  parchment: 0xe9dfc8,
};

function standardMaterial(color, roughness = .76, metalness = .08) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function emissiveMaterial(color, intensity = 1.3, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, blending: opacity < 1 ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: opacity >= 1 });
}
function addRock(group, position, scale, color = palette.limestone) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const f = 0.74 + Math.random() * .36;
    pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * (0.74 + Math.random()*.28), pos.getZ(i) * f);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, standardMaterial(color, .95, 0));
  mesh.position.copy(position);
  mesh.scale.set(scale * (.6 + Math.random()*.65), scale * (.43 + Math.random()*.42), scale * (.55 + Math.random()*.55));
  mesh.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
  group.add(mesh);
  return mesh;
}
function addLine(points, color, opacity = .6) {
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const line = new THREE.Line(geom, material);
  root.add(line);
  return line;
}

// ---- Surface excavation ---------------------------------------------------
const surfaceGroup = new THREE.Group();
root.add(surfaceGroup);
const terrainMat = standardMaterial(0x4b3727, 1, 0);
const terrain = new THREE.Mesh(new THREE.PlaneGeometry(64, 64, 26, 26), terrainMat);
terrain.rotation.x = -Math.PI / 2;
terrain.position.set(0, -1.4, -2);
const terrainPos = terrain.geometry.attributes.position;
for (let i = 0; i < terrainPos.count; i++) {
  const x = terrainPos.getX(i), y = terrainPos.getY(i);
  const height = Math.sin(x*.3) * .18 + Math.cos(y*.21)*.17 + (Math.random()-.5)*.17;
  terrainPos.setZ(i, height);
}
terrain.geometry.computeVertexNormals();
surfaceGroup.add(terrain);

const trench = new THREE.Group();
trench.position.set(0, -.85, -3.5);
surfaceGroup.add(trench);
const gridMat = emissiveMaterial(palette.gold, 1, .75);
for (let i=-4; i<=4; i++) {
  const lineA = new THREE.Mesh(new THREE.BoxGeometry(.032,.032,8.4), gridMat);
  lineA.position.set(i, .02, 0); trench.add(lineA);
  const lineB = new THREE.Mesh(new THREE.BoxGeometry(8.4,.032,.032), gridMat);
  lineB.position.set(0, .02, i); trench.add(lineB);
}
const trenchFrameMat = standardMaterial(0x59402c, .8, 0);
for (const [x,z,rx,rz] of [[-4.45,0,0,0],[4.45,0,0,0],[0,-4.45,0,0],[0,4.45,0,0]]) {
  const edge = new THREE.Mesh(new THREE.BoxGeometry(x ? .32 : 9.1, .18, z ? .32 : 9.1), trenchFrameMat);
  edge.position.set(x, .08, z); trench.add(edge);
}
for (let i=0;i<16;i++) addRock(surfaceGroup, new THREE.Vector3((Math.random()-.5)*35, -1.05, -5 + (Math.random()-.5)*25), .2+Math.random()*.5, i%3===0?0x6b4a31:0x443323);

function makeSurveyFlag(x, z, label) {
  const g = new THREE.Group();
  g.position.set(x,-.86,z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.55,6), standardMaterial(0x8a765e)); pole.position.y=.77; g.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(.37,.23), emissiveMaterial(palette.gold,.8,.75)); flag.position.set(.18,1.38,0); flag.rotation.y=.11; g.add(flag);
  g.userData.label=label; surfaceGroup.add(g);
}
makeSurveyFlag(-5.5,-4.2,'GRID 17B'); makeSurveyFlag(5.2,-2.5,'NORTH'); makeSurveyFlag(-3.9,4.6,'SURVEY');
const relic = new THREE.Group();
relic.position.set(-.8,-.5,-3.3); surfaceGroup.add(relic);
const relicStone = new THREE.Mesh(new THREE.DodecahedronGeometry(.7,1), standardMaterial(0x956743,.87,.02)); relicStone.scale.set(1,.36,.75); relic.add(relicStone);
const relicRing = new THREE.Mesh(new THREE.TorusGeometry(.78,.018,5,36), emissiveMaterial(palette.gold,.9,.8)); relicRing.rotation.x=Math.PI/2; relicRing.position.y=.12; relic.add(relicRing);

// ---- Tunnel / stratigraphy ------------------------------------------------
const tunnelGroup = new THREE.Group(); root.add(tunnelGroup);
const ringMat = new THREE.MeshStandardMaterial({ color: 0x6e4830, roughness: .95, metalness: 0, transparent: true, opacity: .73 });
const strataMat = new THREE.MeshStandardMaterial({ color: 0x865134, roughness: .98, metalness: 0, transparent: true, opacity: .46, side: THREE.DoubleSide });
const tunnelRings=[];
for(let i=0;i<29;i++) {
  const z=-11-i*1.72;
  const radius=6.1+Math.sin(i*.77)*.65;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.13+(i%4)*.028,7,42),ringMat);
  ring.position.set(Math.sin(i*.73)*.45, -2.6+Math.cos(i*.4)*.32,z);
  ring.rotation.z=Math.sin(i*.43)*.11;
  tunnelGroup.add(ring); tunnelRings.push(ring);
  if(i%3===0){
    const sediment = new THREE.Mesh(new THREE.TorusGeometry(radius+.24,.054,6,40), strataMat);
    sediment.position.copy(ring.position); sediment.rotation.copy(ring.rotation); tunnelGroup.add(sediment);
  }
}
const strataBands=[];
for(let i=0;i<7;i++) {
  const band = new THREE.Mesh(new THREE.BoxGeometry(18,.13,.82), new THREE.MeshStandardMaterial({color: [0x7e4d35,0x6a3e2a,0x98714e][i%3],roughness:1,transparent:true,opacity:.45}));
  band.position.set(0,-6.9+i*1.25,-22-i*3.4);
  band.rotation.z=(i-3)*.02;
  tunnelGroup.add(band); strataBands.push(band);
}
for(let i=0;i<78;i++) {
  const z=-10-Math.random()*49;
  const a=Math.random()*Math.PI*2; const r=4.8+Math.random()*4;
  const rock=addRock(tunnelGroup,new THREE.Vector3(Math.cos(a)*r,-2.5+Math.sin(a)*r,z),.08+Math.random()*.24,Math.random()>.5?0x67402c:0x926042);
  rock.userData.tunnelRock=true;
}

// ---- Chamber --------------------------------------------------------------
const chamberGroup = new THREE.Group(); root.add(chamberGroup);
const roomMat = standardMaterial(0x5e4a37,.94,0);
const roomAccent = standardMaterial(0x80634a,.84,.02);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(15,31), roomMat); floor.rotation.x=-Math.PI/2; floor.position.set(0,-1.2,-75); chamberGroup.add(floor);
const floorInset = new THREE.Mesh(new THREE.PlaneGeometry(7.5,20), new THREE.MeshStandardMaterial({color:0x4a392d,roughness:1})); floorInset.rotation.x=-Math.PI/2;floorInset.position.set(0,-1.17,-75);chamberGroup.add(floorInset);
function makeColumn(x,z) {
  const g=new THREE.Group(); g.position.set(x,-1.15,z);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.63,.73,.25,8),roomAccent);base.position.y=.125;g.add(base);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.37,.44,4.35,10),roomMat);shaft.position.y=2.28;g.add(shaft);
  const capital=new THREE.Mesh(new THREE.CylinderGeometry(.66,.45,.34,8),roomAccent);capital.position.y=4.56;g.add(capital);
  const glow=new THREE.Mesh(new THREE.TorusGeometry(.48,.018,5,22),emissiveMaterial(0xdca661,.85,.45)); glow.rotation.x=Math.PI/2;glow.position.y=3.1;g.add(glow);
  chamberGroup.add(g);
}
makeColumn(-4,-68);makeColumn(4,-68);makeColumn(-4,-80);makeColumn(4,-80);
const rearWall = new THREE.Mesh(new THREE.BoxGeometry(14,7,.55),roomMat);rearWall.position.set(0,2.2,-84);chamberGroup.add(rearWall);
const sideWall1 = new THREE.Mesh(new THREE.BoxGeometry(.55,7,17),roomMat);sideWall1.position.set(-7,2.2,-76);chamberGroup.add(sideWall1);
const sideWall2 = sideWall1.clone();sideWall2.position.x=7;chamberGroup.add(sideWall2);
const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.7,5.5),new THREE.MeshBasicMaterial({color:0x312616,transparent:true,opacity:.62,side:THREE.DoubleSide})); doorGlow.position.set(0,1.8,-83.69);chamberGroup.add(doorGlow);
const lintel=new THREE.Mesh(new THREE.BoxGeometry(4.7,.45,.65),roomAccent);lintel.position.set(0,4.55,-83.3);chamberGroup.add(lintel);
for(const x of [-2.13,2.13]){const jamb=new THREE.Mesh(new THREE.BoxGeometry(.45,4.2,.65),roomAccent);jamb.position.set(x,2.35,-83.3);chamberGroup.add(jamb)}
const chamberLights=[];
for(const x of [-5.8,5.8]){
 const flame=new THREE.PointLight(0xe5a455,7,11,2);flame.position.set(x,3,-77);chamberGroup.add(flame);chamberLights.push(flame);
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),emissiveMaterial(0xf9c874,2));orb.position.copy(flame.position);chamberGroup.add(orb);
}
for(let i=0;i<22;i++) {
 const glyph=addLine([new THREE.Vector3(-6.68+(i%2)*13.36,.5+(i%5)*.72,-70-Math.floor(i/2)*1.4),new THREE.Vector3(-6.67+(i%2)*13.34,.8+(i%5)*.72,-70-Math.floor(i/2)*1.4)],0xb08e62,.36);
 glyph.userData.chamberGlyph=true;
}

// ---- Object / artifact scan ----------------------------------------------
const artifactGroup = new THREE.Group(); artifactGroup.position.set(0,-.35,-100); root.add(artifactGroup);
const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.78,.72,48),standardMaterial(0x3b3028,.8,.17));plinth.position.y=-.8;artifactGroup.add(plinth);
const plinthGlow = new THREE.Mesh(new THREE.TorusGeometry(1.35,.024,6,58),emissiveMaterial(palette.gold,1,.62));plinthGlow.rotation.x=Math.PI/2;plinthGlow.position.y=-.4;artifactGroup.add(plinthGlow);
const profile=[new THREE.Vector2(.17,-.4),new THREE.Vector2(.84,-.37),new THREE.Vector2(.9,-.1),new THREE.Vector2(.75,.13),new THREE.Vector2(.71,.67),new THREE.Vector2(.5,.96),new THREE.Vector2(.48,1.2),new THREE.Vector2(.62,1.31),new THREE.Vector2(.6,1.43),new THREE.Vector2(.34,1.46),new THREE.Vector2(.3,1.32),new THREE.Vector2(.37,1.23),new THREE.Vector2(.29,1.09)];
const vessel = new THREE.Mesh(new THREE.LatheGeometry(profile,54),new THREE.MeshPhysicalMaterial({color:0x9c4c2f,roughness:.48,metalness:.02,clearcoat:.25,clearcoatRoughness:.7}));vessel.position.y=-.25;artifactGroup.add(vessel);
const vesselBand = new THREE.Mesh(new THREE.TorusGeometry(.74,.028,7,50),emissiveMaterial(0xe0b66c,.8,.6));vesselBand.rotation.x=Math.PI/2;vesselBand.position.y=.24;artifactGroup.add(vesselBand);
const scanGroup=new THREE.Group();artifactGroup.add(scanGroup);
for(let i=0;i<4;i++){
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.35+i*.32,.013,5,64),emissiveMaterial(i===3?palette.cyan:palette.gold,.85,.55));
 ring.rotation.x=Math.PI/2;ring.position.y=-.35+i*.49;scanGroup.add(ring);
}
const shellGeo=new THREE.SphereGeometry(2.8,24,16);const shell=new THREE.Mesh(shellGeo,new THREE.MeshBasicMaterial({color:0xe6c47b,wireframe:true,transparent:true,opacity:.11}));shell.scale.y=.83; shell.position.y=.3;artifactGroup.add(shell);
const halo=new THREE.Mesh(new THREE.RingGeometry(3.7,3.74,80),emissiveMaterial(palette.gold,.8,.3));halo.position.set(0,.35,1.05);artifactGroup.add(halo);

// ---- Field laboratory -----------------------------------------------------
const labGroup=new THREE.Group(); root.add(labGroup);
const labFloor=new THREE.GridHelper(22,24,0x31777b,0x1e4b51);labFloor.position.set(0,-1.13,-128);labFloor.material.transparent=true;labFloor.material.opacity=.37;labGroup.add(labFloor);
const labTable=new THREE.Mesh(new THREE.BoxGeometry(6.5,.36,2.8),standardMaterial(0x1d3639,.55,.42));labTable.position.set(0,.1,-128);labGroup.add(labTable);
for(const x of [-2.7,2.7]) for(const z of [-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.4,6),standardMaterial(0x23484a,.5,.5));leg.position.set(x,-1,-128+z);labGroup.add(leg)}
function dataTexture(label, tint) {
 const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
 x.fillStyle='#081417';x.fillRect(0,0,c.width,c.height);x.strokeStyle='rgba(125,225,218,.23)';x.lineWidth=2;
 for(let i=55;i<c.width;i+=78){x.beginPath();x.moveTo(i,0);x.lineTo(i,c.height);x.stroke()}for(let i=45;i<c.height;i+=65){x.beginPath();x.moveTo(0,i);x.lineTo(c.width,i);x.stroke()}
 x.strokeStyle=tint;x.lineWidth=4;x.beginPath();for(let i=0;i<28;i++){let px=50+i*33,py=338-Math.sin(i*.62)*64-i*3.6+(i%5)*8;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
 x.fillStyle=tint;x.font='bold 32px Arial';x.fillText(label,48,65);x.fillStyle='rgba(218,240,234,.65)';x.font='20px Arial';x.fillText('SITE 17 / MATERIAL ANALYSIS / LIVE',50,100);
 x.fillStyle='rgba(218,240,234,.7)'; x.font='18px monospace';x.fillText('CERAMIC PROFILE  97.8%',50,465);x.fillText('SCAN RESOLUTION  0.04 MM',570,465);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function makeScreen(x,y,z,scale,label,tint= '#86ded7'){
 const tex=dataTexture(label,tint);const material=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.82,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.6*scale,2.3*scale),material);screen.position.set(x,y,z);screen.rotation.y=Math.PI;labGroup.add(screen);
 const frame=new THREE.Mesh(new THREE.BoxGeometry(4.78*scale,2.48*scale,.06),new THREE.MeshBasicMaterial({color:0x3f9d9b,wireframe:true,transparent:true,opacity:.45}));frame.position.copy(screen.position);frame.position.z+=.04;labGroup.add(frame);return screen;
}
const screens=[makeScreen(-3.8,3.4,-132,.82,'STRATA MAP'),makeScreen(3.6,2.1,-130.5,.65,'OBJECT 014','#e3bb72'),makeScreen(0,4.7,-134,.75,'FIELD LOG')];
const holo=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,.04,64),emissiveMaterial(palette.cyan,.8,.45));holo.position.set(0,.33,-128);labGroup.add(holo);
const holoWire=new THREE.Mesh(new THREE.SphereGeometry(1.25,22,15),new THREE.MeshBasicMaterial({color:palette.cyan,wireframe:true,transparent:true,opacity:.22}));holoWire.position.set(0,1.55,-128);labGroup.add(holoWire);

// ---- Living map / archive -------------------------------------------------
const archiveGroup=new THREE.Group(); archiveGroup.position.set(0,.5,-156);root.add(archiveGroup);
const globe=new THREE.Mesh(new THREE.SphereGeometry(4.35,36,28),new THREE.MeshBasicMaterial({color:0x63b9bd,wireframe:true,transparent:true,opacity:.24}));archiveGroup.add(globe);
const globeInner=new THREE.Mesh(new THREE.SphereGeometry(4.27,28,20),new THREE.MeshBasicMaterial({color:0x103a3d,transparent:true,opacity:.16,side:THREE.BackSide}));archiveGroup.add(globeInner);
for(let i=-3;i<=3;i++){
 const lat=new THREE.Mesh(new THREE.TorusGeometry(Math.sqrt(4.35*4.35-(i*.95)*(i*.95)),.012,4,64),emissiveMaterial(palette.cyan,.8,.34));lat.position.y=i*.95;lat.rotation.x=Math.PI/2;archiveGroup.add(lat);
}
for(let i=0;i<6;i++){
 const meridian=new THREE.Mesh(new THREE.TorusGeometry(4.35,.012,4,64),emissiveMaterial(palette.cyan,.8,.28));meridian.rotation.y=i*Math.PI/6;archiveGroup.add(meridian);
}
const orbitA=new THREE.Mesh(new THREE.TorusGeometry(6.1,.018,5,100),emissiveMaterial(palette.gold,.65,.45));orbitA.rotation.x=Math.PI/2.8;archiveGroup.add(orbitA);
const orbitB=new THREE.Mesh(new THREE.TorusGeometry(7.5,.012,5,100),emissiveMaterial(palette.cyan,.5,.3));orbitB.rotation.set(Math.PI/2.1,.45,0);archiveGroup.add(orbitB);
const sites=[];
for(let i=0;i<16;i++){
 const phi=Math.acos(1-2*(i+.5)/16), theta=Math.PI*(1+Math.sqrt(5))*i;
 const p=new THREE.Vector3(4.52*Math.cos(theta)*Math.sin(phi),4.52*Math.cos(phi),4.52*Math.sin(theta)*Math.sin(phi));
 const dot=new THREE.Mesh(new THREE.SphereGeometry(i%4===0?.12:.07,8,8),emissiveMaterial(i%4===0?palette.gold:palette.cyan,1));dot.position.copy(p);archiveGroup.add(dot);sites.push(dot);
}
const archiveLight=new THREE.PointLight(0x73d3d1,4,17,2);archiveLight.position.set(1,3,2);archiveGroup.add(archiveLight);

// ---- Particulate atmosphere ----------------------------------------------
const particleGeo=new THREE.BufferGeometry();const particleCount=1900;const positions=new Float32Array(particleCount*3);const colors=new Float32Array(particleCount*3);
const colA=new THREE.Color(0xcaa977), colB=new THREE.Color(0x497c83);
for(let i=0;i<particleCount;i++){
 let z=14-Math.random()*185;const radius=Math.random()*14;const a=Math.random()*Math.PI*2;
 positions[i*3]=Math.cos(a)*radius;positions[i*3+1]=-1.2+(Math.random()-.5)*14;positions[i*3+2]=z;
 const c=Math.random()>.72?colB:colA;colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;
}
particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));particleGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
const dust=new THREE.Points(particleGeo,new THREE.PointsMaterial({size:.038,vertexColors:true,transparent:true,opacity:.66,depthWrite:false,sizeAttenuation:true}));root.add(dust);

// Route coordinates: the scroll moves a physical camera through one continuous dig.
const route=[
 {p:0, pos:new THREE.Vector3(11,8,18), look:new THREE.Vector3(0,-.45,-2), fov:48},
 {p:.145,pos:new THREE.Vector3(.2,1.1,7),look:new THREE.Vector3(0,-1.7,-13),fov:48},
 {p:.32,pos:new THREE.Vector3(0,-2.45,-19),look:new THREE.Vector3(0,-2.7,-40),fov:48},
 {p:.49,pos:new THREE.Vector3(0,.75,-57),look:new THREE.Vector3(0,1.25,-76),fov:45},
 {p:.65,pos:new THREE.Vector3(.2,1.2,-90.8),look:new THREE.Vector3(0,.25,-100),fov:39},
 {p:.825,pos:new THREE.Vector3(0,2.15,-112),look:new THREE.Vector3(0,1.3,-128),fov:47},
 {p:1,pos:new THREE.Vector3(0,2.5,-141),look:new THREE.Vector3(0,.45,-156),fov:46}
];
function routeAt(p) {
 let a=route[0],b=route[route.length-1];
 for(let i=0;i<route.length-1;i++){if(p>=route[i].p&&p<=route[i+1].p){a=route[i];b=route[i+1];break;}}
 const t=(p-a.p)/(b.p-a.p); const e=t*t*(3-2*t);
 desiredPos.copy(a.pos).lerp(b.pos,e); desiredTarget.copy(a.look).lerp(b.look,e);
 camera.fov=THREE.MathUtils.lerp(a.fov,b.fov,e);camera.updateProjectionMatrix();
}
function visibilityFor(p) {
 surfaceGroup.visible = p < .245;
 tunnelGroup.visible = p > .055 && p < .57;
 chamberGroup.visible = p > .275 && p < .73;
 artifactGroup.visible = p > .47 && p < .89;
 labGroup.visible = p > .59;
 archiveGroup.visible = p > .76;
 scene.fog.density = p < .2 ? .018 : p < .58 ? .029 : p < .78 ? .023 : .017;
}
function updateScroll() {
 const max = document.documentElement.scrollHeight - window.innerHeight;
 scrollProgress = max > 0 ? Math.max(0,Math.min(1,window.scrollY/max)) : 0;
 progressLine.style.height=`${scrollProgress*100}%`;
 progressLabel.textContent=String(activeIndex).padStart(2,'0');
 routeAt(scrollProgress); visibilityFor(scrollProgress);
}
window.addEventListener('scroll',updateScroll,{passive:true});
window.addEventListener('pointermove', e=>{mouse.x=(e.clientX/window.innerWidth-.5);mouse.y=(e.clientY/window.innerHeight-.5)},{passive:true});

const readouts=[
 ['27°10′N / 73°38′E','SURFACE'],['27°10′N / 73°38′E','04.7M BELOW'],['27°10′N / 73°38′E','08.2M BELOW'],['27°10′N / 73°38′E','OBJECT 014'],['27°10′N / 73°38′E','FIELD LAB'],['GLOBAL ARCHIVE','16 SITES LIVE']
];
function setActive(index) {
 activeIndex=index;
 chapters.forEach((el,i)=>el.classList.toggle('is-active',i===index));
 railLinks.forEach((el,i)=>el.classList.toggle('active',i===index));
 document.body.dataset.stage=chapters[index].dataset.stage;
 coordinate.textContent=readouts[index][0];depthLabel.textContent=readouts[index][1];
 updateScroll();
}
const observer = new IntersectionObserver((entries)=>{
 entries.forEach(entry=>{if(entry.isIntersecting) setActive(Number(entry.target.dataset.index));});
},{threshold:.56});
chapters.forEach(x=>observer.observe(x));

function animate() {
 const t=clock.getElapsedTime();
 camPos.lerp(desiredPos, .055);
 target.lerp(desiredTarget, .055);
 const sway = new THREE.Vector3(mouse.x*.3, -mouse.y*.18, 0);
 camera.position.copy(camPos).add(sway);
 camera.lookAt(target);
 travelerLight.position.set(.1,-.15,-.8);
 relic.rotation.y=t*.18;
 relicRing.rotation.z=t*.5;
 tunnelRings.forEach((r,i)=>{r.rotation.z=Math.sin(t*.38+i*.45)*.09;});
 chamberLights.forEach((l,i)=>{l.intensity=5.8+Math.sin(t*4+i)*1.4;});
 artifactGroup.rotation.y=Math.sin(t*.34)*.19;
 scanGroup.rotation.y=-t*.24;scanGroup.rotation.z=Math.sin(t*.3)*.04;
 halo.rotation.z=t*.12;
 screens.forEach((s,i)=>{s.material.opacity=.66+Math.sin(t*1.6+i)*.15;});
 holoWire.rotation.y=t*.35;holoWire.rotation.z=t*.15;
 archiveGroup.rotation.y=t*.09;orbitA.rotation.z=t*.12;orbitB.rotation.z=-t*.09;
 sites.forEach((s,i)=>{s.scale.setScalar(.9+Math.sin(t*2+i)*.22);});
 dust.rotation.y=t*.004;
 const attr=dust.geometry.attributes.position;
 for(let i=0;i<Math.min(80,particleCount);i++) { const idx=i*3+1;attr.array[idx]+=Math.sin(t+i)*.00045; }
 attr.needsUpdate=true;
 renderer.render(scene,camera);
 requestAnimationFrame(animate);
}

window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(window.innerWidth,window.innerHeight);});
updateScroll(); setActive(0); animate();
window.setTimeout(()=>loading.classList.add('hide'),700);
