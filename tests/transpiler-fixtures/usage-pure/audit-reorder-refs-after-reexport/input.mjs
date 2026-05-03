// `var _ref;` placement after the leading import region must include `export ... from`
// re-exports because TC39 module records fetch the re-exported module before evaluating
// user body. without the re-export accept in `isTopLevelImportLike`, `lastUserImportEnd`
// would stop at the first non-ImportDeclaration statement and the injected `var _ref;`
// would land BEFORE the re-export - lint `import/first` would warn about an interleaved
// non-import statement, and ESM module-graph linkers that hoist all imports first would
// also break the source order assumption. forcing a `_ref` allocation via a side-effecty
// receiver expression (`getArr()`) lets the placement decision become visible in output
import { foo } from './lib-foo.mjs';
export { bar } from './lib-bar.mjs';
export * from './lib-all.mjs';
export * as ns from './lib-ns.mjs';
declare function getArr(): unknown[];
const a = getArr().at(0);
