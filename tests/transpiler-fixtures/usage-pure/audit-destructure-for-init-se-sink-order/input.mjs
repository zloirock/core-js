// a for-init declaration where a side-effecting destructure init sits BETWEEN a preceding and a following
// sibling (`for (let a = globalThis.foo, { from } = (eff(), Array), b = later(); ...)`): the lifted SE
// sink must land at ITS declarator slot in the comma-list - after `a`, before `b` - preserving source
// evaluation order, not hoisted to the head where `eff()` would run before `a` is bound
for (let a = globalThis.foo, { from } = (eff(), Array), b = later(); cond;) {
  use(a, from, b);
}
