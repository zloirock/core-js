/* eslint-disable no-console -- needed for logging */
import childProcess from 'node:child_process';
import { constants } from 'node:fs';
import { cp, access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(childProcess.exec);

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
    await exec(`git ls-tree -r --name-only ${ target } | grep "docs/web/docs/"`, { cwd: execDir });
  } catch {
    throw new Error(`Docs not found in "${ target }".`);
  }
}

export async function installDependencies(execDir) {
  console.log('Installing dependencies...');
  console.time('Installed dependencies');
  const nodeModulesPath = join(execDir, 'node_modules');
  if (!await isExists(nodeModulesPath)) {
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
  for (const entry of entries) {
    if (entry.isFile()) {
      const srcFile = join(fromDir, entry.name);
      const destFile = join(toDir, entry.name);
      await cp(srcFile, destFile);
    }
  }
  console.timeEnd('Copied blog posts');
}

export async function copyCommonFiles(srcDir) {
  console.log('Copying common files...');
  console.time('Copied common files');
  const toDir = join(srcDir, 'docs/web/');
  await cp(`${ srcDir }CHANGELOG.md`, `${ toDir }changelog.md`);
  await cp(`${ srcDir }CONTRIBUTING.md`, `${ toDir }contributing.md`);
  await cp(`${ srcDir }SECURITY.md`, `${ toDir }security.md`);
  console.timeEnd('Copied common files');
}

export async function buildAndCopyCoreJS(version, srcDir, cacheDir = '', checkout = false) {
  const target = version.branch ?? version.tag;
  const name = version.path ?? version.label;
  const cache = cacheDir !== '';
  console.log(`Building and copying core-js for ${ target }`);
  const targetBundlePath = `${ cacheDir }/${ target }/`;

  if (cache && await isExists(targetBundlePath)) {
    console.time('Core JS bundles copied');
    const bundlePath = join(targetBundlePath, 'core-js-bundle.js');
    const destBundlePath = join(srcDir, 'website/src/public/bundles/', name, 'core-js-bundle.js');
    const esmodulesBundlePath = join(targetBundlePath, 'core-js-bundle-esmodules.js');
    const esmodulesDestBundlePath = join(srcDir, 'website/src/public/bundles/', name, 'core-js-bundle-esmodules.js');
    await cp(bundlePath, destBundlePath);
    await cp(esmodulesBundlePath, esmodulesDestBundlePath);
    console.timeEnd('Core JS bundles copied');
    return;
  }

  console.time('Core JS bundles built');
  if (checkout) {
    await checkoutVersion(version, srcDir);
  }
  await installDependencies(srcDir);
  await exec('npm run bundle-package', { cwd: srcDir });
  const bundlePath = join(srcDir, 'packages/core-js-bundle/minified.js');
  const destPath = join(srcDir, 'website/src/public/bundles/', name, 'core-js-bundle.js');
  await cp(bundlePath, destPath);

  if (cache) {
    const cacheBundlePath = join(targetBundlePath, 'core-js-bundle.js');
    await cp(bundlePath, cacheBundlePath);
  }

  await exec('npm run bundle-package esmodules', { cwd: srcDir });
  const esmodulesBundlePath = join(srcDir, 'packages/core-js-bundle/minified.js');
  const esmodulesDestBundlePath = join(srcDir, 'website/src/public/bundles/', name, 'core-js-bundle-esmodules.js');
  await cp(esmodulesBundlePath, esmodulesDestBundlePath);

  if (cache) {
    const cacheEsmodulesBundlePath = join(targetBundlePath, 'core-js-bundle-esmodules.js');
    await cp(esmodulesBundlePath, cacheEsmodulesBundlePath);
  }

  console.timeEnd('Core JS bundles built');
}

export async function checkoutVersion(version, execDir) {
  if (version.branch) {
    await exec(`git checkout origin/${ version.branch }`, { cwd: execDir });
  } else {
    await exec(`git checkout ${ version.tag }`, { cwd: execDir });
  }
}

export async function buildWeb(branch, execDir, local = false) {
  console.log('Building web...');
  console.time('Built web');
  let command = 'npm run build-web';
  if (branch) command += ` branch=${ branch }`;
  if (local) command += ' local';
  const stdout = await exec(command, { cwd: execDir });
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

export async function getDefaultVersion(versionFile, defaultVersion = null) {
  if (defaultVersion) return defaultVersion;

  const versions = await readJSON(versionFile);
  return versions.find(v => v.default)?.label;
}

export async function readJSON(filePath) {
  const buffer = await readFile(filePath);
  return JSON.parse(buffer);
}
