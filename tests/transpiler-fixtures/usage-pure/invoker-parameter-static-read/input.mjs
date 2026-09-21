// A receiver invoker is a call of the function it invokes, so the parameter pairs with the
// argument the pairing places there and a static read off it takes the pure static.
// Each spelling reads a different static; the invoker itself keeps its source spelling.
function viaCall(a) { return a.of(1); }
function viaApply(o) { return o.groupBy([1], x => x); }
function viaReflect(m) { return m.groupBy([1], x => x); }
function viaBind(p) { return p.withResolvers(); }
export const call = viaCall.call(null, Array);
export const apply = viaApply.apply(null, [Object]);
export const reflect = Reflect.apply(viaReflect, null, [Map]);
export const bound = viaBind.bind(null, Promise)();
