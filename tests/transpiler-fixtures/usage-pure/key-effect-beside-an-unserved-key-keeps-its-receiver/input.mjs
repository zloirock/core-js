// a key the build serves by no name reads the receiver itself: the reused constructor or the capture
// stays for it, as a dispatch's capture does; the init still runs once, ahead of the first key
export const log = [];
export const { [(log.push('k1'), 'try')]: attempt, [(log.push('k2'), 'mine')]: mine } = (log.push('i1'), Promise);
function make() { log.push('i2'); return Array; }
export const { [(log.push('k3'), 'of')]: of, [(log.push('k4'), 'custom')]: custom } = make();
export const { [(log.push('k5'), 'at')]: at } = (log.push('i3'), [1, 2]);
