import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// The implicit read and the claim inside its fallback need distinct polyfills.
export function install(receiver) {
  receiver.at ||= () => [7].includes(7);
}