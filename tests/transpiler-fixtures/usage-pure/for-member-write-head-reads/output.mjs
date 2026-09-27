import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Computed keys and defaults in the head are reads before their target writes.
const a = [1, 2];
for ({
  [_atMaybeArray(a).call(a, 0)]: a.at
} of xs) consume(a.at);
const b = [3, 4];
for ([b.includes = _includesMaybeArray(b).call(b, 4)] of ys) consume(b.includes);