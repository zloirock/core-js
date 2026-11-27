namespace App { export enum State { Ready } }
const { State: saved } = App;
export const before = App.State[0].at(0);
if (flag) Reflect.set(saved, 0, ['written']);
export const after = App.State[0].includes('written');
