import compat from '@core-js/compat/compat';

// the module-list port, declared by the domain: a targets specification to the modules the
// application reaches for and that engine does not have
export default function createListModules({ scope, exclude, versions }) {
  return function listModules(targets) {
    // `targets: null` is not "no targets" to compat - it goes looking for a browserslist config
    // of its own, and the baseline would quietly become whatever that config says. the declaration
    // is resolved once, in `configure`, and "everything" has to say so out loud
    return compat({
      targets: targets ?? { ignoreBrowserslistConfig: true },
      modules: scope,
      exclude,
      version: versions.coreJS,
    }).list;
  };
}
