// inner-level RestElement does NOT trigger catch extraction  -  modern engines support
// nested rest in catch params natively, and inner bindings (`x`, `rest`) are local
// catch bindings with no body usage. shallow rest check correctly stays at the outer
// level (no rest there); descending would just add `_ref` noise
try {
  // body intentionally empty
} catch ({ a: { x, ...rest } }) {
  // empty body
}
