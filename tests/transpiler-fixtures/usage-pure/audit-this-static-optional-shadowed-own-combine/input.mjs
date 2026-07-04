// an OWN static shadows the inherited name: `this.from` dispatches to the user's method, so no
// always-defined polyfill backs the read and the optional KEEPS its guard (the same guarded
// combine shape as any non-polyfillable inner - native short-circuit semantics preserved even
// under a rebound `this`); the trailing instance methods still polyfill against the result and
// the user's method is called exactly once
class C extends Array {
  static from(x) {
    return [9, ...x];
  }
  static make() {
    return this.from?.([1, 2]).flat().at(0);
  }
}
export const r = C.make();
