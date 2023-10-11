import compat from '@core-js/compat';
import compat2 from '@core-js/compat/compat';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';

getModulesListForTargetVersion('3.0');
compat.getModulesListForTargetVersion('3.0');

compat.data['es.array.push'].android
compat.data['es.array.push'].firefox

if (typeof compat.modules[0] !== 'string') {
  console.error('Invalid');
}

if (!compat.entries['core-js'].includes('es.array.from')) {
  console.error('Invalid')
}

compat();
compat({});
compat({ modules: 'core-js/actual' });
compat({ modules: 'es.array.push' });
compat({ modules: /^es\.array\./ });
compat({ modules: ['core-js/actual', /^es\.array\./] });
compat({ exclude: 'core-js/actual' });
compat({ exclude: 'es.array.push' });
compat({ exclude: /^es\.array\./ });
compat({ exclude: ['core-js/actual', /^es\.array\./] });
compat({ modules: 'core-js/actual', exclude: /^es\.array\./ });
compat({ targets: '> 1%' });
compat({ targets: ['defaults', 'last 5 versions'] });
compat({ targets: { esmodules: true, node: 'current', browsers: ['> 1%'] } });
compat({ targets: { chrome: '26', firefox: 4 } });
compat({ targets: { browsers: { chrome: '26', firefox: 4 } } });
compat({ targets: { chrome: '26', firefox: 4, esmodules: true, node: 'current', browsers: ['> 1%'] } });
compat({ version: '3.0' });
compat({ inverse: true });

compat.compat();
compat.compat({});
compat.compat({ modules: 'core-js/actual' });
compat.compat({ modules: 'es.array.push' });
compat.compat({ modules: /^es\.array\./ });
compat.compat({ modules: ['core-js/actual', /^es\.array\./] });
compat.compat({ exclude: 'core-js/actual' });
compat.compat({ exclude: 'es.array.push' });
compat.compat({ exclude: /^es\.array\./ });
compat.compat({ exclude: ['core-js/actual', /^es\.array\./] });
compat.compat({ modules: 'core-js/actual', exclude: /^es\.array\./ });
compat.compat({ targets: '> 1%' });
compat.compat({ targets: ['defaults', 'last 5 versions'] });
compat.compat({ targets: { esmodules: true, node: 'current', browsers: ['> 1%'] } });
compat.compat({ targets: { chrome: '26', firefox: 4 } });
compat.compat({ targets: { browsers: { chrome: '26', firefox: 4 } } });
compat.compat({ targets: { chrome: '26', firefox: 4, esmodules: true, node: 'current', browsers: ['> 1%'] } });
compat.compat({ version: '3.0' });
compat.compat({ inverse: true });

compat2();
compat2({});
compat2({ modules: 'core-js/actual' });
compat2({ modules: 'es.array.push' });
compat2({ modules: /^es\.array\./ });
compat2({ modules: ['core-js/actual', /^es\.array\./] });
compat2({ exclude: 'core-js/actual' });
compat2({ exclude: 'es.array.push' });
compat2({ exclude: /^es\.array\./ });
compat2({ exclude: ['core-js/actual', /^es\.array\./] });
compat2({ modules: 'core-js/actual', exclude: /^es\.array\./ });
compat2({ targets: '> 1%' });
compat2({ targets: ['defaults', 'last 5 versions'] });
compat2({ targets: { esmodules: true, node: 'current', browsers: ['> 1%'] } });
compat2({ targets: { chrome: '26', firefox: 4 } });
compat2({ targets: { browsers: { chrome: '26', firefox: 4 } } });
compat2({ targets: { chrome: '26', firefox: 4, esmodules: true, node: 'current', browsers: ['> 1%'] } });
compat2({ version: '3.0' });
compat2({ inverse: true });
