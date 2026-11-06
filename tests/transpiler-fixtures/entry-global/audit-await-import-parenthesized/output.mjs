// `await (import(...))` with preserved parenthesized wrapper around the import call -
// the resolver now unwraps parens before matching the import expression, so the
// entry resolves to `core-js/actual/array/from` instead of silently being ignored
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";