import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref4;
// LITERAL-discriminated overloads on the remaining literal spellings: a bigint LITERAL param
// (`k: 1n`) discriminates like a string/number literal - babel's BigIntLiteral and oxc's bigint
// Literal canonicalize to one BigInt value, so both emitters pick the same arm (a dropped bigint
// value left babel on the generic fold while oxc picked the arm - a parser desync); a NEGATIVE
// literal param (`k: -1`, a UnaryExpression around the magnitude) resolves through the same
// canonical extractor on both parsers
interface P {
  get(k: 1n): string[];
  get(k: 2n): string;
}
interface Q {
  pick(k: -1): string[];
  pick(k: 1): string;
}
declare const p: P;
declare const q: Q;
_atMaybeArray(_ref = p.get(1n)).call(_ref, 0);
_atMaybeString(_ref2 = p.get(2n)).call(_ref2, 0);
_includesMaybeArray(_ref3 = q.pick(-1)).call(_ref3, 'z');
_atMaybeString(_ref4 = q.pick(1)).call(_ref4, 0);