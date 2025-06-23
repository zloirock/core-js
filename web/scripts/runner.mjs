import child_process from 'node:child_process';
import fs from 'fs/promises';
import { promisify } from 'node:util';
import path from 'path';

const exec = promisify(child_process.exec);
const { cp } = fs;

const srcDir = 'core-js';
const buildsRootDir = 'builds';
const buildResultDir = 'result';
const repo = 'https://github.com/zloirock/core-js.git';
const builderBranch = 'web';

const args = process.argv;
const lastArg = args[args.length - 1];
const branch = lastArg.startsWith('branch=') ? lastArg.slice('branch='.length) : undefined;

const buildId = new Date().toISOString().replace(/[^0-9]/g, '-') + Math.random().toString(36).substring(2, 8);

const buildDir = `${buildsRootDir}/${buildId}/`;
const buildSrcDir = `${buildDir}${srcDir}/`;
const builderDocsDir = `${buildDir}builder/`;
const siteFilesDir = `${buildDir}${srcDir}/web/dist/`;

async function getBranchesWithSiteDocs() {
  console.log('Getting branches with site docs...');
  console.time(`Got branches with site docs"`);
  const remoteBranchesString = await exec(
    `git branch --remote --format="%(refname:short)" | while read branch; do if git ls-tree -r --name-only "$branch" | `
    + `grep -qxF "web/scripts/build.mjs"; then echo "$branch"; fi; done`,
    { cwd: buildSrcDir }
  );
  const branches = remoteBranchesString['stdout'].split('\n').filter(branch => branch !== '').map(branch => branch.replace('origin/', ''));
  console.timeEnd(`Got branches with site docs"`);
  return branches;
}

async function getTagsWithSiteDocs() {
  console.log('Getting tags with site docs...');
  console.time(`Got tags with site docs"`);
  // const tagsString = await exec(
  //   `git tag --list | sort -V | while read t; do v=\${t#v}; IFS=. read -r M m p <<< "$v"; m=\${m:-0}; `
  //   + `if { [ "$M" -gt 3 ] || { [ "$M" -eq 3 ] && [ "$m" -gt 40 ]; }; }; `
  //   + `then git ls-tree -r --name-only "$t" | grep --qxF "web/scripts/build.mjs" && echo "$t"; fi; done`,
  //   { cwd: buildSrcDir }
  // );
  const tagsString = await exec(
    `git branch --remote --format="%(refname:short)" | while read branch; do if git ls-tree -r --name-only "$branch" | `
    + `grep -q "docs/web/docs/"; then echo "$branch"; fi; done`,
    { cwd: buildSrcDir }
  );
  const tags = tagsString['stdout'].split('\n').filter(tag => tag !== '' && tag !== `origin/${builderBranch}`)
    .map(branch => branch.replace('origin/', ''));
  console.timeEnd(`Got tags with site docs"`);
  console.log(`Found tags with site docs: ${tags.join(', ')}`);
  return tags;
}

async function buildWeb(branch) {
  console.log(`Building web for branch "${branch}"`);
  console.time(`Built web for branch "${branch}"`);
  const stdout = await exec(`npm run build-web -- branch=${branch}`, { cwd: buildSrcDir });
  console.timeEnd(`Built web for branch "${branch}"`);
  return stdout;
}

async function copyWeb() {
  console.log(`Copying web...`);
  console.time(`Copied web`);
  const toDir = `${buildDir}${buildResultDir}/`;
  await cp(siteFilesDir, toDir, { recursive: true }, err => { if (err) throw err; });
  console.timeEnd(`Copied web`);
}

async function createBuildDir() {
  console.log(`Creating build directory "${buildDir}"`);
  console.time(`Created build directory ${buildDir}`);
  await exec(`mkdir -p ${buildDir}`);
  await exec(`mkdir -p ${builderDocsDir}`);
  console.timeEnd(`Created build directory ${buildDir}`);
}

async function installDependencies() {
  console.log(`Installing dependencies...`);
  console.time(`Installed dependencies`);
  await exec(`npm ci`, { cwd: buildSrcDir });
  await exec(`npm ci`, { cwd: buildSrcDir + 'web/' });
  console.timeEnd(`Installed dependencies`);
}

async function cloneRepo() {
  console.log(`Cloning core-js repository...`);
  console.time(`Cloned core-js repository`);
  await exec(`git clone ${repo} ${srcDir}`, { cwd: buildDir });
  console.timeEnd(`Cloned core-js repository`);
}

async function switchToLatestBuild() {
  console.log('Switching to the latest build...');
  console.time('Switched to the latest build');
  const absoluteBuildPath = path.resolve(`${buildDir}${buildResultDir}`);
  const absoluteLatestPath = path.resolve('./latest');
  console.log(absoluteBuildPath, absoluteLatestPath);
  await exec(`rm -f ./latest`);
  await exec(`ln -sf ${absoluteBuildPath} ${absoluteLatestPath}`);
  console.timeEnd('Switched to the latest build');
}

async function clearBuildDir() {
  console.log(`Clearing build directory "${buildSrcDir}"`);
  console.time(`Cleared build directory ${buildSrcDir}`);
  await exec(`rm -rf ${buildSrcDir}`);
  console.timeEnd(`Cleared build directory ${buildSrcDir}`);
}

async function copyDocs(srcDir, destDir) {
  console.log(`Copying docs from "${srcDir}" to "${destDir}"`);
  console.time(`Copied docs from "${srcDir}" to "${destDir}"`);
  await cp(srcDir, destDir, { recursive: true }, err => { if (err) throw err; });
  console.timeEnd(`Copied docs from "${srcDir}" to "${destDir}"`);
}

async function copyDocsToBuilder(name) {
  console.log(`Copying docs to builder for branch/tag "${name}"`);
  console.time(`Copied docs to builder for branch/tag "${name}"`);
  await exec(`git checkout origin/${name}`, { cwd: buildSrcDir });
  // await exec(`git checkout ${name}`, { cwd: buildSrcDir });
  const fromDir = `${buildSrcDir}docs/web/docs/`;
  const toDir = `${builderDocsDir}${name}/docs/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd(`Copied docs to builder for branch/tag "${name}"`);
}

async function copyBuilderDocs() {
  console.log('Copying builder docs...');
  console.time('Copied builder docs');
  const fromDir = `${builderDocsDir}`;
  const toDir = `${buildSrcDir}docs/web/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd('Copied builder docs');
}

async function prepareBuilder(branch) {
  console.log('Preparing builder...');
  console.time('Prepared builder');
  await exec(`git checkout origin/${branch}`, { cwd: buildSrcDir });
  await installDependencies();
  console.timeEnd('Prepared builder');
}

async function hasDocsInBranch(branch) {
  console.log(`Checking if docs exist in the branch "${branch}"...`);
  const hasDocs = await exec(`git ls-tree -r --name-only origin/${branch} | grep "docs/web/docs/"`, { cwd: buildSrcDir })
    .then(() => true)
    .catch(() => false);
  if (!hasDocs) {
    console.log(`No docs found in the branch "${branch}".`);
    process.exit();
  }
}

async function switchBranchToLatestBuild(branch) {
  console.log(`Switching branch "${branch}" to the latest build...`);
  console.time(`Switched branch "${branch}" to the latest build`);
  const absoluteBuildPath = path.resolve(`${buildDir}${buildResultDir}`);
  const absoluteLatestPath = path.resolve(`./branches/${branch}`);
  await exec(`rm -f ./branches/${branch}`);
  await exec(`ln -sf ${absoluteBuildPath} ${absoluteLatestPath}`);
  console.timeEnd(`Switched branch "${branch}" to the latest build`);
}

async function run() {
  console.time('Finished in');
  await createBuildDir();
  await cloneRepo();

  const targetBranch = branch || builderBranch;
  if (!branch) {
    const tags = await getTagsWithSiteDocs();
    if (tags.length) {
      for (const tag of tags) {
        await copyDocsToBuilder(tag);
      }
    }
  } else {
    await hasDocsInBranch(targetBranch);
  }

  await prepareBuilder(targetBranch);
  if (!branch) {
    await copyBuilderDocs();
  }
  await buildWeb(targetBranch);

  await copyWeb();

  if (!branch) {
    await switchToLatestBuild();
  } else {
    await switchBranchToLatestBuild(targetBranch);
  }
  await clearBuildDir();
  console.timeEnd('Finished in');
}

await run().catch(console.error);
