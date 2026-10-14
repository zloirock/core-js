import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
// Static extractions off a rest parameter default require closed callers; key/default effects remain
// independent. A logical default whose left's namespace entry is excluded (`.Reflect`, while `ownKeys` keeps its
// own) still decides - the data subset carries `Reflect` - so the right never runs and leaves with its import:
// the key effect and the collapsed hop stay on the left, read raw, and the static extracts into the body.
let eff = 0;
function k({
  ownKeys: _unused,
  ...rest
} = (eff++, _self).Reflect) {
  let ownKeys = _Reflect$ownKeys;
  return [ownKeys, rest];
}
k();