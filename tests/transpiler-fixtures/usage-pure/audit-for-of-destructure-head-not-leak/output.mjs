import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A for-of head that DESTRUCTURES into an existing binding (`for ({ o } of v)`) is a write-rebind, not a
// leaking reference, so an object stored into the bound member and read locally keeps the per-element
// narrow (`this.data.at` -> `_atMaybeArray`). A SIMPLE head (`for (o of v)`) is a plain reference in
// babel, so it stays a conservative escape (`this.data.includes` -> generic `_includes`); the resolver
// mirrors babel for both parsers.
let destructured: any;
for ({
  destructured
} of [] as any) {
  destructured.f = [{
    data: ["a"],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.data).call(_ref, 0);
    }
  }];
  destructured.f[0].read();
}
let simple: any;
for (simple of [] as any) {
  simple.g = [{
    data: ["b"],
    scan() {
      var _ref2;
      return _includes(_ref2 = this.data).call(_ref2, "z");
    }
  }];
  simple.g[0].scan();
}