// A JSX tag name is a runtime reference to a binding only when it can BE one. A lowercase-initial
// bare tag names an intrinsic element - the string, never the global of that spelling - so it must
// inject nothing, even though a global by that name exists and is polyfillable here. A member tag
// stays an expression whatever its case, so its root does reference the global and must inject.
// The two rows use different globals so each verdict is visible on its own in the output.

// Intrinsic bare tags: no module for either of these two globals.
export const cloneTag = <structuredClone x={1} />;
export const microTag = <queueMicrotask y={2} />;

// Member root of the same intrinsic spelling: an expression, so this global IS referenced.
export const memberRoot = <atob.Sub z={3} />;
