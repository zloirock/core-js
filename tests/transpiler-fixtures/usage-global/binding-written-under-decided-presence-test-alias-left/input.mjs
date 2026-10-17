const config = APP_CONFIG;

export function aliasLeft() {
  let value = [1];
  config || (value = 'abc');
  return value.padStart(4);
}
