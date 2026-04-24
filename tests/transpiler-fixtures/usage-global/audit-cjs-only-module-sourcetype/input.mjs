// CommonJS body under default `sourceType: 'module'` - no ESM markers, only `module.exports`.
// plugin must treat this as CJS and emit `require()` statements for its polyfill imports,
// not ES `import` declarations
module.exports = { items: [].at(-1) };
