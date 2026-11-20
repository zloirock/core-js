import { deepEqual, equal, notEqual, rejects } from 'node:assert/strict';

const script = path.resolve('scripts/pages-branches.mjs');
const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-pages-'));
const run = $({ cwd, quiet: true });
const commit = message => run`git -c user.name=Test -c user.email=test@example.com -c commit.gpgsign=false commit --allow-empty -qm ${ message }`;
const page = directory => path.join(cwd, 'pages', directory);
const artifact = (directory, sha) => fs.outputFile(path.join(page(directory), 'commit.txt'), `${ sha }\n`);

try {
  await run`git init -q -b master`;
  await commit('initial');
  const first = (await run`git rev-parse HEAD`).stdout.trimEnd();
  for (const branch of ['topic/a', 'topic-a', 'github-pages-1', 'v1', 'v2']) await run`git branch ${ branch }`;
  await commit('master');
  const head = (await run`git rev-parse HEAD`).stdout.trimEnd();
  await run`git remote add origin .`;

  function runPages(snapshot, sha = head, branch = 'master') {
    const env = { ...process.env, RUNNER_TEMP: cwd, GITHUB_REF_NAME: branch, GITHUB_SHA: sha, PAGES_SNAPSHOT: snapshot };
    return run({ env })`${ process.execPath } ${ script }`;
  }
  async function list() {
    const { stdout } = await runPages();
    const [branches, snapshot] = stdout.trimEnd().split('\n');
    return { branches: JSON.parse(branches.slice('branches='.length)), snapshot: snapshot.slice('snapshot='.length) };
  }

  const plan = await list();
  deepEqual(plan.branches.map(it => it.branch), ['github-pages-1', 'master', 'topic-a', 'topic/a']);
  const topic = plan.branches.find(it => it.branch === 'topic/a');
  equal(topic.sha, first);
  notEqual(topic.directory, 'topic-a', 'a slash and a dash lead to different Pages URLs');
  await rejects(runPages(plan.snapshot), /No branch artifacts were built/);

  await artifact('github-pages-1', first);
  equal((await runPages(plan.snapshot)).stdout, 'publish=true\n', 'one successful branch can publish without starting Sauce for master');
  for (const branch of ['v1', 'v2']) {
    equal((await runPages(plan.snapshot, first, branch)).stdout, 'publish=true\n', `${ branch } can publish other branches without starting Sauce`);
  }
  equal((await runPages(plan.snapshot, first, 'missing')).stdout, '', 'an absent branch cannot publish another branch at the same SHA');
  await artifact('master', head);
  await artifact(topic.directory, first);
  const published = (await runPages(plan.snapshot)).stdout;
  const groupLine = /^sauce-group=[\da-f]{64}$/m;
  const [group] = groupLine.exec(published);
  equal(published, `test-directory=master\n${ group }\npublish=true\n`);
  equal((await runPages(plan.snapshot, first)).stdout, '', 'an old triggering commit cannot publish');

  await run`git branch -f topic/a ${ head }`;
  const next = await list();
  notEqual(next.snapshot, plan.snapshot);
  equal((await runPages(plan.snapshot)).stdout, '', 'a late master build cannot roll back another branch');
  await rejects(runPages(next.snapshot), /Unexpected Pages artifact/);
  await artifact(topic.directory, head);
  equal((await runPages(next.snapshot)).stdout, published);

  await run`git branch -M Master`;
  await fs.rename(page('master'), page('Master'));
  const renamed = await list();
  const upper = (await runPages(renamed.snapshot, head, 'Master')).stdout;
  const [upperGroup] = groupLine.exec(upper);
  notEqual(upperGroup, group, 'case-distinct branches have separate Sauce groups even at the same commit');

  await run`git branch -D topic/a`;
  equal((await runPages(renamed.snapshot, head, 'Master')).stdout, '', 'a deleted branch makes the snapshot stale');
  await run`git remote set-url origin ${ path.join(cwd, 'missing') }`;
  await rejects(runPages(renamed.snapshot), /git ls-remote/);
} finally {
  await fs.remove(cwd);
}

echo(chalk.green('Pages branch snapshots tested'));
