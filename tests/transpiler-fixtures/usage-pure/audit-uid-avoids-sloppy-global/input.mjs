// sloppy-mode `_Map = ...` creates an undeclared global. if the UID generator chose `_Map`
// for the polyfill import, the emit would include `import _Map from ...` (const binding)
// next to `_Map = {...}` (reassignment of that const) — runtime TypeError. both plugins
// reserve undeclared assignment-target identifiers so the polyfill picks `_Map2` instead.
// babel via `program.globals` check in `isNameTaken`; unplugin via `collectAllBindingNames`
// adding non-orphan AssignmentExpression LHS to `names`
_Map = { custom: true };
new Map();
