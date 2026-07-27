import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// spreads compose, and only the container each spread lands in decides. an ARRAY spread iterates and
// copies no property, so the object stays local however many array spreads wrap it; an OBJECT spread
// copies its own properties out, and that verdict wins wherever it appears in the chain. the four
// rows are the composition matrix. `at` and `includes` are the two methods carrying both an array and
// a string variant, so the type-agnostic entry is visible as a different helper
export function arrayInArray() {
  const held = {
    items: [1],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.items).call(_ref, 0);
    }
  };
  return [held.read(), [...[...held]]];
}
export function objectInObject() {
  const held = {
    items: [1],
    read() {
      var _ref2;
      return _includes(_ref2 = this.items).call(_ref2, 1);
    }
  };
  return [held.read(), {
    ...{
      ...held
    }
  }];
}
export function objectInsideArray() {
  const held = {
    items: [1],
    read() {
      var _ref3;
      return _at(_ref3 = this.items).call(_ref3, 0);
    }
  };
  return [held.read(), [...{
    ...held
  }]];
}
export function arrayInsideObject() {
  const held = {
    items: [1],
    read() {
      var _ref4;
      return _includesMaybeArray(_ref4 = this.items).call(_ref4, 1);
    }
  };
  return [held.read(), {
    ...[...held]
  }];
}