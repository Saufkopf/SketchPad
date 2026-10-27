'use strict';
const $=id=>document.getElementById(id),canvas=$('canvas');let ctx=canvas.getContext('2d');
const DXF_WINDOW_LINES=[[0.00018,-0.0,0.00018,-0.1],[0.00018,-0.1,1.00018,-0.1],[1.00018,-0.1,1.00018,-0.0],[0.02746,-0.0,0.02746,1.0],[0.97291,-0.0,0.97291,1.0],[0.10018,0.5,0.90018,0.5],[0.97291,0.65,0.90018,0.65],[0.90018,0.65,0.90018,0.35],[0.90018,0.35,0.97291,0.35],[0.02746,0.65,0.10018,0.65],[0.10018,0.65,0.10018,0.35],[0.10018,0.35,0.02746,0.35],[0.10018,0.65,0.90018,0.65],[0.90018,0.35,0.10018,0.35],[0.00018,-0.0,0.02746,-0.0],[1.00018,-0.0,0.97291,-0.0]];
const DXF_DOOR_LINES=[[1.06249,-0.0,1.06249,-0.1],[1.06249,-0.1,0.98295,-0.1],[0.98295,-0.1,0.98295,1.0],[0.01704,1.0,0.01704,-0.1],[0.01704,-0.1,-0.06251,-0.1],[-0.06251,-0.1,-0.06251,-0.0],[0.99999,-0.1,0.99999,-0.175],[0.99999,-0.175,-1e-05,-0.175],[-1e-05,-0.175,-1e-05,-0.1],[1.06249,-0.0,-0.06251,-0.0]];
const GREEN='#168b55';
const MM=3.7795275591,SIZES={a4p:[210,297],a4l:[297,210],a3p:[297,420],a3l:[420,297]},BLUE='#2454d9',RED='#d71920';
const uid=()=>crypto.randomUUID(),makePage=(name='Seite 1',paper='infinite',kind='drawing')=>({id:uid(),name,paper,grid:kind==='drawing',kind,items:[]});
let doc={id:uid(),name:'Neue Skizze',pages:[makePage()]},pageIndex=0,tool='pen',shapeChoice='rect',color='#2454d9',width=3,redo=[],view={x:0,y:0,z:1},active=null,pointers=new Map(),gesture=null,stylusSeen=false,saveTimer,dirty=false,saveRunning=false,saveAgain=false,saveState='Bereit',selectedPhoto=null,selectedMeasure=null,measureEdit=null,revision=0,eraserSize=28,eraserCursor=null,wallEnd=null,measureDraft=null,measureStage=0,textMove=null,selectedText=null,lastTextTap=null,textDefaultFont=21,textDefaultColor='#2454d9',textDialogColor='#2454d9'; 
const page=()=>doc.pages[pageIndex],imageCache=new Map();
const dbPromise=new Promise((resolve,reject)=>{let r=indexedDB.open('sketchpad-v1',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('docs'))r.result.createObjectStore('docs',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function store(mode='readonly'){return(await dbPromise).transaction('docs',mode).objectStore('docs')}
function status(){if($('status'))$('status').textContent=`${Math.round(view.z*100)} % · ${saveState}`}
async function save(){clearTimeout(saveTimer);doc.name=$('docname').value.trim()||'Unbenannt';if(saveRunning){saveAgain=true;return}saveRunning=true;saveState='Speichert…';status();try{let revisionAtStart=revision,snapshot=structuredClone(doc),db=await dbPromise;await new Promise((resolve,reject)=>{let tx=db.transaction('docs','readwrite');tx.objectStore('docs').put(snapshot);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});localStorage.setItem('sketchpad-current',doc.id);dirty=revision!==revisionAtStart;saveState=dirty?'Weitere Änderungen…':'Gespeichert';if(dirty)saveAgain=true}catch(e){saveState='⚠ Speichern fehlgeschlagen';console.error(e)}finally{saveRunning=false;status();if(saveAgain){saveAgain=false;save()}}}
function changed(){revision++;dirty=true;saveState='Ungespeichert';status();clearTimeout(saveTimer);saveTimer=setTimeout(save,350)}
async function getAll(){let s=await store();return new Promise((ok,err)=>{let r=s.getAll();r.onsuccess=()=>ok(r.result);r.onerror=()=>err(r.error)})}
function normalize(d){if(!Array.isArray(d.pages)){d.pages=[{id:uid(),name:'Seite 1',paper:d.paper||'infinite',grid:d.grid!==false,kind:'drawing',items:d.items||[]}]}d.pages.forEach((p,i)=>{p.id||=uid();p.name||=`Seite ${i+1}`;p.paper||='infinite';p.items||=[];p.kind||='drawing'});return d}
async function load(id){let s=await store();let d=await new Promise(ok=>{let r=s.get(id);r.onsuccess=()=>ok(r.result)});if(!d)return;doc=normalize(d);pageIndex=0;redo=[];selectedPhoto=null;$('docname').value=doc.name;localStorage.setItem('sketchpad-current',id);syncPage();startView();saveState='Gespeichert';status()}
function size(){let r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
const dims=()=>[canvas.clientWidth,canvas.clientHeight],world=(x,y)=>({x:(x-view.x)/view.z,y:(y-view.y)/view.z}),screen=p=>({x:p.x*view.z+view.x,y:p.y*view.z+view.y});
function bounds(p=page()){if(p.paper==='infinite')return null;let[w,h]=SIZES[p.paper];return{w:w*MM,h:h*MM}}
function startView(){let [w,h]=dims(),b=bounds();view.z=1;view.x=b?(w-b.w)/2:w/2;view.y=b?(h-b.h)/2:h/2;draw()}
function fit(){let[w,h]=dims(),b=bounds();if(b){view.z=Math.min((w-50)/b.w,(h-50)/b.h,1.8);view.x=(w-b.w*view.z)/2;view.y=(h-b.h*view.z)/2}else view={x:w/2,y:h/2,z:1};draw()}
function path(item){let p=item.points||[];if(['pen','eraser'].includes(item.type)){if(!p.length)return;ctx.moveTo(p[0].x,p[0].y);if(p.length===1){ctx.lineTo(p[0].x+.01,p[0].y+.01)}else if(p.length===2)ctx.lineTo(p[1].x,p[1].y);else{for(let i=1;i<p.length-1;i++){let m={x:(p[i].x+p[i+1].x)/2,y:(p[i].y+p[i+1].y)/2};ctx.quadraticCurveTo(p[i].x,p[i].y,m.x,m.y)}ctx.lineTo(p.at(-1).x,p.at(-1).y)}}else if(['line','wall','window','door','measure'].includes(item.type)){ctx.moveTo(item.x1,item.y1);ctx.lineTo(item.x2,item.y2)}else if(item.type==='rect')ctx.rect(item.x1,item.y1,item.x2-item.x1,item.y2-item.y1);else if(item.type==='ellipse'){let x=(item.x1+item.x2)/2,y=(item.y1+item.y2)/2;ctx.ellipse(x,y,Math.max(.1,Math.abs(item.x2-item.x1)/2),Math.max(.1,Math.abs(item.y2-item.y1)/2),0,0,Math.PI*2)}}
function drawItem(item){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=item.color||color;ctx.lineWidth=item.width||3;
if(item.type==='image'){let img=imageCache.get(item.src);if(!img){img=new Image();img.onload=draw;img.src=item.src;imageCache.set(item.src,img)}if(img.complete&&img.naturalWidth){ctx.translate(item.x,item.y);ctx.rotate(item.angle||0);ctx.drawImage(img,0,0,item.w,item.h);if(item.id===selectedPhoto){ctx.strokeStyle='#19a2b5';ctx.lineWidth=2/view.z;ctx.strokeRect(0,0,item.w,item.h)}}ctx.restore();return}
if(item.type==='text'){
 const font=item.font||21,lines=textLines(item),step=font*1.25;
 ctx.translate(item.x,item.y);ctx.rotate((item.angle||0)*Math.PI/180);
 ctx.fillStyle=item.color||color;ctx.font=`${font}px sans-serif`;ctx.textBaseline='alphabetic';
 lines.forEach((line,i)=>{if(i*step<=((item.boxH||Infinity)-font*.2))ctx.fillText(line,0,i*step)});ctx.restore();return}

if(item.type==='measure'){let dx=item.x2-item.x1,dy=item.y2-item.y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,ux=dx/L,uy=dy/L,off=Number(item.offset??0),ms=item.measureScale??1,ext=1.75*ms;ctx.strokeStyle=RED;ctx.lineWidth=.48*ms;ctx.beginPath();for(let pt of [{x:item.x1,y:item.y1},{x:item.x2,y:item.y2}]){ctx.moveTo(pt.x-nx*1.5*ms,pt.y-ny*1.5*ms);ctx.lineTo(pt.x+nx*(off+Math.sign(off||1)*ext),pt.y+ny*(off+Math.sign(off||1)*ext))}let a={x:item.x1+nx*off,y:item.y1+ny*off},b={x:item.x2+nx*off,y:item.y2+ny*off};ctx.moveTo(a.x-ux*2*ms,a.y-uy*2*ms);ctx.lineTo(b.x+ux*2*ms,b.y+uy*2*ms);for(let q of[a,b]){ctx.moveTo(q.x-ux*1.25*ms-nx*1.25*ms,q.y-uy*1.25*ms-ny*1.25*ms);ctx.lineTo(q.x+ux*1.25*ms+nx*1.25*ms,q.y+uy*1.25*ms+ny*1.25*ms)}ctx.stroke();let mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};ctx.translate(mid.x,mid.y);let angle=Math.atan2(dy,dx);if(angle>Math.PI/2||angle< -Math.PI/2)angle+=Math.PI;ctx.rotate(angle);ctx.font=`${12*ms}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';let t=item.label||'';if(t==='—'||t==='…')t='';if(t){let tw=ctx.measureText(t).width;ctx.fillStyle=RED;ctx.fillText(t,0,-.6*ms)}else{ctx.strokeStyle='#f2b8bf';ctx.lineWidth=.45*ms;ctx.beginPath();ctx.moveTo(-3*ms,-6*ms);ctx.lineTo(3*ms,-6*ms);ctx.stroke()} ctx.restore();return}
if(item.type==='wall'){
 const a={x:item.x1,y:item.y1},b={x:item.x2,y:item.y2};
 const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,offset=item.wallOffset??-20;
 const walls=page().items.filter(i=>i.type==='wall'&&i!==item);
 const neighbors=(pt)=>walls.filter(w=>Math.hypot(w.x1-pt.x,w.y1-pt.y)<1.6||Math.hypot(w.x2-pt.x,w.y2-pt.y)<1.6);
 const at=(t,side)=>({x:a.x+ux*t+nx*side,y:a.y+uy*t+ny*side});
 const outerJoin=(pt,own)=>{
  for(const w of neighbors(pt)){
   const vx=w.x2-w.x1,vy=w.y2-w.y1,vl=Math.hypot(vx,vy)||1,ox=vx/vl,oy=vy/vl,d=w.wallOffset??-20;
   const q={x:pt.x-oy*d,y:pt.y+ox*d},cross=ux*oy-uy*ox;
   if(Math.abs(cross)<1e-5)continue;
   const t=((q.x-own.x)*oy-(q.y-own.y)*ox)/cross;
   const hit={x:own.x+t*ux,y:own.y+t*uy};
   // At sharp turns the mathematical intersection may be far away: use a bevel.
   if(Math.hypot(hit.x-pt.x)<Math.max(6,Math.abs(offset)*4))return {point:hit,kind:'miter'};
   return {point:q,kind:'bevel',other:own};
  }
  return null;
 };
 const j0=outerJoin(a,at(0,offset)),j1=outerJoin(b,at(L,offset));
 const openings=page().items.filter(o=>(o.type==='window'||o.type==='door')&&o.wallId===item.id);
 ctx.strokeStyle=BLUE;ctx.lineWidth=.48;ctx.lineCap='butt';ctx.lineJoin='miter';
 for(const side of [0,offset]){
  const cuts=openings.map(o=>{let t1=(o.x1-a.x)*ux+(o.y1-a.y)*uy,t2=(o.x2-a.x)*ux+(o.y2-a.y)*uy;return[Math.max(0,Math.min(t1,t2)),Math.min(L,Math.max(t1,t2))]}).filter(q=>q[1]>q[0]).sort((x,y)=>x[0]-y[0]);
  const drawPart=(lo,hi)=>{if(hi-lo<.01)return;let p=at(lo,side),q=at(hi,side);
   if(side===offset&&lo<.01&&j0?.kind==='miter')p=j0.point;
   if(side===offset&&hi>L-.01&&j1?.kind==='miter')q=j1.point;
   ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)};
  ctx.beginPath();let cursor=0;for(const [lo,hi] of cuts){drawPart(cursor,lo);cursor=Math.max(cursor,hi)}drawPart(cursor,L);ctx.stroke();
 }
 ctx.beginPath();
 if(!neighbors(a).length){const q=at(0,offset);ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y)}
 else if(j0?.kind==='bevel'){ctx.moveTo(j0.other.x,j0.other.y);ctx.lineTo(j0.point.x,j0.point.y)}
 if(!neighbors(b).length){const q=at(L,offset);ctx.moveTo(b.x,b.y);ctx.lineTo(q.x,q.y)}
 else if(j1?.kind==='bevel'){ctx.moveTo(j1.other.x,j1.other.y);ctx.lineTo(j1.point.x,j1.point.y)}
 ctx.stroke();ctx.restore();return;
}
if(item.type==='window'||item.type==='door'){
 const axis=item.wallAxis||{dx:item.x2-item.x1,dy:item.y2-item.y1};
 const al=Math.hypot(axis.dx,axis.dy)||1,ux=axis.dx/al,uy=axis.dy/al,nx=-uy,ny=ux;
 const off=item.wallOffset??-20,side=item.wallSide??0;
 const inside=side===0?(Math.sign(off)||-1):-(Math.sign(off)||-1);
 const signed=(item.x2-item.x1)*ux+(item.y2-item.y1)*uy;
 const dir=Math.sign(signed)||1,length=Math.abs(signed),thickness=Math.abs(off);
 // Local x follows the drag. Local y points from the selected wall face into the wall.
 const pt=(x,y)=>({x:item.x1+ux*dir*x+nx*inside*y,y:item.y1+uy*dir*x+ny*inside*y});
 const seg=(x1,y1,x2,y2)=>{const a=pt(x1,y1),b=pt(x2,y2);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)};
 ctx.strokeStyle=GREEN;ctx.lineWidth=.48;ctx.lineCap='butt';ctx.lineJoin='miter';ctx.beginPath();
 if(item.type==='window'){
  // Actual DXF line geometry, transformed from 1100 x 200 to sketched width / wall thickness.
  const lines=DXF_WINDOW_LINES;
  for(const [x1,y1,x2,y2] of lines)seg(x1*length,y1*thickness,x2*length,y2*thickness);
  // Opposite wall face must not remain open. A fine green frame closes the opening.
  seg(0,thickness,length,thickness);
  seg(0,0,length,0);
 }else{
  // Door reveal taken from DXF, mirrored by the drag direction and chosen wall face.
  for(const [x1,y1,x2,y2] of DXF_DOOR_LINES)seg(x1*length,y1*thickness,x2*length,y2*thickness);
  // Door opening: continuous thin threshold on the opposite face.
  seg(0,thickness,length,thickness);
  // Door leaf and quarter-circle swing: hinge at the initial pen contact.
  const hinge=pt(0,-thickness*.17),tip=pt(0,-length-thickness*.17);
  ctx.moveTo(hinge.x,hinge.y);ctx.lineTo(tip.x,tip.y);
  for(let i=0;i<=48;i++){const angle=i*Math.PI/(2*48),q=pt(length*Math.cos(angle),-thickness*.17-length*Math.sin(angle));if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y)}
 }
 ctx.stroke();ctx.restore();return;
}
if(item.type==='eraser'){ctx.strokeStyle='#fff';ctx.lineWidth=item.width||28}ctx.beginPath();path(item);ctx.stroke();ctx.restore()}
function drawChecklist(p){let lines=[(p.category||'Küche').toUpperCase()+' – KUNDENWÜNSCHE','Fronten – Farbe / Dekor','Korpus – Farbe / Dekor','Kombinationsfarbe / Dekor','Laden / Innenausstattung','Arbeitsplatte – Material / Dekor','Griffe / grifflos / Griffmulden','Spüle','Armatur','Abfallsammler','ELEKTROGERÄTE','☐ Backrohr       ☐ Kochfeld / Induktion','☐ Geschirrspüler   ☐ Kühlschrank','☐ Gefrierschrank   ☐ Mikrowelle','☐ Dampfgarer       ☐ Dunstabzug','Sonstige Wünsche / Notizen'];if(p.category&&p.category!=='Küche')lines=[p.category.toUpperCase()+' – KUNDENWÜNSCHE','Farbe / Dekor','Material','Ausführung','Beschläge','Griffe','Beleuchtung','Besondere Wünsche','Maße / Hinweise','Weitere Notizen'];ctx.save();ctx.fillStyle='#24334b';ctx.strokeStyle='#c7d2df';let w=bounds(p)?.w||794;lines.forEach((s,i)=>{let y=42+i*52;ctx.font=(i===0||i===10)?'bold 18px sans-serif':'15px sans-serif';ctx.fillText(s,35,y);if(i!==0&&i!==10){ctx.beginPath();ctx.moveTo(35,y+29);ctx.lineTo(w-35,y+29);ctx.stroke()}});ctx.restore()}
function drawWallJoins(p){
 // One pass for each pair of walls sharing a guide-line vertex. The far face
 // meets at a true line intersection (miter), or a bevel at extreme angles.
 const walls=p.items.filter(i=>i.type==='wall');
 const epsilon=1.6;
 ctx.save();ctx.strokeStyle=BLUE;ctx.lineWidth=.56;ctx.lineCap='round';ctx.lineJoin='round';
 const face=(w,end)=>{let dx=w.x2-w.x1,dy=w.y2-w.y1,L=Math.hypot(dx,dy)||1,d=w.wallOffset??-20;return{x:(end?w.x2:w.x1)-dy/L*d,y:(end?w.y2:w.y1)+dx/L*d}};
 const close=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<epsilon;
 for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){
  const a=walls[i],b=walls[j];
  const endsA=[{x:a.x1,y:a.y1},{x:a.x2,y:a.y2}],endsB=[{x:b.x1,y:b.y1},{x:b.x2,y:b.y2}];
  for(let ea=0;ea<2;ea++)for(let eb=0;eb<2;eb++){
   if(!close(endsA[ea],endsB[eb]))continue;
   const p1=face(a,ea),p2=face(b,eb),ax=a.x2-a.x1,ay=a.y2-a.y1,bx=b.x2-b.x1,by=b.y2-b.y1;
   const det=ax*by-ay*bx;let meet=null;
   if(Math.abs(det)>1e-5){let t=((p2.x-p1.x)*by-(p2.y-p1.y)*bx)/det;meet={x:p1.x+t*ax,y:p1.y+t*ay}}
   const limit=4*Math.max(Math.abs(a.wallOffset??-20),Math.abs(b.wallOffset??-20));
   ctx.beginPath();ctx.moveTo(p1.x,p1.y);
   if(meet&&Math.hypot(meet.x-p1.x,meet.y-p1.y)<limit&&Math.hypot(meet.x-p2.x,meet.y-p2.y)<limit)ctx.lineTo(meet.x,meet.y);
   ctx.lineTo(p2.x,p2.y);ctx.stroke();
  }
 }
 ctx.restore();
}
function renderPage(p){let b=bounds(p);ctx.fillStyle='#fff';if(b){ctx.shadowColor='#0003';ctx.shadowBlur=14/view.z;ctx.fillRect(0,0,b.w,b.h);ctx.shadowBlur=0;ctx.beginPath();ctx.rect(0,0,b.w,b.h);ctx.clip()}else{let[w,h]=dims(),a=world(0,0),z=world(w,h);ctx.fillRect(a.x,a.y,z.x-a.x,z.y-a.y)}if(p.grid){let step=20*MM,[w,h]=dims(),a=world(0,0),z=world(w,h),left=b?0:a.x,top=b?0:a.y,right=b?b.w:z.x,bottom=b?b.h:z.y;ctx.strokeStyle='#e5ebf0';ctx.lineWidth=.7/view.z;ctx.beginPath();let count=0;for(let x=Math.ceil(left/step)*step;x<right&&count++<300;x+=step){ctx.moveTo(x,top);ctx.lineTo(x,bottom)}count=0;for(let y=Math.ceil(top/step)*step;y<bottom&&count++<300;y+=step){ctx.moveTo(left,y);ctx.lineTo(right,y)}ctx.stroke()}if(p.kind==='checklist')drawChecklist(p);for(let item of p.items)drawItem(item);if(active)drawItem(active);if(measureDraft)drawItem(measureDraft)}
function draw(){if(!canvas.width)return;let[w,h]=dims();ctx.clearRect(0,0,w,h);ctx.fillStyle='#dfe5eb';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.z,view.z);renderPage(page());ctx.restore();drawTextSelection();if(selectedMeasure&&tool==='measure'){
 const m=page().items.find(i=>i===selectedMeasure);if(m){const dx=m.x2-m.x1,dy=m.y2-m.y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,off=Number(m.offset||0);const pts=[{x:m.x1,y:m.y1},{x:m.x2,y:m.y2},{x:(m.x1+m.x2)/2+nx*off,y:(m.y1+m.y2)/2+ny*off}];for(const q of pts){const t=screen(q);ctx.beginPath();ctx.arc(t.x,t.y,6,0,Math.PI*2);ctx.fillStyle='#f7f7ff';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#cf298b';ctx.stroke()}}}
 if(eraserCursor){ctx.beginPath();ctx.arc(eraserCursor.x-(eraserCursor.touch?60:0),eraserCursor.y,eraserSize*view.z/2,0,Math.PI*2);ctx.strokeStyle='#e34040';ctx.lineWidth=1.5;ctx.stroke()}status()}
function eventPoint(e){let r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function zoomAt(f,x,y){let a=world(x,y);view.z=Math.max(.15,Math.min(20,view.z*f));view.x=x-a.x*view.z;view.y=y-a.y*view.z;draw()}
function setTool(t){selectedText=null;selectedMeasure=null;measureEdit=null;if(t!=='wall')finishWall();measureDraft=null;measureStage=0;resetInput();tool=t;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));$('shapesbutton').classList.toggle('active',['line','rect','ellipse','square','circle','freeform'].includes(t));draw()}
function photoAt(p){return[...page().items].reverse().find(i=>i.type==='image'&&!i.locked&&p.x>=i.x&&p.y>=i.y&&p.x<=i.x+i.w&&p.y<=i.y+i.h)}
function snap(a,b){let dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)<Math.abs(dy)*.2)b.x=a.x;else if(Math.abs(dy)<Math.abs(dx)*.2)b.y=a.y;return b}
function resetInput(){pointers.clear();gesture=null;active=null;eraserCursor=null}
function finishWall(){wallEnd=null;if($('finishwall'))$('finishwall').hidden=true}
function nearestWall(a){let best=null,dist=24/view.z;for(let i of page().items){if(i.type!=='wall')continue;let dx=i.x2-i.x1,dy=i.y2-i.y1,len=dx*dx+dy*dy||1,L=Math.sqrt(len),nx=-dy/L,ny=dx/L;for(let side of [0,i.wallOffset??20]){let x=i.x1+nx*side,y=i.y1+ny*side,t=Math.max(0,Math.min(1,((a.x-x)*dx+(a.y-y)*dy)/len)),q={x:x+t*dx,y:y+t*dy},d=Math.hypot(a.x-q.x,a.y-q.y);if(d<dist){best={wall:i,point:q,side};dist=d}}}return best}
function numberDialog(item,editing=false){
 const dlg=$('numberdialog'),inp=$('numberinput');
 $('numbertitle').textContent=editing?'Maß ändern':'Maß eingeben';
 inp.value=item.label||'';dlg.showModal();
 // Keine automatische Fokussierung: die eigene Zahlentastatur bleibt sichtbar,
 // die Android-Systemtastatur wird nicht zusätzlich geöffnet.
 let finished=false;
 const done=ok=>{if(finished)return;finished=true;dlg.close();if(ok){item.label=inp.value.trim();if(!editing){page().items.push(item);redo=[]}changed()}measureDraft=null;measureStage=0;resetInput();draw()};
 $('numberok').onclick=()=>done(true);$('numbercancel').onclick=()=>done(false);
 inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();done(true)}};
 dlg.oncancel=e=>{e.preventDefault();done(false)};
}
function textDialog(item,editing=false){
 const dlg=$('textdialog'),inp=$('textinput'),font=$('textfont'),angle=$('textangle');
 textDialogColor=item.color||textDefaultColor;renderTextColors();
 inp.value=item.label||'';font.value=String(item.font||textDefaultFont);angle.value=String(item.angle||0);updateTextPreview();
 $('texttitle').textContent=editing?'Text ändern':'Text eingeben';dlg.showModal();
 let finished=false;
 const done=ok=>{if(finished)return;finished=true;dlg.close();if(ok){
 item.label=inp.value;item.font=Math.max(6,Math.min(200,Number(font.value)||21));
 item.angle=Number(angle.value)||0;item.color=textDialogColor;
 textDefaultFont=item.font;textDefaultColor=item.color;localStorage.setItem('sketchpad-text-font',String(textDefaultFont));localStorage.setItem('sketchpad-text-color',textDefaultColor);
 if(!editing){page().items.push(item);redo=[]}selectedText=item;changed()}resetInput();draw()};
 $('textok').onclick=()=>done(true);$('textcancel').onclick=()=>done(false);
 // Enter erzeugt einen Zeilenumbruch; Speichern nur mit „Fertig“.
 inp.onkeydown=null;
 dlg.oncancel=e=>{e.preventDefault();done(false)};
 setTimeout(()=>inp.focus(),80);
}
function textLines(item){
 const font=item.font||21, raw=String(item.label||'').split('\n');
 if(!item.boxW)return raw;
 ctx.save();ctx.font=`${font}px sans-serif`;
 const result=[];
 for(const line of raw){
  if(!line){result.push('');continue}
  let current='';
  for(const word of line.split(/(\s+)/)){
   if(current&&ctx.measureText(current+word).width>item.boxW){result.push(current.trimEnd());current=word.trimStart()}
   else current+=word;
   while(current.length>1&&ctx.measureText(current).width>item.boxW){
    let n=current.length-1;while(n>1&&ctx.measureText(current.slice(0,n)).width>item.boxW)n--;
    result.push(current.slice(0,n));current=current.slice(n);
   }
  }
  result.push(current);
 }
 ctx.restore();return result;
}
function textGeometry(item){
 const font=item.font||21,lines=textLines(item);
 ctx.save();ctx.font=`${font}px sans-serif`;
 const naturalW=Math.max(font*.8,...lines.map(line=>ctx.measureText(line).width));ctx.restore();
 const w=Math.max(font*.8,item.boxW||naturalW),top=-font;
 const naturalH=Math.max(font*1.25,lines.length*font*1.25);
 const h=Math.max(font*.8,item.boxH||naturalH),bottom=top+h;
 const angle=(item.angle||0)*Math.PI/180;
 const point=(x,y)=>({x:item.x+x*Math.cos(angle)-y*Math.sin(angle),y:item.y+x*Math.sin(angle)+y*Math.cos(angle)});
 return{w,h,top,bottom,point};
}
function textHandles(item){
 const g=textGeometry(item),mx=g.w/2,my=(g.top+g.bottom)/2;
 const positions={nw:[0,g.top],n:[mx,g.top],ne:[g.w,g.top],e:[g.w,my],se:[g.w,g.bottom],s:[mx,g.bottom],sw:[0,g.bottom],w:[0,my]};
 const points=Object.fromEntries(Object.entries(positions).map(([k,v])=>[k,g.point(...v)]));
 return{points,center:g.point(mx,my),rotate:g.point(mx,g.top-38/view.z),corners:['nw','ne','se','sw'].map(k=>points[k])};
}
function textHandleAt(p){if(!selectedText)return null;const h=textHandles(selectedText),radius=13/view.z;
 for(const k of ['rotate','edit',...Object.keys(h.points)]){const q=k==='edit'?h.center:k==='rotate'?h.rotate:h.points[k];if(Math.hypot(q.x-p.x,q.y-p.y)<radius)return k}return null;
}
function drawTextSelection(){if(!selectedText||tool!=='text')return;const h=textHandles(selectedText);ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.z,view.z);ctx.strokeStyle='#cc238d';ctx.lineWidth=1.5/view.z;ctx.setLineDash([5/view.z,4/view.z]);ctx.beginPath();h.corners.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.stroke();ctx.setLineDash([]);
 ctx.beginPath();ctx.moveTo(h.points.n.x,h.points.n.y);ctx.lineTo(h.rotate.x,h.rotate.y);ctx.stroke();
 for(const [k,q] of Object.entries(h.points)){ctx.beginPath();ctx.arc(q.x,q.y,6/view.z,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.stroke()}
 for(const [k,q] of [['rotate',h.rotate],['edit',h.center]]){ctx.beginPath();ctx.arc(q.x,q.y,11/view.z,0,Math.PI*2);ctx.fillStyle=k==='edit'?'rgba(255,255,255,.83)':'#fff';ctx.fill();ctx.stroke();ctx.fillStyle='#cc238d';ctx.font=`${13/view.z}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(k==='rotate'?'↻':'✎',q.x,q.y)}ctx.restore();
}
function textAt(a){
 for(const item of [...page().items].reverse()){
  if(item.type!=='text')continue;
  const g=textGeometry(item),angle=-(item.angle||0)*Math.PI/180,dx=a.x-item.x,dy=a.y-item.y;
  const x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle),pad=10/view.z;
  if(x>=-pad&&x<=g.w+pad&&y>=g.top-pad&&y<=g.bottom+pad)return item;
 }
 return null;
}
function measureLabelAt(a){
 for(const m of [...page().items].reverse()){
  if(m.type!=='measure')continue;
  const dx=m.x2-m.x1,dy=m.y2-m.y1,L=Math.hypot(dx,dy)||1;
  const nx=-dy/L,ny=dx/L,off=Number(m.offset||0),ms=m.measureScale??1;
  const center={x:(m.x1+m.x2)/2+nx*(off-7*ms),y:(m.y1+m.y2)/2+ny*(off-7*ms)};
  const along=Math.abs((a.x-center.x)*dx/L+(a.y-center.y)*dy/L);
  const across=Math.abs((a.x-center.x)*nx+(a.y-center.y)*ny);
  const width=Math.max(12/view.z,(m.label||'').length*7*ms);
  if(along<width/2+4/view.z&&across<Math.max(6/view.z,8*ms))return m;
 }
 return null;
}

function down(e){if($('numberdialog').open||$('textdialog').open)return;if(e.pointerType==='mouse'&&e.button===1){e.preventDefault();let p=eventPoint(e);pointers.set(e.pointerId,{...p,type:'mouse'});gesture={pan:true,p,start:{...view}};return}e.preventDefault();try{canvas.setPointerCapture(e.pointerId)}catch{}let p=eventPoint(e);pointers.set(e.pointerId,{...p,type:e.pointerType});if(e.pointerType==='pen')stylusSeen=true;if(pointers.size===2){active=null;let ps=[...pointers.values()];gesture={distance:Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),z:view.z,center:{x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2}};gesture.anchor=world(gesture.center.x,gesture.center.y);draw();return}if(pointers.size>2)return;if(tool==='pan'){gesture={pan:true,p,start:{...view}};return}let a=world(p.x,p.y);if(tool==='photo'){let hit=photoAt(a);if(hit){selectedPhoto=hit.id;gesture={photo:hit,start:{x:hit.x,y:hit.y},p:a};draw()}return}let t=(e.pointerType==='touch'&&stylusSeen&&$('stylus').checked)?'eraser':tool;
if(t==='text'){
 const handle=textHandleAt(a);
 if(handle){const item=selectedText;if(handle==='edit'){resetInput();textDialog(item,true);return}const h=textHandles(item),g=textGeometry(item),center=h.center;
  textMove={item,mode:handle,point:a,startFont:item.font||21,startAngle:item.angle||0,origin:{x:item.x,y:item.y},center,startW:g.w,startH:g.h,initialPointerAngle:Math.atan2(a.y-center.y,a.x-center.x),startDistance:Math.hypot(a.x-center.x,a.y-center.y),moved:false};return}
 const hit=textAt(a);
 if(hit){selectedText=hit;textMove={item:hit,mode:'move',origin:{x:hit.x,y:hit.y},point:a,moved:false};draw();return}
 selectedText=null;lastTextTap=null;resetInput();textDialog({type:'text',x:a.x,y:a.y,label:'',color:textDefaultColor,font:textDefaultFont,angle:0});draw();return}


if(t==='measure'&&!measureDraft){
 const labelHit=measureLabelAt(a);if(labelHit){resetInput();numberDialog(labelHit,true);return}
 const radius=8/view.z;
 for(const m of [...page().items].reverse().filter(i=>i.type==='measure')){
  const dx=m.x2-m.x1,dy=m.y2-m.y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,off=Number(m.offset||0);
  const handles=[{x:m.x1,y:m.y1,part:'start'},{x:m.x2,y:m.y2,part:'end'},{x:(m.x1+m.x2)/2+nx*off,y:(m.y1+m.y2)/2+ny*off,part:'offset'}];
  const hit=handles.find(q=>Math.hypot(q.x-a.x,q.y-a.y)<radius);
  if(hit){selectedMeasure=m;measureEdit={item:m,part:hit.part};draw();return}
  const along=((a.x-m.x1)*dx+(a.y-m.y1)*dy)/L;
  const distance=Math.abs((a.x-m.x1)*nx+(a.y-m.y1)*ny-off);
  if(along>=0&&along<=L&&distance<5/view.z){selectedMeasure=m;measureEdit={item:m,part:'offset'};draw();return}
 }
 selectedMeasure=null;
}
if(t==='measure'){if(!measureDraft){measureDraft={type:'measure',x1:a.x,y1:a.y,x2:a.x,y2:a.y,offset:0,label:'',measureScale:Math.min(1,1.83/view.z)};measureStage=1}else if(measureStage===2){measureStage=3}draw();return}
if(t==='window'||t==='door'){let hit=nearestWall(a);if(!hit){saveState='Wand antippen';status();return}a=hit.point;let w=hit.wall;active={type:t,x1:a.x,y1:a.y,x2:a.x,y2:a.y,wallId:w.id||null,wallAxis:{dx:w.x2-w.x1,dy:w.y2-w.y1},wallSide:hit.side,wallOffset:w.wallOffset??20,color:GREEN,width:1};draw();return}
if(t==='wall'&&wallEnd)a={...wallEnd};active={type:t==='square'?'rect':t==='circle'?'ellipse':t==='freeform'?'pen':t,id:uid(),...(t==='square'||t==='circle'?{squareShape:true}:{}),...(t==='wall'?{wallOffset:-30}:{}),color:page().kind==='checklist'&&t==='pen'?GREEN:t==='wall'?BLUE:t==='measure'?RED:color,width:t==='eraser'?eraserSize:width,...(['pen','eraser','freeform'].includes(t)?{points:[a]}:{x1:a.x,y1:a.y,x2:a.x,y2:a.y})};if(t==='eraser'){eraserCursor={...p,touch:e.pointerType==='touch'};if(e.pointerType==='touch')active.points[0].x-=60/view.z}draw()}
function move(e){if(!pointers.has(e.pointerId))return;e.preventDefault();let p=eventPoint(e);pointers.set(e.pointerId,{...p,type:e.pointerType});if(pointers.size===2&&gesture&&!gesture.pan&&!gesture.photo){let ps=[...pointers.values()],dist=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),center={x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2};view.z=Math.max(.15,Math.min(20,gesture.z*dist/Math.max(1,gesture.distance)));view.x=center.x-gesture.anchor.x*view.z;view.y=center.y-gesture.anchor.y*view.z;draw();return}if(gesture?.pan){view.x=gesture.start.x+p.x-gesture.p.x;view.y=gesture.start.y+p.y-gesture.p.y;draw();return}if(gesture?.photo){let a=world(p.x,p.y);gesture.photo.x=gesture.start.x+a.x-gesture.p.x;gesture.photo.y=gesture.start.y+a.y-gesture.p.y;draw();return}if(textMove){let a=world(p.x,p.y),m=textMove,dX=a.x-m.point.x,dY=a.y-m.point.y;
 if(Math.hypot(dX,dY)>3/view.z)m.moved=true;
 if(m.mode==='move'&&m.moved){m.item.x=m.origin.x+dX;m.item.y=m.origin.y+dY}
 else if(['nw','n','ne','e','se','s','sw','w'].includes(m.mode)){
  // Verschiebung im lokalen (mitgedrehten) Koordinatensystem des Textfelds.
  const r=m.startAngle*Math.PI/180,localX=dX*Math.cos(r)+dY*Math.sin(r),localY=-dX*Math.sin(r)+dY*Math.cos(r);
  const left=m.mode.includes('w'),right=m.mode.includes('e'),top=m.mode.includes('n'),bottom=m.mode.includes('s');
  const corner=(left||right)&&(top||bottom);
  if(corner){
   const sx=(m.startW+(right?localX:-localX))/m.startW;
   const sy=(m.startH+(bottom?localY:-localY))/m.startH;
   const factor=Math.max(.15,Math.min(8,Math.min(sx,sy)));
   m.item.font=Math.max(6,Math.min(200,Math.round(m.startFont*factor)));
   m.item.boxW=Math.max(10,m.startW*factor);m.item.boxH=Math.max(10,m.startH*factor);
   if(left||top){const shiftX=left?m.startW*(1-factor):0,shiftY=top?m.startH*(1-factor):0;
    m.item.x=m.origin.x+shiftX*Math.cos(r)-shiftY*Math.sin(r);
    m.item.y=m.origin.y+shiftX*Math.sin(r)+shiftY*Math.cos(r);
   }
  }else{
   if(left||right)m.item.boxW=Math.max(12,m.startW+(right?localX:-localX));
   if(top||bottom)m.item.boxH=Math.max(12,m.startH+(bottom?localY:-localY));
   if(left||top){const shiftX=left?m.startW-m.item.boxW:0,shiftY=top?m.startH-m.item.boxH:0;
    m.item.x=m.origin.x+shiftX*Math.cos(r)-shiftY*Math.sin(r);
    m.item.y=m.origin.y+shiftX*Math.sin(r)+shiftY*Math.cos(r);
   }
  }
 }
 else if(m.mode==='rotate'){
  const angle=Math.atan2(a.y-m.center.y,a.x-m.center.x);
  let delta=angle-m.initialPointerAngle;
  while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
  m.item.angle=m.startAngle+delta*180/Math.PI;
  const g=textGeometry(m.item),cx=g.w/2,cy=(g.top+g.bottom)/2;
  const rad=m.item.angle*Math.PI/180;
  m.item.x=m.center.x-cx*Math.cos(rad)+cy*Math.sin(rad);
  m.item.y=m.center.y-cx*Math.sin(rad)-cy*Math.cos(rad);
 }
 draw();return}

 if(tool==='measure'&&measureEdit){let a=world(p.x,p.y),m=measureEdit.item;
 if(measureEdit.part==='start'){m.x1=a.x;m.y1=a.y}
 else if(measureEdit.part==='end'){m.x2=a.x;m.y2=a.y}
 else {let dx=m.x2-m.x1,dy=m.y2-m.y1,L=Math.hypot(dx,dy)||1;m.offset=((a.x-m.x1)*(-dy)+(a.y-m.y1)*dx)/L}
 draw();return}
if(tool==='measure'&&measureDraft&&(measureStage===1||measureStage===3)){let a=world(p.x,p.y);if(measureStage===1){measureDraft.x2=a.x;measureDraft.y2=a.y}else{let dx=measureDraft.x2-measureDraft.x1,dy=measureDraft.y2-measureDraft.y1,L=Math.hypot(dx,dy)||1;measureDraft.offset=((a.x-measureDraft.x1)*(-dy)+(a.y-measureDraft.y1)*dx)/L}draw();return}if(!active)return;let events=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[e];for(let ev of events){let ep=eventPoint(ev),a=world(ep.x,ep.y);if(active.points){if(active.type==='eraser'&&e.pointerType==='touch')a.x-=60/view.z;let last=active.points.at(-1);if(Math.hypot(last.x-a.x,last.y-a.y)>.45)active.points.push(a)}else{if(active.type==='wall')a=snap({x:active.x1,y:active.y1},a);if(['window','door'].includes(active.type)){let axis=active.wallAxis,len=Math.hypot(axis.dx,axis.dy)||1,ux=axis.dx/len,uy=axis.dy/len,d=(a.x-active.x1)*ux+(a.y-active.y1)*uy;active.x2=active.x1+ux*d;active.y2=active.y1+uy*d;active.swing=Math.sign(d)||1;active.swingSide=active.wallSide===0?1:-1}else{if(active.squareShape){let dx=a.x-active.x1,dy=a.y-active.y1,len=Math.max(Math.abs(dx),Math.abs(dy));active.x2=active.x1+Math.sign(dx||1)*len;active.y2=active.y1+Math.sign(dy||1)*len}else{active.x2=a.x;active.y2=a.y}}}}if(active.type==='eraser')eraserCursor={...p,touch:e.pointerType==='touch'};draw()}
function up(e){if(!pointers.has(e.pointerId))return;e.preventDefault();pointers.delete(e.pointerId);if(textMove){let moving=textMove;textMove=null;
 if(moving.moved||moving.mode!=='move'){changed()}else{selectedText=moving.item}draw();return}
 if(gesture){if(gesture.photo)changed();if(pointers.size<2)gesture=null;draw();return}if(measureEdit){measureEdit=null;changed();draw();return}if(tool==='measure'&&measureDraft){if(measureStage===1){if(Math.hypot(measureDraft.x2-measureDraft.x1,measureDraft.y2-measureDraft.y1)>Math.max(.08,5/view.z))measureStage=2;else{measureDraft=null;measureStage=0}}else if(measureStage===3){numberDialog({...measureDraft});return}draw();return}if(active){if(active.points?.length||Math.hypot(active.x2-active.x1,active.y2-active.y1)>2){if(active.type==='wall'){wallEnd={x:active.x2,y:active.y2};$('finishwall').hidden=false}page().items.push(active);redo=[];changed()}active=null;eraserCursor=null;draw()}}
function cancel(e){pointers.delete(e.pointerId);active=null;gesture=null;textMove=null;eraserCursor=null;draw()}
function download(name,blob){let a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)}
const safeName=()=>doc.name.replace(/[^a-z0-9äöüß _-]/gi,'_');
function pageBounds(p){let b=bounds(p);if(b)return{x:0,y:0,w:b.w,h:b.h};let pts=p.items.flatMap(i=>i.points|| (i.type==='image'?[{x:i.x,y:i.y},{x:i.x+i.w,y:i.y+i.h}]:i.type==='text'?[{x:i.x,y:i.y}]:[{x:i.x1,y:i.y1},{x:i.x2,y:i.y2}]));if(!pts.length)pts=[{x:0,y:0},{x:800,y:1100}];let xs=pts.map(v=>v.x).filter(Number.isFinite),ys=pts.map(v=>v.y).filter(Number.isFinite);return{x:Math.min(...xs)-70,y:Math.min(...ys)-90,w:Math.max(400,Math.max(...xs)-Math.min(...xs)+140),h:Math.max(500,Math.max(...ys)-Math.min(...ys)+180)}}
function exportPage(p){let bb=pageBounds(p),out=document.createElement('canvas'),c=out.getContext('2d'),scale=Math.min(3,7000/Math.max(bb.w,bb.h));out.width=Math.max(1,Math.ceil(bb.w*scale));out.height=Math.max(1,Math.ceil(bb.h*scale));c.fillStyle='white';c.fillRect(0,0,out.width,out.height);c.setTransform(scale,0,0,scale,-bb.x*scale,-bb.y*scale);let old=ctx,oldActive=active;ctx=c;active=null;if(p.kind==='checklist')drawChecklist(p);for(let i of p.items)drawItem(i);ctx=old;active=oldActive;return out}
function printPdf(){
 const pages=doc.pages.map(p=>({p,bb:pageBounds(p),src:exportPage(p).toDataURL('image/png')}));
 const win=window.open('','_blank');if(!win){alert('Bitte Pop-ups für den PDF-Export erlauben.');return}
 const html=pages.map(({p,bb,src},i)=>{const checklist=p.kind==='checklist';const w=checklist?210:Math.min(1000,Math.max(297,Math.round(bb.w/MM)));const h=checklist?297:Math.min(1000,Math.max(210,Math.round(bb.h/MM)));return `<section class="${checklist?'check':'drawing'}" style="--pw:${w}mm;--ph:${h}mm"><img src="${src}" alt="Seite ${i+1}"></section>`}).join('');
 win.document.write(`<html><head><meta charset="utf-8"><title>${safeName()}</title><style>@page{size:auto;margin:0}html,body{margin:0;padding:0}section{break-after:page;page-break-after:always;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:var(--pw);height:var(--ph);padding:4mm}section.check{width:210mm;height:297mm}img{display:block;width:100%;height:100%;object-fit:contain}@media screen{body{background:#ddd}section{margin:15px auto;background:white;box-shadow:0 2px 12px #aaa}}</style></head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),800)<\/script></body></html>`);win.document.close()
}
function syncPage(){let p=page();$('paper').value=p.paper;$('grid').checked=p.grid;renderTabs()}
function renderTabs(){$('pagelist').replaceChildren();doc.pages.forEach((p,i)=>{let b=document.createElement('button');b.textContent=`${i+1}. ${p.name}`;b.className=i===pageIndex?'current':'';b.onclick=()=>{pageIndex=i;selectedPhoto=null;redo=[];syncPage();fit();changed()};b.ondblclick=()=>{let name=prompt('Seitenname:',p.name);if(name){p.name=name;renderTabs();changed()}};$('pagelist').append(b)})}
function addPage(kind='drawing',category='Küche'){let p=makePage(kind==='checklist'?category+'-Checkliste':`Seite ${doc.pages.length+1}`,kind==='checklist'?'a4p':page().paper,kind);if(kind==='checklist')p.category=category;doc.pages.push(p);pageIndex=doc.pages.length-1;selectedPhoto=null;redo=[];syncPage();fit();changed()}
function addImage(file){if(!file)return;let img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{let max=Number($('quality').value),scale=Math.min(1,max/Math.max(img.width,img.height)),out=document.createElement('canvas');out.width=Math.max(1,Math.round(img.width*scale));out.height=Math.max(1,Math.round(img.height*scale));out.getContext('2d').drawImage(img,0,0,out.width,out.height);let src=out.toDataURL('image/jpeg',.83),w=Math.min(650,out.width),h=w*out.height/out.width,a=world(canvas.clientWidth/2,canvas.clientHeight/2);let item={id:uid(),type:'image',src,x:a.x-w/2,y:a.y-h/2,w,h,angle:0,locked:false};page().items.push(item);selectedPhoto=item.id;setTool('photo');changed();draw();URL.revokeObjectURL(url)};img.onerror=()=>alert('Bild konnte nicht geladen werden.');img.src=url}
async function showProjects(){let arr=await getAll();arr.sort((a,b)=>a.name.localeCompare(b.name));$('projectlist').replaceChildren();for(let d of arr){let row=document.createElement('div');row.className='project';let open=document.createElement('button');open.textContent=d.name;open.onclick=()=>{load(d.id);$('projectdialog').close()};let del=document.createElement('button');del.textContent='Löschen';del.onclick=async()=>{if(!confirm(`„${d.name}“ löschen?`))return;let db=await dbPromise;await new Promise((ok,err)=>{let tx=db.transaction('docs','readwrite');tx.objectStore('docs').delete(d.id);tx.oncomplete=ok;tx.onerror=err});row.remove();if(d.id===doc.id)newDoc()};row.append(open,del);$('projectlist').append(row)}$('projectdialog').showModal()}
function newDoc(){doc={id:uid(),name:'Neue Skizze',pages:[makePage()]};pageIndex=0;redo=[];$('docname').value=doc.name;syncPage();fit();changed()}
canvas.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault()});canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('wheel',e=>{e.preventDefault();let p=eventPoint(e);zoomAt(e.deltaY<0?1.1:.9,p.x,p.y)},{passive:false});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));const fixedColors=['#202020','#d93636','#2454d9','#178647','#e6bd24','#f18728','#58b9f5','#8b4cc9','#8edb53','#ffffff'];
let customColor=localStorage.getItem('sketchpad-custom-color')||'#16a6a0';
textDefaultFont=Math.max(6,Math.min(200,Number(localStorage.getItem('sketchpad-text-font'))||21));textDefaultColor=localStorage.getItem('sketchpad-text-color')||color;
function updateTextPreview(){const preview=$('textpreviewvalue');if(!preview)return;const val=$('textinput').value.trim();preview.textContent=val||'Mustertext';preview.style.color=textDialogColor;preview.style.fontSize=Math.max(6,Math.min(48,Number($('textfont').value)||21))+'px'}
function renderTextColors(){const holder=$('textcolorswatches');holder.replaceChildren();[...fixedColors,customColor].forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.style.background=c;b.title=i===fixedColors.length?'Eigene Farbe':`Textfarbe ${i+1}`;b.setAttribute('aria-label',b.title);b.style.border=c.toLowerCase()===textDialogColor.toLowerCase()?'3px solid #3997ef':'1px solid #8b98a8';b.textContent=c.toLowerCase()===textDialogColor.toLowerCase()?'✓':'';b.style.color=c==='#ffffff'?'#111':'#fff';b.onclick=()=>{textDialogColor=c;renderTextColors();updateTextPreview()};holder.append(b)});$('textcustomcolor').value=customColor}
$('textfont').addEventListener('input',updateTextPreview);$('textinput').addEventListener('input',updateTextPreview);
$('textcustomcolor').addEventListener('input',e=>{textDialogColor=e.target.value;customColor=e.target.value;localStorage.setItem('sketchpad-custom-color',customColor);renderTextColors();updateTextPreview()});
const colorButton=$('colorbutton'), colorDialog=$('colordialog');
function chooseColor(c){color=c;colorButton.style.background=c;renderColors();colorDialog.close()}
function renderColors(){const holder=$('colorswatches');holder.replaceChildren();[...fixedColors,customColor].forEach((c,i)=>{let b=document.createElement('button');b.type='button';b.title=i===fixedColors.length?'Eigene Farbe':`Farbe ${i+1}`;b.style.background=c;b.style.border=color.toLowerCase()===c.toLowerCase()?'3px solid #3997ef':'1px solid #8b98a8';b.textContent=color.toLowerCase()===c.toLowerCase()?'✓':'';b.style.color=c==='#ffffff'?'#111':'white';b.onclick=()=>chooseColor(c);holder.append(b)})}
colorButton.onclick=()=>{renderColors();$('customcolor').value=customColor;colorDialog.showModal()};
$('savecustomcolor').onclick=()=>{customColor=$('customcolor').value;localStorage.setItem('sketchpad-custom-color',customColor);chooseColor(customColor)};
$('shapesbutton').onclick=()=>$('shapesdialog').showModal();
document.querySelectorAll('[data-shape]').forEach(b=>b.onclick=()=>{shapeChoice=b.dataset.shape;setTool(shapeChoice);$('shapesdialog').close();$('shapesbutton').title='Formen: '+b.textContent.trim()});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('erasersize').oninput=e=>{eraserSize=+e.target.value;$('eraserout').textContent=eraserSize};$('width').oninput=e=>{width=+e.target.value;$('widthout').textContent=width.toLocaleString('de-AT');$('widthpreset').value=[1,2,3,4,5].includes(width)?String(width):''};$('widthpreset').onchange=e=>{width=e.target.value?Number(e.target.value):0.5;$('width').value=String(width);$('widthout').textContent=width.toLocaleString('de-AT')};$('paper').onchange=e=>{page().paper=e.target.value;fit();changed()};$('grid').onchange=e=>{page().grid=e.target.checked;draw();changed()};$('docname').oninput=changed;
$('undo').onclick=()=>{if(page().items.length){redo.push(page().items.pop());draw();changed()}};$('redo').onclick=()=>{if(redo.length){page().items.push(redo.pop());draw();changed()}};$('fit').onclick=fit;$('menu').onclick=$('more').onclick=()=>$('options').showModal();$('close').onclick=()=>$('options').close();$('new').onclick=async()=>{if(confirm('Neues Projekt? Das bisherige bleibt gespeichert.')){await save();newDoc();$('options').close()}};$('save').onclick=()=>save();$('projects').onclick=()=>{$('options').close();showProjects()};$('closeprojects').onclick=()=>$('projectdialog').close();$('png').onclick=()=>exportPage(page()).toBlob(b=>download(safeName()+`_Seite${pageIndex+1}.png`,b));$('pdf').onclick=printPdf;$('json').onclick=async()=>{await save();download(safeName()+'.json',new Blob([JSON.stringify(doc)],{type:'application/json'}))};$('importbtn').onclick=()=>$('import').click();$('import').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let d=normalize(JSON.parse(await f.text()));if(!Array.isArray(d.pages)||d.pages.some(p=>!Array.isArray(p.items)||!['infinite',...Object.keys(SIZES)].includes(p.paper)))throw Error('Ungültiges Projekt');doc={...d,id:uid(),name:String(d.name||'Import').slice(0,120)};pageIndex=0;redo=[];$('docname').value=doc.name;syncPage();fit();await save();$('options').close()}catch(err){alert('Import fehlgeschlagen: '+err.message)}e.target.value=''};
$('addpage').onclick=()=>addPage();$('checktype').onchange=e=>{if(e.target.value){addPage('checklist',e.target.value);e.target.value=''}};$('addphoto').onclick=()=>$('photofile').click();$('photocamera').onchange=e=>{addImage(e.target.files[0]);e.target.value=''};$('finishwall').onclick=()=>finishWall();$('quickdelete').onclick=()=>$('deletepage').click();$('photofile').onchange=e=>{addImage(e.target.files[0]);e.target.value=''};$('photolock').ondblclick=()=>{let p=page().items.find(i=>i.id===selectedPhoto);if(!p)return;let factor=Number(prompt('Fotogröße in % (z. B. 120):',100));if(factor>5&&factor<1000){p.w*=factor/100;p.h*=factor/100;let deg=Number(prompt('Drehung in Grad (0, 90, 180, 270):',0));if(Number.isFinite(deg))p.angle=(p.angle||0)+deg*Math.PI/180;changed();draw()}};$('photolock').onclick=()=>{let p=page().items.find(i=>i.id===selectedPhoto);if(!p){alert('Foto zuerst mit dem Foto-Werkzeug antippen.');return}p.locked=!p.locked;$('photolock').textContent=p.locked?'🔓 Foto':'🔒 Foto';changed();draw()};$('deletepage').onclick=()=>{if(doc.pages.length===1){alert('Mindestens eine Seite muss bleiben.');return}if(confirm('Diese Seite wirklich löschen?')){doc.pages.splice(pageIndex,1);pageIndex=Math.max(0,pageIndex-1);syncPage();fit();changed();$('options').close()}};
for(let digit of ['1','2','3','4','5','6','7','8','9',',','0','⌫']){let b=document.createElement('button');b.textContent=digit;b.onclick=()=>{let el=$('numberinput');el.value=digit==='⌫'?el.value.slice(0,-1):el.value+(digit===','?',':digit)};$('numberpad').append(b)}window.addEventListener('blur',()=>{resetInput();draw()});window.addEventListener('resize',size);document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInput();if(dirty)save()}});window.addEventListener('pagehide',()=>{if(dirty)save()});setInterval(()=>{if(dirty)save()},120000);
(async()=>{size();let id=localStorage.getItem('sketchpad-current');if(id)await load(id);else{syncPage();startView();await save()}if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(console.error)})();
