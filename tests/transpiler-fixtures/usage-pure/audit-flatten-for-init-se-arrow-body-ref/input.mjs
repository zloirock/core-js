// for-init nested-proxy flatten with a SE-prefix IIFE: the for-statement init has no
// statement slot to host the lifted SE prefix, so the destructure synthesizes a
// `_unused = (sePrefix, tail)` sink. The instance-method polyfill inside the arrow body
// needs a `var _ref;` declaration whose offset is local to the synthesized buffer, not
// the original source. If the insert uses original-source coordinates, it corrupts the
// sink and the adjacent `globalThis` substitution emits invalid syntax.
for (const { Array: { from } } = ((() => [].values())(), globalThis); false;) from([]);
