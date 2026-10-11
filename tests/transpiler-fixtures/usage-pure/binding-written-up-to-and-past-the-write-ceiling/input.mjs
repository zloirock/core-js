// A read follows at most 64 writes of one binding: `followed`, written that often, is narrowed by the write that
// reaches its read; `unfollowed`, written once more, is not followed, and its read dispatches generically.
let followed = [0], unfollowed = [0];
// 64 writes, eight rows of eight
followed = [1], followed = [2], followed = [3], followed = [4], followed = [5], followed = [6], followed = [7], followed = [8];
followed = [9], followed = [10], followed = [11], followed = [12], followed = [13], followed = [14], followed = [15], followed = [16];
followed = [17], followed = [18], followed = [19], followed = [20], followed = [21], followed = [22], followed = [23], followed = [24];
followed = [25], followed = [26], followed = [27], followed = [28], followed = [29], followed = [30], followed = [31], followed = [32];
followed = [33], followed = [34], followed = [35], followed = [36], followed = [37], followed = [38], followed = [39], followed = [40];
followed = [41], followed = [42], followed = [43], followed = [44], followed = [45], followed = [46], followed = [47], followed = [48];
followed = [49], followed = [50], followed = [51], followed = [52], followed = [53], followed = [54], followed = [55], followed = [56];
followed = [57], followed = [58], followed = [59], followed = [60], followed = [61], followed = [62], followed = [63], followed = [64];
// 65 writes: the same eight rows and one more
unfollowed = [1], unfollowed = [2], unfollowed = [3], unfollowed = [4], unfollowed = [5], unfollowed = [6], unfollowed = [7], unfollowed = [8];
unfollowed = [9], unfollowed = [10], unfollowed = [11], unfollowed = [12], unfollowed = [13], unfollowed = [14], unfollowed = [15], unfollowed = [16];
unfollowed = [17], unfollowed = [18], unfollowed = [19], unfollowed = [20], unfollowed = [21], unfollowed = [22], unfollowed = [23], unfollowed = [24];
unfollowed = [25], unfollowed = [26], unfollowed = [27], unfollowed = [28], unfollowed = [29], unfollowed = [30], unfollowed = [31], unfollowed = [32];
unfollowed = [33], unfollowed = [34], unfollowed = [35], unfollowed = [36], unfollowed = [37], unfollowed = [38], unfollowed = [39], unfollowed = [40];
unfollowed = [41], unfollowed = [42], unfollowed = [43], unfollowed = [44], unfollowed = [45], unfollowed = [46], unfollowed = [47], unfollowed = [48];
unfollowed = [49], unfollowed = [50], unfollowed = [51], unfollowed = [52], unfollowed = [53], unfollowed = [54], unfollowed = [55], unfollowed = [56];
unfollowed = [57], unfollowed = [58], unfollowed = [59], unfollowed = [60], unfollowed = [61], unfollowed = [62], unfollowed = [63], unfollowed = [64];
unfollowed = [65];
export const r = [followed.includes(64), unfollowed.at(-1)];
