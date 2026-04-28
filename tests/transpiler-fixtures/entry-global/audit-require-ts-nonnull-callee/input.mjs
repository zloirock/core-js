// `require!('core-js/...')` - TS non-null assertion on the require callee. parallel to
// `(require as any)(...)` and `(require)(...)` - all three reach the same Identifier
// check via `unwrapParens` (parens / TS / chain wrappers)
require!('core-js/actual/promise');
