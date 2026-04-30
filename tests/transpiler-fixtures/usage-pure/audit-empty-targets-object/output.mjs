// targets: {} parses to an empty Map without falling back to browserslist; downstream
// shouldInjectPolyfill iterates zero engines and emits no polyfills. accepted divergence
// from the (truthy-but-empty) targets-truthiness check at line 16 vs the size-aware
// guard at line 23 (browserslist fallback path)
'str'.at(-1);
[1, 2].at(0);