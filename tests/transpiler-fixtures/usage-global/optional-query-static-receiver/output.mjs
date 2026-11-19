import "core-js/modules/es.global-this";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.max-safe-integer";
export function read() {
  return (before(), (receiver(), globalThis.Number)[key(), 'MAX_SAFE_INTEGER']).toString();
}