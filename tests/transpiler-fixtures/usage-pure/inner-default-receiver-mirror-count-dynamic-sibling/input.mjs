const pick = () => ({ from: () => [7] });
const [{ from: dynamicSibling } = Array, count] = [pick(), 1];
export { dynamicSibling };
export { count };
