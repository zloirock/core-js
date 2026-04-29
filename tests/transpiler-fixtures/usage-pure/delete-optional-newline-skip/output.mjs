import _globalThis from "@core-js/pure/actual/global-this";
// newline between receiver and `?.` must not change handling - `Promise` in delete-operand
// stays verbatim; `globalThis` receiver is still polyfilled.
delete _globalThis.Promise;