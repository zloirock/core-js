import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// a pattern-valued symbol extraction MOVES its names onto a new declarator; the host goes away when
// the extraction takes every binding it had. the structural type of a moved name must still come from
// the declarator that really binds it: an object rest is always a fresh object, so `Object.keys` keeps
// its provably-non-primitive decline. reading the dead host instead answers "unknown" and re-injects
const plain = {
  x: 1
};
const {
  from,
  ...rest
} = _getIteratorMethod(plain);
console.log(from, Object.keys(rest), Object.freeze(rest));
// same relocation off a proxy global, which renders through the other emission route
const {
  of,
  ...proxyRest
} = _getIteratorMethod(_globalThis);
console.log(of, Object.keys(proxyRest));
// a static the targets DO need is unaffected - the decline is per-argument, not a blanket bail
console.log(_Object$values(rest));
// a `var` redeclaration of the same rest name from a NESTED block hoists into one binding: both
// declarators relocate their names, so the surviving question is still "object", and the dead hosts
// must not linger - a kept host used to leave the two lanes disagreeing about the redeclaration
var {
  from: hoistedFrom,
  ...hoistedRest
} = _getIteratorMethod(plain);
{
  var {
    [_Symbol$asyncIterator]: {
      of: hoistedOf,
      ...hoistedRest
    }
  } = plain;
}
console.log(hoistedFrom, hoistedOf, Object.keys(hoistedRest));
// controls: an unrelocated rest declines, an unknown argument still injects
const {
  a,
  ...plainRest
} = {
  a: 1,
  b: 2
};
export function unknownArg(x) {
  return _Object$keys(x);
}
console.log(a, Object.keys(plainRest));