const pick = () => ({ from: () => [7] });
const [{ from: dynamicFrom } = Array] = [pick()];
export { dynamicFrom };
