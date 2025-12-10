// proposal stage: 4
// https://github.com/tc39/proposal-arraybuffer-transfer

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/4a957b74ea4d716356181644d23f6ad5f10824d6/src/lib/es2024.arraybuffer.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ArrayBuffer {
  // todo hack for modern ts
  // get detached(): boolean;

  /**
   * Creates a new `ArrayBuffer` with the same byte content as this buffer, then detaches this buffer.
   * @param newByteLength If provided, specifies the `byteLength` of the new `ArrayBuffer`
   * @throws {RangeError} If this `ArrayBuffer` is resizable and newByteLength is greater than the `maxByteLength` of this `ArrayBuffer`
   * @throws {TypeError} If this `ArrayBuffer` is already detached, or if it can only be detached by designated operations
   * @returns A new `ArrayBuffer` object
   */
  transfer(newByteLength?: number): ArrayBuffer;

  /**
   * Creates a new non-resizable `ArrayBuffer` with the same byte content as this buffer, then detaches this buffer.
   * @param newByteLength If provided, specifies the `byteLength` of the new `ArrayBuffer`
   * @throws {TypeError} If this `ArrayBuffer` is already detached, or if it can only be detached by designated operations
   * @returns A new `ArrayBuffer` object
   */
  transferToFixedLength(newByteLength?: number): ArrayBuffer;
}
