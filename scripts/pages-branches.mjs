import { execFile } from 'node:child_process';
import { hash } from 'node:crypto';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const { GITHUB_REF_NAME, GITHUB_SHA, PAGES_SNAPSHOT, RUNNER_TEMP } = process.env;

async function checkArtifacts(branches, trigger) {
  const pages = join(RUNNER_TEMP, 'pages');
  await mkdir(pages, { recursive: true });
  const directories = await readdir(pages);
  if (!directories.length) throw new Error('No branch artifacts were built');

  for (const directory of directories) {
    const expected = branches.get(directory);
    if (!expected || (await readFile(join(pages, directory, 'commit.txt'), 'utf8')).trimEnd() !== expected.sha) {
      throw new Error(`Unexpected Pages artifact for ${ directory }`);
    }
  }

  if (directories.includes(trigger.directory)) {
    console.log(`test-directory=${ trigger.directory }`);
    // Actions compares concurrency groups case-insensitively.
    console.log(`sauce-group=${ hash('sha256', trigger.branch) }`);
  } else console.warn(`::warning::no pages of ${ GITHUB_SHA } were built, the Sauce Labs run is skipped`);
  console.log('publish=true');
}

try {
  const { stdout: refs } = await promisify(execFile)('git', ['ls-remote', '--heads', '--sort=refname', 'origin']);
  const branches = new Map();
  let trigger;
  for (const line of refs.split('\n').filter(Boolean)) {
    const [sha, branch] = line.split('\trefs/heads/');
    // Git forbids ~ in refs, so escaped bytes stay distinct and the directory is URL-safe.
    const escaped = encodeURIComponent(branch).replaceAll('%', '~');
    const directory = escaped.length <= 255 ? escaped : `~long-${ hash('sha256', branch) }`;
    const entry = { branch, sha, directory };
    if (branch === GITHUB_REF_NAME) trigger = entry;
    if (branch !== 'v1' && branch !== 'v2') branches.set(directory, entry);
  }

  const matrix = JSON.stringify([...branches.values()]);
  const snapshot = hash('sha256', matrix);
  if (PAGES_SNAPSHOT === undefined) {
    console.log(`branches=${ matrix }`);
    console.log(`snapshot=${ snapshot }`);
  } else if (!trigger || trigger.sha !== GITHUB_SHA || snapshot !== PAGES_SNAPSHOT) {
    console.warn('Skipping stale Pages deployment: branch heads changed');
  } else {
    await checkArtifacts(branches, trigger);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
