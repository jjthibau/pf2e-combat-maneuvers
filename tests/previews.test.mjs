import assert from 'node:assert/strict';
import {test} from 'node:test';
import {evaluateSource,nativeVariant} from '../scripts/sources.js';

class Action {
  constructor(data){Object.assign(this,data);}
  toActionVariant(){return {checkContext:(_options,data)=>data};}
}
class Modifier {constructor(data){Object.assign(this,data);}}
const actions=new Map([
  ['reposition',new Action({rollOptions:[],notes:[]})],
  ['trip',new Action({rollOptions:['inflicts:prone'],notes:[]})],
  ['shove',new Action({rollOptions:['forced-movement'],notes:[]})],
]);
globalThis.game={pf2e:{actions,Modifier,settings:{variants:{abp:'noABP'}}}};
globalThis.foundry={utils:{deepClone:structuredClone}};

const actor={flags:{},itemTypes:{feat:[]},getRollOptions:()=>[],getStatistic:()=>statistic()};
const target={actor:{getSelfRollOptions:()=>[]}};
function statistic(modifiers=[]){
  return {domains:['athletics'],extend:data=>statistic(data.modifiers??modifiers),getChatData({extraRollOptions}){
    const eligible=extraRollOptions.some(option=>['inflicts:prone','forced-movement'].includes(option))&&extraRollOptions.includes('item:id:weapon-a');
    return {check:{map1:-5,map2:-10,mod:14+(eligible?2:0)+modifiers.reduce((sum,mod)=>sum+mod.modifier,0)}};
  }};
}
const source=id=>({kind:'weapon',item:{system:{runes:{potency:0}},traits:new Set(),getRollOptions:()=>[`item:id:${id}`]}});

test('Trip and Shove preview all MAP totals with the native action option and exact weapon',()=>{
  for (const [slug,option] of [['trip','inflicts:prone'],['shove','forced-movement']]) {
    for(const [id,expected] of [['weapon-a',[16,11,6]],['weapon-b',[14,9,4]]]){
      const choice=source(id);
      assert.deepEqual([0,1,2].map(map=>evaluateSource(actor,slug,choice,target,map).score),expected);
      const context=nativeVariant(actor,slug,choice,target).checkContext({}, {rollOptions:[option]});
      assert.equal(context.rollOptions.filter(value=>value===option).length,1);
      assert.ok(context.rollOptions.includes(`item:id:${id}`));
    }
  }
});
