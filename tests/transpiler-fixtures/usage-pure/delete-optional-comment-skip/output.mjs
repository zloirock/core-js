import _globalThis from "@core-js/pure/actual/global-this";
// inline comment between receiver and `?.` must round-trip preserved - `Promise` in
// delete-operand stays verbatim; `globalThis` receiver is still polyfilled.
delete _globalThis /*?.*/.Promise;