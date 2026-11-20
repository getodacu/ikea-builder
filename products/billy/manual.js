export const manual = Object.freeze({
  id:'AA-2289108-3-100', footer:'AA-2289108-3', date:'2024-03-21', pages:16,
  sha256:'723b25d46d1c50219e829cf650388b10cfbe6fa0f55a85b95d12ced64454e86a',
  url:'https://www.ikea.com/us/en/assembly_instructions/billy-bookcase-white__AA-2289108-3-100.pdf'
});
export const pages = [7,8,8,9,10,11,11,12,13,14,15,16];
export const unboxPage = 7;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
