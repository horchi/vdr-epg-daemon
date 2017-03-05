// https://github.com/jbt/js-crypto
md5 = function(sixteen){

  var k = [],i=0;

  for(;i<64;){
    k[i] = 0|(Math.abs(Math.sin(++i)) * 4294967296);
  }

  function add(x, y){
    return (((x>>1)+(y>>1))<<1)+(x&1)+(y&1) ;
    //var msw = (x >> sixteen) + (y >> sixteen) + ((y=(x & ffff) + (y & ffff)) >> sixteen);
    //return (msw << sixteen) | (y & ffff);
  }

  var calcMD5 = function(str){
    var b,c,d,j,
        x = [],
        str2 = unescape(encodeURI(str)),
        a = str2.length,
        h = [b=1732584193,c=-271733879,~b,~c],
        i=0;

    for(;i<=a;) x[i >> 2] |= (str2.charCodeAt(i)||128) << 8*(i++ % 4);
    x[str=(a+8 >> 6)*sixteen+14] = a * 8;
    i = 0;

    for(; i < str; i += sixteen){
      a = h,j=0;
      for(;j<64;){
        a = [
          d = a[3],
          add(
            b = a[1] ,
            (d = add(
              add(
                a[0],
                [
                  b&(c=a[2]) | ~b&d,
                  d&b | ~d&c,
                  b^c^d,
                  c^(b|~d)
                ][a=j>>4]
              ),
              add(
                k[j],
                x[[
                  j,
                  5*j+1,
                  3*j+5,
                  7*j
                ][a]%sixteen+i]
              )
            )) << (a =[
              7, 12, 17, 22,
              5,  9, 14, 20,
              4, 11, sixteen, 23,
              6, 10, 15, 21
            ][4*a+j++%4]) | d >>> 32-a
          ),
          b,
          c
        ];
      }
      for(j=4;j;) h[--j] = add(h[j], a[j]);
    }

    str = '';
    for(;j<32;) str += ((h[j>>3] >> ((1^j++&7)*4)) & 15).toString(sixteen);

    return str;
  };
  return calcMD5;
}(16);
