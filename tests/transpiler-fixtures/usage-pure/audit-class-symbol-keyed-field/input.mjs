// class field with computed `[Symbol.iterator]` key - polyfill provider must recognise
// the well-known Symbol member, emit Symbol.iterator polyfill side-effect import, NOT
// substitute `Symbol.iterator` in the computed key (it would corrupt the class shape).
// the field's value is a generator returning array elements; iteration site narrows
class Box {
  [Symbol.iterator]() {
    return [1, 2, 3].values();
  }
}
const b = new Box();
for (const x of b) x.toFixed(2);
