/* eslint-disable no-console -- needed for logging */
import {
  hasDocs,
  copyBlogPosts,
  copyBabelStandalone,
  copyCommonFiles,
  buildWeb,
  getDefaultVersion,
  readJSON,
  buildAndCopyCoreJS,
  expandVersionsConfig,
  isExists,
} from './helpers.mjs';
import childProcess from 'node:child_process';
import { cp, readdir, readlink, rename, rm, symlink, unlink } from 'node:fs/promises';
import { promisify } from 'node:util';
import { dirname, relative, resolve, join } from 'node:path';

const exec = promisify(childProcess.exec);

const SRC_DIR = 'core-js';
const BUILDS_ROOT_DIR = 'builds';
const BUILD_RESULT_DIR = 'result';
const BUNDLES_DIR = 'bundles';
const REPO = 'https://github.com/zloirock/core-js.git';
const BUILDER_BRANCH = 'master';

const args = process.argv;
const lastArg = args.at(-1);
const BRANCH = lastArg.startsWith('branch=') ? lastArg.slice('branch='.length) : undefined;

const BUILD_ID = new Date().toISOString().replaceAll(/\D/g, '-') + Math.random().toString(36).slice(2, 8);

const BUILD_DIR = `${ BUILDS_ROOT_DIR }/${ BUILD_ID }/`;
const BUILD_SRC_DIR = `${ BUILD_DIR }${ SRC_DIR }/`;
const BUILD_DOCS_DIR = `${ BUILD_DIR }builder/`;
const SITE_FILES_DIR = `${ BUILD_SRC_DIR }/website/dist/`;
const VERSIONS_FILE = `${ BUILD_SRC_DIR }website/config/versions.json`;

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
  await Promise.all([
    exec(`mkdir -p ${ BUILD_DIR }`),
    exec(`mkdir -p ${ BUILD_DOCS_DIR }`),
  ]);
  console.timeEnd(`Created build directory ${ BUILD_DIR }`);
}

async function installDependencies(dir = BUILD_SRC_DIR) {
  console.log('Installing dependencies...');
  console.time('Installed dependencies');
  await exec('npm ci', { cwd: dir });
  console.timeEnd('Installed dependencies');
}

async function cloneRepo() {
  console.log('Cloning core-js repository...');
  console.time('Cloned core-js repository');
  await exec(`git clone ${ REPO } ${ SRC_DIR }`, { cwd: BUILD_DIR });
  console.timeEnd('Cloned core-js repository');
}

async function switchToLatestBuild(link) {
  console.log(`Switching "${ link }" to the latest build...`);
  console.time(`Switched "${ link }" to the latest build`);
  // one rename replaces the old link, which serves until then; no git branch name ends with `.lock`
  const next = `${ link }.lock`;
  await rm(next, { force: true });
  await symlink(resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }`), next);
  await rename(next, link);
  console.timeEnd(`Switched "${ link }" to the latest build`);
}

async function clearBuildDir() {
  console.log(`Clearing build directory "${ BUILD_SRC_DIR }"`);
  console.time(`Cleared build directories ${ BUILD_SRC_DIR } and ${ BUILD_DOCS_DIR }`);
  await Promise.all([
    exec(`rm -rf ${ BUILD_SRC_DIR }`),
    exec(`rm -rf ${ BUILD_DOCS_DIR }`),
  ]);
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
  const toDir = `${ BUILD_DOCS_DIR }${ version.path ?? version.label }/docs/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd(`Copied docs to builder for "${ target }"`);
}

async function copyBuilderDocs() {
  console.log('Copying builder docs...');
  console.time('Copied builder docs');
  await copyDocs(BUILD_DOCS_DIR, `${ BUILD_SRC_DIR }docs/web/`);
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

async function checkoutVersion(version) {
  if (version.branch) {
    await exec(`git checkout origin/${ version.branch }`, { cwd: BUILD_SRC_DIR });
  } else {
    await exec(`git checkout ${ version.tag }`, { cwd: BUILD_SRC_DIR });
  }
}

// the links the runner made in `branches/`; any other entry there is not its own
async function readBranchLinks() {
  if (!await isExists('./branches/')) return [];
  const entries = await readdir('./branches/', { withFileTypes: true });
  return entries.filter(entry => entry.isSymbolicLink()).map(({ name }) => name);
}

async function getExcludedBuilds() {
  const links = (await readBranchLinks()).map(name => `./branches/${ name }`);
  if (await isExists('./latest')) links.push('./latest');
  // a target set by hand may be relative or end with a slash; the build is its first step under `builds/`
  return Promise.all(links.map(async link => {
    return relative(BUILDS_ROOT_DIR, resolve(dirname(link), await readlink(link))).split('/', 1)[0];
  }));
}

async function clearDeletedBranches() {
  console.log('Clearing deleted branches...');
  console.time('Cleared deleted branches');
  const { stdout } = await exec("git for-each-ref --format='%(refname:lstrip=3)' refs/remotes/origin/", { cwd: BUILD_SRC_DIR });
  const liveBranches = new Set(stdout.split('\n'));
  for (const name of await readBranchLinks()) {
    if (!liveBranches.has(name)) {
      await unlink(`./branches/${ name }`);
      console.log(`Branch removed: "${ name }"`);
    }
  }
  console.timeEnd('Cleared deleted branches');
}

async function clearOldBuilds() {
  console.log('Clearing old builds...');
  console.time('Cleared old builds');
  const excluded = await getExcludedBuilds();
  const errors = [];
  for (const build of await readdir(BUILDS_ROOT_DIR)) {
    if (excluded.includes(build)) continue;
    const dir = join('./', BUILDS_ROOT_DIR, '/', build);
    try {
      await exec(`rm -rf ${ dir }`);
      console.log(`Build removed: "${ dir }"`);
    } catch (error) {
      errors.push(error);
    }
  }
  // a build that resists removal must not keep the rest
  if (errors.length) throw new AggregateError(errors, 'Some old builds were not removed');
  console.timeEnd('Cleared old builds');
}

async function createLastDocsLink() {
  console.log('Creating last docs link...');
  console.time('Created last docs link');
  const defaultVersion = await getDefaultVersion(VERSIONS_FILE);
  const absoluteBuildPath = resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }/${ defaultVersion }/docs/`);
  const absoluteLastDocsPath = resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }/docs/`);
  await exec(`ln -s ${ absoluteBuildPath } ${ absoluteLastDocsPath }`);
  console.timeEnd('Created last docs link');
}

async function getVersions(targetBranch) {
  console.log('Getting versions...');
  console.time('Got versions');
  await exec(`git checkout origin/${ targetBranch }`, { cwd: BUILD_SRC_DIR });
  const versions = await readJSON(VERSIONS_FILE);
  console.timeEnd('Got versions');

  return expandVersionsConfig(versions);
}

try {
  console.time('Finished in');
  await createBuildDir();
  await cloneRepo();

  const targetBranch = BRANCH || BUILDER_BRANCH;
  if (!BRANCH) {
    const versions = await getVersions(targetBranch);
    for (const version of versions) {
      if (version.default) continue;
      await copyDocsToBuilder(version);
      await buildAndCopyCoreJS(version, BUILD_SRC_DIR, BUNDLES_DIR, true);
    }
  } else {
    const version = { branch: targetBranch, label: targetBranch };
    await hasDocs(version, BUILD_SRC_DIR);
    await buildAndCopyCoreJS(version, BUILD_SRC_DIR, BUNDLES_DIR, true);
  }

  await prepareBuilder(targetBranch);
  await copyBabelStandalone(BUILD_SRC_DIR);
  await copyBlogPosts(BUILD_SRC_DIR);
  await copyCommonFiles(BUILD_SRC_DIR);
  if (!BRANCH) {
    await copyBuilderDocs();
  }
  await buildWeb(BRANCH, BUILD_SRC_DIR);

  await copyWeb();
  await createLastDocsLink();

  await switchToLatestBuild(BRANCH ? `./branches/${ BRANCH }` : './latest');
  await clearDeletedBranches();
  await clearBuildDir();
  await clearOldBuilds();
  console.timeEnd('Finished in');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
  // takes this build too, unless a link already serves it
  await clearOldBuilds();
}
