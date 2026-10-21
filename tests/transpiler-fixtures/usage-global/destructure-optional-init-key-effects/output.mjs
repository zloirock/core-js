import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// A consumed optional initializer keeps its key effect inside the reached branch.
// Nested instance calls in that effect retain their own polyfills.
const log = [];
const {
  of
} = globalThis.window?.[log.push([7].at(0)), 'Array'];
export const result = [of(3), log];