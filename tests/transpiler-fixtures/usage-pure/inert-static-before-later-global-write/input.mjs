// A later global write does not make an earlier inert call escape its argument.
const box = { read() { return [3]; } };
Object.keys(box);
export const result = box.read().at(0);
if (flag) globalThis.Object = other;
