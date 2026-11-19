import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
declare function convert(input: number): number[];
function read(value: ReturnType<typeof convert> = 'abc') {
  function convert(input: string) {
    return input;
  }
  return _includesMaybeString(value).call(value, 'bc');
}
function rest(...values: ReturnType<typeof convert>[]) {
  var _ref;
  function convert(input: string) {
    return input;
  }
  return _includesMaybeString(_ref = values[0]).call(_ref, 'bc');
}
function object({
  value
}: {
  value: ReturnType<typeof convert>;
} = {
  value: 'abc'
}) {
  function convert(input: string) {
    return input;
  }
  return _includesMaybeString(value).call(value, 'bc');
}
function array([value]: ReturnType<typeof convert>[] = ['abc']) {
  function convert(input: string) {
    return input;
  }
  return _includesMaybeString(value).call(value, 'bc');
}
read();
rest('abc');
object();
array();
class Box {
  constructor(public value: ReturnType<typeof convert> = 'abc') {
    function convert(input: string) {
      return input;
    }
    _includesMaybeString(value).call(value, 'bc');
  }
}
new Box();