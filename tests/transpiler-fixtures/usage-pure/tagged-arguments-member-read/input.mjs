// All tag invocations supply Reflect after the strings array.
// The parameter reads only ownKeys, so the other namespace methods stay absent.
function tag(strings, namespace) { return namespace.ownKeys({ value: 1 }); }
tag`${Reflect}`;
