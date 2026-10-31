import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
let aliasWrite = null;
const readAlias = () => aliasWrite.entries();
const arraySource = ["a"];
aliasWrite = arraySource;
export const d = readAlias();