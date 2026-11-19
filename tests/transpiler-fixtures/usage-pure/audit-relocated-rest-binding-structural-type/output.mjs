import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const plain = {
  x: 1
};
const {
  [_Symbol$iterator]: {
    from,
    ...rest
  }
} = plain;
console.log(from, Object.keys(rest), Object.freeze(rest));
// same relocation off a proxy global, which renders through the other emission route
const {
  [_Symbol$iterator]: {
    of,
    ...proxyRest
  }
} = _globalThis;
console.log(of, Object.keys(proxyRest));
// a static the targets DO need is unaffected - the decline is per-argument, not a blanket bail
console.log(_Object$values(rest));
var {
  [_Symbol$iterator]: {
    from: hoistedFrom,
    ...hoistedRest
  }
} = plain;
{
  var {
    [_Symbol$asyncIterator]: {
      of: hoistedOf,
      ...hoistedRest
    }
  } = plain;
}
console.log(hoistedFrom, hoistedOf, Object.keys(hoistedRest));
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