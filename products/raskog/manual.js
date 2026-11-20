export const manual = Object.freeze({
  id:'AA-2475409-4-100', footer:'AA-2475409-4', date:'2025-09-29', pages:8,
  sha256:'ee9cda5c9dc5b0aa9bee61a0ec1a4bafff9bac0ddbe2f0c68fee4e9e5ef9ab69',
  url:'https://www.ikea.com/us/en/assembly_instructions/raskog-utility-cart-white__AA-2475409-4-100.pdf'
});
export const pages = [4,4,5,6,6,7,8];
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...pages]);
export function pageLink(page) { return `${manual.url}#page=${page}`; }
