import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// U+2028/U+2029 count as line terminators per ES spec, so a `core-js-disable-next-line`
// comment followed by U+2028 makes the call on the SAME physical line a separate ES line
// that the directive disables. byte-encoded U+2028 (\xe2\x80\xa8) sits between the directive
// and the first `.at` call; the second call on the next physical line (after LF) stays
// enabled. distinct polyfill per slot (`.at` disabled, `.flat` emitted) makes this observable.
// core-js-disable-next-line
[].at(-1);
[].flat();