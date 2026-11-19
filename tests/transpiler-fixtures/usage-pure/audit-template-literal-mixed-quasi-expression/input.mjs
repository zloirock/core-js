// mixed quasi + interpolation `${'iter'}ator` must fold to the string 'iterator'
// so `Symbol[...] in obj` is recognised as `Symbol.iterator in obj`
Symbol[`${'iter'}ator`] in obj;
