Function('return this')!LITTLE_ENDIAN = try
  new Uint8Array(new Uint16Array([1]).buffer)[0] === 1
catch
  on