// newline between receiver and `?.` must not change handling - `Promise` in delete-operand
// stays verbatim; `globalThis` receiver is still polyfilled.
delete globalThis
  ?.Promise;
