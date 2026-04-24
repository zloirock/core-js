// lowercase destructure from globalThis - not a known global, no polyfill probes
const { foo } = globalThis;
foo.someMethod?.();
