const STORAGE_KEY='friendsgiving-rsvps-v1';
const $=id=>document.getElementById(id);
const fields=['recordId','name','rsvp','partySize','arrivalDate','arrivalTime','departureDate','dietary','bringing','kids','babyGear','themeSuggestion','notes'];
let records=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(records));render();};
const fmtDate=v=>{if(!v)return '—';const [y,m,d]=v.split('-');return new Date(Date.UTC(+y,+m-1,+d)).toLocaleDateString(undefined,{month:'short',day:'numeric'});};
const fmtTime=v=>{if(!v)return '';const [h,m]=v.split(':');const dt=new Date();dt.setHours(+h,+m);return dt.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});};
function render(){
 const q=$('search').value.trim().toLowerCase();
 const filtered=records.filter(r=>r.name.toLowerCase().includes(q));
 $('guestRows').innerHTML=filtered.map(r=>`<tr data-id="${r.id}"><td><strong>${escapeHtml(r.name)}</strong></td><td><span class="pill">${r.rsvp}</span></td><td>${r.partySize}</td><td>${fmtDate(r.arrivalDate)} ${fmtTime(r.arrivalTime)}</td><td>${(r.overnightNights||[]).join(', ')||'No'}</td><td>${escapeHtml(r.dietary||'—')}</td><td>${escapeHtml(r.bringing||'—')}</td></tr>`).join('');
 $('emptyState').classList.toggle('hidden',filtered.length>0);
 document.querySelectorAll('#guestRows tr').forEach(tr=>tr.addEventListener('click',()=>openEdit(tr.dataset.id)));
 const yes=records.filter(r=>r.rsvp==='Yes');
 $('guestCount').textContent=yes.reduce((a,r)=>a+(+r.partySize||0),0);
 $('overnightCount').textContent=yes.filter(r=>(r.overnightNights||[]).length).reduce((a,r)=>a+(+r.partySize||0),0);
 $('dietCount').textContent=yes.filter(r=>r.dietary.trim()).length;
 $('dishCount').textContent=yes.filter(r=>r.bringing.trim()).length;
 const arrivals=[...yes].filter(r=>r.arrivalDate||r.arrivalTime).sort((a,b)=>(a.arrivalDate+a.arrivalTime).localeCompare(b.arrivalDate+b.arrivalTime));
 $('arrivalList').innerHTML=arrivals.length?arrivals.map(r=>`<div class="item"><strong>${escapeHtml(r.name)}</strong><span>${fmtDate(r.arrivalDate)} ${fmtTime(r.arrivalTime)}</span></div>`).join(''):'<p>No arrival times yet.</p>';
 const overnight=yes.filter(r=>(r.overnightNights||[]).length);
 $('overnightList').innerHTML=overnight.length?overnight.map(r=>`<div class="item"><strong>${escapeHtml(r.name)}</strong><span>${r.partySize} in party · ${(r.overnightNights||[]).join(' & ')}${r.departureDate?' · Leaving '+fmtDate(r.departureDate):''}</span></div>`).join(''):'<p>No overnight guests yet.</p>';
 const themeCounts={}; yes.forEach(r=>{(r.dinnerThemes||[]).forEach(t=>themeCounts[t]=(themeCounts[t]||0)+1);if((r.themeSuggestion||'').trim()){const t=r.themeSuggestion.trim();themeCounts[t]=(themeCounts[t]||0)+1;}}); const themes=Object.entries(themeCounts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])); $('themeResults').innerHTML=themes.length?themes.map(([t,n])=>`<div class="item theme-result"><b>${escapeHtml(t)}</b><span class="theme-count">${n} vote${n===1?'':'s'}</span></div>`).join(''):'<p>No dinner theme votes yet.</p>';
 const food=yes.filter(r=>(r.dietary||'').trim()||(r.bringing||'').trim());
 $('foodList').innerHTML=food.length?food.map(r=>`<div class="item"><strong>${escapeHtml(r.name)}</strong><span>${r.dietary?('Dietary: '+escapeHtml(r.dietary)):'No dietary notes'}${r.bringing?('<br>Bringing: '+escapeHtml(r.bringing)):''}</span></div>`).join(''):'<p>No food notes yet.</p>';
}
function escapeHtml(v=''){return v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function setOvernightChecks(values=[]){document.querySelectorAll('input[name="overnightNight"]').forEach(cb=>cb.checked=values.includes(cb.value));}
function setThemeChecks(values=[]){document.querySelectorAll('input[name="dinnerTheme"]').forEach(cb=>cb.checked=values.includes(cb.value));}
function openNew(){ $('rsvpForm').reset(); setThemeChecks([]); setOvernightChecks([]); $('recordId').value=''; $('partySize').value='1'; $('dialogTitle').textContent='Add RSVP'; $('deleteBtn').classList.add('hidden'); $('rsvpDialog').showModal();}
function openEdit(id){const r=records.find(x=>x.id===id); if(!r)return; fields.forEach(f=>{if($(f))$(f).value=r[f]??'';}); setThemeChecks(r.dinnerThemes||[]); setOvernightChecks(r.overnightNights||[]); $('dialogTitle').textContent='Update RSVP'; $('deleteBtn').classList.remove('hidden'); $('rsvpDialog').showModal();}
$('rsvpForm').addEventListener('submit',e=>{e.preventDefault(); const data={}; fields.forEach(f=>data[f]=$(f).value); data.dinnerThemes=[...document.querySelectorAll('input[name="dinnerTheme"]:checked')].map(cb=>cb.value); data.overnightNights=[...document.querySelectorAll('input[name="overnightNight"]:checked')].map(cb=>cb.value); data.id=data.recordId||crypto.randomUUID(); delete data.recordId; const i=records.findIndex(r=>r.id===data.id); if(i>=0)records[i]=data; else records.push(data); save(); $('rsvpDialog').close();});
$('deleteBtn').addEventListener('click',()=>{const id=$('recordId').value;if(id&&confirm('Delete this RSVP?')){records=records.filter(r=>r.id!==id);save();$('rsvpDialog').close();}});
$('addGuestBtn').addEventListener('click',openNew);
$('closeDialog').addEventListener('click',()=>$('rsvpDialog').close());
$('cancelBtn').addEventListener('click',()=>$('rsvpDialog').close());
$('search').addEventListener('input',render);
render();