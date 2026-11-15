import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Self-reading normalization keeps an open receiver family and evaluates every live arm once.
export function read(input, options) {
  let value = input;
  value = options.first ? value : options.next(value);
  value = options.second ? value : options.next(value);
  value = options.third ? value : options.next(value);
  return value.at(-1);
}