// Dev helper: run ONE exercise raw (no bundler, no polyfills, full node realm) and report which
// self-checks pass. This validates the exercise's own logic and its expected literals before any
// bundling. Usage: node check-exercise.mjs [exercisePathOrLibName]  (default: exercises/rxjs.mjs)
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = process.argv[2] ?? 'exercises/rxjs.mjs';
const target = isAbsolute(arg) ? arg : join(HERE, arg.includes('/') ? arg : `exercises/${ arg }.mjs`);

const mod = await import(pathToFileURL(target).href);
const { checks } = await mod.run();
const bad = checks.filter(c => !c.pass);
for (const c of checks) {
  console.log(`${ c.pass ? '✓' : '✗' } ${ c.label }${ c.pass ? '' : `  actual=${ JSON.stringify(c.actual) } expected=${ JSON.stringify(c.expected) }` }`);
}
console.log(`\n${ checks.length } checks, ${ bad.length } failing`);
if (bad.length) process.exitCode = 1;
