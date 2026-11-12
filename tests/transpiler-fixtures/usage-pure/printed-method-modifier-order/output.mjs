import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Method modifiers keep their TypeScript order before the bundler lowers the class.
declare class Base {
  protected static make(): void;
}
export abstract class Box extends Base {
  protected abstract read(): number;
  protected static override make() {
    var _ref;
    _atMaybeArray(_ref = [7]).call(_ref, 0);
  }
}