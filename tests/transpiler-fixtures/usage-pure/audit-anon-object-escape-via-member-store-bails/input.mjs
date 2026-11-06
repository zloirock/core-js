// An anonymous object stored into a member slot (`obj.f = [{...}]`) escapes iff the member chain ROOT
// binding is externally reachable. `leaked` is a local var exported, so an importer reaches the stored
// object and `this.data.at` drops to the generic helper. `local` stays module-local (read only as
// `local.g`), so the per-element narrow holds and `this.data.includes` resolves `_includesMaybeArray`.
// A store onto a PARAM (`holder`) is held by the caller, so it escapes unconditionally (`_includes`).
const leaked: Record<string, unknown> = {};
leaked.f = [{ data: ["x"], read() { return this.data.at(0); } }];
const local: Record<string, unknown> = {};
local.g = [{ data: ["y"], scan() { return this.data.includes("z"); } }];
function readLocal() { return (local.g as any)[0].scan(); }
function storeOnParam(holder: Record<string, unknown>) {
  holder.h = [{ data: ["w"], pick() { return this.data.includes("v"); } }];
}
export { leaked, readLocal, storeOnParam };
