// `enum Map { A }` registers a runtime TS-only declaration that babel's `binding-identifier lookup`
// doesn't see (enums aren't in babel's scope). type-annotation walker must consult the shared
// adapter hasBinding (which walks the path's ancestor body for TSEnumDeclaration / TSModule
// Declaration) so the enum properly shadows the Map polyfill in `let x: Map`
enum Map { A }
let x: Map;
