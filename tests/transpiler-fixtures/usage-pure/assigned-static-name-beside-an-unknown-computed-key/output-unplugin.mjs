// An assignment pattern extracting a static's `name` beside an unknown computed key: babel writes the
// extraction first, in source order, while unplugin's drain runs the residual - its key included - ahead of
// the extracted write (the sidecar).
import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";

let name, zk;

({ [k]: zk } = Array);
name = _nameMaybeFunction(_Array$from);