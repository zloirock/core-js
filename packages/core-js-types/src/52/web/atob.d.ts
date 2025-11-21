/**
 * Decodes a string of data which has been encoded using Base64 encoding.
 * @param data A base64-encoded string, using the alphabet produced by btoa().
 * @returns A binary string containing raw bytes decoded from encodedData.
 */
declare function atob(data: string): string;
