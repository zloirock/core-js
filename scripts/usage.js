'use strict';
/* eslint-disable no-console -- output */
const os = require('os');
const { cyan, green, gray, red } = require('chalk');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const { argv } = process;

async function getTopK(i) {
  const res = await fetch(`https://stuffgate.com/stuff/website/top-${ i }000-sites`);
  const html = await res.text();
  const [, table] = html.match(/Analyze<\/th><\/tr><\/thead><tbody><tr>([\s\S]+)<\/tr><\/tbody><\/table><\/div>/);
  return Array.from(table.matchAll(/<a href=['"]([^'"]+)['"] target='_blank'>/g), ([, href]) => href);
}

(async () => {
  const browser = await puppeteer.launch({ timeout: 9e4 });
  const CPUS = os.cpus().length;
  const sites = [];
  let limit = 100;
  let index = 0;
  let tested = 0;
  let withCoreJS = 0;

  for (const arg of argv) {
    if (arg.startsWith('-l=')) limit = +arg.slice(3);
  }

  for (let i = 1, top = Math.ceil(limit / 1000); i <= top; i++) {
    sites.push(...await getTopK(i));
  }

  await Promise.all(new Array(CPUS).fill().map(async () => {
    const page = await browser.newPage();
    while (index < limit) {
      const site = sites[index++];
      const name = site.replace(/^(http(?:s):\/\/)/, '');
      try {
        await page.goto(site);

        const { core, vm, vl } = await page.evaluate(`({
          core: !!window['__core-js_shared__'] || !!window.core,
          vm: window['__core-js_shared__']?.versions,
          vl: window.core?.version,
        })`);
        const versions = vm ? vm.map(({ version, mode }) => `${ version } (${ mode } mode)`) : vl ? [vl] : [];
        tested++;
        if (core) withCoreJS++;

        console.log(`${ cyan(`${ name }:`) } ${ core
          ? green(`\`core-js\` is detected, ${ versions.length > 1
              ? `${ cyan(versions.length) } versions: ${ cyan(versions.join(', ')) }`
              : `version ${ cyan(versions[0]) }` }`)
          : gray('`core-js` is not detected') }`);
      } catch {
        console.log(`${ cyan(`${ name }:`) } ${ red('problems with access') }`);
      }
    }
  }));

  const percent = (withCoreJS / tested * 100).toFixed(2);

  console.log(green(`\n\`core-js\` is detected on ${ cyan(withCoreJS) } from ${ cyan(tested) } tested websites, ${
    cyan(`${ percent }%`) }, problems with access to ${ cyan(limit - tested) } websites`));

  await browser.close();
})();
