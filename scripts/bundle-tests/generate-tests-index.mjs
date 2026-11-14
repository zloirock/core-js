// Generate every matching test import in stable order. Unit-pure exposes its core namespace;
// e2e opts out so its transformed sources alone decide which polyfills enter the bundle.
export async function generateTestsIndex({
  name, pkg, filter = /^(?:es|esnext|helpers|web)\./, extensions = ['.js'], exportCore = pkg !== 'core-js',
}) {
  const dir = `../../tests/${ name }`;
  // sorted: readdir hands entries back in the filesystem's own order, so a suite that has to run
  // LAST can only say so through its NAME once this order is the alphabetical one
  const files = (await fs.readdir(dir)).sort();
  return fs.writeFile(`${ dir }/index.js`, `import '../helpers/qunit-helpers';\n\n${ files
    .filter(it => extensions.some(ext => it.endsWith(ext)) && it !== 'index.js' && filter.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ exportCore ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\ncore.globalThis.PURE = true;\n` : '' }`);
}
