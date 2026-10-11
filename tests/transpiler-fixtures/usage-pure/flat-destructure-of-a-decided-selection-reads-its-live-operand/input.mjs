// a flat pattern over a selection the build decides reads like that selection's live operand spelled
// alone: as a parameter default (a ternary, an `&&`), a declaration over an `&&`, an assignment whose
// value is used, an arm carrying an effect ahead of its constructor (declared and assigned), and an
// instance method read off it
export function viaParam({ groupBy } = typeof Symbol != 'undefined' ? Map : Object) {
  return groupBy;
}
export function viaAndParam({ withResolvers } = typeof Symbol != 'undefined' && Promise) {
  return withResolvers;
}
export const { fromAsync } = typeof Symbol != 'undefined' && Array;
let entries;
export const viaValue = () => ({ entries } = typeof Symbol != 'undefined' && Object);
export const { from } = typeof Symbol != 'undefined' ? (console.log(), Iterator) : Object;
let canParse;
({ canParse } = typeof Symbol != 'undefined' ? (console.log(), URL) : Object);
export { entries, canParse };
export const { at } = typeof Symbol != 'undefined' ? [] : user;
