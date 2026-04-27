// late-CJS detection diagnostic: sibling plugin (`@babel/plugin-transform-modules-commonjs`)
// strips ESM markers AFTER our programExit. our programExit used to null `injector`
// immediately, so postHook bailed and the diagnostic warning never surfaced. fix defers
// cleanup to postHook so the markersGone + hasFlushed branch can fire and emit the
// user-facing warning about ESM/CJS mismatch
[1, 2, 3].at(0);
