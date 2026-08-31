import builder from '@core-js/builder';

export default function createBuilder({ minify }) {
  return async function build({ modules, targets }) {
    const { script } = await builder({
      modules,
      targets: targets ?? { ignoreBrowserslistConfig: true },
      format: 'bundle',
      minify,
    });

    return script;
  };
}
