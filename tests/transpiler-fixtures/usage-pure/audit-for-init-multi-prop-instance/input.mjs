// for-loop init destructuring multiple instance-method properties: each property gets
// its own pure-mode instance polyfill alias.
for (const { at, flat } = [[1, 2], [3]]; false;) { at(0); flat(); }
