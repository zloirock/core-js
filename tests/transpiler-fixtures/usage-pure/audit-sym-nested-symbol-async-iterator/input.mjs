// nested computed access `obj[Symbol[Symbol.asyncIterator]]`: the outer access
// resolves to a malformed `Symbol.Symbol.asyncIterator` and must NOT polyfill;
// the inner Symbol member access still emits its own polyfill
const obj = {
  [Symbol.asyncIterator]() { return null; },
};
console.log(obj[Symbol[Symbol.asyncIterator]]);
