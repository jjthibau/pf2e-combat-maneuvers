import {SLUGS,DC,plan,nativeVariant,rollerToken} from './sources.js';
export const ID='pf2e-combat-maneuvers';
const rolling=new Set(),panels=new Map(),overrides=new Map(),escapeDCs=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const target=()=>game.user.targets.size===1&&game.user.targets.first().actor?.isOfType('creature')?game.user.targets.first():null;
const overrideFor=(a,s)=>overrides.get(a.uuid+':'+s)??'auto';
export async function roll(a,slug,{map=0,sourceId,event,escapeDC}={}){
 if(!a?.isOfType('character')||!a.isOwner)throw Error('You must own this character.');
 const selected=target();if(slug!=='escape'&&!selected||slug==='escape'&&game.user.targets.size>1)throw Error('Target exactly one creature, or clear targets for an Escape effect DC.');
 await Promise.all([rollerToken(a)?.animation,selected?.animation].filter(Boolean));
 const p=plan(a,slug,selected,map,sourceId??overrideFor(a,slug));if(!p.choice)throw Error(p.reason??'No available source.');
 if(rolling.has(a.uuid))return null;rolling.add(a.uuid);refresh();
 try{
  let dc=escapeDC??escapeDCs.get(a.uuid);
  if(slug==='escape'&&dc!==undefined&&(!Number.isFinite(dc)||dc<0))throw Error('Escape DC must be a nonnegative number.');
  if(slug==='escape'&&!selected&&dc===undefined){const value=await foundry.applications.api.DialogV2.prompt({window:{title:'Escape effect DC'},content:'<p>Enter the Escape DC of the object, spell, hazard, or other effect.</p><input name="escapeDC" type="number" min="0" step="1" required autofocus>',ok:{label:'Roll Escape',callback:(_event,button)=>{const input=button.form.elements.escapeDC;return input.checkValidity()?Number(input.value):false;}},rejectClose:false});if(value===null||value===false)return null;dc=value;}
  const results=await nativeVariant(a,slug,p.choice,selected).use({actors:[a],target:selected,multipleAttackPenalty:p.choice.penalty,event,...(slug==='escape'?{statistic:p.choice.statistic,...(dc!==undefined?{difficultyClass:{value:dc}}:{})}:{})});return {results,source:{id:p.choice.id,label:p.choice.label,penalty:p.choice.penalty,score:p.choice.score}};
 }
 finally{rolling.delete(a.uuid);refresh();}
}
function update(panel,a){
 const selected=target(),origin=rollerToken(a),distance=selected&&origin?origin.distanceTo(selected):null;
 panel.querySelector('[data-maneuver-status]').textContent=rolling.has(a.uuid)?'Roll pending':selected?`${Number.isFinite(distance)?distance+' ft to target':'Select character token'}`:'Target a creature';
 for(const slug of SLUGS){
  const row=panel.querySelector(`[data-maneuver-row="${slug}"]`),plans=[0,1,2].map(map=>plan(a,slug,selected,map,overrideFor(a,slug)));
  for(const[map,p]of plans.entries()){
   const b=row.querySelector(`[data-map="${map}"]`),detail=row.querySelector(`[data-source-label="${map}"]`),c=p.choice;
   const bonus=c?`${c.score>=0?'+':''}${c.score}`:'—';
   if(map)b.textContent=c?`${bonus} (MAP ${c.penalty})`:'—';
   else b.innerHTML=`<span class="name">${esc(game.i18n.localize(game.pf2e.actions.get(slug).name))}</span><span class="action-glyph">A</span>${bonus}`;
   detail.textContent=c?`${c.label} · ${c.reason}`:p.reason??'Unavailable';
   b.title=c?slug==='escape'?`${c.label}: ${c.reason}. Expected total modifier ${c.score}. Target Athletics DC or set an effect DC by expanding Escape.`:`${c.label}: ${c.reason}; ${c.reach} ft reach; ${c.distance} ft to target. Expected total modifier ${c.score}.`:p.reason??'Unavailable';
   b.disabled=!a.isOwner||(slug==='escape'?game.user.targets.size>1:!selected)||!c||rolling.has(a.uuid)||!!origin?.animation||!!selected?.animation;
  }
  const unavailable=plans.every(p=>!p.choice);row.querySelector('.maneuver-attacks').hidden=unavailable;row.querySelector('.maneuver-unavailable').hidden=!unavailable;row.querySelector('.maneuver-unavailable').textContent=plans[0].reason??'Unavailable';
  const select=panel.querySelector(`[data-source-override="${slug}"]`),current=overrideFor(a,slug);
  let html='<option value="auto">Automatic best option</option>'+plans[0].sources.map(s=>`<option value="${esc(s.id)}" ${s.inRange?'':'disabled'}>${esc(s.label)}${s.inRange?'':' (out of reach)'}</option>`).join('');
  if(current!=='auto'&&!plans[0].sources.some(s=>s.id===current))html+=`<option value="${esc(current)}" disabled>Unavailable source</option>`;
  if(select.innerHTML!==html)select.innerHTML=html;select.value=current;select.disabled=!a.isOwner;
 }
}
function refresh(){for(const[key,{panel,actor}]of panels){if(!panel.isConnected)panels.delete(key);else update(panel,actor);}}
function render(sheet,html){
 const actor=sheet.actor;if(!actor.isOfType('character'))return;
 const root=html instanceof HTMLElement?html:html[0],encounter=root.querySelector('.actions-panel[data-tab="encounter"]');if(!encounter)return;
 encounter.querySelector('.combat-maneuvers')?.remove();const panel=document.createElement('section');panel.className='combat-maneuvers';panel.setAttribute('aria-label','Combat Maneuvers');
 panel.innerHTML=`<header><h3>Combat Maneuvers</h3><span data-maneuver-status role="status" class="maneuver-status"></span></header><ol class="actions-list directory-list">${SLUGS.map(slug=>`<li class="strike maneuver-row" data-maneuver-row="${slug}"><div class="item-image framed"><img src="${esc(game.pf2e.actions.get(slug).img)}" alt=""></div><section><h4 class="name"><a data-maneuver-details="${slug}" role="button" tabindex="0" aria-expanded="false">${esc(game.i18n.localize(game.pf2e.actions.get(slug).name))}</a></h4><div class="button-group tags maneuver-attacks">${[0,1,2].map(map=>`<button type="button" class="tag tag_secondary" data-maneuver="${slug}" data-map="${map}" disabled></button>`).join('')}</div><span class="maneuver-unavailable" hidden></span></section><div class="maneuver-details item-summary" hidden>${slug==='escape'?'<p>Best of unarmed, Acrobatics or Athletics. Target Athletics DC by default.</p><label>Effect DC override <input data-escape-dc type="number" min="0" step="1" placeholder="Target Athletics DC"></label>':`<p>Athletics &middot; ${esc(game.i18n.localize(CONFIG.PF2E.saves[DC[slug]]))} DC</p>`}${[0,1,2].map(map=>`<p>${['First','Second','Third'][map]} attack: <span data-source-label="${map}"></span></p>`).join('')}</div></li>`).join('')}</ol><details class="maneuver-overrides"><summary>Source overrides</summary>${SLUGS.map(slug=>`<label>${esc(game.i18n.localize(game.pf2e.actions.get(slug).name))}<select data-source-override="${slug}" aria-label="${slug} source override"></select></label>`).join('')}</details>`;
 const strikes=encounter.querySelector('[data-strikes]');if(strikes)strikes.after(panel);else encounter.prepend(panel);
 panels.set(sheet.appId??sheet.id,{panel,actor});const dcInput=panel.querySelector('[data-escape-dc]');dcInput.value=escapeDCs.get(actor.uuid)??'';update(panel,actor);
 panel.addEventListener('change',e=>{if(e.target.matches('[data-escape-dc]')){if(e.target.value===''||!e.target.checkValidity())escapeDCs.delete(actor.uuid);else escapeDCs.set(actor.uuid,Number(e.target.value));}const s=e.target.dataset.sourceOverride;if(s){overrides.set(actor.uuid+':'+s,e.target.value);refresh();}});
 const toggleDetails=anchor=>{const details=anchor.closest('[data-maneuver-row]').querySelector('.maneuver-details');details.hidden=!details.hidden;anchor.setAttribute('aria-expanded',String(!details.hidden));};
 panel.addEventListener('keydown',e=>{const anchor=e.target.closest('[data-maneuver-details]');if(anchor&&['Enter',' '].includes(e.key)){e.preventDefault();toggleDetails(anchor);}});
 panel.addEventListener('click',async e=>{const anchor=e.target.closest('[data-maneuver-details]');if(anchor){e.preventDefault();e.stopPropagation();toggleDetails(anchor);return;}const b=e.target.closest('[data-maneuver]');if(!b)return;e.preventDefault();e.stopPropagation();try{await roll(actor,b.dataset.maneuver,{map:Number(b.dataset.map),event:e});}catch(error){ui.notifications.warn(error.message);}});
}
Hooks.once('ready',()=>{
 game.modules.get(ID).api={roll,plan:(a,s,map,source='auto')=>plan(a,s,target(),map,source)};
 Hooks.on('renderCharacterSheetPF2e',render);Hooks.on('closeCharacterSheetPF2e',s=>panels.delete(s.appId??s.id));
 for(const hook of ['targetToken','updateToken','controlToken','canvasReady','updateActor','createItem','updateItem','deleteItem'])Hooks.on(hook,refresh);
 const animations=new WeakSet();let refreshTimer;
 Hooks.on('refreshToken',(token,flags)=>{
  if(!flags.refreshPosition&&!flags.refreshSize&&!flags.refreshElevation)return;
  if(token.animation){if(!animations.has(token)){animations.add(token);token.animation.finally(()=>{animations.delete(token);refresh();});}}
  else{clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,40);}
 });
});
