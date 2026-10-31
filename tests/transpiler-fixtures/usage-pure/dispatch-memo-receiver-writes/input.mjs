import max from '@core-js/pure/actual/number/max-safe-integer';
// Adopted imports and mutable receivers keep their capture across key and argument writes.
const imported = max?.toFixed(0);
let receiver = [1, 2];
const result = receiver?.[(receiver = [3], 'includes')]((receiver = [4], 2));
const later = receiver;
