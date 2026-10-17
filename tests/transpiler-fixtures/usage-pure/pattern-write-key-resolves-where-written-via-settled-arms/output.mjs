const source = 'flat';
export function viaSettledArms(list, flag) {
  let armKey;
  if (flag) {
    const source = 'at';
    armKey = source;
  } else {
    const source = 'at';
    armKey = source;
  }
  return list[armKey]();
}