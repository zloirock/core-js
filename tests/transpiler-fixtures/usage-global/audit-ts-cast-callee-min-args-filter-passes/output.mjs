import "core-js/modules/es.json.parse";
// positive case companion to `audit-ts-cast-callee-min-args-filter-rejects`. JSON.parse
// with 2 args (jsonString + reviver) crosses min-args:2 threshold - polyfill emitted.
// TS wrappers MUST not block the emission either: after `isCallee` peels the wrapper,
// filter sees the wrapped call as a valid 2-arg shape and lets the polyfill through.
// pins filter symmetry: bare and wrapped 2-arg call both produce a single polyfill import
JSON.parse(jsonString, reviver);
(JSON.parse as any)(jsonString, reviver);
JSON.parse!(jsonString, reviver);
(JSON.parse satisfies any)(jsonString, reviver);