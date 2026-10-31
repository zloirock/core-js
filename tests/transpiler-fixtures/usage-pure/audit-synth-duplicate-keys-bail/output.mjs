import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a key a pattern repeats is ONE slot, and what the synthesized literal owes it decides whether the
// path bails: repeated LEAVES read one value, so the literal carries a single property and both
// readers bind it, while a repeated HOP would need the literal to MERGE two subtrees under one
// property - a merge policy nothing here has - and a literal beside a pattern would hand the plain
// reader the synthesized object where the source hands it the real value. So hop duplicates fall
// back to leaf defaults on the pattern (patterns may legally repeat keys) and the declarator
// flatten extracts per prop without building a literal at all. A for-x head is the shape that
// makes the difference load-bearing: its fallback has no statement slot to extract into, so a bail
// there leaves the pattern reading raw off the element.
function f({
  Array: {
    from,
    from: dup
  }
} = {
  Array: {
    from: _Array$from
  }
}) {
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
let headOf, headAlias;
for (const {
  of: h1,
  ['of']: h2
} of [{
  of: _Array$of
}]) {
  headOf = h1;
  headAlias = h2;
  break;
}
export const r = [of(1), isArray([]), typeof headOf, typeof headAlias, headOf === headAlias];