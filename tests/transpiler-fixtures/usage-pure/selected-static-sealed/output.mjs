import _Array$from from "@core-js/pure/actual/array/from";
// Parentheses end the optional callee chain; arguments still run before the nullish call throws.
export function read(choice, effect) {
  const A = choice ? Array : null;
  return null == A ? (void 0)((effect(), [3])) : A === Array ? _Array$from((effect(), [3])) : A.from((effect(), [3]));
}