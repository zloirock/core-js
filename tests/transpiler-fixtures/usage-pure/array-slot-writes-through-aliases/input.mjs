// A source write changes the shared slot from Array to String after the captured method.
// Distinct methods expose Array.at before the write and String.includes after it.
const rows = [[0, 2]];
const alias = rows;
const before = alias[0].at;
rows[0] = '02';
use(before, alias[0].includes('2'));
