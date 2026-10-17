const blockRoot = Object;
export function viaAliasInBlockShadow() {
  {
    const blockRoot = {};
    const blockLink = blockRoot;
    const {
      groupBy
    } = blockLink;
    return groupBy([], v => v);
  }
}