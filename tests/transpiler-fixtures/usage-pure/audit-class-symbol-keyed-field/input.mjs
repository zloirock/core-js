// class method with computed `[Symbol.iterator]` key - polyfill provider must recognise
// the well-known Symbol member and substitute the pure binding in the computed key
// (`[_Symbol$iterator]`), the uniform behavior for every computed well-known-symbol method key.
// the method returns array elements; the iteration site narrows
class Box {
  [Symbol.iterator]() {
    return [1, 2, 3].values();
  }
}
const b = new Box();
for (const x of b) x.toFixed(2);
