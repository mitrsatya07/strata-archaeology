const origin = 'https://archaeolens-satya.lovable.app';
const modules = [
  { id:'scan', no:'01', label:'Observe an artefact', type:'OBSERVATION', path:'/', summary:'Photograph an artefact, sherd, coin, inscription, mineral or gem. Record visible evidence before interpretation.' },
  { id:'sites', no:'02', label:'Archaeological sites', type:'DIRECTORY', path:'/sites', summary:'42+ ASI and UNESCO sites across India, searchable by state, period and culture.' },
  { id:'timeline', no:'03', label:'Cultural timeline', type:'CHRONOLOGY', path:'/timeline', summary:'From the Lower Paleolithic to the present: periods, diagnostic material and key sites.' },
  { id:'museum', no:'04', label:'Virtual museum — 3D', type:'EXPERIENCE', path:'/museum', summary:'Walk a lit WebGL gallery of ten prehistoric artefacts and read each object record.' },
  { id:'typology', no:'05', label:'Pottery & scripts', type:'TYPOLOGY', path:'/typology', summary:'Diagnostic guide to ceramic wares, scripts and inscriptions—from OCP to glazed ware.' },
  { id:'stone-tools', no:'06', label:'Stone tools — 3D', type:'COLLECTION', path:'/stone-tools', summary:'A searchable, interactive catalogue of 69+ prehistoric tools across regions and materials.' },
  { id:'museums', no:'07', label:'Museum directory', type:'INDEX', path:'/museums', summary:'52 ASI site museums, state collections and international repositories of Indian archaeology.' },
  { id:'heritage-laws', no:'08', label:'Heritage law & reporting', type:'STATUTE', path:'/heritage-laws', summary:'AMASR, Antiquities Act and a responsible chance-find protocol for the field.' },
  { id:'field-notes', no:'09', label:'My field notes', type:'NOTEBOOK', path:'/field-notes', summary:'Create private observations with image, GPS and contextual field notes.' },
  { id:'references', no:'10', label:'References & citations', type:'BIBLIOGRAPHY', path:'/references', summary:'Authoritative books, excavation reports, statutes, databases and heritage resources.' },
  { id:'community', no:'11', label:'Peer review forum', type:'COMMUNITY', path:'/community', summary:'Ask careful identification questions, discuss practice and protect sensitive site data.' },
  { id:'about', no:'A1', label:'About & ethics', type:'ABOUT', path:'/about', summary:'How ArchaeoLens approaches evidence, uncertainty, ethics and education.' , tool:true},
  { id:'contact', no:'A2', label:'Contact the team', type:'CONTACT', path:'/contact', summary:'Send a private general query, feedback, bug report or collaboration request.', tool:true },
  { id:'auth', no:'A3', label:'Sign in / sync', type:'ACCOUNT', path:'/auth', summary:'Sign in to access the original ArchaeoLens cloud-synced field tools.', tool:true },
];
const nav = document.querySelector('#module-nav');
const frame = document.querySelector('#atlas-frame');
const loader = document.querySelector('#frame-loader');
const crumb = document.querySelector('#crumb');
const number = document.querySelector('#module-number');
const type = document.querySelector('#module-type');
const summary = document.querySelector('#module-summary');
const openSource = document.querySelector('#open-source');

function currentId(){ return new URLSearchParams(location.search).get('view') || 'scan'; }
function makeNavigation(){
  nav.innerHTML = modules.map(m=>`<a href="?view=${m.id}" class="module-link ${m.tool?'tool':''}" data-id="${m.id}"><span class="n">${m.no}</span><span class="name">${m.label}</span><span class="arrow">↗</span></a>`).join('');
  nav.addEventListener('click',event=>{
    const a=event.target.closest('.module-link'); if(!a) return;
    event.preventDefault(); history.pushState({},'',a.href); loadModule(a.dataset.id);
  });
}
function loadModule(id){
  const module = modules.find(m=>m.id===id) || modules[0];
  document.querySelectorAll('.module-link').forEach(x=>x.classList.toggle('active',x.dataset.id===module.id));
  number.textContent=module.no;type.textContent=module.type;summary.textContent=module.summary;crumb.textContent=`ARCHAEOLENS / ${module.label.toUpperCase()}`;
  openSource.href=origin+module.path;
  loader.classList.remove('done');
  frame.src=origin+module.path;
  document.title=`STRATA Field Atlas — ${module.label}`;
}
frame.addEventListener('load',()=>setTimeout(()=>loader.classList.add('done'),350));
window.addEventListener('popstate',()=>loadModule(currentId()));
makeNavigation(); loadModule(currentId());
