// The public signature gives v an array type even though the implementation uses any.
function read(): { v: number[] };
function read(): { v: any } { return { v: [3] }; }
export const result = read().v.at(0);
