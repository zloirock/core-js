import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Quiet single-use hops keep legal source keys and one comment owner.
// The two receiver rows independently require Array.at and Array.includes.
const quoted = {
  wrapper: {
    data: [1]
  },
  tail: 7
};
let at, quotedTail;
at = _atMaybeArray(quoted['wrapper' /* outer key */]['data' /* inner key */]);
({
  tail: quotedTail
} = quoted);
const numeric = [[[1]], 8];
let includes, numericTail;
includes = _includesMaybeArray(numeric[0][0]);
({
  1: numericTail
} = numeric);
export const result = [at.call([4], 0), includes.call([4], '4'), quotedTail, numericTail];