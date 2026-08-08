// qualified `typeof X.Y` references the runtime root X. unplugin's scope tracker skips the
// TSTypeQuery chain root, so the shared annotation walker extracts the root from the
// TSQualifiedName and both pipelines pull in the root global's polyfills. distinct roots
// (Map / Promise) keep each line's import set identifiable
let a: typeof Map.prototype;
let b: typeof Promise.resolve;
