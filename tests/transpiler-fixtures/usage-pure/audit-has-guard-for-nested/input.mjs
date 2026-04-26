// nested optional chains with two polyfilled instance calls share the same guard
// expression for the outer chain; inner `fn()?.at(0)` keeps its own independent guard.
fn()?.flat(fn()?.at(0));
