import { strictEqual } from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const require = createRequire(import.meta.url);
const directory = fileURLToPath(new URL('./types/', import.meta.url));

// the published type definitions, checked against a consumer that uses the whole public surface.
// `types: []` is the point of the exercise: a type naming a Node global - `Buffer` is the easy
// one to reach for - would silently make every consumer of these types need `@types/node`
let reported = '';

try {
  await run(process.execPath, [require.resolve('typescript/bin/tsc'), '--project', directory]);
} catch (error) {
  reported = error.stdout || error.stderr || error.message;
}

strictEqual(reported, '', `types #1: ${ reported }`);
