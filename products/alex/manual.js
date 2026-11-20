export const manual = Object.freeze({
  id:'AA-2242840-5-100', footer:'AA-2242840-5', date:'2022-10-27', pages:24,
  sha256:'75385bf91c4dfe00b8a1f230aa030b037bdc55a846325f1c26e5f54299bb578d',
  url:'https://www.ikea.com/us/en/assembly_instructions/alex-drawer-unit-white__AA-2242840-5-100.pdf'
});
export const pages = {1:5,2:5,3:6,4:6,5:7,6:8,7:9,8:10,9:13,10:14,11:14,12:15,13:15,14:16,
  15:17,16:17,17:18,18:18,19:19,20:19,21:20,23:22};
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...Object.values(pages)]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
