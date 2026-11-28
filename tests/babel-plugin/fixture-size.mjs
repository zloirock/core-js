import { deepEqual, match, rejects, throws } from 'node:assert/strict';
import { createTestDirectory } from '../transpiler-differential/temporary-directory.mjs';
import { checkFixtureSize, collectFixtures, runShards, visitFixtures } from './fixture-shards.mjs';

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
// The real runner receives a relative subtree; the OS temp directory can be on another Windows drive.
const directory = await createTestDirectory('fixture-contracts-');
const fixture = path.join(directory, 'nested', 'claim');
const previousOverwrite = process.env.OVERWRITE;
try {
  await fs.outputFile(path.join(fixture, 'input.mjs'), '// row\n'.repeat(30));
  await fs.writeJson(path.join(fixture, 'options.json'), { plugins: [['@core-js', {}]] });
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
  await fs.writeFile(path.join(fixture, 'input.mjs'), '');
  await fs.outputFile(path.join(fixture, 'support', 'feature', 'index.js'), 'export default 1;');
  const nested = path.join(fixture, 'child');
  await fs.outputFile(path.join(nested, 'input.mjs'), '');
  await rejects(collectFixtures(directory), /must declare plugins/u);
  await fs.writeJson(path.join(nested, 'options.json'), { plugins: [['@core-js', {}]] });
  deepEqual(await collectFixtures(directory), [fixture, nested]);
  const linked = path.join(directory, 'linked-source');
  await fs.outputFile(path.join(linked, 'input.mjs'), '1;');
  await fs.writeJson(path.join(linked, 'options.json'), { plugins: [['@core-js', {}]] });
  const alias = path.join(fixture, 'alias');
  await fs.symlink(linked, alias, 'junction');
  await fs.symlink(fixture, path.join(nested, 'back'), 'junction');
  deepEqual(await collectFixtures(fixture), [fixture, alias, nested]);
  await rejects(visitFixtures(directory, async site => {
    if (site === nested) throw new Error('nested visitor failed');
  }), /nested visitor failed/u);

  // A stale output must show the actual transform error on either Babel version.
  const broken = path.join(directory, 'broken');
  await fs.outputFile(path.join(broken, 'input.mjs'), '[].at(0);');
  await fs.writeFile(path.join(broken, 'output.mjs'), '[].at(0);');
  await fs.writeJson(path.join(broken, 'options.json'), { plugins: [['@core-js', { method: 'invalid-fixture-method' }]] });
  const env = { ...process.env, OVERWRITE: '', FIXTURE_SHARD: '0/1',
    FIXTURE_SUBTREE: path.relative(path.join(import.meta.dirname, '../transpiler-fixtures'), broken) };
  const failureRun = await $({ cwd: import.meta.dirname, env, quiet: true })`zx ./index.mjs`;
  match(failureRun.stdout, /unexpected error: .*invalid-fixture-method/u);
  match(failureRun.stdout, /"failed":1/u);

  const script = path.join(directory, 'shard.mjs');
  const marker = '@@FIXTURE-SHARD@@{"passed":1}@@';
  for (const [body, failure] of [
    [`console.log('${ marker }');`],
    [`console.log('earlier @@FIXTURE-SHARD@@{"passed":7}@@'); console.log('${ marker }');`],
    [`console.log('child detail\\n${ marker }'); process.exitCode = 7;`, /code 7.*child detail/su],
    ['console.log("no marker");', /produced no result.*no marker/su],
    ['console.log("@@FIXTURE-SHARD@@bad@@");', /invalid counters/u],
    ...['null', '[]', '{"passed":true}', '{"failed":-1}'].map(json => [
      `console.log('@@FIXTURE-SHARD@@${ json }@@');`, /invalid counters/u,
    ]),
    [`process.stdout.write(Buffer.from([0xCE])); await new Promise(resolve => setTimeout(resolve, 20));
      process.stdout.write(Buffer.from([0xBB, 0x0A])); process.exitCode = 1;`, /\u{3BB}/u],
    ...process.platform === 'win32' ? [] : [[`console.log('${ marker }'); process.kill(process.pid, 'SIGTERM');`, /signal SIGTERM/u]],
  ]) {
    await fs.writeFile(script, body);
    const result = runShards({ script, shards: 1 });
    if (failure) await rejects(result, failure);
    else deepEqual(await result, { passed: 1 });
  }
} finally {
  if (previousOverwrite === undefined) delete process.env.OVERWRITE;
  else process.env.OVERWRITE = previousOverwrite;
  await fs.remove(directory);
}
echo(chalk.green('fixture-size: boundaries, exceptions and collection passed'));
