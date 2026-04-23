// class field type is folded across all `this.<field> = X` assignments, not just the init.
// `#box = null` + `this.#box = Array.from(xs)` unions to Array, selecting `_atMaybeArray`.
// init-only inference would either skip polyfill (nullable short-circuit in
// resolveCallReturnType) or pick the generic `_at` variant
class Maybe {
  #box = null;
  set(xs) { this.#box = Array.from(xs); }
  firstOrNull() { return this.#box?.at(0) ?? null; }
}
