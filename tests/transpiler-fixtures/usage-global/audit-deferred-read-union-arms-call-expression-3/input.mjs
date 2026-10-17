let voidWrite = [1];
const readVoid = () => voidWrite.flatMap(f);
voidWrite = void 0;
export const c = readVoid();
