// for-init nested-proxy flatten where the tail receiver is NOT a polyfillable proxy global
// (`globalThis` / `self`). Without a pure import for the receiver, for-init SE-sink injection
// bakes ref splices into the synthesized tail source - exercise that branch in addition to
// the SE-prefix arrow body bake. Distinct .values polyfill in the SE prefix vs .at narrow on
// the result of `from` keeps both receiver-tail and prefix bakes observable.
const userGlobal = { Array };
for (const { Array: { from } } = ((() => [].values())(), userGlobal); false;) from([]).at(0);
