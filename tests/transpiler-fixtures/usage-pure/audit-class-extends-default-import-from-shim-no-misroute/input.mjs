// shadow-default-import lock (companion to renamed-import case): user's default import
// `import Promise from './shim'` binds the local name to a non-Promise module export.
// before the fix, resolveSuperClassName for ImportDefaultSpecifier returned the local
// name unconditionally; without injector recognition (source not core-js) downstream
// dispatch saw `Promise.try` as the global and emitted polyfill, overriding the user
// shim's semantics. after the fix, the injector check (registered via
// scanExistingCoreJSImports for `@core-js/pure/...` only) gates pass-through; non-
// core-js default imports fall to null and `super.try` stays untouched
import Promise from './my-promise-shim';

class C extends Promise {
  static run() {
    return super.try(() => 1);
  }
}

C.run();
