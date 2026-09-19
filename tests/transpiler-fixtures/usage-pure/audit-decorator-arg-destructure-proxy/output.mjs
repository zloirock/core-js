import _Array$from from "@core-js/pure/actual/array/from";
// decorator argument contains an arrow with a default-valued destructured param whose
// default is the polyfill-able receiver (`Array`). the default slot gets rewritten to
// `{ from: _Array$from }` so the arrow's body call resolves to the polyfill even inside
// the decorator expression (runs at class-def time)
@dec(({
  from
} = {
  from: _Array$from
}) => from([1, 2, 3]))
class C {}
function dec(fn) {
  return t => t;
}