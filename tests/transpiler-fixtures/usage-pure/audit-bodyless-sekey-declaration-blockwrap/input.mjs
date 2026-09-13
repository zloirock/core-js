// A computed instance key runs after receiver evaluation and before the property read.
// A bodyless control keeps the receiver, key effect, and binding in its one guarded statement.

// bodyless `if`: a static extract - the key effect must run only when `c` is taken
if (c) var { [(log(), 'from')]: f } = Array;

// bodyless for-of BODY: an instance method, distinct from above - the for-of/in HEAD bail must not catch the
// body (keying on the node type alone dropped the polyfill, mistaking the body for the head binding)
for (item of items) var { [(log(), 'flat')]: m } = rows;

// The literal-receiver do-while follows the same ordering on each iteration.
do var { [(log(), 'at')]: a } = [1, 2, 3]; while (c);
