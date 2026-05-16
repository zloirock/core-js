// `(bar(), 'from') in Array` - LHS has a SequenceExpression carrying the side-effect
// `bar()`. the polyfill folds the in-expression to `true` (Array.from is always defined
// post-polyfill), but the LHS side-effects MUST execute - dropping them changes runtime
// observable behaviour. mirror of the RHS-side SE rescue (`'k' in (fn(), Array)`).
bar(), true;