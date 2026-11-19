import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A lazy mirror inside a literal slot already owns its method read.
// A later pass must preserve the computed key before the user getter.
import { source, key } from './data.mjs';
export function read({
  y: {
    [(key(), 'at')]: at
  }
} = {
  y: source
}) {
  return at;
}