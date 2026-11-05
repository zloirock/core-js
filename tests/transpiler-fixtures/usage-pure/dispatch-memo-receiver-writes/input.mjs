// Receiver writes remain observable; a direct pure import is a native-read control.
import max from '@core-js/pure/actual/number/max-safe-integer';
// A direct pure import stays native; a mutable receiver keeps its capture across key and argument writes.
const imported = max?.toFixed(0);
let receiver = [1, 2];
const result = receiver?.[(receiver = [3], 'includes')]((receiver = [4], 2));
const later = receiver;
