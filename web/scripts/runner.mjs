import child_process from 'node:child_process';
import fs from 'fs/promises';
import { promisify } from 'node:util';
import path from 'path';

const exec = promisify(child_process.exec);
const { cp, readdir } = fs;

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
  const tags = tagsString['stdout'].split('\n').filter(tag => tag !== '')
    .map(branch => branch.replace('origin/', ''));
  console.timeEnd(`Got tags with site docs"`);
  console.log(`Found tags with site docs: ${tags.join(', ')}`);
  return tags;
}

async function buildWeb() {
  console.log(`Building web`);
  console.time(`Built web`);
  let command = 'npm run build-web';
  if (branch) command += ` branch=${branch}`;
  const stdout = await exec(command, { cwd: buildSrcDir });
  console.timeEnd(`Built web`);
  return stdout;
}

async function copyWeb() {
  console.log(`Copying web...`);
  console.time(`Copied web`);
  const toDir = `${buildDir}${buildResultDir}/`;
  await cp(siteFilesDir, toDir, { recursive: true });
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
  console.time(`Cleared build directories ${buildSrcDir} and ${builderDocsDir}`);
  await exec(`rm -rf ${buildSrcDir}`);
  await exec(`rm -rf ${builderDocsDir}`);
  console.timeEnd(`Cleared build directories ${buildSrcDir} and ${builderDocsDir}`);
}

async function copyDocs(srcDir, destDir, recursive = true) {
  console.log(`Copying docs from "${srcDir}" to "${destDir}"`);
  console.time(`Copied docs from "${srcDir}" to "${destDir}"`);
  await cp(srcDir, destDir, { recursive: recursive });
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

async function prepareBuilder(targetBranch) {
  console.log('Preparing builder...');
  console.time('Prepared builder');
  await exec(`git checkout origin/${targetBranch}`, { cwd: buildSrcDir });
  await installDependencies();
  if (!branch) await exec(`rm -rf ${buildSrcDir}docs/web/docs/`);
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

async function buildAndCopyCoreJS() {
  console.log(`Building and copying core-js...`);
  console.time('Core JS bundle built');
  await exec(`npm run bundle-package`, { cwd: buildSrcDir });
  const bundlePath = `${buildSrcDir}packages/core-js-bundle/minified.js`
  const destPath = `${buildSrcDir}web/src/public/core-js-bundle.js`;
  await cp(bundlePath, destPath, { });
  console.timeEnd(`Core JS bundle built`);
}

async function getExcludedBuilds() {
  const branchBuilds = await readdir('./branches/');
  const excluded = new Set();
  for (const branch of branchBuilds) {
    const link = await fs.readlink(`./branches/${branch}`);
    if (!link) continue;
    const parts = link.split('/');
    const buildId = parts[parts.length - 2];
    excluded.add(buildId);
  }
  const latestBuildLink = await fs.readlink(`./latest`);
  if (latestBuildLink) {
    const parts = latestBuildLink.split('/');
    const buildId = parts[parts.length - 2];
    excluded.add(buildId);
  }

  return Array.from(excluded);
}

async function clearOldBuilds() {
  console.log(`Clearing old builds...`);
  console.time(`Cleared old builds`);
  const excluded = await getExcludedBuilds();
  const builds = await readdir(buildsRootDir);
  for (const build of builds) {
    if (!excluded.includes(build)) {
      await exec(`rm -rf ${path.join('./', buildsRootDir, '/', build)}`);
      console.log(`Build removed: "${path.join('./', buildsRootDir, '/', build)}"`);
    }
  }
  console.timeEnd(`Cleared old builds`);
}

async function copyBlogPosts() {
  console.log(`Copying blog posts...`);
  console.time(`Copied blog posts`);
  const fromDir = `${buildSrcDir}docs/`;
  const toDir = `${buildSrcDir}docs/web/blog/`;
  const entries = await readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const srcFile = path.join(fromDir, entry.name);
      const destFile = path.join(toDir, entry.name);
      await fs.copyFile(srcFile, destFile);
    }
  }
  console.timeEnd(`Copied blog posts`);
}

async function copyCommonFiles() {
  console.log(`Copying common files...`);
  console.time(`Copied common files`);
  const fromDir = `${buildSrcDir}`;
  const toDir = `${buildSrcDir}docs/web/`;
  await fs.copyFile(`${fromDir}CHANGELOG.md`, `${toDir}changelog.md`);
  await fs.copyFile(`${fromDir}CONTRIBUTING.md`, `${toDir}contributing.md`);
  await fs.copyFile(`${fromDir}SECURITY.md`, `${toDir}security.md`);
  console.timeEnd(`Copied common files`);
}

async function copyStickyBits() {
  console.log(`Copying stickybits...`);
  console.time(`Copied stickybits`);
  const fromDir = `${buildSrcDir}web/node_modules/stickybits/dist/stickybits.min.js`;
  const toDir = `${buildSrcDir}web/src/public/stickybits.min.js`;
  await cp(fromDir, toDir, { recursive: true });
  console.timeEnd(`Copied stickybits`);
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
  await buildAndCopyCoreJS();
  await copyStickyBits();
  await copyBlogPosts();
  await copyCommonFiles();
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
  await clearOldBuilds();
  console.timeEnd('Finished in');
}

await run().catch(console.error);
