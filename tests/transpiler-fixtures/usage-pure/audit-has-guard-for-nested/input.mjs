// two polyfills with the same optional root: outer records guardRef, inner reuses it
// via findOuterGuardRef. tests #byGuardedRoot O(1) lookup + identity-based match
fn()?.flat(fn()?.at(0));
