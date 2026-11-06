// A stored excluded realm slot keeps its following read observable.
// Global mode is a presence control; entry exclusion belongs to pure mode.
let held; consume((held = globalThis.self).self.slot);
