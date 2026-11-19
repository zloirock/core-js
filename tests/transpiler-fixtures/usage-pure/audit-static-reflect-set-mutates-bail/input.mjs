// Reflect.set(Builtin, key, value) is the call-form of `Builtin.key = value` and the [[Set]] twin
// of Object.assign - it monkey-patches the static slot, so the pre-pass marks Array.from and the
// later call stays verbatim. an unrelated static (Array.of) on the same ctor still polyfills
Reflect.set(Array, "from", function () { return []; });
Array.from([1, 2, 3]);
Array.of(4, 5);
