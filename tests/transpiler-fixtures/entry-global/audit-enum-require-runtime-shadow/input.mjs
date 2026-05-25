// non-ambient `enum require {}` emits an IIFE-backed runtime binding that shadows the
// host `require`. polyfill-provider must classify it as a shadow and skip entry
// expansion. babel's adapter routes through a TS-runtime binding scan; unplugin's
// require-binding detector must enumerate TSEnumDeclaration / TSModuleDeclaration
// (non-`declare`) so the two pipelines agree.
enum require { foo = 1 }
require('core-js/actual/array/from');
