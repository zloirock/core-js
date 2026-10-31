import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A following optional read observes the unbacked hop above a retained store.
let held;
export const value = (({
  PI
}) => PI)((held = globalThis.self).window?.Math);
export { held };