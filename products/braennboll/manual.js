export const manual = Object.freeze({
  id:'AA-2488890-1-100', footer:'AA-2488890-1', date:'2024-03-22', pages:40,
  sha256:'f55d64839596b86eb34897b8bbfaa21c9bd7f294c26c1f7b84823030e8e8aa7f',
  url:'https://www.ikea.com/us/en/assembly_instructions/braennboll-gaming-station-light-gray-white__AA-2488890-1-100.pdf'
});
export const pages = [8,9,9,10,11,12,12,13,14,14,15,16,16,17,18,18,23,23,24,24,25,25,26,26,27,27,28,29,29,30,30,31,31,32,32,33,34,35,35,36,36,37,39,40,40];
export const leftShelfPages = [19,20,20,21,22,22];
export const directWallPage = 38;
export const unboxPage = 6;
export const previewPages = new Set([unboxPage,...new Set([...pages,...leftShelfPages,directWallPage].sort((a,b)=>a-b))]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
