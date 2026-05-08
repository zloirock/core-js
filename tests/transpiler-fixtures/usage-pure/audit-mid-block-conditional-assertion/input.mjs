// conditional assertion `if (flag) assertString(input)` narrows only on the success
// path. the use site after the `if` block must NOT assume `input` is narrowed when
// `flag` was false
declare function assertString(x: unknown): asserts x is string;

function take(input: unknown, flag: boolean) {
  if (flag) assertString(input);
  return input.at(0);
}
