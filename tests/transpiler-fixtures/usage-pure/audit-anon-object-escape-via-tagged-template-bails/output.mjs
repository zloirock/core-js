import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// A TAGGED template substitution is handed raw to the tag function, so an anonymous object inside it
// escapes (`this.data.at` -> generic `_at`). An UNTAGGED template string-coerces its substitution, so an
// object read in place there stays module-local and keeps the narrow (`this.data.includes` ->
// `_includesMaybeArray`).
declare function tag(strings: TemplateStringsArray, ...values: unknown[]): void;
tag`a${[{
  data: ["x"],
  read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  }
}]}b`;
const local = `a${[{
  data: ["y"],
  scan() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.data).call(_ref2, "z");
  }
}][0].scan()}b`;
export { local };