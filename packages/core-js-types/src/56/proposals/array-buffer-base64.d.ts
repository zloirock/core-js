// proposal stage: 3
// https://github.com/tc39/proposal-arraybuffer-base64

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/esnext.typedarrays.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

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
  setFromBase64(str: string, opts?: fromBase64Options): processMetadata;

  setFromHex(str: string): processMetadata;

  toBase64(opts?: toBase64Options): string;

  toHex(): string;
}
