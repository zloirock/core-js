import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a reassignment buried in the assertion guard's OWN argument slot leaves the runtime value
// post-mutation, so the string narrow is stale: usage-global must inject the full multi-type
// union (under-injecting only the string module would leave a runtime array without `at`)
function assertString(v: unknown): asserts v is string {/* type-level only */}
export function ownArgReassign(x: unknown) {
  assertString((x = [1], x));
  return (x as any).at(0);
}