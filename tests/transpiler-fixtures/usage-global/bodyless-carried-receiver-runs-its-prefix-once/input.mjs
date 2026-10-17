// a bodyless `var` whose nested instance read carries the whole init runs the init's effect prefix once:
// the dispatch spells the prefix with the receiver, so nothing lifts it a second time
export function pick(ready, log, list) {
  if (ready) var { C: { at } } = (log('at'), { C: list });
  else var { C: { D: { flat } } } = (log('flat'), log('again'), { C: { D: [] } });
  return [at, flat];
}
