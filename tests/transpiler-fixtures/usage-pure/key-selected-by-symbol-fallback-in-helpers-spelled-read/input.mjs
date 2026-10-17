const spelledKey = 'Symbol.iterator' || '@@iterator';
export const spelledRead = receiver => receiver[spelledKey];
