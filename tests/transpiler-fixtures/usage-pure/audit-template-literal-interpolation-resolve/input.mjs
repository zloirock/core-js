// template literal with all-literal interpolations resolves to a constant string, so
// `Symbol[\`${'iter'}${'ator'}\`]` can be recognised as `Symbol.iterator` and collapsed
Symbol[`${'iter'}${'ator'}`] in obj;
