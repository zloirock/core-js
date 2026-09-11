// `process.env.NODE_ENV` guards every development warning in echarts and in zrender under it, and
// nothing in this suite substitutes it, the way a real application's bundler would. In node the
// pre-flight inherits the real `process`; in a browser the first guard would be a ReferenceError
// before a single check ran. So the value is declared here, and the exercise imports this module
// FIRST: rollup evaluates modules in import order, and echarts reads the guard while its own module
// bodies run.
//
// `production` rather than a blank env on purpose - it is the branch a shipped application takes.
const env = { NODE_ENV: 'production' };

// `globalThis` itself is polyfilled at this floor, so assign through the value core-js installs
if (globalThis.process === undefined) globalThis.process = { env };
else if (globalThis.process.env === undefined) globalThis.process.env = env;
