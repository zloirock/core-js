import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// an instance claim the destructure reads off a realm constructor ahead of a write replacing that constructor's
// slot dispatches on the constructor's ponyfill: the read happens before the write - through the realm, through
// an alias of it and through a proxy hop alike
const promiseName = _nameMaybeFunction(_Promise);
_globalThis.Promise = class PromiseShim {};
const realm = _globalThis;
const mapName = _nameMaybeFunction(_Map);
realm.Map = class MapShim {};
const setName = _nameMaybeFunction(_Set);
_self.Set = class SetShim {};
export { promiseName, mapName, setName };