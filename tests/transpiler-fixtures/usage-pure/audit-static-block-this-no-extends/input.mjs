// no `extends` → `this.X` in a static block has no super class to resolve against.
// `resolveStaticInheritedMember` returns null (buildSuperStaticMeta sees no superClass) →
// the plugin bails without emitting a polyfill. runtime would hit `C.from is undefined`
// anyway — no polyfill target exists
class C {
  static {
    this.from([1, 2]);
  }
}
