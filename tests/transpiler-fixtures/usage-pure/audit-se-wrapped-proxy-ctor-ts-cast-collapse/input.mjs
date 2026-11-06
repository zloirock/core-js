// A SE-wrapped proxy-global ctor sub-receiver carrying a transparent TS wrapper (`((c++, globalThis.self).Map
// as any).prototype.has` / a non-null `!`): the runtime-no-op wrapper is peeled to reach the buried SE-sequence,
// so the prototype fallback still swaps the ctor to the pure binding and re-emits the call effect. Distinct
// ctors / wrapper positions per line: cast on the ctor sub-receiver, cast inside the sequence tail, a non-null
// assertion on the tail, and (last) a cast on the WHOLE `.prototype` receiver - the resolver + both emitters
// peel it to find the ctor, swapping it while KEEPING the cast on `.prototype` (`(eff(), _Promise).prototype`).
let log = [];
function eff(tag) {
  log.push(tag);
  return tag;
}
const castCtor = ((eff('a'), globalThis.self).Map as any).prototype.has.call(new Map(), 1);
const castTail = (eff('b'), globalThis.self as any).Set.prototype.add.call(new Set(), 2);
const nonNull = (eff('c'), globalThis.self!).WeakMap.prototype.get.call(new WeakMap(), {});
const castProto = ((eff('d'), globalThis.self).Promise.prototype as any).then;
export { castCtor, castTail, nonNull, castProto, log };
