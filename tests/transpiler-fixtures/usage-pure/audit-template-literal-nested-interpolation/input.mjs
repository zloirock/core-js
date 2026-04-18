// recursion through nested TemplateLiteral: outer interp is itself a template with a literal
// interp - every leaf resolves to a string literal, so the whole chain folds to 'iterator'
Symbol[`${`iter${'ator'}`}`] in obj;
