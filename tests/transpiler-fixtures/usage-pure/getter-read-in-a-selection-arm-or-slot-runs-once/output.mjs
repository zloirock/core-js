import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a getter read (`K.g`) in a sequence prefix of a realm SELECTION arm, or in a literal SLOT the
// destructure discards, is work the source does: it runs once where the source ran it, and a read
// the claim's own dispatch performs (a carried slot, an element) is not replayed beside it
class K {
  static get g() {
    log();
    return 0;
  }
}
const nb = {
  get y() {
    log();
    return [1, 2];
  },
  get z() {
    log();
    return 1;
  }
};
const {
  Array: {
    from: a1
  }
} = (K.g, {
  Array: {
    from: _Array$from
  }
}) ?? {};
const {
  Iterator: {
    from: a2
  }
} = (K.g, {
  Iterator: {
    from: _Iterator$from
  }
}) || {};
const {
  Promise: {
    try: a3
  }
} = c ? (K.g, {
  Promise: {
    try: _Promise$try
  }
}) : {};
const {
  y: {
    at: v4
  }
} = {
  y: nb.y,
  z: nb.z
};
const v5 = _flatMaybeArray(nb.y);
const it6 = _getIteratorMethod(nb.y);
use(a1, a2, a3, v4, v5, it6);