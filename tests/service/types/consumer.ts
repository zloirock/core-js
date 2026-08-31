import createService from '@core-js/service';
import polyfillService from '@core-js/service/express';

const service = createService({
  scope: ['es.array.at'],
  targets: { chrome: '110' },
  version: 'node_modules',
  configPath: './app',
  browserslistEnv: 'production',
  ignoreBrowserslistConfig: false,
  exclude: [/^es\.math\./],
  minify: true,
  directory: './cache',
  retain: 1,
  compression: { identity: true, gzip: { level: 9 }, br: false },
  route: '/__core-js',
  warn: (message: string) => console.warn(message),
});

const id: string = service.plan.baseline.bundleId;
const engine: string = service.plan.buckets[0].targets.chrome;
const share: number = service.plan.buckets[0].share;
const url: string = service.urlOf(id);
const chosen: string = service.chooseBundle({ 'user-agent': 'x' });
const visitor = service.identify({ 'user-agent': 'x' });
const visitorEngine: string | undefined = visitor?.engine;
// the other row the visitor could be on, where the string leaves two open
const visitorBase: string | undefined = visitor?.alternate?.version;
const markup: string = service.scriptTag('<head>', { src: url, csp: null });
const versions: string = service.config.versions.coreJS;
const builderVersion: string = service.config.versions.builder;

async function run(): Promise<void> {
  const { ready, warmed } = service.start();
  await ready;
  const { built, failed } = await warmed;
  const bytes = await service.bundles.get(id, 'identity');
  const list = await service.bundles.modules(id);
  const pruned = await service.bundles.prune();
  console.log(built.length, failed.length, bytes?.length, list?.length, pruned.length, engine, share, chosen, markup, versions, url);
}

const middleware = polyfillService({ scope: ['es.array.at'] });
const carried: string = middleware.service.plan.baseline.bundleId;
const generation: string = service.plan.generation;

export { run, middleware, carried, generation };
