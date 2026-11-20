export const manual = Object.freeze({
  id:'AA-1621040-20-100', footer:'AA-1621040-20', date:'2024-04-04', pages:32,
  sha256:'ab252e2f2d6caa747307dfc044290bae280cfe6bf0cabe9ab570e541d4c4310a',
  url:'https://www.ikea.com/us/en/assembly_instructions/duktig-play-kitchen-birch__AA-1621040-20-100.pdf'
});
export const unboxPage = 8;
export const pages = [9,9,10,10,10,11,12,12,13,13,13,14,14,14,15,15,16,16,17,17,18,18,19,19,20,20,20,21,21,22,22,23,23,24,24,25,26,26,27,27,28,28,29,29,30,32];
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
