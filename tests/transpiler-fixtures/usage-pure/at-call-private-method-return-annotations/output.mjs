import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a PRIVATE method carries its return annotation on the method node itself, the way a public one
// does, so a call through `#name` narrows by it. the bodies are opaque, or the annotation would be
// redundant with the inferred return; the two reads use DIFFERENT methods, or in usage-global the
// shared import would fold both rows into one and hide either of them going wide
export class Box {
  #chars(): string[] {
    return JSON.parse('[]');
  }
  #label(): string {
    return JSON.parse('""');
  }
  read() {
    var _ref, _ref2;
    return [_atMaybeArray(_ref = this.#chars()).call(_ref, 0), _includesMaybeString(_ref2 = this.#label()).call(_ref2, 'a')];
  }
}