// static-dispatch FALLBACK path (member name not in the known statics whitelist): the
// rewrite replaces only the object slot with the polyfill identifier, not the whole
// MemberExpression. the original receiver's chain-assignment / SequenceExpression side
// effects must ride along into the replacement so `called++` fires before `noSuchStatic`.
let called = 0;
(called++, Promise).noSuchStatic;
