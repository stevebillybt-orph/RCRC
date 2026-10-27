import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const colors = {power:'#df8050',steering:'#7d9c56',drive:'#a18c53',chassis:'#70877e',body:'#a8ac91'};
const parts = {
 battery:{n:'01',name:'電池',en:'BATTERY',system:'power',desc:'成架車嘅能量來源。電池將電力送入 ESC，再由 ESC 控制送往馬達嘅電力；遙控器本身唔會隔空供電畀架車。',tip:'<b>留意電源線：</b>電池 → ESC。停低唔代表全車斷電。',anchor:[.32,1.4,-.82]},
 esc:{n:'02',name:'電子變速器',en:'ELECTRONIC SPEED CONTROLLER',system:'power',desc:'ESC 收到接收器嘅油門指令後，控制馬達轉速與方向。呢個有刷馬達示範用兩條動力線連接 ESC 同馬達。',tip:'<b>內置 BEC：</b>將電池電壓調節到適合接收器、Servo 嘅供電電壓。',anchor:[-.56,1.4,.17]},
 motor:{n:'03',name:'驅動馬達',en:'BRUSHED MOTOR',system:'power',desc:'將電能變成旋轉力量。馬達先轉動小齒輪，經減速齒輪放大扭力，再送去車輪。Crawler 重視慢速時都可以平順地輸出力量。',tip:'<b>試下加油：</b>馬達軸、傳動軸同四個車輪會一齊轉。',anchor:[.37,1.35,.56]},
 receiver:{n:'04',name:'接收器',en:'RADIO RECEIVER',system:'steering',desc:'接收遙控器嘅無線訊號，再分開轉向同油門指令。呢個例子用 CH1 控制 Servo，CH2 控制 ESC。',tip:'<b>訊號 ≠ 動力：</b>接收器需要 BEC 供電，唔會直接用無線訊號推動馬達。',anchor:[-.60,1.31,-.62]},
 servo:{n:'05',name:'轉向伺服器',en:'STEERING SERVO',system:'steering',desc:'Servo 內有小馬達、齒輪同位置回饋。收到 CH1 指令後，輸出臂轉到指定角度，推拉連桿，改變前輪方向。呢個示意將 Servo 裝喺前橋。',tip:'<b>油門可以保持 0：</b>試下轉軚，前輪照樣可以左右擺。',anchor:[0,1.2,1.53]},
 links:{n:'06',name:'轉向拉桿',en:'DRAG LINK & TIE ROD',system:'steering',desc:'Servo 輸出臂推動 Drag link，再透過橫向 Tie rod 連接左右轉向節，令兩個前輪一齊轉向。',tip:'<b>轉向同驅動分開：</b>拉桿改變方向；車橋內半軸負責帶動車輪。轉向角度以示意呈現。',anchor:[0,.86,1.94]},
 gearbox:{n:'07',name:'減速齒輪箱',en:'REDUCTION TRANSMISSION',system:'drive',desc:'馬達轉得快，車輪需要慢而有力。齒輪箱降低輸出轉速，增加可用扭力，再將旋轉動力分到前、後傳動軸。',tip:'<b>睇透明外殼入面：</b>小齒輪帶動大齒輪。齒比及轉速只作原理示意。',anchor:[0,1.2,0]},
 shafts:{n:'08',name:'前後傳動軸',en:'DRIVESHAFTS',system:'drive',desc:'將齒輪箱動力送到前後車橋。萬向接頭容許傳動軸有夾角；伸縮段配合車橋上下移動，保持動力傳遞。',tip:'<b>由底盤睇最清楚：</b>前後各一條軸，一齊將動力送到兩條車橋。',anchor:[0,.66,-.88]},
 axles:{n:'09',name:'車橋與半軸',en:'LOCKED AXLES',system:'drive',desc:'車橋齒輪將縱向傳動改成橫向，經半軸傳到左右車輪。此模型示範鎖定車橋，同一橋左右輪同速旋轉，適合解釋 Crawler 嘅四驅結構。',tip:'<b>唔係一般開放式差速：</b>轉彎時左右輪仍同速，輪胎需要滑移；此頁無模擬輪胎抓地。',anchor:[0,.67,-1.53]},
 wheels:{n:'10',name:'輪胎與輪圈',en:'TIRES & BEADLOCK WHEELS',system:'drive',desc:'車輪將旋轉變成地面上嘅推力。Crawler 常用大花紋、柔軟胎面去貼住岩石；輪圈負責固定輪胎並連接車橋。',tip:'<b>四輪驅動：</b>油門操作會令四輪一齊轉。頁面係架空示範，車身唔會駛走。',anchor:[1.13,.66,1.53]},
 frame:{n:'11',name:'車架與底板',en:'LADDER FRAME & SKID PLATE',system:'chassis',desc:'兩條縱向車架樑加上橫樑，承托電池、馬達與車殼；中央底板保護齒輪箱。懸掛連桿將車橋定位，限制唔需要嘅前後、左右位移。',tip:'<b>重量擺位都重要：</b>重嘢放低，有助降低重心；擺位要配合實際車架與行程。',anchor:[.67,1.11,-.2]},
 shocks:{n:'12',name:'避震與彈簧',en:'COILOVER SHOCKS',system:'chassis',desc:'彈簧承托重量、容許車橋上下活動；阻尼器控制壓縮與回彈速度，減少彈跳。連桿定位車橋，避震唔係唯一固定車橋嘅零件。',tip:'<b>試下「懸掛活動」：</b>前橋擺動時，左右避震一邊壓縮、一邊伸長，示範貼地原理。',anchor:[-.65,1.15,1.46]},
 body:{n:'13',name:'車殼',en:'BODY SHELL',system:'chassis',desc:'Land Cruiser 風格嘅方正車殼，提供外觀同基本保護。此模型以獨立梯形車架承載主要機械組件，車殼可以拆走檢查底盤。',tip:'<b>睇內部：</b>「透明殼」保留輪廓，「拆殼」直接露出所有機械部件。',anchor:[0,2.02,-.5]}
};
const topics={
 all:{en:'THE BIG PICTURE',name:'由指令，到行動。',desc:'一架 Crawler，可以分成四個互相配合嘅系統。點車上標籤或左邊部件，再用下方遙控器，睇住每一步點樣發生。',tip:'<b>由 01 電池開始：</b>跟住電力同旋轉動力，一路睇到四個車輪。',ids:[],flow:['receiver','esc','motor','gearbox','wheels'],heading:'由你嘅手，到四個車輪。'},
 power:{en:'01 / POWER SYSTEM',name:'電力，點樣變成動力？',desc:'電池供電畀 ESC。ESC 根據油門指令控制馬達；內置 BEC 同時供電畀接收器同轉向 Servo。',tip:'<b>試下推油門：</b>留意橙色電力路徑同馬達旋轉。控制訊號與供電係兩回事。',ids:['battery','esc','motor'],flow:['battery','esc','motor','gearbox'],heading:'儲存能量 → 控制電力 → 旋轉。'},
 steering:{en:'02 / STEERING SYSTEM',name:'轉一下軚，前輪點郁？',desc:'遙控器軚盤 → 無線訊號 → 接收器 CH1 → Servo → 拉桿 → 前輪。油門保持零，都可以改變方向。',tip:'<b>拖動遙控器軚盤：</b>留意 Servo 輸出臂同橫向拉桿。',ids:['receiver','servo','links','wheels'],flow:['receiver','servo','links','wheels'],heading:'一個角度指令，變成前輪轉向。'},
 drive:{en:'03 / DRIVETRAIN',name:'一個馬達，帶動四個轆。',desc:'馬達經齒輪箱減速增扭，再由前後傳動軸送到車橋，最後經左右半軸帶動四輪。',tip:'<b>切到「底盤」視角：</b>沿住金色部件，跟蹤動力去向。此模型前後橋等速。',ids:['motor','gearbox','shafts','axles','wheels'],flow:['motor','gearbox','shafts','axles','wheels'],heading:'馬達 → 減速 → 分配 → 四輪。'},
 chassis:{en:'04 / CHASSIS & SUSPENSION',name:'穩得住，亦郁得到。',desc:'梯形車架承托機件，連桿定位車橋，彈簧承重，阻尼器控制彈跳。車橋可以擺動，車架仍然保持整體剛性。',tip:'<b>開啟懸掛活動：</b>觀察前橋兩側避震長度點樣改變；示意並非真實地形物理模擬。',ids:['frame','shocks','axles'],flow:['frame','shocks','axles','wheels'],heading:'剛性車架，配合可活動車橋。'}
};
let selected=null,topic='all',shellMode='off',showLabels=true,demo=false,articulate=false;
let throttle=0,steering=0,steerActual=0,wheelSpin=0,time=0,demoStart=0;
const groups={},meshes=[],wheelPivots=[],wheelRotors=[],rotors=[],springRigs=[],suspensionLinks=[];
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9ebe3');
const camera=new THREE.PerspectiveCamera(36,1,.05,100);camera.position.set(6.2,4.9,7.4);
let renderer,webglAvailable=true;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){
 webglAvailable=false;
 $('#loading').innerHTML='<div class="render-error"><strong>3D 畫面未能啟動</strong><p>呢個瀏覽器未提供 WebGL。請開啟硬件加速，<br>或改用支援 WebGL 嘅瀏覽器。<br>你仍可選擇部件、閱讀原理及操作遙控器。</p><button onclick="location.reload()">重新載入</button></div>';
 // Keep the learning content and controls accessible if graphics are unavailable.
 renderer={domElement:document.createElement('canvas'),shadowMap:{},setPixelRatio(){},setSize(){},render(){}};
}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
$('#canvas-wrap').appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D Crawler；拖曳旋轉，雙指或滾輪縮放');
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.73,0);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=3.5;controls.maxDistance=15;controls.maxPolarAngle=Math.PI-.08;controls.enablePan=true;controls.autoRotateSpeed=.6;
scene.add(new THREE.HemisphereLight('#ffffff','#727a62',3));
const key=new THREE.DirectionalLight('#fff9e8',4.8);key.position.set(4,9,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;key.shadow.bias=-.0004;scene.add(key);
const fill=new THREE.DirectionalLight('#e3edf1',2);fill.position.set(-5,4,-3);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#e9ebe3',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(12,30,'#c4cbb8','#d9dece');grid.position.y=.001;grid.material.transparent=true;grid.material.opacity=.55;scene.add(grid);
const model=new THREE.Group();scene.add(model);
Object.keys(parts).forEach(id=>{groups[id]=new THREE.Group();groups[id].name=id;model.add(groups[id]);});
function material(color,metalness=.1,roughness=.55){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function mesh(id,geo,color,pos=[0,0,0],parent=null,metalness=.12,roughness=.56){let m=new THREE.Mesh(geo,material(color,metalness,roughness));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;m.userData.part=id;m.userData.baseColor=m.material.color.clone();m.userData.baseOpacity=1;m.userData.baseMetalness=metalness;(parent||groups[id]).add(m);meshes.push(m);return m;}
function box(id,size,pos,color,parent=null,metal=.12){return mesh(id,new THREE.BoxGeometry(...size),color,pos,parent,metal);}
function cyl(id,radius,length,pos,color,parent=null,axis='y',metal=.35){const m=mesh(id,new THREE.CylinderGeometry(radius,radius,length,24),color,pos,parent,metal);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
function ball(id,r,pos,color,parent=null){return mesh(id,new THREE.SphereGeometry(r,12,10),color,pos,parent,.5);}
function rod(id,a,b,r,color,parent=null){const m=cyl(id,r,1,[0,0,0],color,parent);setRod(m,new THREE.Vector3(...a),new THREE.Vector3(...b));return m;}
const up=new THREE.Vector3(0,1,0);
function setRod(m,a,b){m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=a.distanceTo(b);m.quaternion.setFromUnitVectors(up,b.clone().sub(a).normalize());}
function tube(id,points,r,color,parent=null){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=mesh(id,new THREE.TubeGeometry(curve,40,r,7,false),color,[0,0,0],parent);return {m,curve};}
function bolt(id,pos,parent=null){return mesh(id,new THREE.CylinderGeometry(.027,.027,.018,6),'#b6b9ac',pos,parent,.7);}
function labelTexture(text,bg,fg,w=256,h=128){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.font='bold 25px monospace';text.split('\n').forEach((line,i,a)=>x.fillText(line,w/2,h/2+(i-(a.length-1)/2)*32));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function plate(id,size,pos,text,bg,fg,parent=null){const m=mesh(id,new THREE.PlaneGeometry(...size),'#ffffff',pos,parent);m.rotation.x=-Math.PI/2;m.material.map=labelTexture(text,bg,fg);m.material.roughness=.9;return m;}

// Two structural rails and a central protective skid.
for(const side of [-1,1]){
 box('frame',[.085,.17,3.75],[side*.61,.99,0],'#3c4840',null,.65);
 box('frame',[.18,.035,3.75],[side*.58,1.09,0],'#566157',null,.65);
 for(const z of [-1.66,-.5,.65,1.62]){bolt('frame',[side*.59,1.12,z]);}
 for(const z of [-1.52,1.52]){
  const tower=box('frame',[.075,.53,.28],[side*.64,1.28,z*.89],'#4f5b4c',null,.55);tower.rotation.x=-Math.sign(z)*.16;
  for(let i=0;i<3;i++)bolt('frame',[side*.65,1.55,z*.89+i*.045]);
 }
 box('frame',[.27,.065,1.7],[side*.84,.92,-.2],'#55634e');
 for(const z of [-.7,.5])rod('frame',[side*.61,.94,z],[side*.95,.94,z],.025,'#69755d');
}
for(const z of [-1.72,-.85,.1,1.72])box('frame',[1.18,.09,.095],[0,1.01,z],'#535e50',null,.55);
box('frame',[1.02,.105,.75],[0,.77,0],'#4f5a46',null,.45);
for(const z of [-2.02,2.02]){box('frame',[1.8,.15,.17],[0,.92,z],'#343f34',null,.6);for(const x of [-.68,.68]){const hook=mesh('frame',new THREE.TorusGeometry(.07,.015,7,16),'#bd784e',[x,.88,z+Math.sign(z)*.13]);hook.rotation.x=Math.PI/2;}}

// Front and rear locked solid axles. Front assembly articulates as one unit.
const frontAxle=new THREE.Group(),rearAxle=new THREE.Group();frontAxle.position.set(0,.57,1.53);rearAxle.position.set(0,.57,-1.53);groups.axles.add(frontAxle,rearAxle);
for(const [a,isFront] of [[frontAxle,true],[rearAxle,false]]){
 cyl('axles',.085,1.87,[0,0,0],'#566153',a,'x',.65);
 const pumpkin=mesh('axles',new THREE.SphereGeometry(.205,20,16),'#555f4c',[0,0,0],a,.65);pumpkin.scale.set(1,1,.8);
 cyl('axles',.145,.09,[0,0,isFront?-.16:.16],'#9e925e',a,'z',.6);
 for(let i=0;i<8;i++){const ang=i*Math.PI/4;const b=bolt('axles',[Math.cos(ang)*.127,Math.sin(ang)*.127,(isFront?-.22:.22)],a);b.rotation.x=Math.PI/2;}
 for(const side of [-1,1]){
  box('axles',[.12,.24,.15],[side*.87,0,0],'#3f4d3c',a,.65);
  const pivot=new THREE.Group();pivot.position.set(side*1.03,0,0);a.add(pivot);wheelPivots.push({pivot,front:isFront,side});
  const rotor=new THREE.Group();pivot.add(rotor);wheelRotors.push(rotor);
  const tire=mesh('wheels',new THREE.CylinderGeometry(.535,.535,.33,56),'#272c28',[0,0,0],rotor,0,.95);tire.rotation.z=Math.PI/2;
  // Chamfered shoulders and alternating individual tread blocks.
  for(const x of [-.145,.145]){const sidewall=mesh('wheels',new THREE.TorusGeometry(.43,.085,10,48),'#2d322c',[x,0,0],rotor,0,.95);sidewall.rotation.y=Math.PI/2;}
  for(let j=0;j<30;j++){const ang=j*Math.PI*2/30;for(const lane of [-1,1]){const a2=ang+lane*.035;const tread=box('wheels',[.17,.065,.115],[lane*.081,Math.cos(a2)*.536,Math.sin(a2)*.536],j%3===0?'#343a32':'#2c322b',rotor,0);tread.rotation.x=a2;tread.rotation.y=lane*.23;}}
  cyl('wheels',.277,.35,[0,0,0],'#8b8d73',rotor,'x',.75);
  for(const x of [-.185,.185]){
   const ring=mesh('wheels',new THREE.TorusGeometry(.253,.025,8,40),'#bec0ab',[x,0,0],rotor,.7);ring.rotation.y=Math.PI/2;
   cyl('wheels',.1,.014,[x*1.06,0,0],'#535d4b',rotor,'x',.7);
   for(let i=0;i<8;i++){const a2=i*Math.PI/4;const b=bolt('wheels',[x*1.08,Math.cos(a2)*.237,Math.sin(a2)*.237],rotor);b.rotation.z=Math.PI/2;}
   for(let i=0;i<6;i++){const a2=i*Math.PI/3;const spoke=box('wheels',[.025,.06,.14],[x,Math.cos(a2)*.165,Math.sin(a2)*.165],'#69765a',rotor,.65);spoke.rotation.x=a2-Math.PI/2;}
  }
 }
}
// Suspension links: lower and upper rods locate the solid axles.
for(const [a,isFront] of [[frontAxle,true],[rearAxle,false]]){
 for(const side of [-1,1]){
  for(const upper of [false,true]){
   const start=new THREE.Vector3(side*(upper?.25:.47),upper?.94:.74,isFront?.26:-.26);
   const endLocal=new THREE.Vector3(side*(upper?.23:.72),upper?.13:-.03,isFront?-.1:.1);
   const end=endLocal.clone().add(a.position);
   const link=rod('frame',start.toArray(),end.toArray(),upper?.025:.035,upper?'#87937a':'#9a9f8c');
   ball('frame',.05,start.toArray(),'#4a5642');
   suspensionLinks.push({m:link,start,endLocal,axle:a});
  }
 }
}
// Coilover shocks, built on a local Y axis so length changes visibly.
function makeShock(axle,side,isFront){
 const root=new THREE.Group();groups.shocks.add(root);
 cyl('shocks',.07,.29,[0,.04,0],'#a1aa83',root,'y',.7);
 cyl('shocks',.025,.54,[0,0,0],'#c9ccc0',root,'y',.9);
 for(const y of [-.31,.31]){cyl('shocks',.085,.045,[0,y,0],'#4d6540',root,'y',.65);ball('shocks',.048,[0,y+(y>0?.04:-.04),0],'#b2baa2',root);}
 const pts=[];for(let i=0;i<=200;i++){const t=i/200;pts.push(new THREE.Vector3(Math.cos(t*Math.PI*20)*.085,-.29+t*.58,Math.sin(t*Math.PI*20)*.085));}
 mesh('shocks',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),200,.013,5,false),'#d2d5bf',[0,0,0],root,.8);
 springRigs.push({root,top:new THREE.Vector3(side*.65,1.54,isFront?1.37:-1.37),endLocal:new THREE.Vector3(side*.74,.07,0),axle});
}
for(const side of [-1,1]){makeShock(frontAxle,side,true);makeShock(rearAxle,side,false);}

// Transmission housing, exposed reduction gear pair and rotary drive shafts.
const housing=box('gearbox',[.58,.48,.61],[0,1.04,0],'#68755a',null,.45);housing.userData.isHousing=true;
for(const x of [-.3,.3])box('gearbox',[.035,.45,.59],[x,1.04,0],'#a8ab92',null,.65);
function gear(r,teeth,pos,color){const g=new THREE.Group();g.position.set(...pos);groups.gearbox.add(g);cyl('gearbox',r,.075,[0,0,0],color,g,'z',.7);for(let i=0;i<teeth;i++){const a=i*Math.PI*2/teeth;let m=box('gearbox',[.055,.05,.08],[Math.cos(a)*(r+.01),Math.sin(a)*(r+.01),0],color,g,.7);m.rotation.z=a;}cyl('gearbox',.045,.09,[0,0,0],'#59624e',g,'z',.7);return g;}
const spur=gear(.22,24,[0,1.12,.345],'#bda96a');const pinion=gear(.09,12,[.31,1.14,.345],'#d0c6a1');
const motorRoot=new THREE.Group();motorRoot.position.set(.33,1.13,.68);groups.motor.add(motorRoot);cyl('motor',.185,.49,[0,0,0],'#8e9b82',motorRoot,'z',.8);
for(const z of [-.24,.24])cyl('motor',.19,.04,[0,0,z],'#434f41',motorRoot,'z',.65);
for(let i=0;i<8;i++){const a=i*Math.PI/4;let vent=box('motor',[.04,.012,.13],[Math.cos(a)*.184,Math.sin(a)*.184,.10],'#344231',motorRoot,.4);vent.rotation.z=a-Math.PI/2;}
const motorRotor=new THREE.Group();motorRotor.position.set(.33,1.13,.35);groups.motor.add(motorRotor);cyl('motor',.035,.23,[0,0,0],'#e2d3aa',motorRotor,'z',.8);box('motor',[.08,.03,.07],[0,.02,0],'#e88d56',motorRotor);rotors.push(motorRotor);
plate('motor',[.23,.28],[.33,1.321,.69],'540\nMOTOR','#4b5b44','#e7eadb');
const driveShafts=[];
for(const [a,isFront] of [[frontAxle,true],[rearAxle,false]]){
 const root=new THREE.Group();groups.shafts.add(root);const spinning=new THREE.Group();root.add(spinning);
 cyl('shafts',.043,1,[0,0,0],'#9d9c70',spinning,'y',.8);
 cyl('shafts',.065,.48,[0,.07,0],'#5c674d',spinning,'y',.7);
 box('shafts',[.022,.45,.025],[.056,.07,0],'#d7c77e',spinning,.6);
 for(const y of [-.5,.5]){cyl('shafts',.08,.07,[0,y,0],'#4b5945',spinning,'y',.7);box('shafts',[.12,.05,.045],[0,y,0],'#b3b79c',spinning,.7);}
 driveShafts.push({root,spinning,axle:a,start:new THREE.Vector3(0,.86,isFront?.27:-.27),endLocal:new THREE.Vector3(0,0,isFront?-.15:.15)});
}

// Battery, receiver, ESC and their separate power/signal wiring.
box('battery',[.59,.30,1.03],[.24,1.25,-.87],'#556348');
for(const z of [-1.20,-.54])box('battery',[.61,.045,.13],[.24,1.422,z],'#27382a');
plate('battery',[.50,.48],[.24,1.405,-.87],'LiPo\nBATTERY','#75824e','#f0edd2');
box('esc',[.43,.25,.42],[-.53,1.20,.25],'#283b2d');
for(let i=0;i<7;i++)box('esc',[.027,.10,.4],[-.70+i*.054,1.35,.25],'#a7b28a',null,.7);
plate('esc',[.32,.18],[-.53,1.41,.25],'ESC','#293a2b','#eff0d7');
box('receiver',[.36,.19,.38],[-.57,1.17,-.6],'#4c6544');plate('receiver',[.29,.28],[-.57,1.271,-.6],'RX\nCH1 · CH2','#425a37','#edf1d5');
const aerial=tube('receiver',[[-.67,1.2,-.69],[-.75,1.38,-.7],[-.74,1.88,-.72]],.012,'#3d4a37');
const servoRoot=new THREE.Group();servoRoot.position.set(0,.32,0);frontAxle.add(servoRoot);
box('servo',[.43,.26,.23],[0,0,0],'#738a50',servoRoot,.6);box('servo',[.49,.04,.25],[0,.13,0],'#3c5134',servoRoot,.5);
for(const x of [-.22,.22])bolt('servo',[x,.161,0],servoRoot);
const hornRoot=new THREE.Group();hornRoot.position.set(.13,.17,0);servoRoot.add(hornRoot);cyl('servo',.06,.045,[0,0,0],'#d0c6a1',hornRoot);box('servo',[.065,.035,.23],[0,0,.09],'#b1be8a',hornRoot,.6);
const tie=rod('links',[0,0,0],[1,0,0],.03,'#abbc81');const drag=rod('links',[0,0,0],[1,0,0],.025,'#96ab66');
const tieBalls=[ball('links',.045,[0,0,0],'#475c3b'),ball('links',.045,[0,0,0],'#475c3b')];
const powerPaths=[];
powerPaths.push(tube('battery',[[.52,1.32,-.45],[.72,1.43,-.22],[.4,1.5,.1],[-.32,1.34,.26]],.025,'#ca7349'));
tube('battery',[[.48,1.31,-.43],[.65,1.38,-.16],[.33,1.44,.14],[-.34,1.29,.3]],.025,'#3b493b');
powerPaths.push(tube('esc',[[-.34,1.3,.35],[-.16,1.46,.65],[.22,1.4,.86],[.33,1.2,.91]],.021,'#cd8551'));
tube('esc',[[-.34,1.24,.39],[-.12,1.40,.70],[.17,1.35,.9],[.29,1.17,.91]],.021,'#4b5e40');
const becPath=tube('esc',[[-.62,1.2,.04],[-.81,1.25,-.17],[-.71,1.18,-.44]],.015,'#cebd77');
const signalPath=tube('receiver',[[-.49,1.22,-.42],[-.85,1.3,.08],[-.82,1.23,.86],[-.27,1.04,1.53]],.015,'#93aa6c');
box('battery',[.11,.07,.12],[.7,1.4,-.18],'#d8bc67');
const sparks=[];for(const {curve} of [...powerPaths,becPath])for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),new THREE.MeshBasicMaterial({color:'#edba75'}));scene.add(p);sparks.push({p,curve,offset:i/3});}

// A lightweight boxy body shell with actual open wheel arches and glazed cabin.
function bodySide(side){
 const s=new THREE.Shape();s.moveTo(-2.03,1.13);s.lineTo(-2.03,1.52);s.lineTo(1.97,1.52);s.lineTo(1.97,1.13);
 s.lineTo(1.94,1.13);s.absarc(1.53,.57,.66,Math.asin((1.13-.57)/.66),Math.PI-Math.asin((1.13-.57)/.66),false);
 s.lineTo(.86,1.08);s.lineTo(-.86,1.08);s.lineTo(-.86,1.13);s.absarc(-1.53,.57,.66,Math.asin((1.13-.57)/.66),Math.PI-Math.asin((1.13-.57)/.66),false);s.lineTo(-2.03,1.13);
 const geom=new THREE.ExtrudeGeometry(s,{depth:.035,bevelEnabled:false});const m=mesh('body',geom,'#a2aa7f');m.rotation.y=-Math.PI/2;m.position.x=side*.85;
}
bodySide(-1);bodySide(1);
box('body',[1.73,.06,1.2],[0,1.55,1.36],'#adb48a');box('body',[1.73,.08,2.55],[0,2.20,-.57],'#b4bb91');box('body',[1.72,.42,.055],[0,1.31,-2.02],'#9fa780');box('body',[1.7,.28,.05],[0,1.38,1.97],'#899476');
for(const side of [-1,1]){
 for(const z of [-1.85,-.96,-.1,.65]){const pillar=box('body',[.055,.65,.045],[side*.82,1.86,z],'#a7b187');if(z===.65)pillar.rotation.x=-.22;}
 for(const [z,len] of [[-1.4,.83],[-.53,.79],[.27,.68]]){const g=box('body',[.015,.50,len],[side*.83,1.87,z],'#577568');g.userData.baseOpacity=.5;}
 box('body',[.06,.045,.2],[side*.88,1.48,.28],'#374b3b');box('body',[.06,.045,.2],[side*.88,1.48,-.6],'#374b3b');
 box('body',[.14,.15,.22],[side*.95,1.8,.61],'#526448');
 box('body',[.18,.10,.04],[side*.59,1.43,-2.06],'#aa694c');
 cyl('body',.10,.03,[side*.59,1.43,2.01],'#ebe5bc',null,'z');
 for(const z of [-1.8,-.9,0])box('body',[.025,.06,.08],[side*.85,2.24,z],'#4e6046');
 box('body',[.035,.04,2.03],[side*.66,2.29,-.8],'#516245');
}
const wind=box('body',[1.55,.51,.025],[0,1.89,.72],'#577568');wind.rotation.x=-.22;wind.userData.baseOpacity=.48;
const rearGlass=box('body',[1.5,.51,.025],[0,1.87,-1.88],'#577568');rearGlass.userData.baseOpacity=.48;
box('body',[.89,.17,.025],[0,1.4,2.01],'#354535');for(let i=0;i<6;i++)box('body',[.72,.013,.015],[0,1.34+i*.023,2.03],'#afb99b');
for(const z of [-1.7,-1,-.3])box('body',[1.32,.035,.035],[0,2.29,z],'#516245');

// Labels are anchored to actual 3D positions, with collision avoidance.
const labelElements={};
for(const [id,p] of Object.entries(parts)){const e=document.createElement('button');e.className='part-label';e.innerHTML=`<span class="marker">${p.n}</span><span>${p.name}</span>`;e.setAttribute('aria-label',`選取${p.name}`);e.addEventListener('click',()=>selectPart(id));$('#labels').appendChild(e);labelElements[id]=e;}
const defaultLabels=['battery','motor','servo','shocks','wheels'];
function fillPartList(){let last='';for(const [id,p] of Object.entries(parts)){if(p.system!==last){const h=document.createElement('div');h.className='part-group-title';h.textContent={power:'01 / POWER',steering:'02 / STEERING',drive:'03 / DRIVETRAIN',chassis:'04 / CHASSIS'}[p.system];$('#part-list').appendChild(h);last=p.system;}const b=document.createElement('button');b.className='part-button';b.dataset.part=id;b.innerHTML=`<span class="part-index">${p.n}</span><span class="part-dot" style="background:${colors[p.system]}"></span><span class="part-name">${p.name}<small>${p.en.split(' & ')[0]}</small></span>`;b.addEventListener('click',()=>selectPart(id));$('#part-list').appendChild(b);}}
fillPartList();
function activeIds(){return selected?[selected]:topics[topic].ids;}
function updateMaterials(){const active=activeIds();for(const m of meshes){const id=m.userData.part;const match=active.includes(id);let opacity=active.length?(match?m.userData.baseOpacity:.095):m.userData.baseOpacity;let shade=m.userData.baseColor.clone();if(active.length&&!match)shade.set('#9aa58f');if(match&&id!=='wheels'&&id!=='body')shade.lerp(new THREE.Color(colors[parts[id].system]),.20);if(id==='body'){m.visible=shellMode!=='off'||selected==='body';if(selected==='body'){opacity=m.userData.baseOpacity;}else if(shellMode==='ghost'){opacity=.09;}else if(shellMode==='solid'){opacity=active.length?.075:m.userData.baseOpacity;}}
 if(m.userData.isHousing)opacity=active.includes('gearbox')?.14:(active.length?.07:.8);
 m.material.color.copy(shade);m.material.opacity=opacity;m.material.transparent=opacity<.99;m.material.depthWrite=opacity>.6;m.material.emissive.set(match?'#2b301e':'#000000');m.material.emissiveIntensity=match?.08:0;m.castShadow=opacity>.5;m.renderOrder=opacity<.3?1:0;
}groups.body.visible=shellMode!=='off'||selected==='body';}
function updateDetail(){const d=selected?parts[selected]:topics[topic];$('#detail-kicker').textContent=selected?`COMPONENT ${d.n} / ${d.system.toUpperCase()}`:d.en;$('#clear-selection').hidden=!selected&&topic==='all';$('#detail-content').innerHTML=`<h2>${d.name}</h2>${selected?`<div class="en-name">${d.en}</div>`:''}<p class="detail-body">${d.desc}</p><div class="detail-tip">${d.tip}</div>${selected==='shocks'||topic==='chassis'?`<div class="small-chips"><button id="articulate" aria-pressed="${articulate}">${articulate?'■ 停止懸掛活動':'↕ 懸掛活動'}</button></div>`:''}${selected==='shafts'||topic==='drive'?'<div class="small-chips"><button id="under-view">↗ 睇底盤</button></div>':''}`;
 $('#articulate')?.addEventListener('click',()=>{articulate=!articulate;updateDetail();});$('#under-view')?.addEventListener('click',()=>setView('bottom'));
 $$('[data-part]').forEach(b=>{b.classList.toggle('active',b.dataset.part===selected);b.classList.toggle('system-active',!selected&&activeIds().includes(b.dataset.part));});
 $$('[data-topic]').forEach(b=>{const a=b.dataset.topic===topic;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a);});
 $('#scene-number').textContent=selected?`COMPONENT ${d.n} / ${d.en}`:topic==='all'?'VEHICLE 01 / UNDER THE SHELL':topics[topic].en;
 $('#scene-title').innerHTML=selected?`${d.name}<br><span style="font-size:.56em;color:#7d8b6f;letter-spacing:0">保留實色 · 其餘半透明</span>`:({all:'每一個部件，<br>都有佢嘅角色。',power:'能量，由呢度開始。',steering:'一個動作，<br>改變行進方向。',drive:'跟住動力，<br>去到每一個轆。',chassis:'穩定，同靈活。'}[topic]);
 updateFlow();updateMaterials();
}
function selectPart(id){selected=selected===id?null:id;if(selected){topic=parts[id].system;if(id==='body'){shellMode='solid';updateShellButtons();}}updateDetail();}
function setTopic(id){topic=id;selected=null;articulate=false;updateDetail();}
function updateFlow(){const t=topics[topic];$('#flow-heading').textContent=t.heading;$('#flow-steps').innerHTML=t.flow.map((id,i)=>`<div class="flow-step ${id===selected?'active':''}">${i?'<span class="step-arrow">→</span>':''}<button data-flow="${id}">${parts[id].name}</button></div>`).join('');$$('[data-flow]').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.flow)));}
function updateShellButtons(){$$('[data-shell]').forEach(b=>{const a=b.dataset.shell===shellMode;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a);});}
$$('[data-topic]').forEach(b=>b.addEventListener('click',()=>setTopic(b.dataset.topic)));
$$('[data-shell]').forEach(b=>b.addEventListener('click',()=>{shellMode=b.dataset.shell;if(selected==='body'&&shellMode!=='solid'){selected=null;topic='all';updateDetail();}updateShellButtons();updateMaterials();}));
$('#clear-selection').addEventListener('click',()=>setTopic('all'));
$('#labels-toggle').addEventListener('click',()=>{showLabels=!showLabels;$('#labels-toggle').classList.toggle('active',showLabels);$('#labels-toggle').setAttribute('aria-pressed',showLabels);});
$('#rotate-toggle').addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;$('#rotate-toggle').classList.toggle('active',controls.autoRotate);$('#rotate-toggle').setAttribute('aria-pressed',controls.autoRotate);});
let camTween=null;
const views={three:[6.2,4.9,7.4],front:[0,2,9.5],side:[9.8,2.5,0],top:[0,10,.001],bottom:[4.7,-6.7,5.5]};
function setView(name){camTween={from:camera.position.clone(),to:new THREE.Vector3(...views[name]),targetFrom:controls.target.clone(),start:performance.now()};$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));controls.autoRotate=false;$('#rotate-toggle').classList.remove('active');$('#rotate-toggle').setAttribute('aria-pressed','false');}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('#reset-view').addEventListener('click',()=>setView('three'));
function zoom(factor){camTween=null;const v=camera.position.clone().sub(controls.target);v.setLength(THREE.MathUtils.clamp(v.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(v);}
$('#zoom-in').addEventListener('click',()=>zoom(.8));$('#zoom-out').addEventListener('click',()=>zoom(1.25));
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('#viewport').requestFullscreen)await $('#viewport').requestFullscreen();else{$('#viewport').scrollIntoView({behavior:'smooth'});$('#motion-status').textContent='此瀏覽器未支援全螢幕；仍可雙指縮放。';}}catch{ $('#motion-status').textContent='全螢幕未能開啟；仍可旋轉及縮放。';}});
controls.addEventListener('start',()=>{camTween=null;});
function updateRemote(){const deg=Math.round(steering*30);$('#steering-readout').innerHTML=`${Math.abs(deg)}° <em>${deg<0?'左轉':deg>0?'右轉':'置中'}</em>`;$('#throttle-readout').innerHTML=`${Math.round(throttle*100)}<em>%</em>`;$('#tx-screen').textContent=`TH ${Math.round(throttle*100)}%`;$('#tx-wheel').style.transform=`rotate(${steering*65}deg)`;$('#trigger').style.transform=`rotate(${-throttle*23}deg)`;$('#motion-status').textContent=throttle>0?'前進 · 四輪架空運轉':throttle<0?'後退 · 四輪反向運轉':steering!==0?'轉向中 · 油門保持 0':'靜止 · 試下操作右邊遙控器';$('#motion-dot').classList.toggle('moving',Math.abs(throttle)>.01);}
function stopDemo(){demo=false;$('#demo').classList.remove('playing');$('#demo').textContent='▷ 自動示範';}
function setThrottle(value,manual=true){if(manual)stopDemo();throttle=THREE.MathUtils.clamp(value,-1,1);$('#throttle').value=Math.round(throttle*100);updateRemote();}
function setSteering(value,manual=true){if(manual)stopDemo();steering=THREE.MathUtils.clamp(value,-1,1);$('#steering').value=Math.round(steering*100);updateRemote();}
$('#throttle').addEventListener('input',e=>setThrottle(Number(e.target.value)/100));$('#steering').addEventListener('input',e=>setSteering(Number(e.target.value)/100));$('#center-steering').addEventListener('click',()=>setSteering(0));
$('#stop').addEventListener('click',()=>{setThrottle(0);articulate=false;updateDetail();});
let holding=null;
function releaseHold(){if(holding){holding=null;setThrottle(0);}}
for(const [id,direction] of [['forward-hold',.45],['reverse-hold',-.35]]){const b=$('#'+id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);holding=id;setThrottle(direction);});b.addEventListener('pointerup',releaseHold);b.addEventListener('pointercancel',releaseHold);b.addEventListener('lostpointercapture',releaseHold);b.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();holding=id;setThrottle(direction);}});b.addEventListener('keyup',releaseHold);}
let wheelDrag=null;
$('#tx-wheel').addEventListener('pointerdown',e=>{e.preventDefault();wheelDrag={x:e.clientX,value:steering,id:e.pointerId};$('#tx-wheel').setPointerCapture(e.pointerId);});
$('#tx-wheel').addEventListener('pointermove',e=>{if(wheelDrag)setSteering(wheelDrag.value+(e.clientX-wheelDrag.x)/65);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('#tx-wheel').addEventListener(ev,()=>{wheelDrag=null;});
window.addEventListener('blur',()=>{releaseHold();stopDemo();setThrottle(0);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseHold();stopDemo();setThrottle(0);}});
$('#demo').addEventListener('click',()=>{if(demo){stopDemo();setThrottle(0);setSteering(0);}else{demo=true;demoStart=time;$('#demo').classList.add('playing');$('#demo').textContent='■ 停止示範';}});
for(const id of ['about','sources'])$('#'+id).addEventListener('click',()=>$('#about-dialog').showModal());$('.close-dialog').addEventListener('click',()=>$('#about-dialog').close());$('#about-dialog').addEventListener('click',e=>{if(e.target===$('#about-dialog')){const r=$('#about-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#about-dialog').close();}});

// Direct model selection via raycasting (ignore the transparent body shell).
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart=null;
function hitAt(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(meshes,false).filter(h=>h.object.visible&&h.object.parent.visible&&(h.object.userData.part!=='body'||shellMode==='solid'));return hits.find(h=>h.object.material.opacity>.45)||hits[0];}
renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointerup',e=>{if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<5){const h=hitAt(e);if(h)selectPart(h.object.userData.part);}pointerStart=null;});
renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)return;const h=hitAt(e);renderer.domElement.style.cursor=h?'pointer':'grab';const t=$('#hover-tip');if(h&&e.pointerType!=='touch'){const r=renderer.domElement.getBoundingClientRect();t.textContent=parts[h.object.userData.part].name;t.style.left=`${Math.min(e.clientX-r.left+12,r.width-115)}px`;t.style.top=`${e.clientY-r.top+12}px`;t.hidden=false;}else t.hidden=true;});
renderer.domElement.addEventListener('pointerleave',()=>$('#hover-tip').hidden=true);

function resize(){const r=$('#canvas-wrap').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe($('#canvas-wrap'));resize();
const v3=new THREE.Vector3(),aTemp=new THREE.Vector3(),bTemp=new THREE.Vector3();
function updateMechanics(dt){
 steerActual=THREE.MathUtils.damp(steerActual,steering,12,dt);const turn=-steerActual*Math.PI/6;wheelSpin+=throttle*dt*3.0;
 frontAxle.rotation.z=articulate?Math.sin(time*1.6)*.17:THREE.MathUtils.damp(frontAxle.rotation.z,0,8,dt);
 wheelPivots.forEach(({pivot,front})=>{pivot.rotation.y=front?turn:0;});wheelRotors.forEach(r=>r.rotation.x=wheelSpin);hornRoot.rotation.y=turn*1.7;
 spur.rotation.z=-wheelSpin*4;pinion.rotation.z=wheelSpin*8;motorRotor.rotation.z=wheelSpin*8;
 model.updateMatrixWorld(true);
 for(const rig of springRigs){const bottom=rig.axle.localToWorld(rig.endLocal.clone());rig.root.position.copy(rig.top).add(bottom).multiplyScalar(.5);rig.root.quaternion.setFromUnitVectors(up,rig.top.clone().sub(bottom).normalize());rig.root.scale.y=rig.top.distanceTo(bottom)/.70;}
 for(const link of suspensionLinks){setRod(link.m,link.start,link.axle.localToWorld(link.endLocal.clone()));}
 for(const s of driveShafts){const end=s.axle.localToWorld(s.endLocal.clone());s.root.position.copy(s.start).add(end).multiplyScalar(.5);s.root.quaternion.setFromUnitVectors(up,end.clone().sub(s.start).normalize());s.root.scale.y=s.start.distanceTo(end);s.spinning.rotation.y=wheelSpin*5;}
 const front=wheelPivots.filter(x=>x.front);const ends=front.map(({pivot})=>pivot.localToWorld(new THREE.Vector3(0,.05,.23)));setRod(tie,ends[0],ends[1]);tieBalls.forEach((m,i)=>m.position.copy(ends[i]));const hornTip=hornRoot.localToWorld(new THREE.Vector3(0,0,.2));setRod(drag,hornTip,ends[0]);
 for(const s of sparks){s.p.visible=Math.abs(throttle)>.02&&(topic==='power'||selected==='battery'||selected==='esc');if(s.p.visible)s.p.position.copy(s.curve.getPoint((time*.55+s.offset)%1));}
 floor.visible=camera.position.y>.1;grid.visible=camera.position.y>.1;
}
function updateLabels(){const w=$('#canvas-wrap').clientWidth,h=$('#canvas-wrap').clientHeight;const active=activeIds();let ids=selected?[selected]:topic==='all'?defaultLabels:active.filter(x=>x!=='links');const rects=[];
 for(const [id,el] of Object.entries(labelElements)){if(!webglAvailable||!showLabels||!ids.includes(id)||(shellMode==='solid'&&!selected&&id!=='body')){el.style.display='none';continue;}v3.set(...parts[id].anchor);if(id==='servo'||id==='links')v3.y+=Math.sin(time*1.6)*(articulate?.04:0);v3.project(camera);let x=(v3.x*.5+.5)*w,y=(-v3.y*.5+.5)*h;const ew=el.offsetWidth||105;const eh=29;if(v3.z>1||v3.z<-1||x<0||x>w||y<100||y>h-160){el.style.display='none';continue;}x=THREE.MathUtils.clamp(x,ew/2+10,w-ew/2-10);let count=0;while(rects.some(r=>Math.abs(r.x-x)<(r.w+ew)/2+5&&Math.abs(r.y-y)<eh+5)&&count<5){y+=34;count++;}if(y>h-160){el.style.display='none';continue;}rects.push({x,y,w:ew});el.style.display='flex';el.style.left=x+'px';el.style.top=y+'px';el.classList.toggle('selected',id===selected);}
}
let previous=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-previous)/1000,.05);previous=now;time+=dt;
 if(demo){const t=time-demoStart;if(t<3){setThrottle(0,false);setSteering(Math.sin(t*2.1)*.9,false);}else if(t<8){setThrottle(.4,false);setSteering(Math.sin((t-3)*1.2)*.7,false);}else if(t<11){setThrottle(-.3,false);setSteering(0,false);}else{stopDemo();setThrottle(0,false);setSteering(0,false);}}
 if(camTween){const t=Math.min((now-camTween.start)/650,1);const ease=t*t*(3-2*t);camera.position.lerpVectors(camTween.from,camTween.to,ease);controls.target.lerpVectors(camTween.targetFrom,new THREE.Vector3(0,.73,0),ease);if(t===1)camTween=null;}
 controls.update();updateMechanics(dt);renderer.render(scene,camera);updateLabels();
}
updateDetail();updateRemote();updateShellButtons();if(webglAvailable)$('#loading').remove();requestAnimationFrame(animate);
// A small read-only QA surface for render/interaction verification.
window.rcrc={getState:()=>({selected,topic,shellMode,throttle,steering,frontAngles:wheelPivots.filter(p=>p.front).map(p=>p.pivot.rotation.y),rearAngles:wheelPivots.filter(p=>!p.front).map(p=>p.pivot.rotation.y),wheelSpin,articulate,meshCount:meshes.length,opaque:selected?meshes.filter(m=>m.userData.part===selected).map(m=>m.material.opacity):[],otherOpacity:selected?meshes.filter(m=>m.userData.part!==selected&&m.userData.part!=='body').slice(0,8).map(m=>m.material.opacity):[],camera:camera.position.toArray(),labels:showLabels,demo}),selectPart,setTopic};
