// an SE-key destructure (`{ [(eff(), 'k')]: v } = R`) keeps the key in place (its effect runs once) and binds
// the polyfill as a statement BEFORE the surviving residual. when the host is a bodyless control body the
// binding and the residual must share a `{ }` block, else the residual escapes the guard and runs the key
// effect even when the control is not taken. block-wrapped to match babel's bodyless-body auto-block

// bodyless `if`: a static extract - the key effect must run only when `c` is taken
if (c) var { [(log(), 'from')]: f } = Array;

// bodyless for-of BODY: an instance method, distinct from above - the for-of/in HEAD bail must not catch the
// body (keying on the node type alone dropped the polyfill, mistaking the body for the head binding)
for (item of items) var { [(log(), 'flat')]: m } = rows;

// bodyless do-while: an instance method on a CONSTANT-literal receiver - the memoized `_ref` hoist also runs
// before the residual, so all three statements share the block (this shape previously crashed the build)
do var { [(log(), 'at')]: a } = [1, 2, 3]; while (c);
