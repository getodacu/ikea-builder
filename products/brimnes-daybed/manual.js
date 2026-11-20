export const manual = Object.freeze({
  id:'AA-1086559-14-100', footer:'AA-1086559-14', date:'2024-02-09', pages:36,
  sha256:'70912e524828cdc572952635505de5dd3899583c089d6e3865967fad195d2fa6',
  url:'https://www.ikea.com/us/en/assembly_instructions/brimnes-daybed-frame-with-2-drawers-white__AA-1086559-14-100.pdf'
});
export const pages = {
  1:6, 2:7, 3:7, 4:8, 5:8, 6:9, 7:9, 8:10, 9:10, 10:11, 11:11, 12:12, 13:13, 14:13, 15:14,
  16:14, 17:15, 18:15, 19:16, 20:16, 21:17, 22:17, 23:18, 24:19, 25:19, 26:20, 27:21, 28:21,
  29:22, 30:22, 31:23, 32:24, 33:24, 34:25, 35:26, 36:27, 37:27, 38:28, 39:29, 40:30, 41:30,
  42:31, 43:31, 44:32, 45:32, 46:32, 47:32, 48:33, 49:33, 50:34, 51:35, 52:35
};
export const unboxPage = 3;
export const previewPages = new Set([unboxPage,...Object.values(pages)]);
export const pageLink = page => `${manual.url}#page=${page}`;
