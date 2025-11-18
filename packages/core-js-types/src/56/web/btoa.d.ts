/**
 * Creates a Base64-encoded ASCII string from a binary string
 * (i.e., a string in which each character in the string is treated as a byte of binary data)
 * @param data The binary string to encode
 * @returns An ASCII string containing the Base64 representation of data
 */
declare function btoa(data: string): string;
