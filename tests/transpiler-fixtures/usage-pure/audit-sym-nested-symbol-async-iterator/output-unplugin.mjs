import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
const obj = {
  [_Symbol$asyncIterator]() { return null; },
};
console.log(obj[Symbol[_Symbol$asyncIterator]]);