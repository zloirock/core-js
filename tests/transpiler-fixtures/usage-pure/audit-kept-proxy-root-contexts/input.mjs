// the syntactic CONTEXTS a kept proxy root can be reached from. the rule does not depend on any of them -
// the assignment stays as the root, the redundant proxy hop drops, the guard survives - but each context
// reaches the collapse through its own visitor, so each pins separately: a kept root nested inside another
// kept root's value, a destructuring default, a class static method, an async arrow body, and a computed
// leaf key. distinct methods per line.
let n;
export const nestedKeptRoot = (n = globalThis.window?.self.window)?.self.Array.prototype.flat.call([1, [2]]);

let p;
export const inDestructureDefault = (({ x = (p = globalThis.window)?.self.Array.prototype.includes } = {}) => x)();

class Probe {
  static read() {
    let q;
    return (q = globalThis.window)?.self.Array.prototype.findLast.call([1], it => it);
  }
}
export const inClassStatic = Probe.read();

let r;
export const inAsyncArrow = (async () => (r = globalThis.window)?.self.Array.prototype.some.call([1], it => it))();

let s;
export const computedLeafKey = (s = globalThis.window)?.self['Array'].prototype.at.call([1], 0);
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
let fh;
for (const v of (fh = globalThis.window)?.[(c++, 'self')].Array.of(1, 2) ?? []) void v;

let tp;
export const inTemplate = `${(tp = globalThis.window)?.[(c++, 'self')].Array.prototype.findIndex.call([7], v => v === 7)}`;

let sp;
export const spreadOut = [...((sp = globalThis.window)?.[(c++, 'self')].Array.from?.([3]) ?? [])];

class KeptHost {
  static probe = globalThis.window?.[(c++, 'self')]?.Array;
  // a PLAIN claimless tail after the guarded hop rides the source short-circuit: past an
  // absent `window` it must read nothing (not throw), and the key effect must not run
  static plainTail = globalThis.window?.[(c++, 'self')].Number;
  plainDotTail = globalThis.window?.self.JSON;
  // a chain END that is ITSELF a proxy hop - dotted, static-string computed or SE-keyed
  // computed alike - belongs to the alias / kept canons and stays raw (a value render of
  // only its object would strand the end hop outside the guard)
  static endHop = globalThis.window?.self?.['window'];
  endHopSeKey = globalThis.window?.self?.[(c++, 'window')];
  field = (globalThis.window ?? globalThis)[(c++, 'self')]?.Array;
  static {
    let sb;
    void ((sb = globalThis.window)?.[(c++, 'self')].Array.prototype.findLastIndex.call([1], v => v));
  }
}
export const keptHost = new KeptHost();

// a claimless ctor read in a `new` callee: the render stays inside the callee parens (a bare
// optional chain is not legal there), and an absent `window` throws in source and render alike
export const newCallee = new (globalThis.window?.self.CustomOther)(1);

// a call in the MIDDLE of the probe chain: the render lands on the deepest member whose object
// is the pure proxy nav, and the call rides the chain's own short-circuit outside it
export const midCall = globalThis.window?.self.foo().bar;

// a nullish-coalescing carrier over the probe chain: the guarded render is the left operand
export const nullishCarrier = globalThis.window?.[(c++, 'self')].JSON ?? 'absent';

// SE-keyed hop under a claimed static + instance dispatch: the dispatch's guard memoizes the
// probe root only, so the hop-key SE rides the claim body on the non-null branch
export const seKeyClaimDispatch = globalThis.window?.[(c++, 'self')].Array.of(8).flat();

// bare-probe INSTANCE guard-memo spellings: the prototype-method call keeps the raw nav in
// the guard body (the locked alias/kept canon), the call-argument SE stays put; the SE-key
// claimless `new`-callee renders the pony guard inside the callee parens
export const bareProtoCall = globalThis.window?.[(c++, 'self')].Array.prototype.find.call([5], v => v === (c++, 5));
export const bareProtoUnpolyfilled = globalThis.window?.[(c++, 'self')].Array.prototype.indexOf.call([5], 5);
export const bareSeKeyNewCallee = new (globalThis.window?.[(c++, 'self')]?.CustomThing)();

export async function awaited() {
  let aw;
  return (aw = await Promise.resolve(globalThis.window))?.[(c++, 'self')]?.Array ?? null;
}

let sw;
switch ((sw = globalThis.window)?.[(c++, 'self')]?.Array) { default: break; }

export const holder = {
  get val() {
    let gt;
    return (gt = globalThis.window)?.[(c++, 'self')].Array.prototype.map.call([9], v => v);
  },
};

export function* keptGen() {
  let yv;
  yield (yv = globalThis.window)?.[(c++, 'self')].Array.prototype.flatMap.call([2], v => [v]);
}

// a param-default synth twin without a SE key: the wrapper default stays the synth target
export const fromSynthDefault = (({ from } = (globalThis.window ?? { from: x => [x] })) => from)([1]);

// The kept double-optional through each remaining host: an ARRAY pattern source (never deferred),
// a for-of head, and an IIFE synth argument (the swap still owns the receiver over the narrowed
// defer). One memo at the root in the first two; the synth renders its own harvest in the third.
let c2 = 0;
let ap;
export const [firstOfKept] = ((ap = globalThis.window)?.[(c2++, 'self')].Array.of(1, 2)) ?? [];
let fh2;
for (const v of (fh2 = globalThis.window)?.self?.[(c2++, 'self')].Array.of(3) ?? []) void v;
let sy;
export const ofKeptDouble = (({ isArray } = {}) => isArray)((sy = globalThis.window)?.self?.[(c2++, 'self')].Array ?? {});
export { c2 };

