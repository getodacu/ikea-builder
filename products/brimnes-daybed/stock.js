export const families={}, parts=new Map(), shapes={};
const identity=[0,0,0,1];
function stock(id,key,name,number,size,group,page,unpacked,role='kit') {
  families[key]??={name,number,group,page,role};
  shapes[key]??=size;
  parts.set(id,{id,family:key,shape:key,packet:group,unpacked,holes:[]});
  return id;
}
export const board=(id,key,name,size,group,page,stage)=>stock(id,key,name,null,size,group,page,stage);
const fittings={
  118331:['Small cam stud',[9,34,9],'118331 / 112996'],109542:['Long bearer screw',[9,34,9]],
  109567:['Caster / handle screw',[8,26,8]],102138:['Long center-runner screw',[8,20,8]],
  100372:['Short runner / hook screw',[8,15,8]],101345:['Small panel dowel',[8,30,8]],
  119030:['Small slotted cam',[15,12,15],'119030 / 118224'],111401:['Caster unit',[18,40,58]],
  110646:['Runner spacer',[17,10,17]],110525:['Flanged slat pin',[10,14,10]],105307:['Rail / slat screw',[8,12,8]],
  123660:['Bent slat hook',[3,15,45]],100049:['Large cam hex key',[38,6,100]],108490:['Sleeve hex key',[28,5,85]],
  114671:['Large cam stud',[12,52,12]],105163:['Lower rail machine screw',[10,15,10]],101359:['Large back-board dowel',[10,36,10]],
  130787:['Two-prong floor foot',[16,8,36]],114670:['Large hex-drive cam',[44,12,44]],
  100602:['Threaded sleeve',[11,16,11],'100602 / 117056'],130485:['Upper rail clip',[5,15,13]],
  110519:['Hammer-in back pin',[8,32,8]],100359:['Long brace screw',[9,15,9]],100365:['Short drawer-runner screw',[8,10,8]],
  112976:['Straight angle rail',[1880,28,22]],112978:['Bent-end front rail',[1913.5,50,20]],
  118301:['Slotted drawer-bottom brace',[16,18,562]],124328:['Drawer handle',[168,27,21],'124328 / 128763 / 145915 / 10050611 / 10121200'],
  CL:['Left cabinet runner · CL',[14,29,530],'139505 · CL'],CR:['Right cabinet runner · CR',[14,29,530],'139505 · CR'],
  DL:['Left drawer runner · DL',[14,29,530],'139505 · DL'],DR:['Right drawer runner · DR',[14,29,530],'139505 · DR']
};
const packets=[
  [[118331,14],[109542,6],[109567,12],[102138,6],[100372,6],[101345,24],[119030,14],[111401,6],[110646,6],[110525,18],[105307,22]],
  [[123660,2],[105307,25],[100049,1],[108490,1],[114671,4],[100372,4],[105163,2],[101359,4],[130787,4],[114670,4],[100602,2],[110525,11],[130485,2]],
  [[110519,8],[118331,8],[109567,4],[101345,8],[119030,8],[100359,4],[100365,12]],
  [[112976,3],[112978,1],[118301,2],[124328,2],['CL',2],['CR',2],['DL',2],['DR',2]]
];
const serial={};
for(const [packet,rows] of packets.entries()) {
  const group=packet===3?'Loose fittings':`Packet ${packet+1}`;
  for(const [row,[code,count]] of rows.entries()) {
    const key=String(code), [name,size,number=key]=fittings[key];
    for(let i=0;i<count;i++) {
      serial[key]=(serial[key]??0)+1;
      let x=-2160+packet*530+(row%3)*167+(i%4)*34, z=640+Math.floor(row/3)*284+Math.floor(i/4)*35;
      if(packet===3) {
        if(row<2) { x=500; z=-580+serial[key]*52+row*184; }
        else if(row===3) { x=1590; z=-420+i*48; }
        else { x=1160+row*98+i*36; z=-20; }
      }
      stock(`${key}-${serial[key]}`,key,name,number,size,group,[3,4,4,5][packet],
        [x,size[1]/2+2,z,...identity],['100049','108490'].includes(key)?'tool':'kit');
    }
  }
}
