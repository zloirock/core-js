/* eslint-disable no-console -- needed for logging */
import childProcess from 'node:child_process';
import { constants } from 'node:fs';
import { cp, access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { promisify } from 'node:util';

const exec = promisify(childProcess.exec);
// a branch name goes to a command as an argument, never through a shell: git allows `$`, `;`, `(`, quotes and alike in it
const execFile = promisify(childProcess.execFile);

const BABEL_PATH = 'website/node_modules/@babel/standalone/babel.min.js';
// `Build bundles` of a push takes a minute or two
const BUNDLES_TIMEOUT = 5 * 60e3;
const BUNDLES_POLL = 5e3;

export async function isExists(target) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function hasDocs(version, execDir) {
  const target = version.branch ? `origin/${ version.branch }` : version.tag;
  console.log(`Checking if docs exist in "${ target }"...`);
  try {
    const { stdout } = await execFile('git', ['ls-tree', '-r', '--name-only', target, 'docs/web/docs/'], { cwd: execDir });
    if (stdout) return;
  } catch { /* a missing ref */ }
  throw new Error(`Docs not found in "${ target }".`);
}

export async function installDependencies(execDir, reinstall = false) {
  console.log('Installing dependencies...');
  console.time('Installed dependencies');
  const nodeModulesPath = join(execDir, 'node_modules');
  if (reinstall || !await isExists(nodeModulesPath)) {
    await exec('npm ci', { cwd: execDir });
  }
  console.timeEnd('Installed dependencies');
}

export async function copyBabelStandalone(srcDir) {
  console.log('Copying Babel standalone...');
  await installDependencies(`${ srcDir }website`);
  console.time('Copied Babel standalone');
  const babelPath = join(srcDir, BABEL_PATH);
  const destPath = join(srcDir, 'website/src/public/babel.min.js');
  await cp(babelPath, destPath);
  console.timeEnd('Copied Babel standalone');
}

export async function copyBlogPosts(srcDir) {
  console.log('Copying blog posts...');
  console.time('Copied blog posts');
  const fromDir = join(srcDir, 'docs/');
  const toDir = join(srcDir, 'docs/web/blog/');
  const entries = await readdir(fromDir, { withFileTypes: true });
  await Promise.all(entries
    .filter(entry => entry.isFile())
    .map(entry => cp(join(fromDir, entry.name), join(toDir, entry.name))));
  console.timeEnd('Copied blog posts');
}

export async function copyCommonFiles(srcDir, branch) {
  console.log('Copying common files...');
  console.time('Copied common files');
  const toDir = join(srcDir, 'docs/web/');
  await Promise.all([
    ['CHANGELOG.md', 'changelog.md'],
    ['CONTRIBUTING.md', 'contributing.md'],
    ['SECURITY.md', 'security.md'],
  ].map(async ([from, to]) => {
    const content = await readFile(join(srcDir, from), 'utf8');
    // these files link other repository files by relative paths, the site build resolves them on GitHub
    const meta = `---\nrepoPath: ${ JSON.stringify(from) }\nrepoBranch: ${ JSON.stringify(branch) }\n---\n`;
    await writeFile(join(toDir, to), meta + content);
  }));
  console.timeEnd('Copied common files');
}

// the site serves no source maps, so a bundle loses its reference to one
async function copyBundle(from, to) {
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, (await readFile(from, 'utf8')).replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '\n'));
}

export async function buildAndCopyCoreJS(version, srcDir, cacheDir = null, checkout = false) {
  async function bundlePackage(esModules) {
    await exec(`npm run bundle-package${ esModules ? ' esmodules' : '' }`, { cwd: srcDir });
    const bundleName = `core-js-bundle${ esModules ? '-esmodules' : '' }.js`;
    const srcPath = join(srcDir, 'packages/core-js-bundle/minified.js');
    const destPath = join(srcDir, 'website/src/public/bundles/', target, bundleName);
    await copyBundle(srcPath, destPath);
    // the bundles of a branch are cached only by the `Build bundles` workflow, together with their commit
    if (cacheDir !== null && !version.branch) {
      const cachePath = join(cacheDir, target, bundleName);
      await cp(srcPath, cachePath);
    }
  }

  // a branch moves with each push, so its cache waits for the commit being built: `Build bundles` of the same push
  // uploads it after the bundles, usually later than this build gets here. In a cache that was there, no commit means
  // a branch not rebased yet or an upload with the bundles in place, so the cache is taken; after the timeout too, as
  // the server has no room to build the bundles itself
  async function isCached() {
    if (!version.branch) return isExists(targetBundlePath);
    const { stdout } = await execFile('git', ['rev-parse', `origin/${ version.branch }`], { cwd: srcDir });
    const commit = stdout.trim();
    const hadCache = await isExists(targetBundlePath);
    for (let waited = 0; waited < BUNDLES_TIMEOUT; waited += BUNDLES_POLL) {
      let cachedCommit = null;
      try {
        cachedCommit = (await readFile(join(targetBundlePath, 'commit'), 'utf8')).trim();
      } catch { /* no commit */ }
      if (cachedCommit === commit || (cachedCommit === null && hadCache)) return true;
      if (!waited) console.log(`Waiting for core-js bundles of ${ commit }...`);
      await setTimeout(BUNDLES_POLL);
    }
    console.log(`Core JS bundles of ${ commit } did not come in time`);
    return isExists(targetBundlePath);
  }

  const target = version.branch ?? version.tag;
  console.log(`Building and copying core-js for ${ target }`);
  const targetBundlePath = join(cacheDir ?? '', target);

  if (cacheDir !== null && await isCached()) {
    console.time('Core JS bundles copied');
    const bundlePath = join(targetBundlePath, 'core-js-bundle.js');
    const destBundlePath = join(srcDir, 'website/src/public/bundles/', target, 'core-js-bundle.js');
    await copyBundle(bundlePath, destBundlePath);

    const esmodulesBundlePath = join(targetBundlePath, 'core-js-bundle-esmodules.js');
    const esmodulesDestBundlePath = join(srcDir, 'website/src/public/bundles/', target, 'core-js-bundle-esmodules.js');
    await copyBundle(esmodulesBundlePath, esmodulesDestBundlePath);
    console.timeEnd('Core JS bundles copied');
    return;
  }

  console.time('Core JS bundles built');
  if (checkout) {
    await checkoutVersion(version, srcDir);
  }
  // `node_modules` is ignored by git, so after a checkout it still holds the dependencies of the previous version
  await installDependencies(srcDir, checkout);

  // the package keeps the last build, and local tests of `core-js-bundle` need the standard one
  await bundlePackage(true);
  await bundlePackage(false);

  console.timeEnd('Core JS bundles built');
}

export async function checkoutVersion(version, execDir) {
  await execFile('git', ['checkout', version.branch ? `origin/${ version.branch }` : version.tag], { cwd: execDir });
}

export async function buildWeb(branch, execDir, local = false) {
  console.log('Building web...');
  console.time('Built web');
  const args = ['run', 'build-website'];
  if (branch) args.push(`branch=${ branch }`);
  if (local) args.push('local');
  const stdout = await execFile('npm', args, { cwd: execDir });
  console.timeEnd('Built web');
  return stdout;
}

export async function getCurrentBranch(execDir) {
  console.log('Getting current branch...');
  console.time('Got current branch');
  const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', { cwd: execDir });
  console.timeEnd('Got current branch');
  return stdout.trim();
}

// a branch build is published as one entry of `branches/`: `/` becomes `~`, which git does not allow in branch names,
// so different branches never share an entry
export function getBranchPreviewName(branch) {
  return branch.replaceAll('/', '~');
}

// the default version by its path: the directory of its pages and the prefix of their URLs, not its label
export async function getDefaultVersion(versionFile, defaultVersion = null) {
  if (defaultVersion) return defaultVersion;

  const versions = await readJSON(versionFile);
  const version = versions.find(v => v.default);
  return version?.path ?? version?.label;
}

export async function readJSON(filePath) {
  const buffer = await readFile(filePath, 'utf8');
  return JSON.parse(buffer);
}

export function expandVersionsConfig(config) {
  let defaultIndex = null;
  const $config = config.map(({ label, branch, path = label, tag, default: $default }, index) => {
    if ($default) {
      if (defaultIndex !== null) throw new Error('Duplicate default');
      defaultIndex = index;
    }
    return {
      branch,
      default: false,
      label,
      path,
      tag,
    };
  });

  if (defaultIndex === null) throw new Error('Missed default');

  return [{ ...$config[defaultIndex], default: true }, ...$config];
}
