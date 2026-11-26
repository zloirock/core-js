import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$log1p from "@core-js/pure/actual/math/log1p";
// Bound and inline array elements keep their native patterns, including siblings, holes and nested keys.
const held = [Math];
for (const [{
  trunc: viaAlias
}] of [held]) use(viaAlias(1.5));
const pair = [Math, 1];
for (const [{
  sign: viaSibling
}, beside] of [pair]) use(viaSibling(-1), beside);
for (const [{
  cbrt: viaHole
},, past] of [held]) use(viaHole(8), past);
const deep = [[Math]];
for (const [[{
  log10: viaDeep
}]] of [deep]) use(viaDeep(100));
const keyed = [{
  k: Math
}];
for (const [{
  k: {
    log2: viaKeyed
  }
}] of [keyed]) use(viaKeyed(8));
// The three factory calls run once each and supply the corresponding pure Math method.
const build = () => [Math];
for (const [{
  hypot: viaCall
}] of [(build(), [{
  hypot: _Math$hypot
}])]) use(viaCall(3, 4));
let count = 0;
const counting = () => (count++, [Math]);
for (const [{
  expm1: viaEffect
}] of [(counting(), [{
  expm1: _Math$expm1
}])]) use(viaEffect(1), count);
const wrap = value => [value];
for (const [{
  log1p: viaArgument
}] of [(wrap(Math), [{
  log1p: _Math$log1p
}])]) use(viaArgument(1));
for (const [{
  fround: viaInline
}] of [[Math]]) use(viaInline(1.5));