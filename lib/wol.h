/*
 * wol.h: 
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

enum wolMisc
{
   sizeWolPacket = 17*6,
   sizeMacStr    = 64,
   sizeAddr      = 16,

   macAddrTupel  = 6,
   wolPort       = 9
};

struct cMacAddr
{
   unsigned char macAddr[macAddrTupel];
   char macAddrStr[sizeMacStr];
};

struct cWolHeader
{
   char remoteAddr[sizeAddr+TB];
   cMacAddr macAddr;
};

int sendWol(const char* mac, const char* device = 0);
int packMacAddr(const char* mac, cMacAddr* packedMac);
