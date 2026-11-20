export const manual = Object.freeze({
  id:'AA-1969722-7-2', footer:'AA-1969722-7', date:'2021-02-11', pages:44,
  sha256:'7a44cb5f389bb35860e1d6e99e0943bf1d277fa8e3f31c2e3ac175d3d71231bf',
  url:'https://www.ikea.com/us/en/assembly_instructions/knoxhult-base-cabinet-with-doors-and-drawer-white__AA-1969722-7-2.pdf'
});
export const beforeLayout=[6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,14,15,15,16,16,17,17,18,18,19,19];
export const layoutPages={left:[20,21,21,22],right:[23,24,24,25],center:[26,27,27,28]};
export const afterLayout=[29,30,31,32,32,33,33,34,35,36,36,36,37,37,38,38,39,39,40,40,41];
export const unboxPage=4;
export const previewPages=new Set([unboxPage,...beforeLayout,...Object.values(layoutPages).flat(),...afterLayout]);
export const pageLink=page=>`${manual.url}#page=${page}`;
