import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a wrapper slot the pattern DISCARDS still evaluates, and what it runs happens before the element
// the claim reads: that effect lifts ahead of the declaration, in source order, and the slot it
// leaves reads as the elision the pattern already had. the claims then serve as they do without a
// neighbour - a surface read, a memo of the element, a sentinel residual beside a live binding
const log = [];
const rows = [[1, 2]];
_pushMaybeArray(log).call(log, 'n');
_pushMaybeArray(log).call(log, 'e');
const viaSurface = _atMaybeArray(_globalThis.Array.prototype);
_pushMaybeArray(log).call(log, 'm');
const _ref = _flatMaybeArray(rows).call(rows);
const viaMemo = _atMaybeArray(_ref);
const [, {
  length: memoLength
}] = [, _ref];
_pushMaybeArray(log).call(log, 'x');
const mixedInstance = _atMaybeArray(_globalThis.Array.prototype);
const mixedStatic = _Object$keys;
const [, {
  other
}] = [, _globalThis];
export const r = [typeof viaSurface, viaMemo(0), memoLength, typeof mixedInstance, typeof mixedStatic, typeof other, log.length];