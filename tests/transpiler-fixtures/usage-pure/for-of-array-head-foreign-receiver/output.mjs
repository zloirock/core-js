import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$fround from "@core-js/pure/actual/math/fround";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$log10 from "@core-js/pure/actual/math/log10";
import _Math$log1p from "@core-js/pure/actual/math/log1p";
import _Math$log2 from "@core-js/pure/actual/math/log2";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a for-of ARRAY head over a receiver foreign to the host - a bound container, a call yielding one -
// mirrors the whole array level in place of the element, as an inline literal mirrors its slot: a
// bound sibling reads its element off the container by index, a hole stays a hole, a nested level
// mirrors on its own, a call keeps running ahead of the literal that stands in for its value
const held = [Math];
for (const [{
  trunc: viaAlias
}] of [[{
  trunc: _Math$trunc
}]]) use(viaAlias(1.5));
const pair = [Math, 1];
for (const [{
  sign: viaSibling
}, beside] of [[{
  sign: _Math$sign
}, pair[1]]]) use(viaSibling(-1), beside);
for (const [{
  cbrt: viaHole
},, past] of [[{
  cbrt: _Math$cbrt
},, held[2]]]) use(viaHole(8), past);
const deep = [[Math]];
for (const [[{
  log10: viaDeep
}]] of [[[{
  log10: _Math$log10
}]]]) use(viaDeep(100));
const keyed = [{
  k: Math
}];
for (const [{
  k: {
    log2: viaKeyed
  }
}] of [[{
  k: {
    log2: _Math$log2
  }
}]]) use(viaKeyed(8));
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
}] of [[{
  fround: _Math$fround
}]]) use(viaInline(1.5));