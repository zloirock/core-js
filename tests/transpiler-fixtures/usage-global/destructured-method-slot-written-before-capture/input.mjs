// a method destructured off a literal is the callee a call of the name runs, so a static read off
// its result is served - unless the file wrote that slot before the capture, which then holds no
// one certain function and keeps the read native. a write after the capture changes nothing
const early = { make() { return Map; } };
early.make = () => Set;
const { make } = early;
make().groupBy(src, fn);
const late = { build() { return Promise; } };
const { build } = late;
late.build = () => Set;
build().try(fn);
