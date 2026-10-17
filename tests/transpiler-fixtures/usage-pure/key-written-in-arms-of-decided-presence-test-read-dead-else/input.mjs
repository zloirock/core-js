let deadElse;
if (typeof Symbol != 'undefined') {
  deadElse = Symbol.iterator;
} else {
  deadElse = '@@iterator';
}
export const readDeadElse = receiver => receiver[deadElse];
