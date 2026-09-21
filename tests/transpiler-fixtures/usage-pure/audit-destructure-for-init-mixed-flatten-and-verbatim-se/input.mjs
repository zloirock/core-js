// A loop initializer keeps each declaration and its effects at its original slot.
// The static mirror and an unrelated sequence initializer each run their effects once.
declare const a: () => void;
declare const sideEffect: () => number;
for (const { Array: { from } } = (a(), globalThis), b = (sideEffect(), 1); false; ) {
  console.log(from, b);
}
