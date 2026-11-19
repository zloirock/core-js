import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// a NON-fn field initializer runs at construction with `this` = instance: a buried
// `this.<field>` write inside it mutates the field-flow surface exactly like a
// constructor write, so the narrowed field bails to generic
class Poisoned {
  items = [1, 2, 3];
  poison = this.items = 'string';
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
export const viaBuriedWrite = new Poisoned().read();

// the write-free field keeps its narrow
class Clean {
  items = [1, 2, 3];
  read() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.items).call(_ref2, 1);
  }
}
export const viaCleanField = new Clean().read();