// @ts-expect-error a catch annotation tsc refuses is the shape under test
try {} catch (e: Error) { e.message.at(0); }
