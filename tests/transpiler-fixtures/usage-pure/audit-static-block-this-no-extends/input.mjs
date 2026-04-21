// no `extends` means `this.X` in a static block has no super class to resolve against.
// `resolveStaticInheritedMember` returns null (buildSuperStaticMeta sees no superClass)
// and the plugin bails. runtime would hit `C.from is undefined` anyway, so no target
class C {
  static {
    this.from([1, 2]);
  }
}
