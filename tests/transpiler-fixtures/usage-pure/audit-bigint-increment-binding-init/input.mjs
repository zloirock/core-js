// Updating a BigInt binding leaves a value that can be formatted as a string.
let count = BigInt(1);
const next = count++;
const repr = String(next).padStart(5, '0');
export { repr };
