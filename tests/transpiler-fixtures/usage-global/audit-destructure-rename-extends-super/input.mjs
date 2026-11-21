// A destructured Set alias supplies the prototype for an instance super call.
const { Set } = globalThis;
class C extends Set {
  combine(other) { return super.union(other); }
}
export const values = [...new C([1]).combine(new Set([2]))];
