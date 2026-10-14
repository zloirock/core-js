import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// Native array selection still runs when its static namespace is polyfilled.
// The hop is anchored on the namespace's ponyfill, where reading the static observes
// nothing, so the static's own import is all the claim leaves.
const held = [_globalThis];
const [_ref] = held;
const ownKeys = _Reflect$ownKeys;
use(ownKeys);