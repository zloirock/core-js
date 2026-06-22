import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// An anonymous object stored into a member slot (`obj.f = [{...}]`) escapes iff the member chain ROOT
// binding is externally reachable. `leaked` is a local var exported, so an importer reaches the stored
// object and `this.data.at` drops to the generic helper. `local` stays module-local (read only as
// `local.g`), so the per-element narrow holds and `this.data.includes` resolves `_includesMaybeArray`.
// A store onto a PARAM (`holder`) is held by the caller, so it escapes unconditionally (`_includes`).
const leaked: Record<string, unknown> = {};
leaked.f = [{ data: ["x"], read() {
var _ref; return _at(_ref = this.data).call(_ref, 0); } }];
const local: Record<string, unknown> = {};
local.g = [{ data: ["y"], scan() {
var _ref2; return _includesMaybeArray(_ref2 = this.data).call(_ref2, "z"); } }];
function readLocal() { return (local.g as any)[0].scan(); }
function storeOnParam(holder: Record<string, unknown>) {
  holder.h = [{ data: ["w"], pick() {
var _ref3; return _includes(_ref3 = this.data).call(_ref3, "v"); } }];
}
export { leaked, readLocal, storeOnParam };