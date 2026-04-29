// global-mode CJS file (`module.exports`) - imports must emit as `require(...)`, not
// ESM `import ...`. CJS detection recognises plain `module.exports.X = Y` writes
const arr = [1, 2, 3];
module.exports.first = arr.at(0);
module.exports.flat = arr.flat();
