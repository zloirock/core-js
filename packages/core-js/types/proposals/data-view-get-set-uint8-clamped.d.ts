// proposal stage: 1
// https://github.com/tc39/proposal-setmap-offrom
interface DataView {
  getUint8Clamped(byteOffset: number): number;
  setUint8Clamped(byteOffset: number, value: number): void;
}
