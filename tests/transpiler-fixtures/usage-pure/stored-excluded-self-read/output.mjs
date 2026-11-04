import _globalThis from "@core-js/pure/actual/global-this";
// A stored excluded realm slot keeps its following read observable.
let held;
consume((held = _globalThis.self).self.slot);