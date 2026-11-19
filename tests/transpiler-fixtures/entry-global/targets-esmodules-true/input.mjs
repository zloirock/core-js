// `targets: { esmodules: true }` filter - three-level demo:
// - `tanh` (ES6, Chrome 38+): fully in ESM baseline -> module dropped
// - `hypot` (ES6) baseline BUT Chrome < 78 buggy (v8 issue 9546), Chrome 61 in baseline -> emits
// - `sum-precise` (stage 3, Chrome 147+): post-baseline -> emits
import 'core-js/es/math/tanh';
import 'core-js/es/math/hypot';
import 'core-js/es/math/sum-precise';
