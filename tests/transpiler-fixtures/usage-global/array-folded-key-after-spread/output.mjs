import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The trailing spread runs before the folded computed key selects `at`.
// Global usage still injects that instance method from the array element.
let visits = 0;
const tail = {
  [Symbol.iterator]() {
    visits++;
    return [1][Symbol.iterator]();
  }
};
const [{
  [(visits++, 'at')]: at
}] = [Array.prototype, ...tail];
export { at, visits };