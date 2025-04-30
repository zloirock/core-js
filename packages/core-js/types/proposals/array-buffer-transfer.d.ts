// proposal stage: 4
// https://github.com/tc39/proposal-arraybuffer-transfer
interface ArrayBuffer {
  readonly detached: boolean;

  transfer(newByteLength?: number): ArrayBuffer;
  transferToFixedLength(newByteLength?: number): ArrayBuffer;
}
