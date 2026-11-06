import _Array$from from "@core-js/pure/actual/array/from";
// a computed-key ALIAS resolves in its own declaration scope, hop by hop: a use-site shadow
// of an init name must not swallow the module-level value the alias actually holds, and an
// alias of the shadow itself must stay unresolved
const j = 'from';
const k = j;

// the param shadows the alias SOURCE name - the module-level alias still resolves
export function viaShadowedSourceName(j) {
  return _Array$from([1]);
}