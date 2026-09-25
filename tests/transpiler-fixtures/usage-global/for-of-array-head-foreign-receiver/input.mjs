// a for-of ARRAY head over a receiver foreign to the host - a bound container, a call yielding one -
// mirrors the whole array level in place of the element, as an inline literal mirrors its slot: a
// bound sibling reads its element off the container by index, a hole stays a hole, a nested level
// mirrors on its own, a call keeps running ahead of the literal that stands in for its value
const held = [Math];
for (const [{ trunc: viaAlias }] of [held]) use(viaAlias(1.5));
const pair = [Math, 1];
for (const [{ sign: viaSibling }, beside] of [pair]) use(viaSibling(-1), beside);
for (const [{ cbrt: viaHole },, past] of [held]) use(viaHole(8), past);
const deep = [[Math]];
for (const [[{ log10: viaDeep }]] of [deep]) use(viaDeep(100));
const keyed = [{ k: Math }];
for (const [{ k: { log2: viaKeyed } }] of [keyed]) use(viaKeyed(8));
const build = () => [Math];
for (const [{ hypot: viaCall }] of [build()]) use(viaCall(3, 4));
let count = 0;
const counting = () => (count++, [Math]);
for (const [{ expm1: viaEffect }] of [counting()]) use(viaEffect(1), count);
const wrap = value => [value];
for (const [{ log1p: viaArgument }] of [wrap(Math)]) use(viaArgument(1));
for (const [{ fround: viaInline }] of [[Math]]) use(viaInline(1.5));
