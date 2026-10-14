// a constructor handed to a standard-library method off what a builtin call returns - typed by that
// call's known return type - is called by the library alone, which reads no static off it: no escape,
// so a polyfilled constructor keeps its narrow entry and one core-js does not polyfill loads nothing.
// the same method off a receiver nothing types is no known library, and its argument still escapes
export const symbols = Array.from(names).map(Symbol);
export const numbers = String(text).split(',').filter(Number);
export const patterns = Object.values(table).flatMap(RegExp);
export const labelled = Array.of(1, 2).every(String);
export const errors = messages.find(Error);
