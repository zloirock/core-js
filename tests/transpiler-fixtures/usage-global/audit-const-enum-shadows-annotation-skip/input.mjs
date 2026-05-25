// `const enum Map { A=1 }` - tsc inlines references but the declaration itself remains a
// runtime TS shadow for annotation-walker purposes. shared adapter hasBinding's path-ancestor
// walk picks up TSEnumDeclaration (`declare` flag absent), shadowing the Map polyfill in the
// downstream type annotation
const enum Map {
  A = 1,
}
let x: Map;
export { x };
