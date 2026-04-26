// `export * from 'core-js/...'` and `export { default } from 'core-js/...'` are pure
// re-exports, not runtime entry-imports - the plugin must leave them as-is.
export * from 'core-js/actual/array/from';
export { default as promise } from 'core-js/actual/promise';
