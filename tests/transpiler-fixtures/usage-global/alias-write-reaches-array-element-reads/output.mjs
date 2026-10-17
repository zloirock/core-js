import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// A later alias write changes the slot from String to Array only after the first read.
// Distinct methods expose String.at before the write and Array.includes after it.
const rows = ['02'];
const alias = rows;
use(rows[0].at(-1));
alias[0] = [0, 2];
const current = rows[0].includes;
use(current);