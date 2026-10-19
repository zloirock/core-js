import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a construction instantiates its class as a call instantiates a function: with the type arguments
// it spells, else with what its arguments infer, and only then with the defaults
class Box<T extends string | string[] = string[]> {
  v: T;
  constructor(v: T) {
    this.v = v;
  }
}
_atMaybeString(_ref = new Box<string>('xy').v).call(_ref, -1);
_includesMaybeString(_ref2 = new Box('xy').v).call(_ref2, 'a');