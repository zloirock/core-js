// an `in` test of an instance method over a binding a TS annotation types folds to `true`: as a statement that
// answer performs nothing and leaves, while a value keeps it
const s: string = x;
// @ts-expect-error an in test over an operand tsc refuses is the shape under test
"at" in s;
// @ts-expect-error an in test over an operand tsc refuses is the shape under test
export const hasAt = "at" in s;
