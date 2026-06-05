// entry-global removes the whole statement, but the observable side effect inside the outer
// comma sequence (`spy()`) must be recovered - the SE-free `0` prefix drops as before
const spy = () => {};
0, (spy(), require)('core-js/actual/promise');
