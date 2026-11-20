export const manual = Object.freeze({
  id:'AA-2055625-9-100', footer:'AA-2055625-9', date:'2023-11-17', pages:40,
  sha256:'9f9cbbccc976cd1ea511f2cbf27e4d7b6c3da869d65e7943f33ed3a48a580c0e',
  url:'https://www.ikea.com/us/en/assembly_instructions/malm-storage-bed-white__AA-2055625-9-100.pdf'
});
export const pages=[7,8,9,10,10,11,12,13,14,14,15,16,16,17,17,18,19,20,21,21,22,23,24,25,26,27,28,29,30,30,31,32,33,34,35,36];
export const unboxPage=3;
export const previewPages=new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
