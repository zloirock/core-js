import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// Native array selection still runs when its static namespace is polyfilled.
// The following read uses the namespace available in the target realm.
const held = [_globalThis];
const [_ref] = held;
const {
  ownKeys: _unused
} = _Reflect;
const ownKeys = _Reflect$ownKeys;
use(ownKeys);