// TS `as const` on LHS of `in`: `('from' as const) in Array`. TS-cast is a runtime no-op
// (`'from' as const` evaluates to the literal `'from'`); resolveKey peels the TS wrapper
// and resolves the LHS to the string key `'from'`. usage-pure's handleInExpression folds
// the whole expression to `true` because Array.from is a polyfilled static (always defined
// post-polyfill). covers the TS-wrapper-on-bare-string-LHS shape - the cast doesn't block
// the fold-to-true path
true;