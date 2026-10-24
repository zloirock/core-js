// every non-`+` arithmetic operator COERCES to a number (`'3' * '2'` is 6) - operand
// kinds must not leak a string narrow onto the numeric runtime value
// @ts-expect-error an enum member tsc refuses is the shape under test
enum E2 { N = '3' * '2' }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
use(E2.N.padStart(2));
