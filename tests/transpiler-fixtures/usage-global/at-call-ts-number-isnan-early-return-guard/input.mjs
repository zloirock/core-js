// `Number.isNaN` answers false for every number but `NaN`, so past the early return `x` is still
// `string | number`, and `at` injects from the string arm, the only one carrying it
function foo(x: string | number) {
  if (Number.isNaN(x)) return;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  x.at(-1);
}
