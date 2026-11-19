// A conditional or deferred alias write provides only a possible realm value.
// Pure guards its live constructor read, preserving an uninitialized-alias throw
// and the static on a matching value. Only an always-evaluated guard write proves
// the alias strongly enough for a direct fold.
var _g;
var _h;
var _i;
export const inArm = (c ? (_g = globalThis) : 1) ? _g.Map.groupBy([1], x => x) : 0;
export const inBody = (h = function () { _h = globalThis; }) ? _h.Object.fromEntries([]) : 0;
export const onSpine = (_i = globalThis) == null ? void 0 : _i.Array.of(3);
