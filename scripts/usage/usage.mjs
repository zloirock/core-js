import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import jszip from 'jszip';

const { cyan, green, gray, red } = chalk;
const agents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
];
const protocols = ['http', 'https'];
const limit = argv._[0] ?? 100;
const attempts = new Map();
const start = Date.now();
let tested = 0;
let withCoreJS = 0;

echo(green('downloading and parsing T1M Alexa data, it could take some seconds'));
// https://s3.amazonaws.com/alexa-static/top-1m.csv.zip is no longer provided, so using the last copy of the dataset from my server
// here could be used, for example, Cisco Umbrella statistics - http://s3-us-west-1.amazonaws.com/umbrella-static/top-1m.csv.zip,
// however, it's not so relative to our case like the Alexa list
// makes sense take a look at https://github.com/PeterDaveHello/top-1m-domains
const response = await fetch('http://es6.zloirock.ru/top-1m.csv.zip');
const archive = await jszip.loadAsync(await response.arrayBuffer());
const file = await archive.file('top-1m.csv.deprecated').async('string');
const BANNER_LINES = 8;
const sites = file
  .split('\n', limit + BANNER_LINES)
  .slice(BANNER_LINES)
  .map(line => line.match(/^\d+,(?<site>.+)$/).groups.site)
  .reverse();
echo(green(`downloading and parsing the rank took ${ cyan((Date.now() - start) / 1e3) } seconds\n${ gray('-'.repeat(120)) }`));

function timeout(promise, time) {
  return Promise.race([promise, new Promise((resolve, reject) => setTimeout(() => reject(Error('timeout')), time))]);
}

chromium.use(StealthPlugin());

// run in parallel
await Promise.all(Array(Math.ceil(os.cpus().length / 2)).fill().map(async () => {
  let browser, site;

  async function check() {
    let errors = 0;
    for (const protocol of protocols) for (const userAgent of agents) try {
      const page = await browser.newPage({ userAgent });
      page.setDefaultNavigationTimeout(6e4);
      await page.goto(`${ protocol }://${ site }`);

      // seems js hangs on some sites, so added a time limit
      const { core, modern, legacy } = await timeout(page.evaluate(`({
        core: !!window['__core-js_shared__'] || !!window.core || !!window._babelPolyfill,
        modern: window['__core-js_shared__']?.versions,
        legacy: window.core?.version,
      })`), 1e4);
      const versions = modern ? modern.map(({ version, mode }) => `${ version } (${ mode } mode)`) : legacy ? [legacy] : [];

      await page.close();

      if (core) return { core, versions };
    } catch (error) {
      if (++errors === 4) throw error;
    } return {};
  }

  while (site = sites.pop()) try {
    await browser?.close();
    browser = await chromium.launch();

    const { core, versions } = await check();

    tested++;
    if (core) withCoreJS++;

    echo`${ cyan(`${ site }:`) } ${ core
      ? green(`\`core-js\` is detected, ${ versions.length > 1
        ? `${ cyan(versions.length) } versions: ${ cyan(versions.join(', ')) }`
        : `version ${ cyan(versions[0]) }` }`)
      : gray('`core-js` is not detected') }`;
  } catch {
    const attempting = (attempts.get(site) | 0) + 1;
    attempts.set(site, attempting);
    if (attempting < 3) sites.push(site);
    else echo(red(`${ cyan(`${ site }:`) } problems with access`));
    await sleep(3e3);
  }

  return browser?.close();
}));

echo(green(`\n\`core-js\` is detected on ${ cyan(withCoreJS) } from ${ cyan(tested) } tested websites, ${
  cyan(`${ (withCoreJS / tested * 100).toFixed(2) }%`) }, problems with access to ${ cyan(limit - tested) } websites`));
