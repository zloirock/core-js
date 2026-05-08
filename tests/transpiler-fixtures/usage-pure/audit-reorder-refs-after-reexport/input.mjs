// Re-exports (`export ... from`) belong to the leading import region per ESM module-graph order.
// Injected `var _ref;` must land after the last re-export, otherwise `import/first` would warn.
import { foo } from './lib-foo.mjs';
export { bar } from './lib-bar.mjs';
export * from './lib-all.mjs';
export * as ns from './lib-ns.mjs';
declare function getArr(): unknown[];
const a = getArr().at(0);
