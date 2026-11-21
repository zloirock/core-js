const nonProxyForward = () => ({
  Array: {
    of: x => [x, 'custom']
  }
});
export const userObjectForward = nonProxyForward()?.Array.of(14);