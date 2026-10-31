// Interaction of the super-optional chain-combine with a trailing operator: the combine emits ONE
// guard for `super.flat?.().map().at(-1)` (super method-GET memoized, `_ref.call(this)`), and the
// trailing `** 2` operator must wrap the WHOLE guarded ternary, not bind to the success branch only.
// exercises the combine's chain-emit paren-wrap reaching the chain tip on a super chainStart
class Wrapped extends Array {
  tail() {
    return super.flat?.().map(x => x).at(-1) ** 2;
  }
}
