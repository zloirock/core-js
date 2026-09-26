// a `namespace require {}` binds a runtime `require` only when INSTANTIATED. one whose sole member is
// a `const enum` (tsc-inlined) emits no object, so it is elided and the `require('core-js/...')` call
// still hits the host global - a real entry that must expand. the entry-detection require-shadow check
// must agree with the usage-side runtime-binding walk (both go through the shared instantiation gate),
// otherwise babel expands while unplugin silently skips.
namespace require { const enum E {} }
require('core-js/actual/array/from');
