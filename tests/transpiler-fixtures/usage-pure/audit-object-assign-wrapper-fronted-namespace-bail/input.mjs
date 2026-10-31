// the mutating namespace is wrapper-fronted (`(0, Object).assign(...)`, a common minified shape):
// it still resolves to the global `Object`, so the assign patches `Array.from` and the later call
// keeps the user patch
(0, Object).assign(Array, { from: function () { return []; } });
Array.from([1, 2, 3]);
