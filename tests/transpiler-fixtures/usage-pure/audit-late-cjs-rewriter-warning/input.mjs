// late-CJS detection diagnostic: sibling plugin (`@babel/plugin-transform-modules-commonjs`)
// strips ESM markers after the polyfill provider's main pass finishes. Per-file injector
// cleanup is deferred so the late-CJS detector still has access to its state and can emit
// the user-facing diagnostic about ESM/CJS mismatch
[1, 2, 3].at(0);
