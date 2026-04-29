// late-CJS detection diagnostic in usage-global mode.
// Sibling `@babel/plugin-transform-modules-commonjs` strips ESM markers after the
// polyfill provider's main pass finishes. Per-file injector cleanup is deferred so the
// late-CJS detector still has access to its state and surfaces the diagnostic warning
// under both usage modes
[1, 2, 3].at(0);
