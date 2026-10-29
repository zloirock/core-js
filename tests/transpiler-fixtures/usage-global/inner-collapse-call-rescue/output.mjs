import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A call-rooted realm receiver keeps its call before a residual member read.
// Folding the quiet hops must not discard or duplicate the call's effects.
const log = [];
function read() {
  log.push('call');
  return globalThis;
}
const value = (log.push('prefix'), read()).self.Math;
consume(value, log);