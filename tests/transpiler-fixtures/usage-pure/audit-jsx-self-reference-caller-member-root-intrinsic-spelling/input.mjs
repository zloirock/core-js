// A JSX tag name REFERENCES the function it names: the element hands the component to a renderer that calls it with props, so such
// a function has callers the file cannot see.
var cond = true;
// A MEMBER tag is an expression whatever its case, so its root references the binding and the
// intrinsic spelling rule must not reach it.
export const memberRootIntrinsicSpelling = (function d({ ['fromEntries']: fromEntries } = Object) {
  return cond ? (cond = false, <d.Sub x={1} />) : fromEntries([['a', 1]]);
})();
