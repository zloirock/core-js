import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Global presence guard; the pure twin exercises ordinary string-key capture.
// A computed string resembling a symbol label names an ordinary property.
// The outer receiver and its nested getters are read once in source order.
// An open nested receiver retains its instance polyfill.
export function read(input) {
  const {
    ['[@@iterator]']: {
      other,
      at
    }
  } = input;
  return [other, at];
}