import _Promise$try from "@core-js/pure/actual/promise/try";
// re-export of a core-js pure entry creates no local binding, so dedup detection sees
// no specifier to register. injector emits its own default import alongside the
// re-export for the same module - bundlers tree-shake to one file load, but the
// emitted source carries both statements
export { default } from "@core-js/pure/actual/promise/try";
_Promise$try(() => 1);