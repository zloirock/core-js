import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A folded computed data key names the same source slot as the matching pattern key.
// The array source call and nested method read run once before the quiet sibling.
// The literal wrapper needs no retained capture.
const list = [3, [1, 2]];
let at, after;
// eslint-disable-next-line no-useless-computed-key -- the folded computed spelling is the case under test
at = _atMaybeArray(_flatMaybeArray(list).call(list));
after = 1;
export const result = [at.call([9], 0), after];