import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const isStr: (x: unknown) => x is string = x => typeof x === 'string';
function test(x: unknown) {
  if (isStr(x)) _atMaybeString(x).call(x, -1);
}
test('hi');