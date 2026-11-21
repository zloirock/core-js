const { Number: { isInteger } } = globalThis, nested = () => {
  const NAME = 'Promise';
  return (globalThis as any)[NAME];
};
export { isInteger, nested };
