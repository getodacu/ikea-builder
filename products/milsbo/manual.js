export const manual = Object.freeze({
  id:'AA-2094158-9-100', footer:'AA-2094158-9', date:'2024-03-14', pages:36,
  sha256:'531fa0a5e67132a5b1b18bb79e9167693304f9d820ad6438fe6071ba63cf1e95',
  url:'https://www.ikea.com/us/en/assembly_instructions/milsbo-glass-door-cabinet-anthracite__AA-2094158-9-100.pdf'
});
export const unboxPage = 7;
export const pages = [8,9,9,10,10,11,12,12,13,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33];
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
