export const manual = Object.freeze({
  id:'AA-2615392-2-100', footer:'AA-2615392-2', date:'2026-01-29', pages:16,
  sha256:'a657dcf98ef533ed9570e2f5ccd4e6c9053b7a2f570905c4b6fb1c1efc5379d8',
  url:'https://www.ikea.com/us/en/assembly_instructions/poaeng-armchair-frame-birch-veneer__AA-2615392-2-100.pdf'
});
export const pages = [5,5,6,6,7,8,9,10,11,12,13];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
