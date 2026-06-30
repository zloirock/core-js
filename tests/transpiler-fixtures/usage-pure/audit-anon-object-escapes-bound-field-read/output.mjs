import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// an anon object nested in a local-bound carrier's FIELD (`const o = { wrap: {...} }`) escapes iff a HELD
// read of that field (`sink(o.wrap)`) aliases it out - then its `this.<field>` flow must NOT narrow, so a
// method WITH a generic form injects the GENERIC helper (`_at`), not the array-specific `<m>MaybeArray` the
// narrow would emit (which mishandles a foreign-reassigned field at ie:11). dereferencing the field instead
// (`o.box.read()`) keeps the anon module-local, so the array narrow stands. a method-resolution-only delta -
// babel and unplugin share the provider verdict, so no sidecar

// HELD field-read aliases the nested anon out -> escaped -> generic at
function f1(sink) {
  const o = {
    wrap: {
      data: ["x"],
      read() {
        var _ref;
        return _at(_ref = this.data).call(_ref, 0);
      }
    }
  };
  sink(o.wrap);
}

// the field DEREFERENCED (the anon's own slot read) keeps it module-local -> array narrow includes
function f2() {
  const o = {
    box: {
      data: ["a"],
      read() {
        var _ref2;
        return _includesMaybeArray(_ref2 = this.data).call(_ref2, "a");
      }
    }
  };
  o.box.read();
}