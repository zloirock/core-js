declare function assertString(x: unknown): asserts x is string;

function take(input: unknown, flag: boolean) {
  if (flag) assertString(input);
  return input.at(0);
}
