const nullishKey = Symbol.iterator ?? '@@iterator';
export const nullishRead = receiver => receiver[nullishKey];
