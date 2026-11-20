const root='https://www.ikea.com/us/en/assembly_instructions/smastad-loft-bed-frame-desk-and-storage-white__';
export const manual=Object.freeze({
  id:'AA-2227988-7-100', footer:'AA-2227988-7', date:'2025-07-07', pages:60,
  sha256:'167f36eb3e529d2896e5825e490f8536041d2444546d9927046441ad53ce9b6e',
  url:`${root}AA-2227988-7-100.pdf`
});
export const companions=[['Desk assembly booklet',`${root}AA-2200883-3-100.pdf`],
  ['Storage assembly booklet',`${root}AA-2200885-4-100.pdf`]];
export const unboxPage=3;
const right=[7,8,8,9,10,10,11,11,12,13,14,15,15,16,17,18,18,21,22,23,24,24,25,25,26,26,27,28,28,29,29,30,30,31,31,32,32];
export const layouts=[['right-upper','Right ladder · upper drawing'],['right-lower','Right ladder · lower drawing'],
  ['left-upper','Left ladder · upper drawing'],['left-lower','Left ladder · lower drawing']];
export const pages=Object.fromEntries(layouts.map(([layout])=>[layout,right.map((p,i)=>
  p+(layout.startsWith('left')?26:0)+(i>=14&&i<=16&&layout.endsWith('lower')?2:0)
)]));
export const previewPages=new Set([unboxPage,...new Set(Object.values(pages).flat().sort((a,b)=>a-b))]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
