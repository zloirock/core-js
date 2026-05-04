// directive prologue inside the inline-call body. ESTree treats `'use strict'` as an
// ExpressionStatement (with a `directive` field); Babel parks it in a separate `directives`
// array on the function body. singleReturnBodyExpression iterates body.body only, so:
//   - ESTree: the directive is an ExpressionStatement that is neither LOCAL_BINDING_DECL_TYPES
//     nor a ReturnStatement, so it counts as a prefix statement -> inlineCallHasObservableEffects
//     returns true, and the original receiver call is preserved via sideEffects wrap
//   - Babel: directives sit outside body.body, so the body has only the ReturnStatement and
//     no observable effects are recorded; the directive is preserved by virtue of staying
//     attached to the unchanged FunctionExpression declaration
// either way the static dispatch on the resolved receiver should rewrite to the polyfill;
// the directive-bearing function declaration itself is not removed
const strictReturn = function () {
  'use strict';
  return Promise;
};
const result1 = strictReturn().resolve(1);
const strictReturnArrow = () => {
  'use strict';
  return Promise;
};
const result2 = strictReturnArrow().reject(2);
export { result1, result2 };
