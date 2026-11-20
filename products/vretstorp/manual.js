export const manual = Object.freeze({
  id:'AA-2191645-5-100', footer:'AA-2191645-5', date:null, pages:44,
  sha256:'dc7ace89132febafbda9ac0b4f0a9ff2b6c82d8302a849b02a1f32f150e1f94b',
  url:'https://www.ikea.com/us/en/assembly_instructions/vretstorp-frame-for-sleeper-sofa__AA-2191645-5-100.pdf'
});
export const pages = [6,7,8,9,10,11,12,13,13,14,15,16,17,17,18,19,20,21,22,23,24,25,26,27,27,28,29,30,31,32,33,34,35,36,37,38,39,40,42,43];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
