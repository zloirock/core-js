// proposal stage: 1
// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
interface DataView<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  getUint8Clamped(byteOffset: number): number;
  setUint8Clamped(byteOffset: number, value: number): void;
}
