// `require!('core-js/...')` - TS non-null assertion on the require callee. Parallel to
// `(require as any)(...)` and `(require)(...)` - all three reach the same identifier
// check after the wrapper peel covers parens, TS expression wrappers, and chain wrappers
require!('core-js/actual/promise');
