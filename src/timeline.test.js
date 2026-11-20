import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompiler, sample } from './timeline.js';

function assembly(id, number) {
  const start = [0,20,0,0,0,0,1], end = [0,10,0,0,0,0,1];
  const families = { board:{number:null,role:'kit'} };
  const shapes = { board:[40,20,40] };
  const parts = new Map([[id,{id,family:'board',shape:'board',unpacked:start}]]);
  const axis = [0,-1,0];
  const operations = [{kind:'place',ids:[id],prerequisites:[],poses:[[start,end]],axes:[axis],
    joint:{target:[0,10,0],axis,outward:[0,1,0],caption:'Seat board'}}];
  return createCompiler({families,parts,shapes},()=>[{number,operations}]);
}

test('compiled products keep their own unbox, printed steps and installed IDs',()=>{
  const compileA=assembly('alpha',4), compileB=assembly('bravo',9);
  const a=compileA({}), b=compileB({});
  assert.deepEqual(a.order,[0,4]);
  assert.deepEqual(b.order,[0,9]);
  for (const [t,id] of [[a,'alpha'],[b,'bravo'],[a,'alpha'],[b,'bravo']]) {
    const unbox=sample(t,0,1);
    assert.deepEqual(Object.keys(unbox.poses),[id]);
    assert.deepEqual(unbox.installed,[]);
    assert.ok(Object.isFrozen(unbox.poses[id]));
    assert.deepEqual(sample(t,t.order.at(-1),1).installed,[id]);
  }
  assert.strictEqual(sample(a,0,0),sample(compileA({}),0,1));
  assert.throws(()=>sample(a,9,1),RangeError);
  assert.throws(()=>sample(b,4,1),RangeError);
});

test('a separately sold panel installs and travels with its supplied frame, unlike a tool',()=>{
  const pose=(x,y)=>[x,y,0,0,0,0,1];
  const down=[0,-1,0], right=[1,0,0];
  const frame=pose(0,10), panel=pose(0,14), movedFrame=pose(30,10), movedPanel=pose(30,14);
  const parts=new Map([
    ['frame',{id:'frame',family:'frame',shape:'frame',unpacked:pose(-60,10)}],
    ['panel',{id:'panel',family:'panel',shape:'panel',unpacked:pose(60,10)}]
  ]);
  const shapes={frame:[40,20,40],panel:[36,4,36]};
  const place=(id,prerequisites,end)=>({
    kind:'place',ids:[id],prerequisites,poses:[[pose(0,50),end]],axes:[down],
    joint:{target:end.slice(0,3),axis:down,outward:[0,1,0]}
  });
  const move={
    kind:'move',ids:['frame','panel'],prerequisites:[],poses:[[frame,movedFrame],[panel,movedPanel]],axes:[right,right],
    joint:{target:[30,10,0],axis:right,outward:[-1,0,0]},
    rigid:{anchor:'frame',frames:[frame,movedFrame],offsets:[pose(0,0),pose(0,4)]}
  };
  const compile=role=>createCompiler({parts,shapes,families:{frame:{number:null,role:'kit'},panel:{number:null,role}}},()=>[
    {number:1,operations:[place('frame',[],frame)]},
    {number:2,operations:[place('panel',['frame'],panel)]},
    {number:3,operations:[move]}
  ])({});
  const timeline=compile('external');
  assert.deepEqual(sample(timeline,2,1).installed,['frame','panel']);
  assert.deepEqual(sample(timeline,2,1).poses,{frame,panel});
  const {t0,t1}=timeline.steps.get(3).events[0];
  const mid=sample(timeline,3,(t0+t1)/2).poses;
  assert.ok(Math.abs(mid.frame[0]-15)<1e-9);
  assert.deepEqual(mid.panel.map((v,i)=>v-mid.frame[i]),[0,4,0,0,0,0,0]);
  assert.deepEqual(sample(timeline,3,1).poses,{frame:movedFrame,panel:movedPanel});
  assert.throws(()=>compile('tool'),/Step 2: invalid place of panel/);
});
