// Closed callers prove the native constructor through the supplied value.
// Only the selected static is required.
function get() { return Array; }
function read(held) { return held.from([1]); }
read(get());
