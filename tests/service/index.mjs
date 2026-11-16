import './container-http.mjs';
import './container-image.mjs';
import './container-lifecycle.mjs';
import './container-manifest.mjs';
import './container-settings.mjs';
import './target.mjs';
import './user-agents.mjs';
import './invariants.mjs';
import './targets.mjs';
import './buckets.mjs';
import './matcher.mjs';
import './resolver.mjs';
import './traffic-shares.mjs';
import './configure.mjs';
import './builder.mjs';
import './bundles.mjs';
import './warm.mjs';
import './build-plan.mjs';
import './serve.mjs';
import './script-tag.mjs';
import './adapter-express.mjs';
import './warn.mjs';
import './types.mjs';

// Windows terminates children when sent SIGINT or SIGTERM through child_process.kill.
if (process.platform !== 'win32') await import('./container-process.mjs');

echo(chalk.green('service tested'));
