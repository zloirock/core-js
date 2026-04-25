import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// both branches resolve to known globals with viable static polyfills for the destructured
// key. each branch becomes its own `{key: _Branch$key}` literal, preserving runtime
// conditional semantics: `cond=truthy` -> Array.from polyfill, `cond=falsy` -> Iterator.from
// polyfill. user gets the matching semantic per branch instead of one polyfill aliasing the
// other (which the inline-default pre-fix did)
function f({
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
}) {
  return from;
}
const {
  from: g1
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};
let g2;
({
  from: g2
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
});
export { f, g1, g2 };