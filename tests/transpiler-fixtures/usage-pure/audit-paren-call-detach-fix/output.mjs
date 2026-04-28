import _includes from "@core-js/pure/actual/instance/includes";
// `(arr.includes)(1)` with `createParenthesizedExpressions: true`: pre-fix
// `unwrapTSExpressionParent` did not peel `ParenthesizedExpression`, so callerPath.parent
// resolved to the parens node (not the outer CallExpression), `isCall` flipped false, and
// the polyfill emit dropped `.call(arr)` (broken `this`: `(_includesMaybeArray(arr))(1)`).
// post-fix the function peels parens too, aligning createParens=true behavior with the
// default parser (which "fixes" detached `this` via the polyfill emission's
// `.call(arr, args)` form). users who want the broken-detach semantics must remove the
// polyfill plugin or rely on a separate lint
_includes(arr).call(arr, 1);