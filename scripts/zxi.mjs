const { dirname, resolve } = path;
const { pathExists } = fs;
const { cwd, env } = process;
const { _: args } = argv;
const { cyan, green } = chalk;
const CD = args.includes('cd');
const TIME = args.includes('time');

if (CD) args.splice(args.indexOf('cd'), 1);
if (TIME) args.splice(args.indexOf('time'), 1);

const FILE = args.shift();
const DIR = dirname(FILE);

$.verbose = true;

async function install(dir) {
  await $({ cwd: dir })`npm install \
    --no-audit \
    --no-fund \
    --lockfile-version=3 \
    --loglevel=error \
    --force \
  `;
}

if (await pathExists(`${ DIR }/package.json`)) {
  await install(DIR);

  // a suite that imports a module from another one runs it from THAT directory, so its dependencies
  // resolve there and not here - `"zxi": { "install": ["../sibling"] }` is how such a suite declares
  // what else has to be installed before its runner is imported
  const { zxi } = JSON.parse(await fs.readFile(`${ DIR }/package.json`));
  for (const sibling of zxi?.install ?? []) await install(resolve(DIR, sibling));

  $.preferLocal = [resolve(DIR), cwd()];
}

if (CD) cd(DIR);

env.FORCE_COLOR = '1';

// --- idle stdin ---
// Node materializes `process.stdin` REF'd, and a transient read anywhere in a run's dependency
// graph leaves that handle ref'd with no consumer on it. Behind a pipe that never closes - the
// stdin every `run-s` member is handed - the finished process then stays up on an input it is not
// reading, which is measured: a runner printing its own success and then living for over an hour.
// No script started this way takes input, so the bootstrap releases an idle stdin once the script
// is done; a stream something is still reading is left exactly as it is
function releaseIdleStdin() {
  const { stdin } = process;
  if (stdin.readableFlowing === true) return;
  if (stdin.listenerCount('data') || stdin.listenerCount('readable')) return;
  stdin.unref?.();
}

const start = Date.now();

try {
  await import(`../${ FILE }`);
} finally {
  releaseIdleStdin();
}

if (TIME) echo(green(`\n${ FILE } took ${ cyan((Date.now() - start) / 1000) } seconds`));
