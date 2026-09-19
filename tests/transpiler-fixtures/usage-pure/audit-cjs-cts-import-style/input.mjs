// .cts (CommonJS TypeScript) extension defaults the import style to `require(...)` rather
// than ESM `import`. Combined with `module.exports = ...` the file is unambiguously CJS,
// and emitted polyfills must use the matching CJS shape so bundlers don't reject the file
// as mixed-format.
const x: number = 1;
arr.flat?.();
module.exports = { x };
