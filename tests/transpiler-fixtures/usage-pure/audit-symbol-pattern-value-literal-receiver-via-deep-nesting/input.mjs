// Nested defaults keep their polyfills through deeper pattern values.
const { [Symbol.iterator]: { next: { length: deepLen = [1].toSpliced(0, 1) } } } = [13];
export const viaDeepNesting = deepLen;
