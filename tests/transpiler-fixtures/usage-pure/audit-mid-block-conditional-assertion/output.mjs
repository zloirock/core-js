import _at from "@core-js/pure/actual/instance/at";
declare function assertString(x: unknown): asserts x is string;
function take(input: unknown, flag: boolean) {
  if (flag) assertString(input);
  return _at(input).call(input, 0);
}