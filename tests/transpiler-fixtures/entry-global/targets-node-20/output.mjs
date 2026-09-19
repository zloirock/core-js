// `targets: { node: '20' }` filter demo:
// - `tanh` (ES6, Node >= 4): native -> module dropped
// - `hypot` (ES6, Node >= 4 with working v8): native -> module dropped
// - `sum-precise` (stage 3): not in Node yet -> only this module emits
import "core-js/modules/es.math.sum-precise";