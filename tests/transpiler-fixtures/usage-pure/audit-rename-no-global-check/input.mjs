// `_ref.x` references an undeclared global. both plugins' `isNameTaken` avoids
// allocating `_ref` initially. post-pass rename in babel's `pruneUnusedRefs`
// rebuilds `taken` only from declared bindings, not `program.references`, so
// an unused slot compaction may re-collide with the sloppy global
globalThis._ref = { x: 5 };
console.log(_ref.x);
[1, 2, 3].at(0);
