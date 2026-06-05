// the directive before the OUTER `{` spans the whole nested-block body, so `flat` (two blocks
// deep) is disabled while the sibling `flatMap` outside still polyfills
// core-js-disable-next-line
{
  {
    [].flat();
  }
}
[].flatMap(x => x);
