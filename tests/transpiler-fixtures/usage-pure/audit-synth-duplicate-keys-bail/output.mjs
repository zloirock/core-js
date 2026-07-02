import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// duplicate destructure keys bail every synthesized-literal path (the literal would need
// duplicate properties - ES5-strict invalid - or a merge policy): leaf duplicates and
// duplicate HOP keys fall back to leaf defaults on the pattern (patterns may legally repeat
// keys), the declarator flatten extracts per prop without building a literal at all
function f({
  Array: {
    from,
    from: dup
  }
} = _globalThis) {
  return [from, dup];
}
export { f };
function g({
  JSON: {
    parse
  },
  JSON: {
    stringify
  }
} = _globalThis) {
  return [parse, stringify];
}
export { g };
const of = _Array$of;
const {
  Array: {
    isArray
  }
} = _globalThis;
export const r = [of(1), isArray([])];