export const article = 'https://www.ikea.com/us/en/p/relatera-desk-sit-stand-white-s99552865/';
export const frameArticle = 'https://www.ikea.com/us/en/p/relatera-underframe-sit-stand-f-table-top-white-80540306/';
export const topArticle = 'https://www.ikea.com/us/en/p/relatera-table-top-white-30540295/';
export const manual = Object.freeze({
  id:'AA-2396864-4-100', footer:'AA-2396864-4', date:'2024-09-18', pages:20,
  sha256:'3e7760cc3a9d1f3be9b003310d0af0d22a40c2195760d7abdcce4babfa9d1868',
  url:'https://www.ikea.com/us/en/assembly_instructions/relatera-underframe-sit-stand-f-table-top-white__AA-2396864-4-100.pdf'
});
export const pages = Object.freeze([5,5,7,7,8,8,9,9,10,11,12,13,13,14,15,15,16]);
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
