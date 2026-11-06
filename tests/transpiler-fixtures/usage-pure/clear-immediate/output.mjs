import _clearImmediate from "@core-js/pure/actual/clear-immediate";
// Cancellation alone keeps its dedicated pure entry point.
_clearImmediate(1);