// Pure captures a call-rooted receiver after the final import.
// An initless var between source imports must not split that import region.
import "x";
var sentinel;
import "y";
const result = readReceiver().at(-1);
