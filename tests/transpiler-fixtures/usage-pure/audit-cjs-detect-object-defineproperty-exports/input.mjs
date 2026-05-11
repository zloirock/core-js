// tsc / esbuild CJS emit shape: `Object.defineProperty(exports, 'x', ...)` instead of
// direct `exports.x = ...`. detection must recognise as CJS so polyfill imports emit as
// `require()` not ESM `import`
Object.defineProperty(exports, 'x', { value: Array.from([1, 2, 3]) });
