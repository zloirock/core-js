// proposal stage: 4
// https://github.com/tc39/proposal-arraybuffer-transfer
interface ArrayBuffer {
  // todo hack for modern ts
  // get detached(): boolean;

  transfer(newByteLength?: number): ArrayBuffer;
  transferToFixedLength(newByteLength?: number): ArrayBuffer;
}
