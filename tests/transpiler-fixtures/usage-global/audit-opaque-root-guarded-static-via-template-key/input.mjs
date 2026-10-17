// a TEMPLATE-literal hop key resolves like the dotted spelling through the canonical key fold
const tk = () => globalThis;
export const viaTemplateKey = tk()?.window?.[`self`]?.Array.of(20).at(0);
