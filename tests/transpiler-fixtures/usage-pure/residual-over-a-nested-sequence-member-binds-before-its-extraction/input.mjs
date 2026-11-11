// A nested sequence member evaluates its effect before any binding. Its captured
// value keeps the extracted first property ahead of the following native length read.
var box = { y: Array };
var { from, length } = (0, (b(), box)).y;
export { from, length };
