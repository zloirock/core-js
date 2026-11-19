// A stored excluded realm slot keeps its following read observable.
let held; consume((held = globalThis.self).self.slot);
