/* eslint-disable no-console -- needed for logging */
import childProcess from 'node:child_process';
import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const exec = promisify(childProcess.exec);
const { cp, readdir, access } = fs;

const SRC_DIR = 'core-js';
const BUILDS_ROOT_DIR = 'builds';
const BUILD_RESULT_DIR = 'result';
const BUNDLES_DIR = 'bundles';
const REPO = 'https://github.com/zloirock/core-js.git';
const BUILDER_BRANCH = 'web-3';

const args = process.argv;
const lastArg = args.at(-1);
const BRANCH = lastArg.startsWith('branch=') ? lastArg.slice('branch='.length) : undefined;

const BUILD_ID = new Date().toISOString().replaceAll(/\D/g, '-') + Math.random().toString(36).slice(2, 8);

const BUILD_DIR = `${ BUILDS_ROOT_DIR }/${ BUILD_ID }/`;
const BUILD_SRC_DIR = `${ BUILD_DIR }${ SRC_DIR }/`;
const BUILD_DOCS_DIR = `${ BUILD_DIR }builder/`;
const SITE_FILES_DIR = `${ BUILD_SRC_DIR }/website/dist/`;
const VERSIONS_FILE = `${ BUILD_SRC_DIR }website/config/versions.json`;

async function getDefaultVersion() {
  const versions = await readJSON(VERSIONS_FILE);
  return versions.find(v => v.default)?.label;
}

async function isExists(target) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// async function getTagsWithSiteDocs() {
//   console.log('Getting tags with site docs...');
//   console.time('Got tags with site docs');
//   // const tagsString = await exec(
//   //   `git tag --list | sort -V | while read t; do v=\${t#v}; IFS=. read -r M m p <<< "$v"; m=\${m:-0}; `
//   //   + `if { [ "$M" -gt 3 ] || { [ "$M" -eq 3 ] && [ "$m" -gt 40 ]; }; }; `
//   //   + `then git ls-tree -r --name-only "$t" | grep --qxF "website/scripts/build.mjs" && echo "$t"; fi; done`,
//   //   { cwd: BUILD_SRC_DIR }
//   // );
//   const tagsString = await exec(
//     'git branch --remote --format="%(refname:short)" | while read branch; do if git ls-tree -r --name-only "$branch" | '
//     + 'grep -q "docs/web/docs/"; then echo "$branch"; fi; done',
//     { cwd: BUILD_SRC_DIR },
//   );
//   const tags = tagsString.stdout.split('\n').filter(tag => tag !== '')
//     .map(name => name.replace('origin/', ''));
//   console.timeEnd('Got tags with site docs');
//   console.log(`Found tags with site docs: ${ tags.join(', ') }`);
//   return tags;
// }

async function buildWeb() {
  console.log('Building web');
  console.time('Built web');
  let command = 'npm run build-web';
  if (BRANCH) command += ` branch=${ BRANCH }`;
  const stdout = await exec(command, { cwd: BUILD_SRC_DIR });
  console.timeEnd('Built web');
  return stdout;
}

async function copyWeb() {
  console.log('Copying web...');
  console.time('Copied web');
  const toDir = `${ BUILD_DIR }${ BUILD_RESULT_DIR }/`;
  await cp(SITE_FILES_DIR, toDir, { recursive: true });
  console.timeEnd('Copied web');
}

async function createBuildDir() {
  console.log(`Creating build directory "${ BUILD_DIR }"`);
  console.time(`Created build directory ${ BUILD_DIR }`);
  await exec(`mkdir -p ${ BUILD_DIR }`);
  await exec(`mkdir -p ${ BUILD_DOCS_DIR }`);
  console.timeEnd(`Created build directory ${ BUILD_DIR }`);
}

async function installDependencies() {
  console.log('Installing dependencies...');
  console.time('Installed dependencies');
  await exec('npm ci', { cwd: BUILD_SRC_DIR });
  console.timeEnd('Installed dependencies');
}

async function cloneRepo() {
  console.log('Cloning core-js repository...');
  console.time('Cloned core-js repository');
  await exec(`git clone ${ REPO } ${ SRC_DIR }`, { cwd: BUILD_DIR });
  console.timeEnd('Cloned core-js repository');
}

async function switchToLatestBuild() {
  console.log('Switching to the latest build...');
  console.time('Switched to the latest build');
  const absoluteBuildPath = path.resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }`);
  const absoluteLatestPath = path.resolve('./latest');
  console.log(absoluteBuildPath, absoluteLatestPath);
  await exec('rm -f ./latest');
  await exec(`ln -sf ${ absoluteBuildPath } ${ absoluteLatestPath }`);
  console.timeEnd('Switched to the latest build');
}

async function clearBuildDir() {
  console.log(`Clearing build directory "${ BUILD_SRC_DIR }"`);
  console.time(`Cleared build directories ${ BUILD_SRC_DIR } and ${ BUILD_DOCS_DIR }`);
  await exec(`rm -rf ${ BUILD_SRC_DIR }`);
  await exec(`rm -rf ${ BUILD_DOCS_DIR }`);
  console.timeEnd(`Cleared build directories ${ BUILD_SRC_DIR } and ${ BUILD_DOCS_DIR }`);
}

async function copyDocs(from, to, recursive = true) {
  console.log(`Copying docs from "${ from }" to "${ to }"`);
  console.time(`Copied docs from "${ from }" to "${ to }"`);
  await cp(from, to, { recursive });
  console.timeEnd(`Copied docs from "${ from }" to "${ to }"`);
}

async function copyDocsToBuilder(version) {
  const target = version.branch ?? version.tag;
  console.log(`Copying docs to builder for "${ target }"`);
  console.time(`Copied docs to builder for "${ target }"`);
  await checkoutVersion(version);
  const fromDir = `${ BUILD_SRC_DIR }docs/web/docs/`;
  const toDir = `${ BUILD_DOCS_DIR }${ version.label }/docs/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd(`Copied docs to builder for "${ target }"`);
}

async function copyBuilderDocs() {
  console.log('Copying builder docs...');
  console.time('Copied builder docs');
  const fromDir = `${ BUILD_DOCS_DIR }`;
  const toDir = `${ BUILD_SRC_DIR }docs/web/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd('Copied builder docs');
}

async function prepareBuilder(targetBranch) {
  console.log('Preparing builder...');
  console.time('Prepared builder');
  await exec(`git checkout origin/${ targetBranch }`, { cwd: BUILD_SRC_DIR });
  await installDependencies();
  if (!BRANCH) await exec(`rm -rf ${ BUILD_SRC_DIR }docs/web/docs/`);
  console.timeEnd('Prepared builder');
}

async function hasDocs(version) {
  const target = version.branch ? `origin/${ version.branch }` : version.tag;
  console.log(`Checking if docs exist in "${ target }"...`);
  try {
    await exec(`git ls-tree -r --name-only ${ target } | grep "docs/web/docs/"`, { cwd: BUILD_SRC_DIR });
  } catch {
    throw new Error(`No docs found in "${ target }".`);
  }
}

async function switchBranchToLatestBuild(name) {
  console.log(`Switching branch "${ name }" to the latest build...`);
  console.time(`Switched branch "${ name }" to the latest build`);
  const absoluteBuildPath = path.resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }`);
  const absoluteLatestPath = path.resolve(`./branches/${ name }`);
  await exec(`rm -f ./branches/${ name }`);
  await exec(`ln -sf ${ absoluteBuildPath } ${ absoluteLatestPath }`);
  console.timeEnd(`Switched branch "${ name }" to the latest build`);
}

async function checkoutVersion(version) {
  if (version.branch) {
    await exec(`git checkout origin/${ version.branch }`, { cwd: BUILD_SRC_DIR });
  } else {
    await exec(`git checkout ${ version.tag }`, { cwd: BUILD_SRC_DIR });
  }
}

async function buildAndCopyCoreJS(version) {
  const target = version.branch ?? version.tag;
  const name = version.label;
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
  await checkoutVersion(version);
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

async function getExcludedBuilds() {
  const branchBuilds = await readdir('./branches/');
  const excluded = new Set();
  for (const name of branchBuilds) {
    const link = await fs.readlink(`./branches/${ name }`);
    if (!link) continue;
    const parts = link.split('/');
    const id = parts.at(-2);
    excluded.add(id);
  }
  const latestBuildLink = await fs.readlink('./latest');
  if (latestBuildLink) {
    const parts = latestBuildLink.split('/');
    const id = parts.at(-2);
    excluded.add(id);
  }

  return Array.from(excluded);
}

async function clearOldBuilds() {
  console.log('Clearing old builds...');
  console.time('Cleared old builds');
  const excluded = await getExcludedBuilds();
  const builds = await readdir(BUILDS_ROOT_DIR);
  for (const build of builds) {
    if (!excluded.includes(build)) {
      await exec(`rm -rf ${ path.join('./', BUILDS_ROOT_DIR, '/', build) }`);
      console.log(`Build removed: "${ path.join('./', BUILDS_ROOT_DIR, '/', build) }"`);
    }
  }
  console.timeEnd('Cleared old builds');
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
      await fs.copyFile(srcFile, destFile);
    }
  }
  console.timeEnd('Copied blog posts');
}

async function copyCommonFiles() {
  console.log('Copying common files...');
  console.time('Copied common files');
  const fromDir = `${ BUILD_SRC_DIR }`;
  const toDir = `${ BUILD_SRC_DIR }docs/web/`;
  await fs.copyFile(`${ fromDir }CHANGELOG.md`, `${ toDir }changelog.md`);
  await fs.copyFile(`${ fromDir }CONTRIBUTING.md`, `${ toDir }contributing.md`);
  await fs.copyFile(`${ fromDir }SECURITY.md`, `${ toDir }security.md`);
  console.timeEnd('Copied common files');
}

async function createLastDocsLink() {
  console.log('Creating last docs link...');
  console.time('Created last docs link');
  const defaultVersion = await getDefaultVersion();
  const absoluteBuildPath = path.resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }/${ defaultVersion }/docs/`);
  const absoluteLastDocsPath = path.resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }/docs/`);
  await exec(`ln -s ${ absoluteBuildPath } ${ absoluteLastDocsPath }`);
  console.timeEnd('Created last docs link');
}

async function readFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content.toString();
}

async function readJSON(filePath) {
  const json = await readFile(filePath);
  try {
    return JSON.parse(json);
  } catch {
    return '';
  }
}

async function getVersions(targetBranch) {
  console.log('Getting versions...');
  console.time('Got versions');
  await exec(`git checkout origin/${ targetBranch }`, { cwd: BUILD_SRC_DIR });
  const versions = await readJSON(VERSIONS_FILE);
  console.timeEnd('Got versions');

  return versions;
}

async function run() {
  console.time('Finished in');
  await createBuildDir();
  await cloneRepo();

  const targetBranch = BRANCH || BUILDER_BRANCH;
  if (!BRANCH) {
    const versions = await getVersions(targetBranch);
    for (const version of versions) {
      await copyDocsToBuilder(version);
      await buildAndCopyCoreJS(version);
    }
  } else {
    const version = { branch: targetBranch };
    await hasDocs(version);
    await buildAndCopyCoreJS(version);
  }

  await prepareBuilder(targetBranch);
  await copyBlogPosts();
  await copyCommonFiles();
  if (!BRANCH) {
    await copyBuilderDocs();
  }
  await buildWeb();

  await copyWeb();
  await createLastDocsLink();

  if (!BRANCH) {
    await switchToLatestBuild();
  } else {
    await switchBranchToLatestBuild(targetBranch);
  }
  await clearBuildDir();
  await clearOldBuilds();
  console.timeEnd('Finished in');
}

await run().catch(console.error);
