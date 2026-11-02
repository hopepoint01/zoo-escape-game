'use strict';
const HABS=[
 {id:'mountain',name:'산지와 언덕',emoji:'🐐',tone:'#d6e5d6',species:['산양','눈표범','아이벡스','큰뿔양','마멋'],icons:['🐐','🐆','🐐','🐏','🐿️']},
 {id:'grass',name:'평지와 초원',emoji:'🦒',tone:'#f2eac8',species:['기린','얼룩말','코끼리','사자','치타'],icons:['🦒','🦓','🐘','🦁','🐆']},
 {id:'forest',name:'숲',emoji:'🐅',tone:'#cfebdb',species:['호랑이','오랑우탄','레서판다','곰','사슴'],icons:['🐅','🦧','🦊','🐻','🦌']},
 {id:'wetland',name:'연못과 습지',emoji:'🦩',tone:'#d9edf0',species:['홍학','하마','악어','오리','수달'],icons:['🦩','🦛','🐊','🦆','🦦']},
 {id:'coast',name:'바위 해안',emoji:'🐧',tone:'#cfe9f6',species:['펭귄','바다사자','물범','퍼핀','바다코끼리'],icons:['🐧','🦭','🦭','🐧','🦭']},
 {id:'desert',name:'모래밭과 사막',emoji:'🐪',tone:'#f2dec1',species:['사막여우','미어캣','낙타','사막거북','사막왕도마뱀'],icons:['🦊','🦦','🐪','🐢','🦎']},
 {id:'river',name:'강',emoji:'🦫',tone:'#d1e9f1',species:['비버','카피바라','민물거북','메기','철갑상어'],icons:['🦫','🦫','🐢','🐟','🐟']},
 {id:'sea',name:'바다',emoji:'🐬',tone:'#cde0fa',species:['돌고래','상어','고래','가오리','문어'],icons:['🐬','🦈','🐳','🐟','🐙']},
 {id:'mudflat',name:'갯벌',emoji:'🦀',tone:'#e6dbcd',species:['짱뚱어','칠게','농게','갯지렁이','망둥어'],icons:['🐟','🦀','🦀','🪱','🐟']},
 {id:'sky',name:'하늘',emoji:'🦅',tone:'#ddebf7',species:['독수리','매','제비','부엉이','알바트로스'],icons:['🦅','🦅','🐦','🦉','🐦']}
];
// Dependencies are loaded on demand so the game also opens instantly offline.
const EXTERNAL_LIBRARIES={
 XLSX:['https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'],
 pdfjsLib:['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'],
 html2canvas:['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'],
 jspdf:['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js','https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js']
};
const libraryTasks=new Map();
async function ensureLibrary(name){
 if(window[name])return window[name];if(libraryTasks.has(name))return libraryTasks.get(name);
 const task=(async()=>{for(const url of EXTERNAL_LIBRARIES[name]||[]){try{
  await new Promise((resolve,reject)=>{let done=false;const script=document.createElement('script');script.src=url;script.async=true;
   const timer=setTimeout(()=>end(new Error('연결 시간 초과')),7500);
   function end(err){if(done)return;done=true;clearTimeout(timer);script.onload=null;script.onerror=null;if(err){script.remove();reject(err)}else resolve()}
   script.onload=()=>end();script.onerror=()=>end(new Error('다운로드 실패'));document.head.appendChild(script);
  });if(window[name])return window[name];
 }catch(e){/* Try the alternate CDN. */}}
 throw Error(`${name} 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.`)
 })();libraryTasks.set(name,task);try{return await task}finally{libraryTasks.delete(name)}
}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],by=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rand=n=>{if(n<=1)return 0;const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n;};
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const mkid=()=>crypto.randomUUID?.()||('id'+Date.now()+Math.random());
const surnameOf=n=>/^[가-힣]{2,5}$/.test(n||'')?n.slice(0,1):'';
const Hab=id=>HABS.find(x=>x.id===id)||HABS[0];
const makeDemo=()=>Array.from({length:25},(_,i)=>({id:mkid(),className:'체험반',number:String(i+1),name:`학생${String(i+1).padStart(2,'0')}`,gender:'',surname:'',team:'',habitat:'',animal:'',animalSex:'',variant:''}));
const defaults=()=>({students:makeDemo(),activeClass:'체험반',habitats:HABS.slice(0,6).map(x=>x.id),history:[],groups:{},seats:{},currentGroups:[],lastRace:null,settings:{title:'Who will be the winner?',subtitle:'동물원 탈출 대작전!',pin:'',groups:6,size:4,nameStyle:'both',reducedMotion:false},options:{preventRepeat:true,minimizeSpecies:true,revealTiming:'exit',soundEnabled:true}});
let state;try{let raw=localStorage.getItem('zoo_escape_web_v2');state=raw?{...defaults(),...JSON.parse(raw)}:defaults()}catch{state=defaults()}
if(!Array.isArray(state.students))state.students=makeDemo();
if(!state.habitats?.length)state.habitats=HABS.slice(0,6).map(x=>x.id);state.options={preventRepeat:true,minimizeSpecies:true,revealTiming:'exit',soundEnabled:true,...(state.options||{})};
let candidateRows=[],currentGroupDraft=null,selectedSeat=null,pdfBytes=null,pdfDoc=null,pdfPages=0,pdfPage=0,pdfImgUrl=null,addingSeat=false,race=null,raf=0,speechAudio=null,noticeTimer=0;
const save=()=>{try{const copy={...state,lastRace:state.lastRace};localStorage.setItem('zoo_escape_web_v2',JSON.stringify(copy))}catch(e){if(e?.name!=='SecurityError')toast('브라우저 저장 공간이 부족합니다. 이전 기록을 삭제해 주세요.',true)}};
const list=()=>state.students.filter(s=>s.className===state.activeClass);
const currentHab=()=>state.habitats.map(Hab);
const activeGroups=()=>state.groups[state.activeClass]||[];
function toast(message, bad=false){const n=by('notification');n.textContent=message;n.style.background=bad?'#a84f4d':'#1b5e46';n.classList.remove('hidden');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>n.classList.add('hidden'),5000)}
function modal(title,html){by('modalTitle').textContent=title;by('modalContent').innerHTML=html;by('modal').classList.remove('hidden')}
function closeModal(){by('modal').classList.add('hidden')}
function openView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));$$('.nav-btn').forEach(v=>v.classList.toggle('selected',v.dataset.view===name));if(name==='home')renderHome();if(name==='roster')renderRoster();if(name==='picker'){renderHabChecks();refreshCandidateSummary();drawIdle()}if(name==='groups')renderGroups();if(name==='seating')renderSeating();if(name==='history')renderHistory();if(name==='settings')renderSettings();const title={home:'Who will be the winner?',roster:'학생 명단 관리',picker:'동물원 탈출 경주',groups:'새로운 모둠 만들기',seating:'PDF 좌석배치도',history:'추첨 기록',settings:'교사용 설정'};by('pageTitle').textContent=name==='home'?state.settings.title:title[name];by('pageSubtitle').textContent=name==='home'?state.settings.subtitle:'동물원 탈출 대작전! · 제작자 백서향';window.scrollTo({top:0,behavior:'instant'})}
function classOptions(){let classes=[...new Set(state.students.map(s=>s.className))].sort((a,b)=>a.localeCompare(b,'ko'));if(!classes.length)classes=['체험반'];if(!classes.includes(state.activeClass))state.activeClass=classes[0];by('classSelect').innerHTML=classes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');by('classSelect').value=state.activeClass}
function ensureDefaultGroups(){
 if(activeGroups().length||!list().length)return;
 const students=list(),hs=currentHab();const named=[...new Set(students.map(s=>s.team).filter(Boolean))];
 const count=named.length||Math.min(students.length,Math.max(1,+state.settings.groups||6));
 const groups=Array.from({length:count},(_,i)=>({id:mkid(),name:named[i]||`${i+1}모둠 · ${hs[i%hs.length].name}`,habitat:hs[i%hs.length].id,members:[]}));
 if(named.length){for(const s of students){let idx=named.indexOf(s.team);if(idx<0)idx=groups.reduce((best,g,i)=>g.members.length<groups[best].members.length?i:best,0);groups[idx].members.push(s.id);s.team=groups[idx].id}}
 else{let idx=0;const sizes=groupSizes(students.length,count);for(let i=0;i<count;i++)for(let j=0;j<sizes[i];j++){groups[i].members.push(students[idx].id);students[idx].team=groups[i].id;idx++}}
 state.groups[state.activeClass]=groups;
}
function assignAnimals(force=false){const rows=list();const hs=currentHab();if(!hs.length){toast('활성 지형을 선택해 주세요.',true);return}const groups=activeGroups();const teamHab=new Map(groups.map(g=>[g.id,g.habitat]));const byHab=new Map(hs.map(x=>[x.id,[]]));const unassigned=[];
for(const s of rows){let h=groups.length?(teamHab.get(s.team)||''):'';if(!byHab.has(h))h=(!force&&byHab.has(s.habitat))?s.habitat:'';if(h)byHab.get(h).push(s);else unassigned.push(s)}
for(const s of unassigned){const h=hs.slice().sort((a,b)=>byHab.get(a.id).length-byHab.get(b.id).length)[0];byHab.get(h.id).push(s)}
for(const h of hs){const students=byHab.get(h.id);let used=new Set();if(!force){for(const s of students){if(s.habitat===h.id&&s.animal&&h.species.includes(s.animal))used.add(s.animal)}}for(const s of students){s.habitat=h.id;const existing=h.species.includes(s.animal)&&!force;if(existing){s.variant=students.filter(x=>x.animal===s.animal).indexOf(s)>0?'🎒':'';continue}let species=state.options.minimizeSpecies!==false?h.species.find(a=>!used.has(a)):h.species[rand(h.species.length)];if(!species)species=h.species[used.size%h.species.length]||h.species[rand(h.species.length)];s.animal=species;s.variant=used.has(species)?'🎒':'';used.add(species);s.animalSex=s.animalSex||''}}
save();if(force)toast('선택한 지형에 맞게 동물 캐릭터를 다시 배정했습니다.');}
function speciesIcon(s){const h=HABS.find(h=>h.species.includes(s?.animal));return h?.icons[h.species.indexOf(s.animal)]||'🐾'}
function speciesIconByName(name){const h=HABS.find(h=>h.species.includes(name));return h?.icons[h.species.indexOf(name)]||'🐾'}
function renderHome(){const n=list().length,groups=activeGroups();by('stats').innerHTML=[['👧','학생 수',n+'명'],['🏕️','활성 지형',state.habitats.length+'곳'],['🧩','현재 모둠',groups.length+'개'],['🏆','추첨 기록',state.history.filter(r=>r.className===state.activeClass).length+'회']].map(([icon,t,v])=>`<div class="stat"><div class="stat-icon">${icon}</div><div><span>${t}</span><strong>${v}</strong></div></div>`).join('');
by('homeHabitats').innerHTML=currentHab().map(h=>{let ns=list().filter(s=>s.habitat===h.id);return `<div class="hab-card"><div class="hab-icon">${h.emoji}</div><div><strong>${esc(h.name)}</strong><small>${ns.length}명 · ${ns.length}마리</small></div></div>`}).join('');by('homeGroups').innerHTML=groups.length?groups.map((g,i)=>`<div class="quick-group"><span>${esc(g.name)}</span><strong>${g.members.length}명 · ${Hab(g.habitat).emoji}</strong></div>`).join(''):'<div class="hint">아직 저장한 모둠이 없습니다. ‘새 모둠 만들기’에서 6모둠을 구성할 수 있어요.</div>'}
function renderRoster(){let rows=list();const q=by('studentSearch').value.trim();if(q)rows=rows.filter(s=>(s.name+s.number+s.team+s.animal).includes(q));by('rosterBody').innerHTML=rows.map(s=>`<tr data-id="${esc(s.id)}"><td><input aria-label="번호" data-field="number" value="${esc(s.number)}"></td><td><input aria-label="이름" data-field="name" value="${esc(s.name)}"></td><td><select data-field="gender"><option value="">미설정</option><option value="남" ${s.gender==='남'?'selected':''}>남</option><option value="여" ${s.gender==='여'?'selected':''}>여</option></select></td><td><input data-field="surname" aria-label="성씨" value="${esc(s.surname)}" placeholder="성씨"></td><td><input data-field="team" value="${esc(activeGroups().find(g=>g.id===s.team)?.name||s.team)}" placeholder="미배정"></td><td><div style="display:flex;align-items:center;gap:2px"><span>${speciesIcon(s)}</span><select data-field="animal" aria-label="동물">${[...new Set([s.animal,...Hab(s.habitat).species])].filter(Boolean).map(a=>`<option value="${esc(a)}" ${s.animal===a?'selected':''}>${esc(a)}</option>`).join('')}</select></div><select data-field="animalSex" aria-label="동물 성별"><option value="">동물 성별 미설정</option><option value="수컷" ${s.animalSex==='수컷'?'selected':''}>수컷</option><option value="암컷" ${s.animalSex==='암컷'?'selected':''}>암컷</option></select></td><td><button class="td-delete" data-delete="${esc(s.id)}" title="학생 삭제">✕</button></td></tr>`).join('')}
function renderHabChecks(){by('habitatChecks').innerHTML=HABS.map(h=>`<label><input type="checkbox" data-hab="${h.id}" ${state.habitats.includes(h.id)?'checked':''}>${h.emoji} ${esc(h.name)}</label>`).join('')}
function renderSettings(){by('titleSetting').value=state.settings.title;by('subtitleSetting').value=state.settings.subtitle;by('pinSetting').value=state.settings.pin;by('defaultGroups').value=state.settings.groups;by('defaultSize').value=state.settings.size;by('nameStyle').value=state.settings.nameStyle;by('reducedMotion').checked=!!state.settings.reducedMotion}
function renderGroups(){const g=currentGroupDraft||activeGroups();by('groupsGrid').innerHTML=g.map((group,i)=>`<div class="group-card" data-group="${i}"><div class="group-head"><span class="hab-icon">${Hab(group.habitat).emoji}</span><b>모둠 ${i+1}</b><small>${group.members.length}명</small></div><input data-gr-field="name" value="${esc(group.name)}" aria-label="모둠 이름"><select data-gr-field="habitat">${HABS.map(h=>`<option value="${h.id}" ${group.habitat===h.id?'selected':''}>${esc(h.name)}</option>`).join('')}</select>${group.members.map(sid=>{const s=list().find(x=>x.id===sid);if(!s)return '';return `<div class="group-person"><span>${esc(s.name)} ${esc(s.number)}번</span><select data-move="${esc(sid)}"><option value="${i}">이동 ▾</option>${g.map((other,j)=>j===i?'':`<option value="${j}">${esc(other.name)}</option>`).join('')}</select></div>`}).join('')}</div>`).join('');by('groupStats').innerHTML=`<div class="hint"><b>${g.length}개 모둠</b><br>배정 학생 ${g.reduce((a,x)=>a+x.members.length,0)}명 / 전체 ${list().length}명</div>`}
function renderHistory(){const h=state.history.filter(x=>x.className===state.activeClass).slice().reverse();by('historyList').innerHTML=h.length?h.map(r=>`<div class="history-entry"><time>${esc(r.date)}</time><strong>${esc(r.kind==='student'?'개인 뽑기':r.kind==='team'?'모둠 뽑기':'동물 종류 뽑기')} · ${r.winners.length}개 당첨</strong><p>탈출 순위: ${esc((r.ranks||[]).slice(0,6).map(x=>x.label).join(' → '))}</p>${r.winners.map(x=>`<span class="chip">🏆 ${esc(x.label)}</span>`).join('')}</div>`).join(''):'<div class="hint">아직 추첨 기록이 없습니다.</div>'}
function persistOption(){state.options.preventRepeat=by('preventRepeat').checked;state.options.minimizeSpecies=by('minimizeSpecies').checked;state.options.revealTiming=by('revealTiming').value;state.options.soundEnabled=by('soundEnabled').checked;save()}
function restoreOption(){by('preventRepeat').checked=state.options.preventRepeat;by('minimizeSpecies').checked=state.options.minimizeSpecies;by('revealTiming').value=state.options.revealTiming;by('soundEnabled').checked=state.options.soundEnabled}
function repeatSet(kind){const ids=new Set();for(const r of state.history){if(r.className===state.activeClass&&r.kind===kind)for(const w of r.winners)ids.add(w.id)}return ids}
function csvSet(s){return new Set(String(s||'').split(/[,，\s]+/).map(x=>x.trim()).filter(Boolean))}
function getCandidates(){const kind=by('pickKind').value;const blocked=by('preventRepeat').checked?repeatSet(kind):new Set();let items=[];
 if(kind==='student'){
  const sg=by('genderFilter').value,sa=by('animalSexFilter').value,inc=csvSet(by('surnameInclude').value),exc=csvSet(by('surnameExclude').value);
  items=list().filter(s=>state.habitats.includes(s.habitat)).filter(s=>sg==='all'||(sg==='unset'?!s.gender:s.gender===sg)).filter(s=>sa==='all'||(sa==='unset'?!s.animalSex:s.animalSex===sa)).filter(s=>!inc.size||inc.has(s.surname)).filter(s=>!exc.has(s.surname)).filter(s=>!blocked.has(s.id)).map(s=>({id:s.id,label:s.name,gender:s.gender,surname:s.surname,habitat:s.habitat,animal:s.animal,icon:speciesIcon(s),number:s.number}));
 }else if(kind==='team'){
  items=activeGroups().filter(g=>state.habitats.includes(g.habitat)).filter(g=>!blocked.has(g.id)).map(g=>({id:g.id,label:g.name,habitat:g.habitat,animal:'',icon:Hab(g.habitat).emoji}));
 }else{
  items=currentHab().flatMap(h=>h.species.map((sp,i)=>({id:`${h.id}:${sp}`,label:sp,habitat:h.id,animal:sp,icon:h.icons[i]}))).filter(x=>!blocked.has(x.id));
 }
 return items;
}
function comboWanted(){const raw=by('genderCombo').value;if(raw==='any')return null;if(raw==='custom')return [Math.max(0,+by('comboBoys').value||0),Math.max(0,+by('comboGirls').value||0)];return raw.split(',').map(Number)}
function validSubset(xs,wanted,surnames){if(wanted){if(xs.filter(x=>x.gender==='남').length!==wanted[0]||xs.filter(x=>x.gender==='여').length!==wanted[1])return false}
 if(surnames==='same'){return xs.every(x=>x.surname&&x.surname===xs[0].surname)}
 if(surnames==='distinct'){return xs.every(x=>x.surname)&&new Set(xs.map(x=>x.surname)).size===xs.length}return true}
// Uniform combinatorial sampling, including constrained surname combinations.
function randBigInt(top){
 if(top<=1n)return 0n;
 const bits=(top-1n).toString(2).length, byteCount=Math.ceil(bits/8),mask=(1n<<BigInt(bits))-1n;
 let value;do{const bytes=new Uint8Array(byteCount);crypto.getRandomValues(bytes);value=bytes.reduce((r,b)=>(r<<8n)+BigInt(b),0n)&mask}while(value>=top);
 return value;
}
function choose(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let r=1n;for(let i=1;i<=k;i++)r=r*BigInt(n-k+i)/BigInt(i);return r}
function pickWeighted(options){let total=options.reduce((t,x)=>t+x.weight,0n);if(total<=0n)throw Error('조건을 충족하는 조합이 없습니다.');let idx=randBigInt(total);for(const opt of options){if(idx<opt.weight)return opt.value;idx-=opt.weight}return options.at(-1).value}
function pickSubset(items,count,wanted,surname){
 if(!Number.isInteger(count)||count<1)throw Error('뽑기 인원은 1명 이상이어야 합니다.');
 if(count>items.length)throw Error(`뽑기 인원(${count})이 후보 수(${items.length})보다 많습니다.`);
 if(wanted&&wanted[0]+wanted[1]!==count)throw Error('남녀 조합 인원의 합이 뽑기 인원과 일치하지 않습니다.');
 const boys=items.filter(x=>x.gender==='남'),girls=items.filter(x=>x.gender==='여');
 if(wanted&&(boys.length<wanted[0]||girls.length<wanted[1]))throw Error('성별 조합을 충족할 학생이 부족합니다.');
 const simplePick=(arr,n)=>shuffle(arr).slice(0,n);
 if(surname==='any')return shuffle(wanted?[...simplePick(boys,wanted[0]),...simplePick(girls,wanted[1])]:simplePick(items,count));
 const bySurname=new Map();for(const x of items){if(!x.surname)continue;if(!bySurname.has(x.surname))bySurname.set(x.surname,[]);bySurname.get(x.surname).push(x)}
 if(surname==='same'){
  const options=[...bySurname.values()].map(group=>{const b=group.filter(x=>x.gender==='남'),g=group.filter(x=>x.gender==='여');return{value:group,weight:wanted?choose(b.length,wanted[0])*choose(g.length,wanted[1]):choose(group.length,count)}}).filter(x=>x.weight>0n);
  if(!options.length)throw Error('동일 성씨에서 조건에 맞는 인원을 선택할 수 없습니다.');
  const group=pickWeighted(options);
  return shuffle(wanted?[...simplePick(group.filter(x=>x.gender==='남'),wanted[0]),...simplePick(group.filter(x=>x.gender==='여'),wanted[1])]:simplePick(group,count));
 }
 if(surname!=='distinct')throw Error('지원되지 않는 성씨 조합입니다.');
 const surnameGroups=[...bySurname.values()],memo=new Map();
 function ways(i,n,b,g){const key=`${i}/${n}/${b}/${g}`;if(memo.has(key))return memo.get(key);if(n===0)return 1n;if(i===surnameGroups.length||n<0||n>surnameGroups.length-i)return 0n;
  let v=ways(i+1,n,b,g);const group=surnameGroups[i];
  if(wanted){if(b>0)v+=BigInt(group.filter(x=>x.gender==='남').length)*ways(i+1,n-1,b-1,g);if(g>0)v+=BigInt(group.filter(x=>x.gender==='여').length)*ways(i+1,n-1,b,g-1)}
  else v+=BigInt(group.length)*ways(i+1,n-1,0,0);
  memo.set(key,v);return v}
 let b=wanted?wanted[0]:0,g=wanted?wanted[1]:0;
 if(ways(0,count,b,g)===0n)throw Error('서로 다른 성씨 조건을 충족할 수 없습니다. 성씨 또는 인원 설정을 확인해 주세요.');
 const chosen=[];let n=count;
 for(let i=0;i<surnameGroups.length&&n>0;i++){
  const group=surnameGroups[i],opts=[{value:null,weight:ways(i+1,n,b,g)}];
  for(const x of group){if(wanted&&x.gender!=='남'&&x.gender!=='여')continue;if(wanted&&x.gender==='남'&&b===0)continue;if(wanted&&x.gender==='여'&&g===0)continue;
   const nb=wanted&&x.gender==='남'?b-1:b,ng=wanted&&x.gender==='여'?g-1:g;
   opts.push({value:x,weight:ways(i+1,n-1,nb,ng)});
  }
  const x=pickWeighted(opts.filter(o=>o.weight>0n));if(!x)continue;chosen.push(x);n--;if(wanted){if(x.gender==='남')b--;else g--}
 }
 if(chosen.length!==count)throw Error('조건별 조합 생성 중 오류가 발생했습니다.');
 return shuffle(chosen);
}
function makeDraw(){const items=getCandidates(),kind=by('pickKind').value,count=parseInt(by('pickCount').value,10)||1,wanted=kind==='student'?comboWanted():null,surname=kind==='student'?by('surnameMode').value:'any';
 const winners=pickSubset(items,count,wanted,surname);
 const winids=new Set(winners.map(x=>x.id));
 const ranks=[...shuffle(winners),...shuffle(items.filter(x=>!winids.has(x.id)))];
 const result={id:mkid(),className:state.activeClass,kind,date:new Date().toLocaleString('ko-KR'),winners:winners.map(x=>({id:x.id,label:x.label})),ranks:ranks.map(x=>({...x})),conditions:{count,preventRepeat:by('preventRepeat').checked,habitats:[...state.habitats]},saved:false};
 return result;
}
function refreshCandidateSummary(){if(!by('candidateSummary'))return;let candidates;try{candidates=getCandidates()}catch{return}const kind=by('pickKind').value;const count=+by('pickCount').value||1;const names={student:'학생',team:'모둠',species:'동물 종류'};by('animalAllocation').innerHTML=currentHab().map(h=>{const arr=list().filter(s=>s.habitat===h.id);return `${h.emoji} ${esc(h.name)} <b>${arr.length}명</b> · 동물종 ${new Set(arr.map(s=>s.animal)).size}종`}).join('<br>')||'선택된 지형이 없습니다.';by('candidateSummary').innerHTML=`현재 추첨 가능 ${names[kind]} <b>${candidates.length}</b>개 / 이번에 <b>${count}</b>개 뽑기${count>candidates.length?'<br>⚠️ 후보 수보다 많이 뽑을 수 없습니다.':''}`;const combo=by('genderCombo');combo.disabled=kind!=='student';by('genderFilter').disabled=kind!=='student';by('surnameMode').disabled=kind!=='student';by('animalSexFilter').disabled=kind!=='student'}
function saveDraw(record){if(record.saved)return;record.saved=true;state.history.push({id:record.id,className:record.className,kind:record.kind,date:record.date,winners:record.winners,ranks:record.ranks,conditions:record.conditions});state.history=state.history.slice(-150);state.lastRace=record;save()}
function showDrawResult(){const r=state.lastRace;if(!r){toast('먼저 경주를 시작해 주세요.',true);return}const trophy=['🥇','🥈','🥉'];by('raceOverlay').innerHTML=`<div style="font-size:38px;margin-bottom:8px">🎉 🏆 🎉</div><h2>${r.kind==='team'?'우승 모둠':r.kind==='species'?'행운의 동물':'오늘의 주인공'}!</h2><div class="winners">${r.winners.map((w,i)=>{const p=r.ranks.find(x=>x.id===w.id);return `<div class="win-pill"><div style="font-size:26px">${trophy[i]||'⭐'} ${esc(p?.icon||'🐾')}</div>${esc(w.label)}</div>`}).join('')}</div><p style="margin-top:14px;color:#5e7a6c">${r.ranks.length}개 참가 · 정문 탈출 성공!</p>`;by('raceOverlay').classList.remove('hidden');by('raceResults').innerHTML=r.ranks.map((x,i)=>`<span class="result-chip">${i+1}위 ${x.icon} ${esc(x.label)}</span>`).join('')}
function playSound(rank){if(!by('soundEnabled').checked)return;try{const AC=window.AudioContext||window.webkitAudioContext;const ctx=speechAudio||(speechAudio=new AC());const low=rank%4;for(let i=0;i<3;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type=low===0?'sine':'triangle';o.frequency.setValueAtTime((low===0?240:340)+i*85,ctx.currentTime+i*.09);o.frequency.exponentialRampToValueAtTime((low===0?145:210)+i*70,ctx.currentTime+i*.09+.11);g.gain.setValueAtTime(.0001,ctx.currentTime+i*.09);g.gain.exponentialRampToValueAtTime(.035,ctx.currentTime+i*.09+.01);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+i*.09+.16);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+i*.09);o.stop(ctx.currentTime+i*.09+.17)}}catch{}}
const canvas=by('raceCanvas'),ctx=canvas.getContext('2d');
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function renderCanvasFrame(record,elapsed=0,duration=30000){const W=1152,H=648;ctx.clearRect(0,0,W,H);let grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#bfe9e8');grad.addColorStop(.56,'#eaf7db');grad.addColorStop(1,'#f8f0d3');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#ffffff99';for(let k=0;k<11;k++){let x=(k*139+42-((elapsed/80)%135)+1152)%1250-50;ctx.beginPath();ctx.ellipse(x,42+(k%3)*29,38,14,0,0,Math.PI*2);ctx.fill()}
 const hs=currentHab();let tileW=925/Math.max(1,hs.length);for(let i=0;i<hs.length;i++){let x=75+i*tileW;ctx.globalAlpha=.30;ctx.fillStyle=hs[i].tone;ctx.fillRect(x,100,tileW,530);ctx.globalAlpha=1;ctx.fillStyle='#274d43';ctx.font='bold 14px system-ui';ctx.fillText(hs[i].emoji+' '+hs[i].name,x+8,128);ctx.strokeStyle='#ffffff94';ctx.setLineDash([6,7]);ctx.beginPath();ctx.moveTo(x+tileW,145);ctx.lineTo(x+tileW,618);ctx.stroke();ctx.setLineDash([])}
 ctx.fillStyle='#215844';ctx.fillRect(1020,110,12,510);ctx.fillRect(1104,110,12,510);ctx.fillStyle='#f6fff5';rounded(ctx,1029,109,77,40,7);ctx.fill();ctx.fillStyle='#255f4d';ctx.font='bold 15px system-ui';ctx.fillText('ZOO',1038,125);ctx.fillText('EXIT',1037,141);
 ctx.fillStyle='#f5ca95';rounded(ctx,1012,507,110,115,9);ctx.fill();ctx.fillStyle='#b97955';ctx.fillRect(1014,538,106,16);ctx.font='27px system-ui';ctx.fillText('🎟️',1058,565);ctx.font='bold 11px system-ui';ctx.fillStyle='#734a3c';ctx.fillText('어서 와요!',1028,589);
 ctx.strokeStyle='#5b907950';for(let i=0;i<25;i++){let y=158+i*18;ctx.beginPath();ctx.moveTo(67,y+8);ctx.lineTo(1006,y+8);ctx.stroke()}
 const ranks=record?.ranks||list().map(s=>({id:s.id,label:s.name,icon:speciesIcon(s)}));const shown=ranks.slice(0,27),lineGap=Math.min(54,Math.max(17.2,430/Math.max(1,shown.length)));
 for(let i=shown.length-1;i>=0;i--){const r=shown[i],fin=duration*(.62+(i/Math.max(1,ranks.length))*.36);const progress=record?Math.min(1,elapsed/fin):.02+(i%8)*.005;const sway=Math.sin(elapsed/180+i)*2.5;let x=80+Math.min(.985,progress)*942, y=165+i*lineGap+sway;const style=state.settings.nameStyle;ctx.textBaseline='middle';if(['both','animal'].includes(style)){ctx.font='23px "Segoe UI Emoji","Apple Color Emoji",system-ui';ctx.fillText(r.icon||'🐾',x,y)}
 const showStudent=!record||by('revealTiming').value==='start'||(by('revealTiming').value.startsWith('middle')&&elapsed>=duration*({'middle25':.25,'middle':.5,'middle75':.75}[by('revealTiming').value]||.5))||race?.forceReveal||(by('revealTiming').value==='exit'&&progress>=1);
 let label=style==='species'?r.animal||r.label:style==='animal'?'':showStudent?(style==='species_student'?`${r.animal||''} ${r.label}`:r.label):'';
 if(record?.kind==='team'){const group=activeGroups().find(g=>g.id===r.id);if(group){const leg=Math.min(group.members.length,Math.max(1,Math.ceil(progress*group.members.length)));if(showStudent)label=label?`${label} · ${leg}/${group.members.length}주자`:`${leg}/${group.members.length}주자`}}
 if(label){ctx.font='bold 11px system-ui';ctx.fillStyle='#245e4e';ctx.fillText(label,['species','student','species_student'].includes(style)?x:x+30,y)}
 }
 if(record&&race?.recentExits?.length){
 const recent=race.recentExits.filter(x=>elapsed-x.at<2200);for(let i=0;i<Math.min(2,recent.length);i++){
  const r=recent[i],fade=Math.max(.3,1-(elapsed-r.at)/2400);ctx.globalAlpha=fade;ctx.fillStyle='#fffef7';ctx.strokeStyle='#4f9975';ctx.lineWidth=2;rounded(ctx,780,145+i*60,225,46,12);ctx.fill();ctx.stroke();
  ctx.fillStyle='#255e46';ctx.font='bold 17px system-ui';ctx.fillText(`${r.icon||'🐾'} ${(by('revealTiming').value==='manual'&&!race?.forceReveal)?'???':r.label} 탈출!`,793,174+i*60);ctx.globalAlpha=1;
 }
 }
 ctx.textBaseline='alphabetic';ctx.fillStyle='#205345';ctx.font='bold 14px system-ui';ctx.fillText('START',15,108);ctx.fillStyle='#18543e';ctx.fillText(record?`남은 시간 ${Math.max(0,Math.ceil((duration-elapsed)/1000))}초`:'함께 달릴 동물들이 기다리고 있어요!',20,630);
}
function drawIdle(){if(race?.running)return;renderCanvasFrame(null)}
function raceButtons(running,paused=false){by('startRace').disabled=running;by('pauseRace').disabled=!running;by('pauseRace').textContent=paused?'▶ RESUME':'Ⅱ PAUSE';by('skipRace').disabled=!running;by('raceStatus').textContent=running?(paused?'일시 정지':'동물원 탈출 중!'):'출발 대기'}
function stopRace(){if(raf)cancelAnimationFrame(raf);raf=0;if(race)race.running=false;raceButtons(false)}
function completeRace(){if(!race)return;stopRace();saveDraw(race.result);by('raceStatus').textContent='🎉 탈출 성공!';playSound(1);renderCanvasFrame(race.result,race.duration,race.duration);showDrawResult();refreshCandidateSummary()}
function animateFrame(now){if(!race||!race.running||race.paused)return;const dt=Math.max(0,Math.min(100,now-race.last));race.last=now;race.elapsed+=dt;
 const rows=race.result.ranks;if(rows.length){for(let i=0;i<rows.length;i++){const p=rows[i],finish=race.duration*(.62+(i/rows.length)*.36);if(race.elapsed>=finish&&!race.crossed.has(p.id)){race.crossed.add(p.id);race.recentExits.unshift({label:p.label,icon:p.icon,at:race.elapsed});if(race.recentExits.length>5)race.recentExits.pop();if(i%3===0)playSound(i+1)}}}
 renderCanvasFrame(race.result,race.elapsed,race.duration);if(race.elapsed>=race.duration){completeRace();return}raf=requestAnimationFrame(animateFrame)}
function playRace(reuse=false){try{if(race?.running)stopRace();let r=reuse?state.lastRace:makeDraw();if(!r)throw Error('다시 볼 경주 기록이 없습니다.');if(!reuse){state.lastRace=r;save()};let duration=(+by('raceDuration').value||30)*1000;if(state.settings.reducedMotion)duration=Math.min(duration,4000);race={running:true,paused:false,last:performance.now(),elapsed:0,duration,result:r,forceReveal:false,crossed:new Set(),recentExits:[]};by('raceOverlay').classList.add('hidden');by('raceResults').innerHTML='';raceButtons(true);raf=requestAnimationFrame(animateFrame);toast(`총 ${r.ranks.length}개 후보 중 ${r.winners.length}개를 뽑았습니다. 결과는 시작 시 확정됩니다.`)}catch(e){toast(e.message,true)}}
function togglePause(){if(!race?.running)return;race.paused=!race.paused;race.last=performance.now();raceButtons(true,race.paused);if(!race.paused)raf=requestAnimationFrame(animateFrame)}
function groupSizes(n,g){return Array.from({length:g},(_,i)=>Math.floor(n/g)+(i<n%g?1:0))}
function createGroups(){const members=list();if(!members.length){toast('현재 반에 학생이 없습니다.',true);return}let num=Math.max(1,Math.floor(+by('groupNumber').value||6)),basis=by('groupBasis').value,g=basis==='count'?num:Math.max(1,Math.ceil(members.length/num));g=Math.min(g,members.length);const sizes=groupSizes(members.length,g);const hs=currentHab();const draft=Array.from({length:g},(_,i)=>({id:mkid(),name:`${i+1}모둠 · ${hs[i%hs.length].name}`,habitat:hs[i%hs.length].id,members:[]}));let ranking=state.lastRace?.kind==='student'&&state.lastRace.className===state.activeClass?state.lastRace.ranks.map(x=>x.id):[];
 let sorted=[...ranking.map(id=>members.find(s=>s.id===id)).filter(Boolean),...shuffle(members.filter(s=>!ranking.includes(s.id)))];
 if(by('groupMethod').value==='random'||!ranking.length)sorted=shuffle(sorted);
 const method=by('groupMethod').value;
 if(method==='sequential'){
  let pos=0;for(let i=0;i<g;i++)draft[i].members=sorted.slice(pos,pos+sizes[i]).map(x=>x.id),pos+=sizes[i];
 }else if(method==='round'||method==='snake'){
  let order=[];let last=-1;while(order.length<members.length){let round=method==='round'?Array.from({length:g},(_,i)=>i):(Math.floor(order.length/g)%2===0?Array.from({length:g},(_,i)=>i):Array.from({length:g},(_,i)=>g-1-i));for(const j of round)if(order.filter(x=>x===j).length<sizes[j])order.push(j);if(order.length===last)break;last=order.length}
  sorted.forEach((s,i)=>draft[order[i]??0].members.push(s.id));
 }else{
  // Greedy random tie-breaking: balance gender and surname when requested.
  const balanceSex=by('groupSpreadGender').checked||method==='balanced',balanceSurname=by('groupSpreadSurname').checked||method==='balanced';
  for(const s of sorted){let best=Infinity,choices=[];for(let i=0;i<g;i++){const group=draft[i];if(group.members.length>=sizes[i])continue;const inside=group.members.map(id=>members.find(x=>x.id===id));let cost=group.members.length*.08;if(balanceSex&&s.gender)cost+=inside.filter(x=>x.gender===s.gender).length*3;if(balanceSurname&&s.surname)cost+=inside.filter(x=>x.surname===s.surname).length*5;
    if(cost<best){best=cost;choices=[i]}else if(cost===best)choices.push(i)}
   if(!choices.length)throw Error('모둠 배정이 완료되지 않았습니다.');draft[choices[rand(choices.length)]].members.push(s.id);
  }
 }
 currentGroupDraft=draft;renderGroups();by('groupNotice').textContent=`${members.length}명 → ${g}개 모둠 구성 완료. 실제로 적용하려면 '현재 모둠으로 적용'을 눌러 주세요.`;toast('새 모둠 구성안이 완성되었습니다. 학생 이동과 이름 수정을 할 수 있습니다.');
}
function saveGroups(){const groups=currentGroupDraft||activeGroups();if(!groups.length){toast('먼저 새 모둠을 만들어 주세요.',true);return}const ids=groups.flatMap(g=>g.members);const actual=list().map(s=>s.id);if(ids.length!==actual.length||new Set(ids).size!==ids.length||actual.some(id=>!ids.includes(id))){toast('모든 학생은 정확히 하나의 모둠에 배정되어야 합니다.',true);return}state.groups[state.activeClass]=JSON.parse(JSON.stringify(groups));for(const g of groups){for(const sid of g.members){const s=state.students.find(x=>x.id===sid);if(s){s.team=g.id;s.habitat=g.habitat;s.animal=''}}}assignAnimals(true);currentGroupDraft=null;save();renderGroups();toast('새 모둠을 현재 모둠으로 저장했습니다.')}
function updateGroupRow(e){const groupCard=e.target.closest('[data-group]');if(!groupCard)return;const idx=+groupCard.dataset.group;let groups=currentGroupDraft||activeGroups();if(!currentGroupDraft)currentGroupDraft=JSON.parse(JSON.stringify(groups)),groups=currentGroupDraft;const g=groups[idx];if(!g)return;if(e.target.dataset.grField){g[e.target.dataset.grField]=e.target.value;renderGroups();return}if(e.target.dataset.move){let to=+e.target.value;const id=e.target.dataset.move;if(to===idx)return;g.members=g.members.filter(x=>x!==id);groups[to].members.push(id);renderGroups()}}
function placementRows(){const groups=activeGroups();let ranks=new Map(state.lastRace?.className===state.activeClass?state.lastRace?.ranks?.map((x,i)=>[x.id,i+1]):[]);let seats=state.seats[state.activeClass]||[];return list().map(s=>({className:s.className,number:s.number,name:s.name,gender:s.gender,surname:s.surname,team:groups.find(g=>g.id===s.team)?.name||s.team,habitat:Hab(s.habitat).name,animal:s.animal,rank:ranks.get(s.id)||'',seat:seats.find(x=>x.studentId===s.id)?.number||''}))}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function rowsAsCsv(rows){
 const headers=['반','번호','이름','성별','성씨','모둠','지형','동물','탈출 순위','좌석 번호'];
 const fields=['className','number','name','gender','surname','team','habitat','animal','rank','seat'];
 const value=v=>'"'+String(v??'').replaceAll('"','""')+'"';return '\ufeff'+[headers,...rows.map(r=>fields.map(f=>r[f]))].map(line=>line.map(value).join(',')).join('\r\n');
}
async function exportXlsx(){
 try{const rows=placementRows();if(!rows.length)throw Error('저장할 학생 데이터가 없습니다.');
 if(!window.XLSX){try{await ensureLibrary('XLSX')}catch(e){/* CSV fallback below */}}
 if(window.XLSX){
  const sheet=XLSX.utils.json_to_sheet(rows.map(x=>({'반':x.className,'번호':x.number,'이름':x.name,'성별':x.gender,'성씨':x.surname,'모둠':x.team,'지형':x.habitat,'동물':x.animal,'탈출 순위':x.rank,'좌석 번호':x.seat})));sheet['!cols']=[12,8,15,8,8,24,18,15,12,12].map(w=>({wch:w}));
  const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'학생 및 모둠');XLSX.writeFile(book,`${state.activeClass}_동물원_결과.xlsx`);toast('Excel 파일을 저장했습니다.');
 }else{download(new Blob([rowsAsCsv(rows)],{type:'text/csv;charset=utf-8'}),`${state.activeClass}_동물원_결과.csv`);toast('Excel 라이브러리를 불러오지 못해 CSV로 저장했습니다. 인터넷 연결을 확인해 주세요.')}
 }catch(e){toast('파일 저장 오류: '+e.message,true)}
}
function downloadTemplate(){const csv='\ufeff반,번호,이름,성별,모둠\r\n6-1,1,김민준,남,1모둠\r\n6-1,2,이서연,여,1모둠\r\n';download(new Blob([csv],{type:'text/csv;charset=utf-8'}),'학생명단_양식.csv')}
function parseCsv(txt){
 txt=txt.replace(/^\ufeff/,'');let rows=[],row=[],cell='',quoted=false;
 for(let i=0;i<txt.length;i++){const c=txt[i];if(c==='"'){if(quoted&&txt[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
 else if(!quoted&&(c===','||c==='\t')){row.push(cell);cell=''}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&txt[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}else cell+=c}
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
function normalizeStudentRows(rows,defaultClass){
 const norm=x=>String(x??'').trim().replaceAll(' ','').toLowerCase();
 const columns=(rows[0]||[]).map(norm);
 const idx=(variants)=>columns.findIndex(c=>variants.includes(c));
 const col={className:idx(['반','학급','학반','class','classname','class_name','classroom']),number:idx(['번호','순번','number','num','no','학번']),name:idx(['이름','성명','name','학생이름','학생명']),gender:idx(['성별','gender','sex']),team:idx(['모둠','모둠명','팀','team','group']),surname:idx(['성씨','성','surname'])};
 if(col.name<0)throw Error('명단의 첫 행에 ‘이름’ 열이 있어야 합니다.');
 return rows.slice(1).filter(r=>r.some(x=>String(x??'').trim())).map((row,i)=>{
  const get=k=>col[k]>=0?String(row[col[k]]??'').trim():'';
  const g=get('gender');let sex=/^(남|남자|남학생|m|male)$/i.test(g)?'남':/^(여|여자|여학생|f|female)$/i.test(g)?'여':'';
  const name=get('name');return{name,className:get('className')||defaultClass,number:get('number')||String(i+1),gender:sex,surname:get('surname')||surnameOf(name),team:get('team')};
 }).filter(x=>x.name)
}
async function importRoster(file){if(!file)return;try{
 if(file.size>12*1024*1024)throw Error('학생 명단은 12MB 이하만 지원합니다.');
 const ext=file.name.toLowerCase().split('.').pop();let all=[];
 if(ext==='csv'||ext==='tsv'||ext==='txt'){
  const bytes=new Uint8Array(await file.arrayBuffer());let content;
  try{content=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}
  catch{content=new TextDecoder('euc-kr').decode(bytes)}
  all=normalizeStudentRows(parseCsv(content),file.name.split('.')[0]||'새 반');
 }
 else if(['xlsx','xls'].includes(ext)){
  if(!window.XLSX)await ensureLibrary('XLSX');
  const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});for(const name of wb.SheetNames){const rows=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:''});if(!rows.length)continue;try{all.push(...normalizeStudentRows(rows,name||'새 반'))}catch(e){if(wb.SheetNames.length===1)throw e}}
 }else throw Error('Excel(.xlsx/.xls) 또는 CSV 파일을 선택해 주세요.');
 if(!all.length)throw Error('유효한 학생 명단을 찾지 못했습니다.');
 if(!confirm(`총 ${all.length}명의 학생을 불러옵니다. 기존 명단과 추첨 기록을 교체할까요?`))return;
 const students=all.map(s=>({...s,id:mkid(),habitat:'',animal:'',animalSex:'',variant:''}));
 state.students=students;state.activeClass=students[0].className;state.groups={};state.seats={};state.history=[];state.lastRace=null;currentGroupDraft=null;selectedSeat=null;
 ensureDefaultGroups();assignAnimals(true);save();classOptions();renderRoster();toast(`${students.length}명의 학생을 불러왔습니다. 기존 명단과 추첨 기록을 교체했습니다.`);
 }catch(e){toast('명단 가져오기 실패: '+e.message,true)}finally{by('rosterFile').value=''}
}
const seats=()=>state.seats[state.activeClass]||(state.seats[state.activeClass]=[]);
function blankSeat(number,x,y,team=''){return{id:mkid(),number,studentId:'',team,x,y}}
function renderSeating(){let a=seats(),groups=activeGroups();const p=by('seatStudent');p.innerHTML='<option value="">미배정</option>'+list().map(x=>`<option value="${esc(x.id)}">${esc(x.number)} · ${esc(x.name)}</option>`).join('');by('seatTeam').innerHTML='<option value="">지형 미설정</option>'+groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('');renderSeatObjects();renderSeatStatus();updateSeatInspector()}
function renderSeatStatus(){const s=seats();const used=s.filter(x=>x.studentId).length;const unseated=list().filter(x=>!s.some(t=>t.studentId===x.id));by('seatStatus').innerHTML=`<div class="seat-stat-row"><span>전체 학생</span><strong>${list().length}명</strong></div><div class="seat-stat-row"><span>좌석 수</span><strong>${s.length}개</strong></div><div class="seat-stat-row"><span>배정 완료</span><strong>${used}명</strong></div><div class="seat-stat-row"><span>미배정</span><strong>${unseated.length}명</strong></div>`;}
function renderSeatObjects(){let a=seats();by('seatObjects').innerHTML=a.map(x=>{const student=list().find(s=>s.id===x.studentId),g=activeGroups().find(g=>g.id===x.team);return `<div class="seat-obj ${selectedSeat===x.id?'selected':''}" data-seat-id="${esc(x.id)}" style="left:${x.x*100}%;top:${x.y*100}%"><small>${esc(x.number)}번 ${g?Hab(g.habitat).emoji:''}</small><b>${esc(student?.name||'빈 좌석')}</b></div>`}).join('');by('seatPlaceholder').classList.toggle('hidden',a.length>0||!!pdfImgUrl)}
function updateSeatInspector(){const seat=seats().find(x=>x.id===selectedSeat);by('seatNumber').value=seat?.number||'';by('seatStudent').value=seat?.studentId||'';by('seatTeam').value=seat?.team||'';by('removeSeat').disabled=!seat;by('updateSeat').disabled=!seat}
function generateSeatGrid(){const groups=activeGroups();const students=list();const teamCount=Math.max(1,groups.length||Math.min(state.habitats.length,Math.ceil(students.length/4)));const cols=Math.min(3,teamCount),rows=Math.ceil(teamCount/cols);let listSeats=[];const sorted=groups.length?groups:Array.from({length:teamCount},(_,i)=>({id:'group-'+i,members:students.slice(i*4,i*4+4).map(x=>x.id),habitat:state.habitats[i%state.habitats.length]}));
 for(let i=0;i<sorted.length;i++){const g=sorted[i];const row=Math.floor(i/cols),col=i%cols;const width=.89/cols,height=.78/rows,per=Math.max(4,g.members.length),scols=per>=6?3:2,srows=Math.ceil(per/scols);for(let j=0;j<per;j++){let x=.06+col*width+(j%scols+.6)*width/(scols+.4),y=.13+row*height+(Math.floor(j/scols)+.7)*height/(srows+.35);listSeats.push(blankSeat(String(listSeats.length+1),x,y,groups.length?g.id:''))}}
 state.seats[state.activeClass]=listSeats;selectedSeat=null;save();renderSeating();toast(`${listSeats.length}개 좌석을 생성했습니다. 드래그로 책상 위치를 조정할 수 있습니다.`)}
function autoSeat(){const a=seats(),students=list(),groups=activeGroups();if(a.length<students.length){toast(`좌석이 ${students.length-a.length}개 부족합니다. 좌석을 추가해 주세요.`,true);return}if(a.length===0){toast('먼저 좌석을 지정해 주세요.',true);return}
 // First validate every group capacity, then commit in one step to prevent partial assignments.
 const plan=[];let assignedIDs=new Set();
 for(const group of groups){const members=shuffle(students.filter(s=>s.team===group.id));const spots=shuffle(a.filter(x=>x.team===group.id));if(spots.length<members.length){toast(`'${group.name}'에 필요한 좌석이 ${members.length-spots.length}개 부족합니다. 좌석의 모둠 구역을 조정해 주세요.`,true);return}members.forEach((s,i)=>{plan.push([spots[i],s]);assignedIDs.add(s.id)})}
 const remaining=shuffle(students.filter(s=>!assignedIDs.has(s.id))),free=shuffle(a.filter(x=>!x.team));if(free.length<remaining.length){toast('모둠 구역에 속하지 않은 빈 좌석이 부족합니다. 좌석을 추가하거나 지형 구역을 변경해 주세요.',true);return}
 remaining.forEach((s,i)=>plan.push([free[i],s]));for(const x of a)x.studentId='';for(const [seat,student] of plan)seat.studentId=student.id;
 save();renderSeating();toast(`${plan.length}명의 좌석 배정이 완료되었습니다.`)}
async function setSeatPdfData(bytes){
 if(!window.pdfjsLib)await ensureLibrary('pdfjsLib');
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 pdfBytes=bytes;pdfDoc=await pdfjsLib.getDocument({data:new Uint8Array(bytes.slice(0)),useSystemFonts:true}).promise;pdfPages=pdfDoc.numPages;pdfPage=0;
 await renderPdfPage();
}
async function renderPdfPage(){if(!pdfDoc)return;try{
 const page=await pdfDoc.getPage(pdfPage+1),vp=page.getViewport({scale:1.6});const canvas=document.createElement('canvas');
 canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
 by('pdfPage').innerHTML=Array.from({length:pdfPages},(_,i)=>`<option value="${i}" ${i===pdfPage?'selected':''}>${i+1} / ${pdfPages}</option>`).join('');
 if(pdfImgUrl)URL.revokeObjectURL(pdfImgUrl);pdfImgUrl=await new Promise(resolve=>canvas.toBlob(blob=>resolve(URL.createObjectURL(blob)),'image/png'));
 by('pdfImage').src=pdfImgUrl;by('pdfImage').hidden=false;by('seatCanvas').style.aspectRatio=vp.width+'/'+vp.height;
 by('seatPlaceholder').classList.add('hidden');by('seatHelp').textContent=`PDF ${pdfPage+1}/${pdfPages}페이지가 열렸습니다. 좌석 후보를 감지하거나 교사가 좌석을 배치하세요.`;
 renderSeatObjects();toast(`PDF ${pdfPage+1}페이지를 불러왔습니다.`);
 }catch(e){toast('PDF 페이지 읽기 오류: '+e.message,true)}
}
async function detectPdfSeats(){if(!pdfDoc){toast('먼저 PDF를 업로드해 주세요.',true);return}
 try{const page=await pdfDoc.getPage(pdfPage+1),viewport=page.getViewport({scale:1}),content=await page.getTextContent();let detected=[];
 for(const item of content.items){const t=(item.str||'').trim();
  if(!/^(?:[1-9][0-9]?|[1-9][0-9]?번|좌석\s*[1-9][0-9]?)$/.test(t))continue;
  const m=pdfjsLib.Util.transform(viewport.transform,item.transform);let x=Math.min(.96,Math.max(.04,m[4]/viewport.width+.025)),y=Math.min(.95,Math.max(.05,m[5]/viewport.height-.018));
  if(detected.every(d=>Math.hypot(d.x-x,d.y-y)>.035))detected.push({number:t.replace(/[^0-9]/g,''),x,y});
 }
 if(!detected.length){toast('PDF에서 좌석 번호 텍스트를 찾지 못했습니다. 수동으로 좌석을 추가하거나 자동 격자를 생성해 주세요.',true);return}
 if(!confirm(`PDF에서 좌석 번호 후보 ${detected.length}개를 찾았습니다. 현재 좌석을 교체하고 후보를 표시할까요? 위치는 꼭 확인해 주세요.`))return;
 state.seats[state.activeClass]=detected.map((d,i)=>blankSeat(d.number||String(i+1),d.x,d.y));save();selectedSeat=null;renderSeating();toast(`${detected.length}개 좌석 후보를 배치했습니다. 실제 책상 위치를 확인하고 드래그로 수정해 주세요.`);
 }catch(e){toast('좌석 후보 분석 오류: '+e.message,true)}
}
async function exportSeatPdf(){
 try{const a=seats();if(!a.length)throw Error('좌석을 먼저 생성하거나 추가해 주세요.');
 if(!window.html2canvas)await ensureLibrary('html2canvas');if(!window.jspdf?.jsPDF)await ensureLibrary('jspdf');
 const el=by('seatCanvas'),shot=await html2canvas(el,{scale:2.25,useCORS:true,backgroundColor:'#ffffff',logging:false});
 const {jsPDF}=window.jspdf,pdf=new jsPDF({orientation:shot.width>=shot.height?'landscape':'portrait',unit:'mm',format:'a4'}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),ratio=Math.min(pw/shot.width,ph/shot.height),w=shot.width*ratio,h=shot.height*ratio;
 pdf.addImage(shot.toDataURL('image/png'),'PNG',(pw-w)/2,(ph-h)/2,w,h,undefined,'FAST');
 pdf.save(`${state.activeClass}_좌석배치도.pdf`);toast('PDF 좌석배치도를 저장했습니다.');
 }catch(e){toast('PDF 파일 자동 저장 오류: '+e.message+' 브라우저 인쇄 메뉴에서 PDF로 저장할 수 있습니다.',true);}
}
let dragId=null,dragMoved=false;
function seatCoordinates(event){const r=by('seatCanvas').getBoundingClientRect();return{x:Math.max(.03,Math.min(.97,(event.clientX-r.left)/r.width)),y:Math.max(.04,Math.min(.96,(event.clientY-r.top)/r.height))}}
function downSeat(e){const el=e.target.closest('[data-seat-id]');if(el){dragId=el.dataset.seatId;selectedSeat=dragId;dragMoved=false;el.setPointerCapture(e.pointerId);renderSeatObjects();updateSeatInspector();return}if(!addingSeat)return;const {x,y}=seatCoordinates(e);let a=seats();let seat=blankSeat(String(a.length+1),x,y);a.push(seat);selectedSeat=seat.id;save();renderSeating()}
function moveSeat(e){if(!dragId)return;const seat=seats().find(x=>x.id===dragId);if(!seat)return;const {x,y}=seatCoordinates(e);seat.x=x;seat.y=y;dragMoved=true;const element=by('seatObjects').querySelector(`[data-seat-id="${dragId}"]`);if(element){element.style.left=x*100+'%';element.style.top=y*100+'%'}}
function upSeat(){if(dragId){dragId=null;save()}}
function setHabitats(arr){if(!arr.length)return;state.habitats=arr;const groups=activeGroups();groups.forEach((g,i)=>{if(!arr.includes(g.habitat))g.habitat=arr[i%arr.length]});assignAnimals(true);renderHabChecks();refreshCandidateSummary();drawIdle();save();toast(`활성 지형 ${arr.length}곳을 선택했습니다.`)}
function wire(){
 by('modalClose').onclick=closeModal;by('modalOk').onclick=closeModal;by('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
 $$('#nav .nav-btn').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='settings'&&state.settings.pin){const code=prompt('교사용 PIN을 입력하세요.');if(code!==state.settings.pin){toast('PIN이 일치하지 않습니다.',true);return}}openView(b.dataset.view)}));
 $$('[data-action]').forEach(b=>b.onclick=()=>openView(b.dataset.action.replace('goto-','')));
 by('classSelect').addEventListener('change',e=>{state.activeClass=e.target.value;currentGroupDraft=null;selectedSeat=null;state.lastRace=null;ensureDefaultGroups();assignAnimals(false);save();classOptions();openView(document.querySelector('.nav-btn.selected').dataset.view)});
 by('fullscreen').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
 by('teacherLock').onclick=()=>{if(!state.settings.pin){toast('교사용 PIN은 설정 메뉴에서 지정할 수 있습니다.');openView('settings');return}const pin=prompt('교사용 PIN을 입력하세요.');if(pin===state.settings.pin)openView('settings');else toast('PIN이 일치하지 않습니다.',true)};
 by('rosterFile').onchange=e=>importRoster(e.target.files[0]);
 by('studentSearch').oninput=renderRoster;
 by('addStudent').onclick=()=>{let s={id:mkid(),className:state.activeClass,number:String(list().length+1),name:`학생${list().length+1}`,gender:'',surname:'',team:'',habitat:state.habitats[0],animal:'',animalSex:''};state.students.push(s);assignAnimals(false);renderRoster();toast('학생을 추가했습니다. 이름과 정보를 수정해 주세요.')};
 by('clearRoster').onclick=()=>{if(!confirm(`${state.activeClass} 학생 명단을 모두 삭제할까요?`))return;state.students=state.students.filter(s=>s.className!==state.activeClass);delete state.groups[state.activeClass];delete state.seats[state.activeClass];state.history=state.history.filter(x=>x.className!==state.activeClass);classOptions();save();renderRoster()};
 by('rosterBody').addEventListener('change',e=>{const tr=e.target.closest('[data-id]');if(!tr)return;const s=state.students.find(x=>x.id===tr.dataset.id);if(!s||!e.target.dataset.field)return;s[e.target.dataset.field]=e.target.value;if(e.target.dataset.field==='name'&&!s.surname)s.surname=surnameOf(s.name);save();renderRoster();refreshCandidateSummary()});
 by('rosterBody').addEventListener('click',e=>{const del=e.target.closest('[data-delete]');if(!del)return;const id=del.dataset.delete;state.students=state.students.filter(s=>s.id!==id);for(const g of activeGroups())g.members=g.members.filter(x=>x!==id);save();renderRoster()});
 by('downloadTemplate').onclick=downloadTemplate;by('assignAnimals').onclick=()=>{assignAnimals(true);renderRoster()};by('assignAnimalsPicker').onclick=()=>{assignAnimals(true);refreshCandidateSummary();drawIdle()};
 const tracked=['pickKind','pickCount','genderFilter','genderCombo','comboBoys','comboGirls','surnameInclude','surnameExclude','surnameMode','animalSexFilter','preventRepeat','minimizeSpecies','revealTiming','raceDuration','soundEnabled'];
 for(const id of tracked){by(id).addEventListener('change',()=>{by('comboInputs').classList.toggle('hidden',by('genderCombo').value!=='custom');persistOption();refreshCandidateSummary()})}
 by('habAll').onclick=()=>setHabitats(HABS.map(h=>h.id));by('habDefault').onclick=()=>setHabitats(HABS.slice(0,6).map(h=>h.id));
 by('habitatChecks').addEventListener('change',e=>{if(e.target.dataset.hab){let arr=$$('#habitatChecks input:checked').map(x=>x.dataset.hab);if(!arr.length){e.target.checked=true;toast('지형을 최소 하나 선택해야 합니다.',true);return}state.habitats=arr;activeGroups().forEach((g,i)=>{if(!arr.includes(g.habitat))g.habitat=arr[i%arr.length]});assignAnimals(true);renderHabChecks();refreshCandidateSummary();drawIdle();save()}});
 by('startRace').onclick=()=>playRace(false);by('newRace').onclick=()=>{if(race?.running)stopRace();state.lastRace=null;save();by('raceOverlay').classList.add('hidden');by('raceResults').innerHTML='';drawIdle();toast('새로운 추첨을 시작할 수 있습니다.')};
 by('pauseRace').onclick=togglePause;by('skipRace').onclick=()=>{if(race?.running)completeRace()};by('showResult').onclick=showDrawResult;by('replayRace').onclick=()=>playRace(true);
 by('revealNames').onclick=()=>{if(race){race.forceReveal=!race.forceReveal;toast(race.forceReveal?'학생 이름을 공개했습니다.':'학생 이름을 숨겼습니다.');renderCanvasFrame(race.result,race.elapsed,race.duration)}else toast('진행 중인 경주가 없습니다.')};
 by('groupBasis').onchange=()=>{by('groupNumber').value=by('groupBasis').value==='size'?state.settings.size:state.settings.groups};
 by('createGroups').onclick=()=>{try{createGroups()}catch(e){toast(e.message,true)}};by('saveGroups').onclick=saveGroups;by('exportGroups').onclick=exportXlsx;
 by('groupsGrid').addEventListener('change',updateGroupRow);by('reloadRanks').onclick=()=>{toast(state.lastRace?.kind==='student'?'최근 학생 탈출 순서를 사용할 준비가 되었습니다.':'학생 추첨 기록이 없어 무작위 순서를 사용합니다.');};
 by('seatPdf').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>14*1024*1024)throw Error('PDF는 14MB 이하 파일로 선택해 주세요.');setSeatPdfData(await file.arrayBuffer())}catch(err){toast(err.message,true)}};
 by('pdfPage').onchange=e=>{pdfPage=+e.target.value;renderPdfPage()};
 by('addSeatMode').onclick=()=>{addingSeat=!addingSeat;by('addSeatMode').textContent=addingSeat?'✅ 좌석 추가 모드 ON':'+ 좌석 클릭 추가';by('seatCanvas').style.cursor=addingSeat?'crosshair':'default'};
 by('seatCanvas').addEventListener('pointerdown',e=>{const seatEl=e.target.closest('[data-seat-id]');if(seatEl){dragId=seatEl.dataset.seatId;selectedSeat=dragId;dragMoved=false;by('seatCanvas').setPointerCapture(e.pointerId);$$('.seat-obj').forEach(x=>x.classList.toggle('selected',x.dataset.seatId===selectedSeat));updateSeatInspector()}else if(addingSeat)downSeat(e)});
 by('seatCanvas').addEventListener('pointermove',moveSeat);by('seatCanvas').addEventListener('pointerup',upSeat);by('seatCanvas').addEventListener('pointercancel',upSeat);
 by('detectPdfSeats').onclick=detectPdfSeats;
 by('generateSeatGrid').onclick=()=>{if(seats().length&&!confirm('기존 좌석 위치가 새 격자로 변경됩니다. 계속할까요?'))return;generateSeatGrid()};
 by('autoSeat').onclick=autoSeat;by('clearSeats').onclick=()=>{if(!confirm('현재 반의 좌석 정보를 모두 삭제할까요?'))return;state.seats[state.activeClass]=[];selectedSeat=null;save();renderSeating()};
 by('updateSeat').onclick=()=>{const seat=seats().find(x=>x.id===selectedSeat);if(!seat)return;const id=by('seatStudent').value;if(id){for(const x of seats())if(x.id!==seat.id&&x.studentId===id)x.studentId=''}seat.studentId=id;seat.team=by('seatTeam').value;seat.number=by('seatNumber').value.trim()||seat.number;save();renderSeating();toast('좌석 배정을 저장했습니다.')};
 by('removeSeat').onclick=()=>{state.seats[state.activeClass]=seats().filter(x=>x.id!==selectedSeat);selectedSeat=null;save();renderSeating()};
 by('exportPdf').onclick=exportSeatPdf;by('printSeats').onclick=()=>window.print();by('exportSeatExcel').onclick=exportXlsx;
 by('clearHistory').onclick=()=>{if(!confirm('현재 반 추첨 기록을 모두 초기화할까요?'))return;state.history=state.history.filter(x=>x.className!==state.activeClass);save();renderHistory();refreshCandidateSummary()};
 by('saveSettings').onclick=()=>{const s=state.settings;s.title=by('titleSetting').value||'Who will be the winner?';s.subtitle=by('subtitleSetting').value||'동물원 탈출 대작전!';s.pin=by('pinSetting').value;s.groups=Math.max(1,+by('defaultGroups').value||6);s.size=Math.max(1,+by('defaultSize').value||4);s.nameStyle=by('nameStyle').value;s.reducedMotion=by('reducedMotion').checked;save();toast('교사용 설정을 저장했습니다.');openView('home')};
 by('resetData').onclick=()=>{if(!confirm('모든 명단·추첨·모둠·좌석 데이터를 초기화하고 체험용 명단을 불러올까요?'))return;state=defaults();currentGroupDraft=null;selectedSeat=null;pdfBytes=null;pdfPages=0;pdfPage=0;if(pdfImgUrl)URL.revokeObjectURL(pdfImgUrl);pdfImgUrl=null;by('pdfImage').hidden=true;pdfDoc=null;by('seatCanvas').style.aspectRatio='1.414';ensureDefaultGroups();assignAnimals(true);classOptions();save();restoreOption();openView('home')};
}
wire();classOptions();ensureDefaultGroups();if(list().some(s=>!s.animal||!s.habitat))assignAnimals(false);restoreOption();by('groupNumber').value=state.settings.groups;renderHabChecks();openView('home');
