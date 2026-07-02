// a side-effecting computed key TWO levels deep. the key is kept in place (value renamed to a throwaway,
// effect once) and the polyfill bound separately - the same residual path as every depth. polyfill wins
const { a: { b: { [(effectful(), 'from')]: f } } } = { a: { b: Array } };
const probe = [1, 2].includes(2);
