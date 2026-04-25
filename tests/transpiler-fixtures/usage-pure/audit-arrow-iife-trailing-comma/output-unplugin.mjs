import _Array$from from "@core-js/pure/actual/array/from";
// Trailing comma in the arrow IIFE call argument list: detectIifeArgReceiver scans
// `call.arguments` directly so the comma carries through unchanged. Synth-swap still
// fires on the receiver position, leaving the trailing comma in place.
(({ from }) => from(1))({ from: _Array$from },);