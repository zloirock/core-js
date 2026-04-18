import _isIterable from "@core-js/pure/actual/is-iterable";
// exercises both recursive branches of resolveKey at once: BinaryExpression(+) and
// computed Identifier-alias; either alone is covered, the combination is not
const k1 = 'iter' + 'ator';
const k2 = k1;
_isIterable(obj);