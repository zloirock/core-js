import { deepEqual, rejects, throws } from 'node:assert/strict';
import { checkFixtureSize, collectFixtures } from './fixture-shards.mjs';

const reason = 'The regression requires all nested scopes in one input.';
const directive = `// fixture-size: 31 -- ${ reason }\n`;
checkFixtureSize('', 'empty');
for (const newline of ['\n', '\r\n', '\r', '\u2028', '\u2029']) {
  for (const trailing of ['', newline]) {
    const source = Array(30).fill('// row').join(newline) + trailing;
    checkFixtureSize(source, 'at-limit');
    throws(() => checkFixtureSize(`${ source + newline }// overflow`, 'over-limit'), /has 3[12] lines/u);
  }
  checkFixtureSize(`// fixture-size: 31 -- ${ reason }${ newline }${ Array(30).fill('// row').join(newline) }`, 'indivisible-newline');
}
// Blank lines and comments use the same budget as executable source.
checkFixtureSize(`${ '// row\n'.repeat(29) }\n`, 'blank-at-limit');
throws(() => checkFixtureSize(`${ '// row\n'.repeat(29) }\n\n`, 'blank-over-limit'), /has 31 lines/u);
const source = directive + '// row\n'.repeat(30);
checkFixtureSize(source, 'indivisible');
throws(() => checkFixtureSize(`${ source }// extra\n`, 'over-exception'), /has 32 lines \(limit 31\)/u);
throws(() => checkFixtureSize(`${ directive }// short\n`, 'obsolete'), /no longer needs/u);
throws(() => checkFixtureSize(`// leading\n${ source }`, 'misplaced'), /has 32 lines \(limit 30\)/u);
for (const invalid of ['// fixture-size', '// fixture-size: 30 -- reason', '// fixture-size: 31.5 -- reason',
  '// fixture-size: many -- reason', '// fixture-size: 31', '// fixture-size: 31 -- ',
  '// fixture-size: 999999999999999999999 -- reason']) {
  throws(() => checkFixtureSize(`${ invalid }\n${ '// row\n'.repeat(30) }`, 'malformed'), /invalid fixture-size directive/u);
}

// Exercise the collector itself: nested fixtures and explicit regeneration must use the gate.
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-fixture-size-'));
const fixture = path.join(directory, 'nested', 'claim');
const previousOverwrite = process.env.OVERWRITE;
try {
  await fs.outputFile(path.join(fixture, 'input.mjs'), '// row\n'.repeat(30));
  deepEqual(await collectFixtures(directory), [fixture]);
  await fs.writeFile(path.join(fixture, 'input.mjs'), '// row\n'.repeat(31));
  process.env.OVERWRITE = '1';
  await rejects(collectFixtures(directory), /has 31 lines/u);
  await fs.writeFile(path.join(fixture, 'input.mjs'), source);
  deepEqual(await collectFixtures(directory), [fixture]);
  await fs.writeFile(path.join(fixture, 'input.mjs'), `${ source }// extra\n`);
  await rejects(collectFixtures(directory), /has 32 lines \(limit 31\)/u);
  await fs.writeFile(path.join(fixture, 'input.mjs'), '// fixture-size: 31 -- \n');
  await rejects(collectFixtures(directory), /invalid fixture-size directive/u);
  await fs.writeFile(path.join(fixture, 'input.mjs'), `${ directive }// short\n`);
  await rejects(collectFixtures(directory), /no longer needs/u);
} finally {
  if (previousOverwrite === undefined) delete process.env.OVERWRITE;
  else process.env.OVERWRITE = previousOverwrite;
  await fs.remove(directory);
}
echo(chalk.green('fixture-size: boundaries, exceptions and collection passed'));
