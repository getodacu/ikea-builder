export const manual = Object.freeze({
  id:'AA-571176-10-100', footer:'AA-571176-10', date:'2024-04-08', pages:24,
  sha256:'2c81fc2435cbabf81f9ac781f5733417319d61bc4b8d657c580044dd3e56643d',
  url:'https://www.ikea.com/us/en/assembly_instructions/hemnes-shoe-cabinet-with-2-compartments-white__AA-571176-10-100.pdf'
});
export const pages = [7,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,17,18,18,19,19,20,20,21,21,22,22,22,22,23,23,23,24];
export const unboxPage = 6;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
