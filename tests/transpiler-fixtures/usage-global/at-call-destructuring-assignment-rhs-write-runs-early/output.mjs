import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The method call precedes this destructuring assignment and sees the original array.
const o = {
  f: [1, 2],
  m() {
    return this.f.at(0);
  }
};
o.m();
let q;
[q] = [o.f = 'str'];
export { q };

// This default runs after the RHS has replaced the stored array with a string.
export function duringAssignment() {
  const box = {
    f: [7],
    m() {
      return this.f.at(0);
    }
  };
  let result;
  [result = box.m()] = (box.f = 'str', []);
  return result;
}