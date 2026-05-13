import _Array$from from "@core-js/pure/actual/array/from";
// Partial-consume of a static-object wrapper whose declarator init carries a SE prefix:
// `Array.from` extracts as a polyfill, `other` stays in the preserved declarator. The SE
// prefix lifts once as a standalone `log();` statement - the preserved declarator must
// reference the SE tail (`wrapper`) only, not the original `(log(), wrapper)` slice,
// or `log()` runs twice.
const wrapper = {
  Array,
  other: 1
};
log();
const from = _Array$from;
const {
  other
} = wrapper;