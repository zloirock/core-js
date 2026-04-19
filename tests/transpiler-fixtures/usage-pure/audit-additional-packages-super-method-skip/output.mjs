// `additionalPackages` are monorepo aliases / vendor forks the user picked deliberately -
// `scanExistingCoreJSImports` treats them as inert for pure-import dedup / super-method
// mapping. `MyP` is not registered with the injector, so `super.try` stays with the fork's
// own semantics and is not rewritten to the plugin default pkg
import MyP from 'my-fork/actual/promise';
class C extends MyP {
  static m() {
    return super.try(() => 1);
  }
}