import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// nested computed access `obj[Symbol[Symbol.asyncIterator]]`: the outer access
// resolves to a malformed `Symbol.Symbol.asyncIterator` and must NOT polyfill;
// the inner Symbol member access still emits its own polyfill
const obj = {
  [_Symbol$asyncIterator]() { return null; },
};
console.log(obj[_Symbol[_Symbol$asyncIterator]]);