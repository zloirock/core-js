let aliasWrite = null;
const readAlias = () => aliasWrite.entries();
const arraySource = ["a"];
aliasWrite = arraySource;
export const d = readAlias();
