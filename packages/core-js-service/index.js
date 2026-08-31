import createWarn from './internals/infrastructure/warn.js';

// the composition root: the graph is assembled here and only here, so that every module below
// takes what it needs as an argument instead of reaching for it. the layers are wired in as
// they land - see AGENTS.md
export default function createService({ warn: warnSink } = {}) {
  const warn = createWarn(warnSink);

  return { warn };
}
