import _from from "@core-js/pure/actual/array/from";
import _of from "@core-js/pure/actual/array/of";
// Effectful keys keep the native pattern; both statics are served in the body.
function read([{
  of,
  from,
  [(effect(), "key")]: other
} = Array]) {
  of = _of;
  from = _from;
  return [of(4), from([9]), other];
}
read([void 0]);