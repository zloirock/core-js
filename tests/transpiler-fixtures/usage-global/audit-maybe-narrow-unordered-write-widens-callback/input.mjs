let viaCallback = [1];
[0].forEach(() => { viaCallback = 'ab'; });
export const b = viaCallback.at(0);
