import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// The declined leaf keeps both the receiver-prefix and computed-key claims live.
const root = () => globalThis;
export function read(effects) {
  return (effects.push('outer'), effects.push(Array.from('i').at(0)), root()).self.window[effects.push([7].includes(7)), 'declinedNavigationMissing'];
}