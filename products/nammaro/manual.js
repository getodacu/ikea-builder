export const manual = Object.freeze({
  id:'AA-2307889-5-100', footer:'AA-2307889-5', date:'2026-02-05', pages:16,
  sha256:'aecd32830f1f4b46bfea6c1338bbc17dfb65005d65d07f976c5e45f2c16c95f1',
  url:'https://www.ikea.com/us/en/assembly_instructions/naemmaroe-chaise-outdoor-light-brown-stained__AA-2307889-5-100.pdf'
});
export const pages = [4,5,6,6,7,8,9,10,11,11,12,13,14];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
