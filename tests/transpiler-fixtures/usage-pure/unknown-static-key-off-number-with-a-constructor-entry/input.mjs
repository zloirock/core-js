// An unknown key can select any own static of a constructor with a global module.
// Global usage loads its constructor and statics, without unrelated prototype methods.
// Pure keeps the unknown read native.
export function read(key) { return Number[key]; }
