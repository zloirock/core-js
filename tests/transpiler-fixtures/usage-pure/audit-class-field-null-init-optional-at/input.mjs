// `#box = null` is a sentinel init - real assignments happen in `set`. resolveClassMemberNode
// must drop nullable-only inits to unknown, else the nullable-receiver short-circuit in
// resolveCallReturnType skips polyfill emission for `this.#box?.at(0)` entirely
class Maybe {
  #box = null;
  set(xs) { this.#box = Array.from(xs); }
  firstOrNull() { return this.#box?.at(0) ?? null; }
}
