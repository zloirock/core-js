// Iterator consumption keeps a sealed receiver prefix ahead of the symbol-key effect.
// The effectful realm key remains inside its original receiver.
export const result = (prefix(), globalThis?.[(hop(), 'self')]).window[(key(), Symbol.iterator)]();
