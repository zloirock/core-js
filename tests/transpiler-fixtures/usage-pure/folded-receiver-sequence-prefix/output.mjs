import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
export function read() {
  return _self?.Math.PI;
}
export function optional() {
  return (missingPrefix, _self)?.Math.PI;
}
export function alias() {
  const realm = _globalThis;
  return realm.Math.PI;
}
export function destructure() {
  const {
    Array: A
  } = (missingPrefix, _globalThis);
  later;
  const M = _Map;
  const {
    user
  } = _globalThis;
  let later;
  return [A, M, user];
}