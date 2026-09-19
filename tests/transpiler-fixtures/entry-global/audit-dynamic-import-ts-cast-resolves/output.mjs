// `await import('core-js/...' as any)` - top-level await with TS-cast string argument.
// the dynamic-import detection uses the same adapter unwrap as the static `require` path,
// so a TS cast on the argument still surfaces the entry to the registry
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";