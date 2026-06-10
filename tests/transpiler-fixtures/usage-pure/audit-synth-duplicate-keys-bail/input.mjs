// duplicate destructure keys bail every synthesized-literal path (the literal would need
// duplicate properties - ES5-strict invalid - or a merge policy): leaf duplicates and
// duplicate HOP keys fall back to leaf defaults on the pattern (patterns may legally repeat
// keys), the declarator flatten extracts per prop without building a literal at all
function f({ Array: { from, from: dup } } = globalThis) {
  return [from, dup];
}
export { f };
function g({ JSON: { parse }, JSON: { stringify } } = globalThis) {
  return [parse, stringify];
}
export { g };
const { Array: { of }, Array: { isArray } } = globalThis;
export const r = [of(1), isArray([])];
