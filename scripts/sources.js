// Scoped Foundry14/PF2e8.6 adapter: no global action, actor or prototype patches.
export const SLUGS=['trip','grapple','shove','disarm','reposition','escape'];
export const DC={trip:'reflex',grapple:'fortitude',shove:'fortitude',disarm:'reflex',reposition:'fortitude',escape:'athletics'};
function escapeContext(a,statistic,target,penalty=0){
 const variant=new (game.pf2e.actions.get('escape').constructor)().toActionVariant();
 const modifiers=penalty?[new game.pf2e.Modifier({slug:'multiple-attack-penalty',label:'PF2E.MultipleAttackPenalty',modifier:penalty})]:[];
 return variant.checkContext({actor:a,target:target?.actor,buildContext:args=>({item:args.item,rollOptions:[...args.rollOptions,...variant.traits]})},{slug:statistic,rollOptions:variant.rollOptions,modifiers});
}
const traitsFor=s=>s==='trip'?['trip','ranged-trip']:s==='reposition'?[]:[s];
export function rollerToken(a){
 const controlled=canvas.tokens?.controlled.filter(t=>t.actor?.uuid===a.uuid)??[];
 if(controlled.length===1)return controlled[0];
 const active=a.getActiveTokens(true).filter(t=>t.scene?.id===canvas.scene?.id);
 return active.length===1?active[0]:null;
}
function freeHands(a){
 // Native handsFree ignores shields for casting; handsReallyFree counts them.
 return a.handsReallyFree+a.inventory.contents.filter(i=>i.isOfType('weapon')&&i.traits.has('free-hand')).reduce((n,i)=>n+i.handsHeld,0);
}
export function sources(a,slug,target){
 if(slug==='escape')return {sources:['unarmed','acrobatics','athletics'].flatMap(statistic=>{try{const context=escapeContext(a,statistic,target);return context?[{id:statistic,statistic,label:statistic==='unarmed'?game.i18n.localize('PF2E.TraitUnarmed'):a.getStatistic(statistic).label,kind:'escape',inRange:true}]:[];}catch{return [];}}),reason:null};
 const origin=rollerToken(a);
 if(!origin||!target||origin===target)return {sources:[],reason:!origin?'Select this character’s token on the scene.':origin===target?'Target another creature.':'Target one creature.'};
 const entries=a.system.actions??[],fist=entries.find(s=>s.item.slug==='basic-unarmed'||s.item.baseType==='fist'),choices=[];
 if(freeHands(a)>0&&fist)choices.push({id:'free-hand',item:fist.item,label:'Free hand',kind:'hand'});
 for(const s of entries){const i=s.item;if(!s.ready||!i.isOfType('weapon')||!traitsFor(slug).some(t=>i.traits.has(t))||i.system.graspingAppendage&&freeHands(a)<1)continue;
  if(!choices.some(c=>c.item.uuid===i.uuid&&c.kind==='weapon'))choices.push({id:i.id,item:i,label:i.name,kind:'weapon'});
 }
 for(const c of choices){c.agile=c.item.traits.has('agile');c.ranged=c.kind==='weapon'&&c.item.traits.has('ranged-trip')&&c.item.isRanged;c.reach=c.ranged?c.item.range?.increment:a.getReach({action:'attack',weapon:c.item});c.distance=origin.distanceTo(target,{reach:c.reach});c.inRange=Number.isFinite(c.distance)&&Number.isFinite(c.reach)&&c.distance<=c.reach;}
 return {sources:choices,reason:!choices.length?'No available hand or qualifying weapon.':choices.every(c=>!c.inRange)?'Out of reach.':null};
}
function sourceModifiers(a,c){
 const mods=[];
 if(c.kind==='weapon'){
  const abp=game.pf2e.settings.variants.abp!=='noABP'&&!a.flags.pf2e?.disableABP;
  const value=abp?a.synthetics.weaponPotency['strike-attack-roll']?.[0]?.bonus??0:c.item.system.runes.potency;
  if(value)mods.push(new game.pf2e.Modifier({slug:'potency',label:abp?'PF2E.AutomaticBonusProgression.attackPotency':'PF2E.Item.Weapon.Rune.Potency',modifier:value,type:abp?'potency':'item'}));
 }
 if(c.ranged)mods.push(new game.pf2e.Modifier({slug:'ranged-trip',label:'PF2E.TraitRangedTrip',modifier:-2,type:'circumstance'}));
 return mods;
}
function optionsFor(a,slug,c,target){return [...a.getRollOptions(['all','skill-check','athletics','attack']),`action:${slug}`,'attack',...c.item.getRollOptions('item'),...c.item.traits,...target.actor.getSelfRollOptions('target')];}
export function evaluateSource(a,slug,c,target,map){
 if(slug==='escape'){const penalty=-5*map,context=escapeContext(a,c.statistic,target,penalty);return {...c,penalty,score:context.statistic.totalModifier,reason:'Escape (standard MAP)'};}
 const stat=a.getStatistic('athletics'),options=optionsFor(a,slug,c,target);
 const preview=stat.extend({domains:[...new Set([...stat.domains,'attack'])]});
 const native=preview.getChatData({item:c.item,target:target.actor,extraRollOptions:options});
 let maps=[0,native.check.map1,native.check.map2],reason=c.agile?'Agile':'Standard';
 const feat=a.itemTypes.feat.find(f=>f.slug==='agile-maneuvers'&&!f.suppressed),remaster=feat?.system.publication.remaster;
 if(feat&&(remaster||['trip','grapple','shove'].includes(slug))){
  const step=remaster&&c.agile&&a.getRollOptions(['all']).includes('self:effect:panache')?3:4;
  maps=[0,Math.max(maps[1],-step),Math.max(maps[2],-step*2)];reason=step===3?'Agile Maneuvers + Panache':'Agile Maneuvers';
 }
 const penalty=maps[map],mods=sourceModifiers(a,c);
 if(penalty)mods.push(new game.pf2e.Modifier({slug:'multiple-attack-penalty',label:'PF2E.MultipleAttackPenalty',modifier:penalty}));
 const score=preview.extend({modifiers:mods}).getChatData({item:c.item,target:target.actor,extraRollOptions:options}).check.mod;
 return {...c,penalty,score,reason};
}
export function plan(a,slug,target,map,override='auto'){
 if(!SLUGS.includes(slug)||![0,1,2].includes(map))throw Error('Invalid maneuver or attack number.');
 const available=sources(a,slug,target);
 const ranked=available.sources.filter(c=>c.inRange&&(override==='auto'||c.id===override)).map(c=>evaluateSource(a,slug,c,target,map));
 ranked.sort((a,b)=>b.score-a.score||Number(a.kind!=='hand')-Number(b.kind!=='hand')||a.label.localeCompare(b.label));
 return {choice:ranked[0]??null,sources:available.sources,reason:ranked.length?null:override!=='auto'?'Selected source is unavailable.':available.reason};
}
export function nativeVariant(a,slug,choice,target){
 if(slug==='escape')return new (game.pf2e.actions.get('escape').constructor)().toActionVariant();
 const action=game.pf2e.actions.get(slug),NativeAction=game.pf2e.actions.get('reposition').constructor;
 const adapted=new NativeAction({cost:action.cost,description:action.description,img:action.img,name:action.name,slug,traits:action.traits,statistic:'athletics',difficultyClass:DC[slug],notes:foundry.utils.deepClone(action.notes),rollOptions:action.rollOptions,modifiers:action.modifiers});
 const variant=adapted.toActionVariant(),nativeContext=variant.checkContext.bind(variant);
 variant.checkContext=(opts,data)=>{
  const context=nativeContext(opts,{...data,item:choice.item,modifiers:[...(data.modifiers??[]),...sourceModifiers(a,choice)],rollOptions:[...data.rollOptions,...optionsFor(a,slug,choice,target)]});
  if(context?.statistic?.extend)context.statistic=context.statistic.extend({domains:[...new Set([...context.statistic.domains,'attack'])]});
  return context;
 };
 return variant;
}
