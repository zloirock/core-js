// ... and the patched twin declines, exactly as it does on a member key
enum HopPatched { SELF = 'self' }
Object.assign(HopPatched, { SELF: 'window' });
