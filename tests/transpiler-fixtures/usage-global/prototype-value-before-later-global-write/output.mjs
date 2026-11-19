import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// The earlier Object.create call retains its own prototype property.
const proto = {
  at: 13
};
export const result = Object.create(proto).at;
if (flag) globalThis.Object = other;