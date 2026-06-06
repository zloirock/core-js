// optional call on a non-polyfilled method, followed by plain member hops, then a polyfilled
// instance method: `recv.m?.().x.at(-1)`. the optional-call body collapses to `_ref.call(recv)`,
// so the intermediate member tail (`.x`, `.rows`) must be spliced back on - otherwise the
// polyfill reads off the bare call result and the hop is silently dropped. a side-effecting
// receiver (`getRec()`) is memoized once into its own ref
obj.m?.().x.at(-1);
getRec().m?.().rows.flat();
