export const manual = Object.freeze({
  id:'AA-2503161-1-100', footer:'AA-2503161-1', date:'2024-04-24', pages:32,
  sha256:'a1a35b11570f06b080e3c5146f379d44087d7876cb98da008d364ebc4ab9ec13',
  url:'https://www.ikea.com/us/en/assembly_instructions/fjaellbo-tv-unit-black__AA-2503161-1-100.pdf'
});
export const article = 'https://www.ikea.com/us/en/p/fjaellbo-tv-unit-black-00579034/';
export const pages = [7,7,8,8,9,9,10,10,11,12,12,13,14,15,16,17,18,19,20,21,22,23,24,25,25,26,27,28,29,30];
export const unboxPage = 6;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
