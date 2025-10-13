/* eslint-disable no-console -- needed for logging */
import childProcess from 'node:child_process';
import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const exec = promisify(childProcess.exec);
const { access, cp, readdir } = fs;

const BUNDLES_DIR = 'bundles';
const BABEL_PATH = 'website/node_modules/@babel/standalone/babel.min.js';

const BUILD_SRC_DIR = `./`;
const BUILD_WEBSITE_SRC_DIR = `${ BUILD_SRC_DIR }/website`;

async function isExists(target) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function buildWeb(branch) {
  console.log('Building web');
  console.time('Built web');
  let command = `npm run build-web branch=${ branch } local`;
  const stdout = await exec(command, { cwd: BUILD_SRC_DIR });
  console.timeEnd('Built web');
  return stdout;
}

async function installDependencies(dir = BUILD_SRC_DIR) {
  console.log('Installing dependencies...');
  console.time('Installed dependencies');
  await exec('npm ci', { cwd: dir });
  console.timeEnd('Installed dependencies');
}

async function hasDocs(version) {
  const target = version.branch ? `origin/${ version.branch }` : version.tag;
  console.log(`Checking if docs exist in "${ target }"...`);
  try {
    await exec(`git ls-tree -r --name-only ${ target } | grep "docs/web/docs/"`, { cwd: BUILD_SRC_DIR });
  } catch {
    throw new Error(`Docs not found in "${ target }".`);
  }
}

async function buildAndCopyCoreJS(version) {
  const target = version.branch ?? version.tag;
  const name = version.path ?? version.label;
  console.log(`Building and copying core-js for ${ target }`);
  const targetBundlePath = `${ BUNDLES_DIR }/${ target }/`;

  if (await isExists(targetBundlePath)) {
    console.time('Core JS bundles copied');
    const bundlePath = `${ targetBundlePath }core-js-bundle.js`;
    const destBundlePath = `${ BUILD_SRC_DIR }website/src/public/bundles/${ name }/core-js-bundle.js`;
    const esmodulesBundlePath = `${ targetBundlePath }core-js-bundle-esmodules.js`;
    const esmodulesDestBundlePath = `${ BUILD_SRC_DIR }website/src/public/bundles/${ name }/core-js-bundle-esmodules.js`;
    await cp(bundlePath, destBundlePath);
    await cp(esmodulesBundlePath, esmodulesDestBundlePath);
    console.timeEnd('Core JS bundles copied');
    return;
  }

  console.time('Core JS bundles built');
  await installDependencies();
  await exec('npm run bundle-package', { cwd: BUILD_SRC_DIR });
  const bundlePath = `${ BUILD_SRC_DIR }packages/core-js-bundle/minified.js`;
  const destPath = `${ BUILD_SRC_DIR }website/src/public/bundles/${ name }/core-js-bundle.js`;
  const destBundlePath = `${ targetBundlePath }core-js-bundle.js`;
  await cp(bundlePath, destPath);
  await cp(bundlePath, destBundlePath);

  await exec('npm run bundle-package esmodules', { cwd: BUILD_SRC_DIR });
  const esmodulesBundlePath = `${ BUILD_SRC_DIR }packages/core-js-bundle/minified.js`;
  const esmodulesDestBundlePath = `${ BUILD_SRC_DIR }website/src/public/bundles/${ name }/core-js-bundle-esmodules.js`;
  const destEsmodulesBundlePath = `${ targetBundlePath }core-js-bundle-esmodules.js`;
  await cp(esmodulesBundlePath, esmodulesDestBundlePath);
  await cp(esmodulesBundlePath, destEsmodulesBundlePath);
  console.timeEnd('Core JS bundles built');
}

async function copyBabelStandalone() {
  console.log('Copying Babel standalone');
  await installDependencies(BUILD_WEBSITE_SRC_DIR);
  console.time('Copied Babel standalone');
  const babelPath = `${ BUILD_SRC_DIR }${ BABEL_PATH }`;
  const destPath = `${ BUILD_SRC_DIR }website/src/public/babel.min.js`;
  await cp(babelPath, destPath);
  console.timeEnd('Copied Babel standalone');
}

async function copyBlogPosts() {
  console.log('Copying blog posts...');
  console.time('Copied blog posts');
  const fromDir = `${ BUILD_SRC_DIR }docs/`;
  const toDir = `${ BUILD_SRC_DIR }docs/web/blog/`;
  const entries = await readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const srcFile = path.join(fromDir, entry.name);
      const destFile = path.join(toDir, entry.name);
      await cp(srcFile, destFile);
    }
  }
  console.timeEnd('Copied blog posts');
}

async function copyCommonFiles() {
  console.log('Copying common files...');
  console.time('Copied common files');
  const fromDir = `${ BUILD_SRC_DIR }`;
  const toDir = `${ BUILD_SRC_DIR }docs/web/`;
  await cp(`${ fromDir }CHANGELOG.md`, `${ toDir }changelog.md`);
  await cp(`${ fromDir }CONTRIBUTING.md`, `${ toDir }contributing.md`);
  await cp(`${ fromDir }SECURITY.md`, `${ toDir }security.md`);
  console.timeEnd('Copied common files');
}

async function getCurrentBranch() {
  const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', { cwd: BUILD_SRC_DIR });
  return stdout.trim();
}

try {
  console.time('Finished in');
  const targetBranch = await getCurrentBranch();

  const version = { branch: targetBranch, label: targetBranch };
  await hasDocs(version);
  await buildAndCopyCoreJS(version);

  await copyBabelStandalone();
  await copyBlogPosts();
  await copyCommonFiles();
  await buildWeb(targetBranch);
  console.timeEnd('Finished in');
} catch (error) {
  console.error(error);
}
