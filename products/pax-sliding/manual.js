export const manual = Object.freeze({
  id:'AA-2213695-9-100', footer:'AA-2213695-9', date:'2025-06-16', pages:36,
  sha256:'08b729b37fe7d37b1fe0bf1b276b683fcf18c19c09778915d912dc23fb726356',
  url:'https://www.ikea.com/us/en/assembly_instructions/pax-pair-of-sliding-door-frames-rail-white__AA-2213695-9-100.pdf'
});
export const pages = [5,7,8,8,9,9,10,10,11,12,13,13,14,15,15,16,17,18,19,20,20,21,22,23,24,25,26,27,27,28,29,30,30,31,32,33,34];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
