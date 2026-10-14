// An instance leaf under a hop default the assigned literal proves dead, beside a sibling: unplugin extracts
// it off the literal's slot (the sidecar), while babel keeps the read native - its debt. The declaration form
// keeps it native in both emitters.
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";

var _ref, _ref2;
let fl, zw;
const holder = { list: [1, 2] };

_ref = { w: { y: holder.list }, zw: 1 };
({ w: _ref2 } = _ref);
fl = _flatMaybeArray(_ref2.y);
({ zw } = _ref);