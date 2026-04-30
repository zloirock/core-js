// `import type Map from "./mod"` - ImportDefaultSpecifier under ImportDeclaration with
// importKind === 'type'. `isTypeOnlyImportBinding` filters this in
// `isAmbientBindingShape`, so the binding does NOT block polyfill emission. references
// to Map resolve to the global at runtime (tsc elides type-only imports)
import type Map from "./not-a-real-mod";
const m = new globalThis.Map();
const r = m.has(1);
export { r };
