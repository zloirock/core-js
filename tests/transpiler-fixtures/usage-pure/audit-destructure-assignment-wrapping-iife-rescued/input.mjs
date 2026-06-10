// the rescued chain-assignment may itself wrap an SE-bearing IIFE: ONE rescue carries the
// binding update AND the setup, each exactly once, with the inner globalThis still rewritten
let calls = 0;
let a;
const [{
  from
}] = [(a = (() => {
  calls++;
  return globalThis;
})()).Array];
