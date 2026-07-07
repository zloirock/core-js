import "core-js/modules/es.string.at";
// usage-global imports are file-level, so the clean-assertion control needs its OWN fixture:
// the narrow holds and ONLY the string module is injected - an invalidation regression that
// widens to the multi-type union would surface here as an extra array import
function assertString(v: unknown): asserts v is string {/* type-level only */}
export function cleanControl(x: unknown) {
  assertString(x);
  return (x as any).at(0);
}