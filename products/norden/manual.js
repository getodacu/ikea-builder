export const manual = Object.freeze({
  id:'AA-1931387-8-100', footer:'AA-1931387-8', date:'2024-11-20', pages:12,
  sha256:'fa39a4ce4025224450753135170224b1b2882a4539120604da2e4f88a7c47519',
  url:'https://www.ikea.com/us/en/assembly_instructions/norden-gateleg-table-white__AA-1931387-8-100.pdf'
});
export const pages = [4,5,5,6,7,8,8,9,9,9,10,10,11,11,11,12];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
