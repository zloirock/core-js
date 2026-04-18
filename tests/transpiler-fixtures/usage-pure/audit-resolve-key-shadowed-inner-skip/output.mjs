// inner `k` shadows outer; resolveKey must follow the function-frame binding,
// not the outer `'iterator'`, so no polyfill is injected
const k = 'iterator';
function f() {
  const k = 'foo';
  return Symbol[k] in obj;
}
f();