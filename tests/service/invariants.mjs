import { readFile, readdir } from 'node:fs/promises';
import { deepStrictEqual, ok } from 'node:assert/strict';

const suites = (await readdir(new URL('.', import.meta.url))).filter(file => file.endsWith('.mjs'));
const labels = new Set();
const taken = new Set();
const reused = [];

for (const file of suites) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8');
  // `matcher-2 #1`, `user-agents-1 #7: Windows Chrome` - the family is what an invariant is named
  for (const { groups } of source.matchAll(/'(?<family>[a-z][\w-]*-\d+) #\d+/g)) labels.add(groups.family);

  // the whole point of a label is to name the assertion that failed: a number used twice in one
  // file sends whoever is reading the failure to the wrong assertion, and nothing else says so
  for (const [label] of source.matchAll(/'[a-z][\w-]* #\d+[a-z]?(?=[':])/g)) {
    if (taken.has(`${ file }${ label }`)) reused.push(`${ file } ${ label.slice(1) }`);
    taken.add(`${ file }${ label }`);
  }
}

const packageRoot = new URL('../../packages/core-js-service/', import.meta.url);
const invariants = await readFile(new URL('./INVARIANTS.md', packageRoot), 'utf8');

// the area rule reads both ways: a trap with no assertion is a trap nobody checks, and an assertion
// whose invariant is written down nowhere is a label nobody can read - and the second half rots
// silently, because nothing goes red when a rule is renamed, moved or dropped from the document
const undocumented = [...labels].filter(family => !invariants.includes(`**${ family }**`)).toSorted();

deepStrictEqual(undocumented, [], `invariants #1: ${ undocumented.join(', ') } named by an assertion and written down nowhere`);
ok(labels.size > 30, `invariants #2: only ${ labels.size } assertion families found - the scan stopped matching`);
deepStrictEqual(reused.toSorted(), [], `invariants #3: ${ reused.join(', ') } labels one assertion more than once`);
ok(taken.size > 200, `invariants #4: only ${ taken.size } assertions found - the scan stopped matching`);

// the constants sit below every layer, the domain included, so a `node:` import there is the domain
// asking the operating system what it is running on. Nothing else would go red: the import works,
// the tests pass, and the layer boundary is gone
const constants = await readFile(new URL('./config.js', packageRoot), 'utf8');
const environment = constants.matchAll(/from '(?<module>node:[\w/]+)'/g).map(({ groups }) => groups.module).toArray();

deepStrictEqual(environment, [], `layers-1 #1: config.js reaches for ${ environment.join(', ') }`);
