// a chain assignment writes its TAIL into every name on the chain, so a dominating `x = y = V` write
// installs `V` whatever channel later reads the alias: a bare receiver, a computed key, a callee, an
// array-wrapper alias, a class base and a class static container. one write-value canon answers
// them all - a channel judging the raw `y = V` node resolves nothing and drops the polyfill

let recv = Object, r2;
recv = r2 = Array;
export const bareReceiver = recv.from('ab');
