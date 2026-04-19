import "core-js/modules/es.array.iterator";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.math.sum-precise";
// `targets: { esmodules: true }` filter — three-level demo:
// - `Math.tanh` (ES6, Chrome 38+): fully in ESM baseline → skipped
// - `Math.hypot` (ES6): baseline BUT Chrome < 78 buggy (v8 issue 9546), 61 in baseline → polyfilled
// - `Math.sumPrecise` (stage 3, Chrome 147+): post-baseline → polyfilled
Math.tanh(0.5);
Math.hypot(3, 4);
Math.sumPrecise([1, 2, 3]);