import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a LEAF default under a TAGGED host. the tag fills slot 0 with the strings array, so the parameter's
// own default does not fire - but that array carries no static of its own, so the LEAF default does,
// natively and after the rewrite alike. what stays in place is therefore the caller-correct slot
// default, never an extract: it fires exactly where the source's own default fires, so nothing the
// caller supplied is lost by it. the plain call beside it is the accounted control taking that route
const tagged = function ({
  from = _Array$from
} = {}) {
  return from;
}`x`;
const invoked = function ({
  of = _Array$of
} = {}) {
  return of;
}();
export default [tagged, invoked];