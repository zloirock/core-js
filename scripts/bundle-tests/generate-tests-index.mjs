import fs from 'node:fs/promises';

// (re)generate `tests/<name>/index.js` importing every matching test file, plus the pure
// core export hook for non-`core-js` packages; shared by the unit and e2e bundle builds
export async function generateTestsIndex(name, pkg, filter = /^(?:es|esnext|helpers|web)\./, extensions = ['.js']) {
  const dir = `../../tests/${ name }`;
  const files = await fs.readdir(dir);
  return fs.writeFile(`${ dir }/index.js`, `import '../helpers/qunit-helpers';\n\n${ files
    .filter(it => extensions.some(ext => it.endsWith(ext)) && it !== 'index.js' && filter.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ pkg !== 'core-js' ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\n` : '' }`);
}
