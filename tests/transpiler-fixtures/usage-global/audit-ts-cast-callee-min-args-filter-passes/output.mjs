import "core-js/modules/es.json.parse";
// positive companion to `audit-ts-cast-callee-min-args-filter-rejects`. JSON.parse with 2
// args (jsonString + reviver) crosses the min-args:2 threshold - polyfill emitted. TS
// wrappers (`as` / `!` / `satisfies`) must be peeled so the wrapped call is still seen as a
// valid 2-arg shape. pins filter symmetry: bare and wrapped 2-arg both emit one import.
JSON.parse(jsonString, reviver);
(JSON.parse as any)(jsonString, reviver);
JSON.parse!(jsonString, reviver);
(JSON.parse satisfies any)(jsonString, reviver);