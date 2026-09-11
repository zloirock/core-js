// Two-hop Identifier alias chain: `b -> a -> [Array]`. follow-init helper chases the
// chain to the literal `[Array]` then peels one ArrayExpression layer to reach Array.
// const-binding cycle guard prevents infinite recursion on pathological re-aliases
const a = [Array];
const b = a;
const [{ from }] = b;
from([1, 2]);
