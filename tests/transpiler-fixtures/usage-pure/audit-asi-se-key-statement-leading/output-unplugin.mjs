import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// statement-leading SE-wrap after an identifier without `;` — ASI boundary preserved
let a = () => 0;
let fn = () => 0;
a
;(fn(), _Symbol$iterator);