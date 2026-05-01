import _at from "@core-js/pure/actual/instance/at";
// `export const alias = o` declares-and-exports the alias in one statement. babel's
// scope tracker excludes declarator id slots from `binding.referencePaths`, so the leak
// detection in the closure walker (which only sees REFS) misses this. post-build check
// against `getExportedNames` catches any closure binding (root or alias) that is exported,
// bailing to no-narrow. importer can `import { alias } from './mod'; alias.arr = "..."`
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref;
    return _at(_ref = this.arr).call(_ref, 0);
  }
};
export const alias = o;
o.test();