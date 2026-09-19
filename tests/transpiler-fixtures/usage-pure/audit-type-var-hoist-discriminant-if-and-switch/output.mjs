import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a discriminated union resolves through the discriminant test, which reaches the hoisted binding by
// identity. the two test forms are separate paths in that resolver, so they get a method each
declare const discSrc: {
  kind: "a";
  v: string[];
} | {
  kind: "b";
  v: string;
};
export function viaDiscriminantIf() {
  {
    var box = discSrc;
  }
  {
    var _ref;
    if (box.kind === "a") return _atMaybeArray(_ref = box.v).call(_ref, 0);
  }
}
export function viaDiscriminantSwitch() {
  var _ref2;
  {
    var boxed = discSrc;
  }
  {
    switch (boxed.kind) {
      case "a":
        return _includesMaybeArray(_ref2 = boxed.v).call(_ref2, "x");
    }
  }
}