import { sample } from './timeline.js';
import { manualPath } from '../products/catalog.js';

const $ = id => document.getElementById(id);
const element = (tag,text) => Object.assign(document.createElement(tag),{textContent:text});
const nn = n => String(n).padStart(2,'0');
export function mountGuide(slug,entry,product) {
  const {families,parts,steps,compile,chapters,groupOrder,unbox,manualNotes=[],manualLinks=[],
    references={},choices=[],skippedLabels={}}=product;
  const {manual,previewPages}=entry;
  const pageLink = page => `${manual.url}#page=${page}`;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen=matchMedia('(max-width: 760px), (max-height: 480px)');
  const route=Object.fromEntries(choices.map(({key,initial})=>[key,initial])), confirmed=new Set();
  const stepByNumber=new Map([[0,unbox],...steps.map(step=>[step.number,step])]);
  const printedOrder=[...stepByNumber.keys()];
  const view=$('view'), heading=$('action-title'), counts=$('placed'), partsSheet=$('parts'), chooser=$('inspect');
  const stage=$('stage'), rail=heading.closest('.rail'), chapterStrip=$('chapters');
  const replay=$('replay'), back=$('back'), next=$('next'), jump=$('jump'), jumpList=$('jump-list');
  const useButton=$('use-demo');
  const preview=$('page-preview'), thumb=$('page-preview-thumb'), previewLabel=$('page-preview-label');
  const previewDialog=$('page-preview-dialog'), fullPage=$('page-preview-full'), previewError=$('page-preview-error');
  const localManual=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const manualAssets=`./${manualPath(slug,manual)}`;
  const reduced = () => motion.matches || !scene;
  let timeline=compile(route), number=0, progress=1, phase='end', scene, animation=0, clock=null;
  let chosen=null, jumpChapter=0, lastCount=-1, complete=false, disposed=false;
  let previewPage, completedFrame, demo, showingDemo=false;

  const inventory=new Map(), groups=new Map();
  const externalGroup='Required, not supplied';
  const packet = p => families[p.family].role==='external' ? externalGroup : p.packet;
  let suppliedCount=parts.size;
  for (const p of parts.values()) {
    if(!inventory.has(p.family)) inventory.set(p.family,[]);
    inventory.get(p.family).push(p.id);
    const group=packet(p);
    if(families[p.family].role==='external') suppliedCount--;
    groups.set(group,(groups.get(group)??0)+1);
  }
  const selectedChapter = () => chapters.findIndex(([,a,b])=>number>=a&&number<=b);
  const orderRank = name => { const i=groupOrder.indexOf(name); return i<0 ? groupOrder.length : i; };
  const inventoryRows = [...groups].sort(([a],[b])=>orderRank(a)-orderRank(b));
  const optionGroups=new Map();
  chooser.add(new Option(suppliedCount===parts.size?'All supplied parts':'All staged parts',''));
  for (const [family,ids] of inventory) {
    const item=families[family];
    const group=item.role==='external'?externalGroup:item.group;
    if(!optionGroups.has(group)) {
      const g=document.createElement('optgroup'); g.label=group; optionGroups.set(group,g);
    }
    const code=item.number ? ` · ${item.number}` : '';
    const role=item.role==='kit'?'':` · ${item.role}`;
    optionGroups.get(group).append(new Option(`${ids.length} × ${item.name}${code}${role}`,family));
  }
  for (const [group] of inventoryRows) if(optionGroups.has(group)) chooser.append(optionGroups.get(group));
  for (const g of optionGroups.values()) if(!g.parentNode) chooser.append(g);

  function link(label,p) {
    return Object.assign(element('a',label),{href:typeof p==='number'?pageLink(p):p,target:'_blank',rel:'noopener'});
  }
  $('edition').textContent=`Edition ${manual.id}`;
  $('manual-notes').replaceChildren(...manualNotes.map(text=>element('p',text)));
  $('manual-pages').hidden=!manualLinks.length;
  for (const [label,p] of manualLinks) {
    const li=document.createElement('li'); li.append(link(typeof p==='number'?`${label} · p. ${p}`:label,p)); $('manual-pages').append(li);
  }

  const choiceFields=choices.map(choice=>{
    const {key,legend,options}=choice;
    const fieldset=document.createElement('fieldset');
    fieldset.hidden=true; fieldset.append(element('legend',legend));
    const inputs=options.map(([value,label],index)=>{
      const input=Object.assign(document.createElement('input'),{type:'radio',name:key,value:String(index)});
      input.addEventListener('change',()=>{
        confirmed.add(key);
        route[key]=value;
        timeline=compile(route);
        select(number);
      });
      const row=element('label',''); row.append(input,` ${label}`); fieldset.append(row);
      return input;
    });
    $('choices').append(fieldset);
    return {...choice,fieldset,inputs};
  });
  const unconfirmed = () => choiceFields.find(x=>x.step===number && x.requireExplicit && !confirmed.has(x.key));
  const hasGate = () => choiceFields.some(x=>x.step===number && x.requireExplicit);
  const lastStep = () => timeline.order.at(-1);
  const nextStep = () => timeline.order[timeline.order.indexOf(number)+1];

  const chapterButtons=chapters.map(([label,a,b],i)=>{
    const button=document.createElement('button'); button.type='button'; button.setAttribute('aria-controls','jump');
    button.append(element('span',a===b?nn(a):`${nn(a)}—${nn(b)}`),element('span',label));
    button.addEventListener('click',()=>{
      const wasOpen=jump.open && jumpChapter===i;
      jumpChapter=i; renderJump(); jump.open=!wasOpen; syncChapters();
    });
    chapterStrip.append(button); return button;
  });
  function syncChapters() {
    const current=selectedChapter();
    chapterButtons.forEach((b,i)=>{
      if(i===current) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current');
      b.setAttribute('aria-expanded',String(jump.open&&i===jumpChapter));
      b.classList.toggle('is-past',i<current);
    });
  }
  function revealChapter() {
    const strip=chapterStrip.getBoundingClientRect(), chip=chapterButtons[selectedChapter()].getBoundingClientRect();
    chapterStrip.scrollLeft+=chip.left<strip.left ? chip.left-strip.left : Math.max(0,chip.right-strip.right);
  }
  function renderJump() {
    const [chapter,first,last]=chapters[jumpChapter];
    $('jump-title').textContent=`Jump to a step · ${chapter}`;
    const rows=[];
    for(const n of printedOrder) {
      if(n<first || n>last) continue;
      const li=document.createElement('li'), button=document.createElement('button');
      button.type='button'; button.dataset.step=n;
      button.append(element('strong',nn(n)),stepByNumber.get(n).title);
      if(!complete && n===number) button.setAttribute('aria-current','step');
      if(!timeline.order.includes(n)) {
        button.disabled=true;
        if(skippedLabels[n]) button.append(element('small',skippedLabels[n]));
      }
      li.append(button); rows.push(li);
    }
    jumpList.replaceChildren(...rows);
  }
  jump.addEventListener('toggle',()=>{if(jump.open) resetDemo(); syncChapters();});
  jumpList.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button || button.disabled) return;
    jump.open=false; select(Number(button.dataset.step),false,true);
  });

  function showParts(record) {
    const added=new Set(), reused=new Set();
    if(record) for(const {kind,ids,rigid} of record.events) {
      if(kind==='place') for(const id of ids) added.add(id);
      else if(kind==='move') reused.add(rigid.anchor);
      else for(const id of ids) reused.add(id);
    }
    const rows = record ? record.parts.flatMap(row=>{
      const f=families[row.family], shown=row.ids.filter(id=>reused.has(id)&&!added.has(id)).length;
      const qty=[row.added?`${row.added} new`:'',shown?`${shown} reused`:''].filter(Boolean).join(' · ');
      return qty?[[f.name,f.number,f.role==='external'?`${qty} · not supplied`:qty]]:[];
    }) : inventoryRows.map(([name,count])=>[name,null,String(count)]);
    $('part-rows').replaceChildren(...rows.map(([name,code,qty])=>{
      const li=document.createElement('li'), text=element('span',name);
      if(code) text.append(element('small',code));
      li.append(text,element('span',qty)); return li;
    }));
    $('inventory').hidden=Boolean(record);
    $('parts-label').textContent=record?'Parts for this step':'Parts';
    $('parts-total').textContent=record?(added.size?`${added.size} to add`:'No new parts'):`${suppliedCount} supplied`;
  }
  chooser.addEventListener('change',()=>{
    if(number!==0) return;
    chosen=chooser.value||null;
    const info=$('inspect-info'); info.hidden=!chosen;
    if(chosen) {
      const f=families[chosen], values=inventory.get(chosen);
      const stockGroups=[...new Set(values.map(id=>packet(parts.get(id))))].join(' + ');
      info.replaceChildren(`${values.length} × ${f.name}. ${stockGroups}. `,link('Source callout',f.page),'.');
    }
    scene?.inspect(chosen);
  });
  function clearInspect() {
    if(chosen) scene?.inspect(null);
    chosen=null; chooser.value=''; $('inspect-info').hidden=true;
  }

  function renderRecord() {
    const record=timeline.steps.get(number), {page,title,action,warning}=record??unbox;
    heading.textContent=complete?'Assembly complete':title;
    $('action-text').textContent=complete
      ? `Review the completed ${entry.name} assembly for this configuration. Follow the official IKEA manual for installation and use.` : action;
    $('chapter-tag').textContent=complete?'Complete':`${nn(selectedChapter())} / ${chapters[selectedChapter()][0]}`;
    $('source-label').textContent=complete?'Last assembly page':'Official page';
    $('official-page').href=pageLink(page); $('page-number').textContent=`p. ${page}`;
    const referenceList=$('step-references'), sourceLinks=references[number]??[];
    referenceList.hidden=!sourceLinks.length;
    referenceList.replaceChildren(...sourceLinks.map(([label,p])=>link(typeof p==='number'?`${label} · p. ${p} ↗`:`${label} ↗`,p)));
    const pageToPreview=localManual && previewPages?.has(page) ? page : undefined;
    if(pageToPreview!==previewPage) {
      previewPage=pageToPreview; preview.hidden=true;
      if(previewPage===undefined) thumb.removeAttribute('src');
      else {
        previewLabel.textContent=`Preview PDF page ${page}`;
        thumb.src=`${manualAssets}${page}-thumb.png`;
      }
    }
    $('warning').hidden=!warning;
    if(warning) {
      $('warning-text').textContent=warning.text;
      $('warning-link').href=pageLink(warning.page);
      $('warning-link').textContent=`Safety instructions · p. ${warning.page} ↗`;
    }
    for(const {step,key,fieldset,inputs,options,requireExplicit} of choiceFields) {
      fieldset.hidden=complete||step!==number;
      if(!fieldset.hidden) inputs.forEach((input,i)=>{
        input.checked=(!requireExplicit||confirmed.has(key)) && options[i][0]===route[key];
      });
    }
    partsSheet.hidden=complete;
    if(!complete) showParts(record);
    renderJump(); syncChapters();
  }
  function renderTransport() {
    const verb=phase==='playing'?'Pause':phase==='paused'?'Resume':'Replay';
    replay.textContent=verb; replay.setAttribute('aria-label',`${verb} step`);
    replay.hidden=complete;
    useButton.hidden=!complete||!scene||!product.useDemo;
    if(!useButton.hidden) useButton.textContent=showingDemo?'Reset demonstration':product.useDemo.label;
    replay.disabled=complete||!scene||!timeline.steps.get(number)?.events.length;
    back.setAttribute('aria-disabled',String(number===0));
    const atLast=number===lastStep(), gate=unconfirmed(), following=nextStep();
    const skip=following!==printedOrder[printedOrder.indexOf(number)+1];
    next.setAttribute('aria-disabled',String(atLast&&(number===0||phase!=='end')));
    next.textContent=number===0?'Start build':complete?'Back to inventory':atLast?'View completed assembly':gate ? gate.prompt??'Choose an option' :
      hasGate() && following!==undefined ? `${skip?'Skip to':'Next:'} step ${following}` : 'Next step';
    if(!atLast && !gate) {
      const arrow=element('span',' →'); arrow.setAttribute('aria-hidden','true'); next.append(arrow);
    }
    const state=number===0?'Unbox':complete?'Complete':phase==='playing'?'Playing':phase==='paused'?'Paused':'Step preview';
    $('stage-index').textContent=`${nn(number)} / ${nn(lastStep())}`; $('stage-state').textContent=state;
    $('camera').hidden=!scene;
  }
  function draw() {
    let frame=showingDemo?sample(demo,demo.order.at(-1),progress):completedFrame??sample(timeline,number,progress);
    // Use figures have motion, but no numbered-step joint annotation.
    if(showingDemo && frame.joint) frame={...frame,joint:null};
    if(lastCount!==frame.installed.length) {
      lastCount=frame.installed.length;
      counts.textContent=number===0?`${suppliedCount} supplied pieces · 0 placed`:`${lastCount} parts placed`;
    }
    scene?.draw(frame,{number,progress,record:complete?undefined:timeline.steps.get(number),route:timeline.route,complete});
  }
  function announce(text) { $('announcement').textContent=text; }
  function cancel() { if(animation) cancelAnimationFrame(animation); animation=0; clock=null; }
  function pausePlayback() { cancel(); phase='paused'; renderTransport(); }
  function frameAt(time) {
    const duration=(showingDemo?demo.steps.get(demo.order.at(-1)):timeline.steps.get(number)).duration;
    if(clock===null) clock=time-progress*duration;
    progress=Math.min(1,(time-clock)/duration); draw();
    if(progress<1) { animation=requestAnimationFrame(frameAt); return; }
    cancel(); phase='end';
    if(showingDemo) announce(`${product.useDemo.label}: demonstration complete.`);
    renderTransport();
  }
  function play() {
    scene?.auto();
    progress=reduced()?1:0; clock=null;
    phase=showingDemo||progress===1?'end':'playing';
    renderTransport(); draw();
    if(progress===0) animation=requestAnimationFrame(frameAt);
    else if(showingDemo) announce(`${product.useDemo.label}: demonstration complete.`);
  }
  function resetDemo() {
    if(!showingDemo) return;
    cancel(); showingDemo=false; progress=1; draw(); renderTransport();
    announce('Demonstration reset.');
  }
  useButton.onclick=()=>{
    if(!complete||!scene||!product.useDemo) return;
    if(showingDemo) {resetDemo(); return;}
    demo??=product.useDemo.compile(timeline.route);
    showingDemo=true; announce(`${product.useDemo.label}: demonstration started.`); play();
  };
  function select(value,shouldPlay=false,focus=false) {
    const completing=value==='complete';
    if(completing) {
      if(complete||number===0||number!==lastStep()||phase!=='end') return;
      value=lastStep();
    }
    if(!timeline.order.includes(value)) return;
    cancel(); clearInspect();
    showingDemo=false; demo=undefined;
    const changed=number!==value||complete!==completing;
    number=value; complete=completing; phase='end'; progress=1; lastCount=-1;
    if(complete) {
      const end=sample(timeline,lastStep(),1);
      completedFrame=product.completeFrame?.(end)??end;
    } else completedFrame=undefined;
    scene?.auto();
    if(!jump.open) jumpChapter=selectedChapter();
    renderRecord();
    if(changed) { rail.scrollTop=0; partsSheet.open=true; }
    if(changed||focus) {
      revealChapter();
      if(smallScreen.matches) window.scrollTo({top:number?stage.getBoundingClientRect().top+scrollY:0,behavior:'instant'});
    }
    renderTransport();
    const message=complete?'Assembly complete.':number===0?`${unbox.title}.`:`Step ${number}. ${timeline.steps.get(number).title}.`;
    if(shouldPlay && timeline.steps.get(number)?.events.length && !reduced()) {
      announce(message); play();
    } else {
      draw();
      announce(message);
    }
    if(focus) heading.focus({preventScroll:true});
  }
  back.onclick=()=>{
    if(complete) select(lastStep(),false,true);
    else if(number) select(timeline.order[timeline.order.indexOf(number)-1]);
  };
  next.onclick=()=>{
    if(complete) select(0);
    else if(number===lastStep()) select('complete',false,true);
    else if(unconfirmed()) unconfirmed().inputs[0].focus();
    else select(nextStep(),true);
  };
  replay.onclick=()=>{
    if(complete) return;
    if(phase==='playing') pausePlayback();
    else if(phase==='paused') {phase='playing';clock=null;renderTransport();animation=requestAnimationFrame(frameAt);}
    else play();
  };
  thumb.onload=()=>{preview.hidden=previewPage===undefined;};
  thumb.onerror=()=>{preview.hidden=true;};
  fullPage.onload=()=>{fullPage.hidden=false; previewError.hidden=true;};
  fullPage.onerror=()=>{fullPage.hidden=true; previewError.hidden=false;};
  preview.onclick=()=>{
    const page=previewPage;
    resetDemo();
    if(phase==='playing') pausePlayback();
    $('page-preview-title').textContent=fullPage.alt=`IKEA manual · PDF page ${page}`;
    $('page-preview-local').href=`${manualAssets}manual.pdf#page=${page}`;
    $('page-preview-official').href=pageLink(page);
    fullPage.hidden=true; previewError.hidden=true;
    fullPage.src=`${manualAssets}${page}.png`;
    previewDialog.showModal();
  };
  previewDialog.addEventListener('close',()=>preview.focus());
  $('turn').onclick=()=>scene?.rotate();
  $('reset').onclick=()=>{clearInspect(); scene?.reset();};
  motion.addEventListener('change',()=>{
    if(motion.matches && showingDemo && progress<1) {
      cancel(); progress=1; draw(); announce(`${product.useDemo.label}: demonstration complete.`); return;
    }
    if(!motion.matches || phase==='end') return;
    cancel(); phase='end'; progress=1; renderRecord(); renderTransport(); scene?.auto(); draw();
  });

  function unavailable() {
    cancel(); scene?.dispose(); scene=undefined; phase='end'; progress=1;
    showingDemo=false; demo=undefined;
    stage.classList.add('is-text-only');
    view.hidden=true;
    const status=$('view-status'); status.hidden=false;
    status.textContent='3D is unavailable. Follow the instructions and official page links.';
    renderRecord(); renderTransport(); draw();
  }
  select(0);
  window.addEventListener('pagehide',event=>{
    if(!event.persisted) {disposed=true;cancel();scene?.dispose();}
  });
  void (async ()=>{
    try {
      const [{createView},sceneModule]=await Promise.all([import('./scene.js'),product.loadScene()]);
      if(disposed) return;
      scene=createView(view,unavailable,product,sceneModule);
      if(chosen) scene.inspect(chosen);
      $('view-status').hidden=true; renderTransport(); draw();
    } catch {
      if(!disposed) unavailable();
    }
  })();
}
