import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an anon object stored into a member / class-field slot of an externally-reachable holder ESCAPES - the
// holder (`this`, a class instance) can be exposed, so an outside `holder.x.field = Y` may rewrite the
// object's fields. its `this.<field>` flow must NOT narrow, so a method WITH a generic form injects the
// GENERIC instance helper (`_at` / `_includes`), not the array-specific `<m>MaybeArray` the narrow would
// emit (which mishandles a foreign-reassigned field at ie:11). a method-resolution-only delta - babel and
// unplugin share the provider verdict, so no sidecar

// non-binding member root (`this.f` store): escaped -> generic at
function f1() {
  this.a = {
    data: ["x"],
    read() {
      var _ref;
      return _at(_ref = this.data).call(_ref, 0);
    }
  };
}

// class field initializer (`class C { f = {...} }`): escaped -> generic includes
class C {
  c = {
    tags: ["a"],
    read() {
      var _ref2;
      return _includes(_ref2 = this.tags).call(_ref2, "a");
    }
  };
}