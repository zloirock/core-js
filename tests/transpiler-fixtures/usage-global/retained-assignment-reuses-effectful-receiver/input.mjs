// Global presence guard; the pure twin exercises receiver capture.
// Earlier instance reads and a retained guard share one capture of an effectful receiver.
// The call stays before both property reads and is never replaced with a repeated call.
let name, values;
({ name, values } = receiver() || Object);
use(name, values);
