// proposal stage: 4
// https://github.com/tc39/proposal-arraybuffer-transfer
interface ArrayBuffer {
  readonly detached: boolean;

  slice(start?: number, end?: number): ArrayBuffer;
  transfer(newByteLength?: number): ArrayBuffer;
  transferToFixedLength(newByteLength?: number): ArrayBuffer;
}
