import child_process from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import path from 'path';

const exec = promisify(child_process.exec);
const { cp } = fs;

const srcDir = 'core-js';
const buildsRootDir = 'builds';
const buildResultDir = 'branches';
const repo = 'https://github.com/zloirock/core-js.git';

const buildId = new Date().toISOString().replace(/[^0-9]/g, '-') + Math.random().toString(36).substring(2, 8);

const buildDir = `${buildsRootDir}/${buildId}/`;
const buildSrcDir = `${buildDir}${srcDir}/`;
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
  const tagsString = await exec(
    `git tag --list | sort -V | while read t; do v=\${t#v}; IFS=. read -r M m p <<< "$v"; m=\${m:-0}; `
    + `if { [ "$M" -gt 3 ] || { [ "$M" -eq 3 ] && [ "$m" -gt 40 ]; }; }; `
    + `then git ls-tree -r --name-only "$t" | grep --qxF "web/scripts/build.mjs" && echo "$t"; fi; done`,
    { cwd: buildSrcDir }
  );
  const tags = tagsString['stdout'].split('\n').filter(tag => tag !== '');
  console.timeEnd(`Got tags with site docs"`);
  return tags;
}

async function buildWeb(branch) {
  console.log(`Building web for branch "${branch}"`);
  console.time(`Built web for branch "${branch}"`);
  const stdout = await exec(`npm run build-web -- branch=${branch}`, { cwd: buildSrcDir });
  console.timeEnd(`Built web for branch "${branch}"`);
  return stdout;
}

async function copyWeb(branch) {
  console.log(`Copying web for branch "${branch}"`);
  console.time(`Copied web for branch "${branch}"`);
  const toDir = `${buildDir}${buildResultDir}/${branch}/`;
  await cp(siteFilesDir, toDir, { recursive: true }, err => { if (err) throw err; });
  console.timeEnd(`Copied web for branch "${branch}"`);
}

async function createBuildDir() {
  console.log(`Creating build directory "${buildDir}"`);
  console.time(`Created build directory ${buildDir}`);
  await exec(`mkdir -p ${buildDir}`);
  console.timeEnd(`Created build directory ${buildDir}`);
}

async function installDependencies(branch) {
  console.log(`Installing dependencies...`);
  console.time(`Installed dependencies`);
  await exec(`git checkout ${branch}`, { cwd: buildSrcDir });
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

async function run() {
  console.time('Finished in');
  await createBuildDir();
  await cloneRepo();
  const branches = await getBranchesWithSiteDocs(buildSrcDir);
  if (!branches.length) {
    console.log('No branches with Web Builder found.');
    process.exit();
  }

  for (const branch of branches) {
    await installDependencies(branch);
    await buildWeb(branch);
    await copyWeb(branch, buildDir, buildResultDir, siteFilesDir);
  }

  await switchToLatestBuild();
  await clearBuildDir();
  console.timeEnd('Finished in');
}

await run().catch(console.error);
