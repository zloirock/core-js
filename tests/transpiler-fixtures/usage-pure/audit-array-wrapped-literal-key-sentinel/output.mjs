// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const [{
  'from': f,
  ...r
}, o] = [Array, {}];
f([1]);
r;
o;