import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(...a)=>new Vector3(...a);
const q=p=>new Quaternion().fromArray(p,3);
const xyz=p=>new Vector3().fromArray(p);
const nearby=(a,b)=>assert.ok(a.distanceTo(b)<1e-6,`${a.toArray()} != ${b.toArray()}`);
function mount(factory,id,pose) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(pose);
  node.quaternion.fromArray(pose,3);
  node.updateMatrixWorld(true);
  return node;
}
const hits=(node,origin,direction)=>new Raycaster(origin,direction,0,90).intersectObject(node,true);

test('p. 17 wall attachment is through both keyed holes in the upper rear stretcher',()=>{
  const t=compile({}), end=sample(t,21,1).poses, factory=createGeometry();
  try {
    const upper=mount(factory,'wallBrace',end.wallBrace), lower=mount(factory,'lowerBrace',end.lowerBrace);
    const rear=v(0,0,-1);
    for(const [i,x] of [-270,270].entries()) {
      const id=`wall-${i+1}`;
      nearby(xyz(end[id]),v(x,1008,-127));
      nearby(v(0,-1,0).applyQuaternion(q(end[id])),rear);
      assert.equal(hits(upper,v(x,1008,-105),rear).length,0,'Wall screw centre is a through opening');
      assert.ok(hits(upper,v(x+11,1008,-105),rear).length,'Adjacent stretcher material is intact');
      assert.ok(hits(lower,v(x,521,-105),rear).length,'Do not anchor through the lower stretcher');
    }
  } finally { factory.dispose(); }
});

test('pp. 9, 18, 21: lower pins turn on fixed axes and high stops trace the cut slots',()=>{
  const t=compile({}), end=sample(t,28,1).poses, factory=createGeometry();
  try {
    for(const [i,[bay,y]] of [['lower',147],['upper',635]].entries()) {
      const turn=t.steps.get(28).events[i*2+1];
      const states=[turn.before,sample(t,28,(turn.t0+turn.t1)/2),turn.after];
      assert.deepEqual(turn.joint.axis,[1,0,0]);
      assert.ok(states[0].poses[`${bay}Front`][2]>states[1].poses[`${bay}Front`][2]);
      assert.ok(states[1].poses[`${bay}Front`][2]>states[2].poses[`${bay}Front`][2]);
      for(const [sign,side,pivot,stop] of [[-1,'L',1+i,1+i],[1,'R',3+i,3+i]]) {
        const cheek=`${bay}Cheek${side}`, receiver=`110364-${pivot}`, stopPin=`116713-${stop}`, out=v(sign,0,0);
        nearby(xyz(end[receiver]),v(sign*391,y,112));
        nearby(xyz(end[stopPin]),v(sign*397,y+245,57));
        nearby(v(0,1,0).applyQuaternion(q(end[stopPin])),out.clone().negate());
        const bracket=mount(factory,receiver,end[receiver]);
        assert.equal(hits(bracket,v(sign*372,y,112),out).length,0,'Lower bracket is open at the pivot');
        assert.equal(hits(bracket,v(sign*372,y,122),out).length,0,'Pivot can enter the front notch');
        assert.ok(hits(bracket,v(sign*372,y,103),out).length,'There is backing under the pivot opening');
        for(const {poses} of states) {
          const p=poses[cheek], node=mount(factory,cheek,p);
          const axisPoint=v(0,-191,113).applyQuaternion(q(p)).add(xyz(p));
          nearby(axisPoint,v(sign*381,y,112));
          assert.ok(hits(node,v(sign*392,y+24,112),v(0,-1,0)).length,'Moulded pin projects outward at the axis');
          assert.equal(hits(node,v(sign*359,y+245,57),out).length,0,'Upper fixed pin is in the curved slot throughout rotation');
          assert.ok(hits(node,v(sign*359,y+260,57),out).length,'Material immediately outside the swept slot');
        }
      }
    }
  } finally { factory.dispose(); }
});

test('pp. 10, 23, 24: handed opposite roller ends seat the separate top drawer',()=>{
  const t=compile({}), end=sample(t,37,1).poses, factory=createGeometry();
  try {
    const event=t.steps.get(37).events[0];
    assert.deepEqual(event.op.prerequisites,['caseRunnerL','caseRunnerR']);
    assert.ok(event.ids.includes('drawerRunnerL')&&event.ids.includes('drawerRunnerR'));
    assert.ok(event.ids.every(id=>!id.startsWith('lower')&&!id.startsWith('upper')));
    nearby(xyz(end.drawerFront),v(0,1155,132));
    const first=(event.t1-event.t0)/4;
    const poised=sample(t,37,event.t0+2*first).poses;
    assert.ok(q(poised.drawerFront).angleTo(q(end.drawerFront))>.12,'P. 24 tips the drawer before leveling it');
    const engaged=sample(t,37,event.t0+3*first).poses;
    for(const side of ['L','R']) {
      const sign=side==='L'?-1:1;
      for(const [id,x,z] of [[`caseRunner${side}`,sign*390,94],[`drawerRunner${side}`,sign*394,-106]]) {
        const rail=mount(factory,id,end[id]);
        const wheel=rail.children.find(mesh=>mesh.geometry.type==='CylinderGeometry'&&mesh.geometry.parameters.radiusTop===10);
        assert.ok(wheel);
        nearby(wheel.getWorldPosition(v()),v(x,1117,z));
      }
      const id=`drawerRunner${side}`;
      nearby(xyz(engaged[id]).sub(xyz(end[id])),v(0,0,205));
    }
  } finally { factory.dispose(); }
});
