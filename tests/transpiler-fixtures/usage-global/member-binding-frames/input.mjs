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
