import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise";
// surfaces of a DEOPTED name (the file writes its slot): every usage form stays verbatim -
// class heritage and the inherited static, a template tag, a destructured static and its
// call, bare ctor + static reads. a value DERIVED from a deopted ctor is an ordinary
// unknown receiver: the untyped instance canon still applies its runtime-dispatch helper
// (bias-safe degrade, not a pristine-type narrow). the identity self-copy coexists with a
// later real write - the write deopts the name, while the self-copy reads the slot ahead of
// every write, so it installs the pure import like any detect
Iterator = shim;
class K extends Iterator {}
use(K.range(0, 2));
String = fake;
use(String.raw`a${b}c`);
Reflect = shim;
const {
  ownKeys
} = Reflect;
use(ownKeys(o));
Array = fake;
const xs = Array.from(src);
use(_at(xs).call(xs, -1));
Promise = _Promise;
Promise = shim;
use(Promise.resolve(1));
Map = shim;
use(new Map([[1, 2]]), Map.groupBy(a, f));