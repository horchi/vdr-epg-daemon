/*
 * wol.c: 
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <errno.h>

#include "common.h"
#include "wol.h"

//***************************************************************************
// Send WOL
//***************************************************************************

int sendWol(const char* mac, const char* device)
{
   struct sockaddr_in addr;
   unsigned char packet[sizeWolPacket];
   int sock;
   int optval = 1;
   cWolHeader wolHeader;
   const char* bcast = "";

   if (isEmpty(device))
      device = getFirstInterface();
   
   bcast = bcastAddressOf(getIpOf(device), getMaskOf(device));
      
   if ((sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)) < 0)
   {
      tell(0, "Error: Cannot open socket '%s'", strerror(errno));
      return fail;
   }
   
   if (setsockopt(sock, SOL_SOCKET, SO_BROADCAST, (char*)&optval, sizeof(optval)) < 0)
   {
      tell(0, "Error: Cannot set socket options '%s'", strerror(errno));
      return fail;
   }

   sprintf(wolHeader.remoteAddr, "%.*s", sizeAddr, bcast);

   if (packMacAddr(mac, &wolHeader.macAddr) < 0)
   {
      tell(0, "Error: MAC Address '%s' ist not valid", mac);
      return fail;
   }
   
   // .....
   
   addr.sin_family = AF_INET;
   addr.sin_port = htons(wolPort);
   
   if (inet_aton(wolHeader.remoteAddr, &addr.sin_addr) == 0)
   {
      tell(0, "Error: Invalid remote ip address given '%s'", wolHeader.remoteAddr);
      return fail;
   }
   
   for (int i = 0; i < 6; i++)
      packet[i] = 0xFF;
   
   for (int i = 1; i <= 16; i++)
      for (int j = 0; j < 6; j++)
         packet[i * 6 + j] = wolHeader.macAddr.macAddr[j];
   
   if (sendto(sock, packet, sizeof(packet), 0, (struct sockaddr*)&addr, sizeof(addr)) < 0)
   {
      tell(0, "Error: Cannot send data '%s'", strerror(errno));
      return fail;
   }

   tell(0, "Info: Successful sent WOL magic packet to '%s' via bcast '%s'",
        wolHeader.macAddr.macAddrStr, bcast);
   
   close(sock);
   
   return success;
}

//***************************************************************************
// Pack MAC Address
//***************************************************************************

int packMacAddr(const char* mac, cMacAddr* packedMac)
{
   char* tmpMac = strdup(mac);
   char* tok;
  
   tok = strtok(tmpMac, ":");
   
   for (int i = 0; i < macAddrTupel; i++)
   {
      if (!tok)
      {
         free(tmpMac);
         return fail;
      }
      
      packedMac->macAddr[i] = (unsigned char)strtol(tok, 0, 16);  // HEX
      tok = strtok(0, ":");
   }

   strncpy(packedMac->macAddrStr, mac, sizeMacStr);
   free(tmpMac);
   
   return success;
}
