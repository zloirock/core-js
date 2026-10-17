const orKey = Symbol.iterator || '@@iterator';
export const orRead = receiver => receiver[orKey];
