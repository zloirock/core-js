import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// An assignment pattern extracting a static's `name` beside an unknown computed key: babel writes the
// extraction first, in source order, while unplugin's drain runs the residual - its key included - ahead of
// the extracted write (the sidecar).
let name, zk;
name = _nameMaybeFunction(_Array$from);
({
  [k]: zk
} = Array);