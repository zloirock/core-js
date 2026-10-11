// TS `as const` cast on the LHS of `in`: `('from' as const) in Array`. the cast must be peeled so the LHS folds to
// the string `'from'`, and the `in` check folds to `true` (Array.from is polyfilled and always defined
// post-polyfill) - as a statement that answer performs nothing and leaves, while a value keeps it

export const hasFrom = true;