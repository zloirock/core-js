export const caught = (() => {
  try {
    throw [];
  } catch ([{ Set: CS, 'with-dash': cd, Array: { of: cof } } = globalThis]) {
    return [CS, cd, cof];
  }
})();
