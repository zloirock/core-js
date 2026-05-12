// JSXIdentifier visitor must honour hoisted-var shadows in nested non-function blocks.
// estree-toolkit registers `var` declarations in the block's own scope rather than hoisting
// to the enclosing function; the visitor must thread its path so the var-scope fallback fires.
// Without that, `<Map />` would inject the Map polyfill chain even though the tag resolves
// to the local hoisted var at runtime.
function App(cond) {
  if (cond) {
    var Map = function () {
      return null;
    };
  }
  return <Map />;
}