// optional-chain hop produces an intermediate ChainExpression on oxc, flat
// OptionalMemberExpression on babel. without peeling the intermediate wrapper inside the
// chain walk, oxc bails out at the wrapper and the `at` polyfill is missed for the
// typed array path, while babel continues to resolve and emits the array-specific helper
declare const data: { items: number[] };
(data?.items).at(0);
