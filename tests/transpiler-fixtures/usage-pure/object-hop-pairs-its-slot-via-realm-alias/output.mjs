import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let realmAlias = _globalThis;
realmAlias = _self;
const {
  w: {
    Map: viaRealmAlias
  }
} = {
  w: realmAlias
};
export default [viaRealmAlias];