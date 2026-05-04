// re-export `export { name } from 'mod'` and bare `export * from 'mod'` are top-level
// import-region for reorderRefsAfterImports. when the file mixes user re-exports and
// uses polyfilled instance methods + chained inner-poly chain (which generates `_ref`
// vars), generated `_ref` must be reordered to land AFTER all imports including
// re-exports - empty `var _ref` declaration must not slip between import and re-export
export { externalA } from './audit-stub-a.mjs';
export * from './audit-stub-b.mjs';

const arr = [1, 2, 3];
const out1 = arr?.at?.(0)?.findLast(x => x > 0);
const out2 = arr?.flat?.()?.flatMap(x => [x]);
export { out1, out2 };
