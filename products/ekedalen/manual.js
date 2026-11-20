export const manual = Object.freeze({
  id:'AA-1934520-19', footer:'AA-1934520-19', date:'2022-03-10', pages:24,
  sha256:'32ebf3c693bbf49d18245de4e123257cc970b6bee6ac1a8eeb2bd7d700cdde83',
  url:'https://image-ikea.mncdn.com//montaj-kilavuzu/70340807_70340807_1.pdf'
});
export const pages = [5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,13,13,14,14,15,15,16,17,18,19,19,20,21,22,22];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
