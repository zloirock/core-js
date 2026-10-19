// bigint operands flow through the shared operator table - the member is KNOWN bigint,
// so a string-only method name must not inject anything
// @ts-expect-error an enum member tsc refuses is the shape under test
enum E3 {
  B = 1n * 2n,
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
use(E3.B.padEnd(2));