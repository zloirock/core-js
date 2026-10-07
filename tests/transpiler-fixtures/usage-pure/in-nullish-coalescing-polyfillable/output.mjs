import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// An `in` over a `??` whose left the build serves (`globalThis?.Array`, and `globalThis?.Number`, a global
// core-js extends in place) reads that left and folds like a static `in`; over a left it does not serve
// (`globalThis?.WeakRef`) the test stays raw, each operand polyfilled in place, though the right has the key.
true;
true;
'groupBy' in (_globalThis.WeakRef ?? _Map);