// statement-leading SE-wrap after an identifier without `;` - ASI boundary preserved
let a = () => 0;
let fn = () => 0;
a
Symbol[(fn(), 'iterator')];
