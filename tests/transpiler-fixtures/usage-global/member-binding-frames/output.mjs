import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.ends-with";
import "core-js/modules/es.string.includes";
// The computed name reads a string outside the parameter scope.
// The method reads its array default, then the string written to that parameter.
const value = 'outer';
class Box {
  [value.at(0)](value = [1, 2]) {
    const first = value.includes(2);
    value = 'ab';
    return [first, value.endsWith('b')];
  }
}
new Box().o();