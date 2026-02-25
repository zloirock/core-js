// https://github.com/tc39/proposal-arraybuffer-base64

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/esnext.typedarrays.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

type CoreJSAlphabet = 'base64' | 'base64url';

type CoreJSLastChunkHandling = 'loose' | 'strict' | 'stop-before-partial';

interface CoreJSFromBase64Options {
  alphabet?: CoreJSAlphabet;
  lastChunkHandling?: CoreJSLastChunkHandling;
}

interface CoreJSToBase64Options {
  alphabet?: CoreJSAlphabet;
  omitPadding?: boolean;
}

interface CoreJSProcessMetadata {
  read: number;
  written: number;
}

interface Uint8ArrayConstructor {
  /**
   * Creates a new `Uint8Array` from a base64-encoded string.
   * @param string - The base64-encoded string.
   * @param options - If provided, specifies the alphabet and handling of the last chunk.
   * @returns A new `Uint8Array` instance.
   * @throws SyntaxError If the input string contains characters outside the specified alphabet, or if the last
   * chunk is inconsistent with the `lastChunkHandling` option.
   */
  fromBase64(string: string, options?: CoreJSFromBase64Options): Uint8Array;

  /**
   * Creates a new `Uint8Array` from a base16-encoded string.
   * @param string - The base16-encoded string.
   * @returns A new `Uint8Array` instance.
   */
  fromHex(string: string): Uint8Array;
}

interface Uint8Array {
  /**
   * Sets the `Uint8Array` from a base64-encoded string.
   * @param string - The base64-encoded string.
   * @param options - If provided, specifies the alphabet and handling of the last chunk.
   * @returns An object containing the number of bytes read and written.
   * @throws SyntaxError If the input string contains characters outside the specified alphabet, or if the last
   * chunk is inconsistent with the `lastChunkHandling` option.
   */
  setFromBase64(string: string, options?: CoreJSFromBase64Options): CoreJSProcessMetadata;

  /**
   * Sets the `Uint8Array` from a base16-encoded string.
   * @param string - The base16-encoded string.
   * @returns An object containing the number of bytes read and written.
   */
  setFromHex(string: string): CoreJSProcessMetadata;

  /**
   * Converts the `Uint8Array` to a base64-encoded string.
   * @param options - If provided, sets the alphabet and padding behavior used.
   * @returns A base64-encoded string.
   */
  toBase64(options?: CoreJSToBase64Options): string;

  /**
   * Converts the `Uint8Array` to a base16-encoded string.
   * @returns A base16-encoded string.
   */
  toHex(): string;
}
