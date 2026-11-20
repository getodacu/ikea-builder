export const manual = Object.freeze({
  id: 'AA-1848992-8-2', footer: 'AA-1848992-8', date: '2021-02-23', pages: 56,
  sha256: 'daed552aff65aba9ba7b659af284ed1a0cc1e3b2cb7b2842c3fcaed039923a41',
  url: 'https://www.ikea.com/us/en/assembly_instructions/malsjoe-sideboard-black-stained__AA-1848992-8-2.pdf'
});
export const pages = [11,12,12,13,13,14,14,15,16,16,17,17,18,18,19,20,21,21,22,22,23,23,24,25,26,26,27,28,28,29,30,31,32,33,33,34,34,35,35,36,37,37,38,38,39,40,41,42,43,43,43,44,44,44,44,45,45,46,46,47,47,48,48,49,49,49,49,50,50,51,51,52,52];
export const unboxPage = 7;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
