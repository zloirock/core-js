// An inline tag receives the strings array before its Reflect argument.
// Its parameter reads only ownKeys; the namespace does not escape.
(function(strings, namespace) { return namespace.ownKeys({ value: 1 }); })`${Reflect}`;
