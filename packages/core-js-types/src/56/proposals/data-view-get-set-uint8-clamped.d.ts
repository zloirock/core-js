// proposal stage: 1
// https://github.com/tc39/proposal-dataview-get-set-uint8clamped

interface DataView<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> { // @type-options no-constructor
  /**
   * Reads an unsigned 8-bit integer at the specified byte offset from the DataView,
   * interpreting the byte as a clamped 8-bit unsigned value (same as Uint8ClampedArray).
   * @param byteOffset The offset, in bytes, from the start of the DataView.
   * @returns The unsigned 8-bit integer at the given offset.
   */
  getUint8Clamped(byteOffset: number): number;

  /**
   * Stores a value as an unsigned 8-bit integer at the specified byte offset in the DataView,
   * clamping the input to the 0–255 range and rounding to the nearest integer as per Uint8ClampedArray behavior.
   * @param byteOffset The offset, in bytes, from the start of the DataView.
   * @param value The value to store; it will be clamped to the range 0–255 and rounded to the nearest integer.
   */
  setUint8Clamped(byteOffset: number, value: number): void;
}
