// inline comment between receiver and `?.` must round-trip preserved - `Promise` in
// delete-operand stays verbatim; `globalThis` receiver is still polyfilled.
delete globalThis /*?.*/ ?.Promise;
