// nested template literals all of whose leaves are string literals fold
// to a constant; here the constant is `'iterator'`, so `Symbol[...] in obj`
// resolves to a `Symbol.iterator`-in-obj check (i.e. an iterability probe).
Symbol[`${`iter${'ator'}`}`] in obj;
