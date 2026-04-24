import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
// `targets: { esmodules: true }` filter - three-level demo:
// - `Math.tanh` (ES6, Chrome 38+): fully in baseline -> stays bare
// - `Math.hypot` (ES6): baseline BUT Chrome < 78 buggy (v8 issue 9546) -> pure import
// - `Math.sumPrecise` (stage 3, Chrome 147+): post-baseline -> pure import
Math.tanh(0.5);
_Math$hypot(3, 4);
_Math$sumPrecise([1, 2, 3]);