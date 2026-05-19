// static-dispatch FALLBACK path (member name not in the known statics whitelist):
// the rewrite replaces just the `.object` slot with the polyfill identifier rather
// than replacing the whole MemberExpression. previously the receiver's chain-
// assignment / SequenceExpression side effects were dropped (only the main
// non-fallback branch threaded `withSideEffects(id, allEffects)`). now mirrored:
// `prependChainAssignmentEffect` over the original receiver + `meta.sideEffects`
// from detect-usage compose into the replacement so `called++` fires before
// `noSuchStatic` is read
let called = 0;
(called++, Promise).noSuchStatic;
