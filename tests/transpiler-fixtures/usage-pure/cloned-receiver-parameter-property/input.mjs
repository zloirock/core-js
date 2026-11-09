// A cloned constructor keeps its parameter property and the transformed default.
export const last = new (class {
  constructor(public readonly value: number[] = Array.from([1, 2])) {}
})().value.at(-1);
