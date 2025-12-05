/**
 * Decodes a string of data which has been encoded using Base64 encoding.
 * @param data A base64-encoded string, using the alphabet produced by btoa().
 * @returns A binary string containing raw bytes decoded from encodedData.
 */
declare function atob(data: string): string;

/**
 * Creates a Base64-encoded ASCII string from a binary string
 * (i.e., a string in which each character in the string is treated as a byte of binary data)
 * @param data The binary string to encode
 * @returns An ASCII string containing the Base64 representation of data
 */
declare function btoa(data: string): string;
