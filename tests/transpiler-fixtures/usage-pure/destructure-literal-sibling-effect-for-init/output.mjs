import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// An observable sibling in a literal finishes before the loop's instance read.
let effects = 0;
for (var {
    y: _ref
  } = {
    y: [1, 2],
    z: effects++
  }, includes = _includesMaybeArray(_ref); !includes;) break;