// A resolved static keeps receiver writes before key effects and call arguments.
// The constructor store remains the actual source assignment, evaluated once.
let held;
export const keyed = (before(), held = Array)[(key(), 'from')](argument());
export const stored = (held = Array).from(argument());
export const prefixed = (before(), Array).from(argument());
export const plain = Array.from(argument());
