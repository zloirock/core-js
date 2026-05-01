import _at from "@core-js/pure/actual/instance/at";
// `export const inst = new C()` decl-as-exports the instance binding. like the object-
// alias case, the declarator id is excluded from referencePaths so the in-closure leak
// classifier never sees the export. post-build `getExportedNames` check on every closure
// binding catches this. importer can mutate `inst.box` from outside, narrow becomes unsound
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
export const inst = new C();
inst.first();