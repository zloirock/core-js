// regression: addPureImport must publish the chosen polyfill name to Babel's
// `program.references`/`program.uids` so that sibling transforms running
// afterwards (here: @babel/plugin-transform-computed-properties) don't pick the
// same name for a temp variable. without registration, both the import and the
// computed-property temp end up named `_Reflect$ownKeys`, the temp shadows the
// import, and `_Reflect$ownKeys is not a function` blows up at runtime.
Reflect.ownKeys({ a: 1, [s]: 2 });
