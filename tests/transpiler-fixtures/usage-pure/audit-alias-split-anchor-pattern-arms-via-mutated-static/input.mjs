Reflect.ownKeys = shim;
function viaMutatedStatic(target) {
  const { Reflect: R } = globalThis;
  outerUse(R.get(target, propKey));
  return function inner() {
    var R;
    var { Reflect: R } = globalThis;
    return R.ownKeys(target);
  };
}
export const results = [viaMutatedStatic];
