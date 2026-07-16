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
let fh;
for (const v of (fh = globalThis.window)?.[(c++, 'self')].Array.of(1, 2) ?? []) void v;

let tp;
export const inTemplate = `${(tp = globalThis.window)?.[(c++, 'self')].Array.prototype.findIndex.call([7], v => v === 7)}`;

let sp;
export const spreadOut = [...((sp = globalThis.window)?.[(c++, 'self')].Array.from?.([3]) ?? [])];

class KeptHost {
  static probe = globalThis.window?.[(c++, 'self')]?.Array;
  field = (globalThis.window ?? globalThis)[(c++, 'self')]?.Array;
  static {
    let sb;
    void ((sb = globalThis.window)?.[(c++, 'self')].Array.prototype.findLastIndex.call([1], v => v));
  }
}
export const keptHost = new KeptHost();

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
