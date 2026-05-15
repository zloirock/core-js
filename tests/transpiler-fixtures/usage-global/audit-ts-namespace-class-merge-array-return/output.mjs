import "core-js/modules/es.array.at";
// merged namespace exports a fn returning real `number[]` - downstream .at must
// polyfill (Array.prototype.at). symmetric to the narrowing case: now the result type
// IS array, so dispatch correctly routes to es.array.at
class Wrapper {}
namespace Wrapper {
  export function getItems(): number[] {
    return [];
  }
}
const arr = Wrapper.getItems();
arr.at(0);