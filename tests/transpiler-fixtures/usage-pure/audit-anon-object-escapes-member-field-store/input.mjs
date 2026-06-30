// an anon object stored into a member / class-field slot of an externally-reachable holder ESCAPES - the
// holder (`this`, a class instance) can be exposed, so an outside `holder.x.field = Y` may rewrite the
// object's fields. its `this.<field>` flow must NOT narrow, so a method WITH a generic form injects the
// GENERIC instance helper (`_at` / `_includes`), not the array-specific `<m>MaybeArray` the narrow would
// emit (which mishandles a foreign-reassigned field at ie:11). a method-resolution-only delta - babel and
// unplugin share the provider verdict, so no sidecar

// non-binding member root (`this.f` store): escaped -> generic at
function f1() {
  this.a = { data: ["x"], read() { return this.data.at(0); } };
}

// class field initializer (`class C { f = {...} }`): escaped -> generic includes
class C {
  c = { tags: ["a"], read() { return this.tags.includes("a"); } };
}
