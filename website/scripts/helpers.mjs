/* eslint-disable no-console -- needed for logging */
import childProcess from 'node:child_process';
import { constants } from 'node:fs';
// eslint-disable-next-line node/no-unsupported-features/node-builtins -- ok
import { cp, access, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(childProcess.exec);
// a branch name goes to a command as an argument, never through a shell: git allows `$`, `;`, `(`, quotes and alike in it
const execFile = promisify(childProcess.execFile);

const BABEL_PATH = 'website/node_modules/@babel/standalone/babel.min.js';

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

export async function buildAndCopyCoreJS(version, srcDir, cacheDir = null, checkout = false) {
  async function bundlePackage(esModules) {
    await exec(`npm run bundle-package${ esModules ? ' esmodules' : '' }`, { cwd: srcDir });
    const bundleName = `core-js-bundle${ esModules ? '-esmodules' : '' }.js`;
    const srcPath = join(srcDir, 'packages/core-js-bundle/minified.js');
    const destPath = join(srcDir, 'website/src/public/bundles/', target, bundleName);
    await cp(srcPath, destPath);
    if (cacheDir !== null) {
      const cachePath = join(cacheDir, target, bundleName);
      await cp(srcPath, cachePath);
    }
  }

  const target = version.branch ?? version.tag;
  console.log(`Building and copying core-js for ${ target }`);
  const targetBundlePath = join(cacheDir ?? '', target);

  if (cacheDir !== null && await isExists(targetBundlePath)) {
    console.time('Core JS bundles copied');
    const bundlePath = join(targetBundlePath, 'core-js-bundle.js');
    const destBundlePath = join(srcDir, 'website/src/public/bundles/', target, 'core-js-bundle.js');
    await cp(bundlePath, destBundlePath);

    const esmodulesBundlePath = join(targetBundlePath, 'core-js-bundle-esmodules.js');
    const esmodulesDestBundlePath = join(srcDir, 'website/src/public/bundles/', target, 'core-js-bundle-esmodules.js');
    await cp(esmodulesBundlePath, esmodulesDestBundlePath);
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

export async function getDefaultVersion(versionFile, defaultVersion = null) {
  if (defaultVersion) return defaultVersion;

  const versions = await readJSON(versionFile);
  return versions.find(v => v.default)?.label;
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
