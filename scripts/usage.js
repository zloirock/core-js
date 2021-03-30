'use strict';
/* eslint-disable no-console -- output */
const os = require('os');
const { cyan, green, gray, red } = require('chalk');
const puppeteer = require('puppeteer');
const sites = require('./sites');
const { argv } = process;

(async () => {
  const browser = await puppeteer.launch({ timeout: 9e4 });
  const CPUS = os.cpus().length;
  let limit = sites.length;
  let index = 0;
  let tested = 0;
  let withCoreJS = 0;

  for (const arg of argv) {
    if (arg.startsWith('-l=')) limit = +arg.slice(3);
  }

  await Promise.all(new Array(CPUS).fill().map(async () => {
    const page = await browser.newPage();
    while (index < limit) {
      const site = sites[index++];
      try {
        try {
          await page.goto(`https://${ site }`);
        } catch {
          await page.goto(`http://${ site }`);
        }

        const { core, vm, vl } = await page.evaluate(`({
          core: !!window['__core-js_shared__'] || !!window.core,
          vm: window['__core-js_shared__']?.versions,
          vl: window.core?.version,
        })`);
        const versions = vm ? vm.map(({ version, mode }) => `${ version } (${ mode } mode)`) : vl ? [vl] : [];
        tested++;
        if (core) withCoreJS++;

        console.log(`${ cyan(`${ site }:`) } ${ core
          ? green(`\`core-js\` is detected, ${ versions.length > 1
              ? `${ cyan(versions.length) } versions: ${ cyan(versions.join(', ')) }`
              : `version ${ cyan(versions[0]) }` }`)
          : gray('`core-js` is not detected') }`);
      } catch {
        console.log(`${ cyan(`${ site }:`) } ${ red('problems with access') }`);
      }
    }
  }));

  const percent = (withCoreJS / tested * 100).toFixed(2);

  console.log(green(`\n\`core-js\` is used on ${ cyan(withCoreJS) } from ${ cyan(tested) } tested websites, ${
    cyan(`${ percent }%`) }, problems with access to ${ cyan(limit - tested) } websites`));

  await browser.close();
})();
