// A native property of the returned constructor requires no additional statics.
// Keep the constructor import narrow when no polyfillable static is read.
const source = { read() { return Map; } };
void source.read().prototype;
