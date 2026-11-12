import _at from "@core-js/pure/actual/instance/at";
// A lazy mirror inside a literal slot already owns its method read.
// A later pass must preserve the computed key before the user getter.
import { source, key } from './data.mjs';
export function read({
  y: {
    [(key(), 'at')]: at
  }
} = {
  y: (_ref => {
    return _ref == null ? _ref : {
      get at() {
        return _at(_ref);
      }
    };
  })(source)
}) {
  return at;
}