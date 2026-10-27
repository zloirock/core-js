import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
// The computed name reads a string outside the parameter scope.
// The method reads its array default, then the string written to that parameter.
const value = 'outer';
class Box {
  [_atMaybeString(value).call(value, 0)](value = [1, 2]) {
    const first = _includes(value).call(value, 2);
    value = 'ab';
    return [first, _endsWithMaybeString(value).call(value, 'b')];
  }
}
new Box().o();