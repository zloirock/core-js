/* eslint-disable no-console -- needed for logging */
import {
  hasDocs, copyBlogPosts, copyBabelStandalone, copyCommonFiles, buildWeb, getDefaultVersion, readJSON, buildAndCopyCoreJS,
} from './helpers.mjs';
import childProcess from 'node:child_process';
import { cp, readdir, readlink } from 'node:fs/promises';
import { promisify } from 'node:util';
import { resolve, join } from 'node:path';

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
  await exec(`mkdir -p ${ BUILD_DIR }`);
  await exec(`mkdir -p ${ BUILD_DOCS_DIR }`);
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

async function switchToLatestBuild() {
  console.log('Switching to the latest build...');
  console.time('Switched to the latest build');
  const absoluteBuildPath = resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }`);
  const absoluteLatestPath = resolve('./latest');
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
  const toDir = `${ BUILD_DOCS_DIR }${ version.path ?? version.label }/docs/`;
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

async function switchBranchToLatestBuild(name) {
  console.log(`Switching branch "${ name }" to the latest build...`);
  console.time(`Switched branch "${ name }" to the latest build`);
  const absoluteBuildPath = resolve(`${ BUILD_DIR }${ BUILD_RESULT_DIR }`);
  const absoluteLatestPath = resolve(`./branches/${ name }`);
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

async function getExcludedBuilds() {
  const branchBuilds = await readdir('./branches/');
  const excluded = new Set();
  for (const name of branchBuilds) {
    const link = await readlink(`./branches/${ name }`);
    if (!link) continue;
    const parts = link.split('/');
    const id = parts.at(-2);
    excluded.add(id);
  }
  const latestBuildLink = await readlink('./latest');
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
      await exec(`rm -rf ${ join('./', BUILDS_ROOT_DIR, '/', build) }`);
      console.log(`Build removed: "${ join('./', BUILDS_ROOT_DIR, '/', build) }"`);
    }
  }
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

  return versions;
}

try {
  console.time('Finished in');
  await createBuildDir();
  await cloneRepo();

  const targetBranch = BRANCH || BUILDER_BRANCH;
  if (!BRANCH) {
    const versions = await getVersions(targetBranch);
    for (const version of versions) {
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

  if (!BRANCH) {
    await switchToLatestBuild();
  } else {
    await switchBranchToLatestBuild(targetBranch);
  }
  await clearBuildDir();
  await clearOldBuilds();
  console.timeEnd('Finished in');
} catch (error) {
  console.error(error);
}
