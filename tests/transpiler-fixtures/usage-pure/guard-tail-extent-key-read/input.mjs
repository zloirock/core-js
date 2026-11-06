// A live guard below an effectful realm key remains responsible for the whole continuation.
// The nested claim in the key runs only after the environment probe succeeds.
export const read = () => globalThis.window?.self[(Array.of(3)[0], 'window')].guardTailBox;
