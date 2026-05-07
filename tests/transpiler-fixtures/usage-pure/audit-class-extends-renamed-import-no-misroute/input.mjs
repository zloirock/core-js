// rename-shadow lock: `import {fn as Promise} from './local'` makes the local binding's
// name coincide with a known global, but the user explicitly aliased a non-Promise export
// to it. before the fix, resolveSuperClassName passed the local name through unconditionally
// for any import binding; resolveSuperImportName found no injector entry and superMeta.object
// stayed `Promise`, so static dispatch matched `Promise.try` in built-in-definitions.json
// and emitted `_Promise$try.call(this, ...)` - unsound, since runtime calls fn.try, not the
// global Promise.try. after the fix, only injector-recognised imports (registered via
// scanExistingCoreJSImports for `@core-js/pure/...` sources) pass through; renamed-shadow
// names from arbitrary modules return null and `super.try(...)` is left untouched
import { something as Promise } from './my-shim';

class C extends Promise {
  static run() {
    return super.try(() => 1);
  }
}

C.run();
