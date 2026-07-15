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
