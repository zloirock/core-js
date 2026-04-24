// `export * as Promise from "mod"` - the local `Promise` is a re-export alias, not a runtime
// reference to the global. oxc models this as ExportAllDeclaration with an `exported` Identifier
// slot (not ExportNamespaceSpecifier like babel). plugin must recognise the alias position
// and skip polyfill injection - otherwise Promise polyfill imports leak into files that only
// re-export the name
export * as Promise from "mod";