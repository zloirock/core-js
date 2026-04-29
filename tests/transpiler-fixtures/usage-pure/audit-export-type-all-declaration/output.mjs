// `export type * as NS from 'mod'` - declaration-level `exportKind: 'type'` on
// ExportAllDeclaration. plugin's TS-type-only detection currently does not mark this as
// type-only because the inner has no specifier (re-exports all under namespace); plugin
// also doesn't inject runtime polyfill for the namespace identifier. fixture documents
// that no over-injection happens via the export-all-as-type path
export type * as Types from './types';