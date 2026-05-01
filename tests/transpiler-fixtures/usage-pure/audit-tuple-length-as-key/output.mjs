import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// findTypeMember tuple branch line 1254: tuple['length'] returns TSNumberKeyword (the static arity).
// But tuple[0] etc resolves through findTupleElement. Edge: accessing 'length' on a tuple via member.
type Pair = [string, number[]];
declare const t: Pair;
const len = t.length;
const x = _atMaybeArray(_ref = t[1]).call(_ref, 0);