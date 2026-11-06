// `export * from 'core-js/...'` is a barrel re-export, not a side-effect import - by design
// it is NOT registered as an existing entry by the entry detector (which walks only
// ImportDeclaration / ExpressionStatement / TSImportEqualsDeclaration). The sibling
// `import 'core-js/actual/array/map'` is expanded independently, and the barrel passes
// through to module resolution without conflicting with the per-target expansion
export * from 'core-js/actual/array/from';
import 'core-js/actual/array/map';
