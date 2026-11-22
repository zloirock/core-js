// A primitive string throws in both statement and value positions.
const s: string = x;
// @ts-expect-error an in test over an operand tsc refuses is the shape under test
"at" in s;
// @ts-expect-error an in test over an operand tsc refuses is the shape under test
export const hasAt = "at" in s;
