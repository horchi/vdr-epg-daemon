// MD5 (RFC 1321) over the UTF-8 bytes of a string, as hex.
// Needed for the epgd login key: md5(user + password) – compatible with yaMD5.hashStr().

const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);

export function md5(str) {
   const bytes = new TextEncoder().encode(str);
   const len = bytes.length;
   const nBlocks = ((len + 8) >>> 6) + 1;
   const words = new Uint32Array(nBlocks * 16);

   for (let i = 0; i < len; i++)
      words[i >>> 2] |= bytes[i] << ((i % 4) * 8);

   words[len >>> 2] |= 0x80 << ((len % 4) * 8);
   words[nBlocks * 16 - 2] = (len * 8) >>> 0;
   words[nBlocks * 16 - 1] = Math.floor(len / 0x20000000);

   let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

   for (let blk = 0; blk < words.length; blk += 16) {
      let a = a0, b = b0, c = c0, d = d0;

      for (let i = 0; i < 64; i++) {
         let f, g;
         const r = i >>> 4;

         if (r === 0)      { f = (b & c) | (~b & d); g = i; }
         else if (r === 1) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
         else if (r === 2) { f = b ^ c ^ d;          g = (3 * i + 5) % 16; }
         else              { f = c ^ (b | ~d);       g = (7 * i) % 16; }

         const tmp = d;
         d = c;
         c = b;
         const x = (a + f + K[i] + words[blk + g]) >>> 0;
         const s = S[r * 4 + (i % 4)];
         b = (b + ((x << s) | (x >>> (32 - s)))) >>> 0;
         a = tmp;
      }

      a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0;
      c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
   }

   return [a0, b0, c0, d0]
      .map(w => [0, 8, 16, 24].map(sh => ((w >>> sh) & 0xff).toString(16).padStart(2, '0')).join(''))
      .join('');
}
