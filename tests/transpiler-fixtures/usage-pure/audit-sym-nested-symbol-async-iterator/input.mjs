const obj = {
  [Symbol.asyncIterator]() { return null; },
};
console.log(obj[Symbol[Symbol.asyncIterator]]);
