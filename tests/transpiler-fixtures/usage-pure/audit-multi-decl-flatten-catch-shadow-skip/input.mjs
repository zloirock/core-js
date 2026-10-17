// multi-decl flatten with sibling that locally shadows the receiver name via `catch`
// parameter. catch-clause parameter binds locally for the catch body's scope; without
// CatchClause scope tracking, the inner `globalThis` reference would be rewritten to
// `_globalThis` even though the catch param shadows the outer global
const { Array: { from } } = globalThis, y = (() => {
  try {
    throw 'err';
  } catch (globalThis) {
    return globalThis;
  }
})();
export { from, y };
