// `declare namespace { function f(...args) }` parses as TSModuleDeclaration nested with
// TSDeclareFunction. estree-toolkit's scope crawler walks `RestElement` through reference
// paths on type-only function shapes and throws without intervention. The plugin walks
// the full AST and neutralises rest params on those shapes. Unrelated array binding below
// confirms the transform reaches usage detection without the crawler crashing
declare namespace N {
  function f(...args: number[]): void;
}
declare const arr: number[];
arr.flat();
