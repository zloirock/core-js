import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// Collapsing a sealed proxy receiver preserves its prefix and computed hop effects.
// The receiver value is selected before the later computed symbol-key effect.
export const result = (prefix(), globalThis?.[hop(), 'self']).window[key(), Symbol.iterator]();