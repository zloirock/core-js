// flatten + Symbol.iterator sibling + `...rest`: rest must EXCLUDE both consumed keys
// from the residual object, so the residual destructure emits two sentinels - `Array:
// _unused` and `[_Symbol$iterator]: _unused2`. the latter uses the polyfilled binding so
// engines without native `Symbol` still evaluate the key; residual init keeps user `obj`
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter, ...rest } = obj;
console.log(from, iter, rest);
