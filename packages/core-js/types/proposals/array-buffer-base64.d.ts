// proposal stage: 3
// https://github.com/tc39/proposal-arraybuffer-base64
type alphabet = 'base64' | 'base64url';
type lastChunkHandling = 'loose' | 'strict' | 'stop-before-partial';
type fromBase64Options = {
  alphabet?: alphabet;
  lastChunkHandling?: lastChunkHandling;
}
type toBase64Options = {
  alphabet?: alphabet;
  omitPadding?: boolean;
}
type processMetadata = {
  read: number;
  written: number;
}

interface Uint8ArrayConstructor {
  fromBase64(str: string, opts?: fromBase64Options): Uint8Array;
  fromHex(str: string): Uint8Array;
}

interface Uint8Array {
  setFromBase64(str: string, opts?: fromBase64Options): Uint8Array;
  setFromHex(str: string): processMetadata;
  toBase64(opts?: toBase64Options): string;
  toHex(): string;
}
