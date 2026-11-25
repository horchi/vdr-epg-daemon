/*
 * webremote.c
 *
 * See the README file for copyright information
 *
 * Proxy for the remote control of the osd2web plugin (fb.html of the VDR)
 *
 *   GET data/osd2web/<uuid>/<path>       -> http://<ip>:<osd2webp>/<path>
 *                                           (fb.html and the web frontend skins/<skin>/...)
 *   GET data/osd2web/<uuid>/... (Upgrade) -> websocket tunnel to ws://<ip>:<osd2webp>
 *
 *   osd2web is plain http, on a https web frontend the browser blocks it (mixed content),
 *   by the proxy the remote control has the origin (and the TLS) of the web frontend
 */

#include <poll.h>
#include <netdb.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <unistd.h>

#include <string>
#include <thread>
#include <atomic>

#include "lib/curl.h"

#include "httpd.h"

static std::atomic<bool> remoteStop {false};
static std::atomic<int> remoteTunnels {0};

//***************************************************************************
// Answer
//***************************************************************************

static MHD_Result remoteAnswer(MHD_Connection* tcp, int status, const char* text)
{
   MHD_Response* response = MHD_create_response_from_buffer(strlen(text), (void*)text, MHD_RESPMEM_MUST_COPY);
   MHD_add_response_header(response, "Content-Type", "application/json; charset=utf-8");
   MHD_Result res = MHD_queue_response(tcp, status, response);
   MHD_destroy_response(response);
   return res;
}

//***************************************************************************
// Connect (with timeout)
//***************************************************************************

static int remoteConnect(const char* ip, int port, int timeoutMs)
{
   struct addrinfo hints {};
   struct addrinfo* res {};
   char service[20];

   hints.ai_family = AF_UNSPEC;
   hints.ai_socktype = SOCK_STREAM;
   snprintf(service, sizeof(service), "%d", port);

   if (getaddrinfo(ip, service, &hints, &res) != 0 || !res)
      return -1;

   int fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);

   if (fd < 0)
   {
      freeaddrinfo(res);
      return -1;
   }

   int flags = fcntl(fd, F_GETFL, 0);
   fcntl(fd, F_SETFL, flags | O_NONBLOCK);

   int rc = connect(fd, res->ai_addr, res->ai_addrlen);
   freeaddrinfo(res);

   if (rc < 0 && errno == EINPROGRESS)
   {
      pollfd pfd { fd, POLLOUT, 0 };
      int err {0};
      socklen_t len = sizeof(err);

      if (poll(&pfd, 1, timeoutMs) == 1 && getsockopt(fd, SOL_SOCKET, SO_ERROR, &err, &len) == 0 && !err)
         rc = 0;
   }

   if (rc < 0)
   {
      close(fd);
      return -1;
   }

   fcntl(fd, F_SETFL, flags);   // blocking again

   return fd;
}

// send all (the upgraded socket of MHD may be non blocking)

static bool sendAll(int fd, const char* buf, size_t size)
{
   while (size)
   {
      ssize_t n = send(fd, buf, size, MSG_NOSIGNAL);

      if (n < 0 && (errno == EAGAIN || errno == EWOULDBLOCK || errno == EINTR))
      {
         pollfd pfd { fd, POLLOUT, 0 };

         if (poll(&pfd, 1, 5000) <= 0)
            return false;

         continue;
      }

      if (n <= 0)
         return false;

      buf += n;
      size -= n;
   }

   return true;
}

// value of a header line in a raw http response, empty if missing

static std::string headerValue(const std::string& head, const char* name)
{
   std::string key = std::string("\r\n") + name + ":";

   for (size_t pos = 0; (pos = head.find("\r\n", pos)) != std::string::npos; pos += 2)
   {
      if (strncasecmp(head.c_str() + pos, key.c_str(), key.size()) != 0)
         continue;

      size_t start = pos + key.size();
      size_t end = head.find("\r\n", start);
      std::string value = head.substr(start, end == std::string::npos ? std::string::npos : end - start);

      value.erase(0, value.find_first_not_of(" \t"));
      value.erase(value.find_last_not_of(" \t") + 1);

      return value;
   }

   return "";
}

//***************************************************************************
// Websocket Tunnel
//***************************************************************************

struct RemoteTunnel
{
   int backend {-1};
   std::string toClient;      // data of the backend received behind its handshake
};

static void remotePump(MHD_socket client, int backend, std::string toClient, std::string toBackend,
                       MHD_UpgradeResponseHandle* urh)
{
   char buf[16 * 1024];
   bool ok = sendAll(client, toClient.data(), toClient.size()) && sendAll(backend, toBackend.data(), toBackend.size());

   while (ok && !remoteStop)
   {
      pollfd fds[2] { { client, POLLIN, 0 }, { backend, POLLIN, 0 } };
      int n = poll(fds, 2, 500);

      if (n < 0 && errno != EINTR)
         break;

      for (int i = 0; ok && n > 0 && i < 2; i++)
      {
         if (!fds[i].revents)
            continue;

         ssize_t size = recv(fds[i].fd, buf, sizeof(buf), 0);

         if (size < 0 && (errno == EAGAIN || errno == EWOULDBLOCK || errno == EINTR))
            continue;

         ok = size > 0 && sendAll(fds[1-i].fd, buf, size);
      }
   }

   close(backend);
   MHD_upgrade_action(urh, MHD_UPGRADE_ACTION_CLOSE);
   remoteTunnels--;
   tell(eloDetail, "osd2web: websocket tunnel closed");
}

static void remoteUpgraded(void* cls, MHD_Connection* connection, void* req_cls,
                           const char* extra_in, size_t extra_in_size,
                           MHD_socket sock, MHD_UpgradeResponseHandle* urh)
{
   RemoteTunnel* tunnel = (RemoteTunnel*)cls;

   remoteTunnels++;
   std::thread(remotePump, sock, tunnel->backend, tunnel->toClient,
               std::string(extra_in ? extra_in : "", extra_in ? extra_in_size : 0), urh).detach();

   delete tunnel;
}

// stop all tunnels (before MHD_stop_daemon)

void cEpgHttpd::stopRemoteTunnels()
{
   remoteStop = true;

   for (int i = 0; remoteTunnels > 0 && i < 40; i++)
      usleep(50000);
}

//***************************************************************************
// Serve Remote
//***************************************************************************

MHD_Result cEpgHttpd::serveRemote(MHD_Connection* tcp, const char* url)
{
   // rights (url with session prefix, like the other data requests)

   {
      json_t* obj = json_object();
      int statusCode {MHD_HTTP_OK};

      if (!hasRights("/data/osd2web", obj, statusCode))
      {
         char* text = json_dumps(obj, 0);
         MHD_Result res = remoteAnswer(tcp, statusCode, text);
         free(text);
         json_decref(obj);
         return res;
      }

      json_decref(obj);
   }

   // "/data/osd2web/<uuid>/<file>"

   std::string rest = url + strlen("/data/osd2web/");
   size_t slash = rest.find('/');
   std::string uuid = rest.substr(0, slash);
   std::string file = slash == std::string::npos ? "" : rest.substr(slash + 1);

   if (uuid.empty() || uuid.find_first_not_of("0123456789abcdefABCDEF-") != std::string::npos
       || file.find_first_not_of("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-/") != std::string::npos
       || file.find("..") != std::string::npos || file.find("//") != std::string::npos || file[0] == '/')
      return remoteAnswer(tcp, MHD_HTTP_NOT_FOUND, "{}");

   // only to the osd2web of a known VDR

   vdrDb->clear();
   vdrDb->setValue("UUID", uuid.c_str());

   if (!vdrDb->find() || vdrDb->getIntValue("OSD2WEBP") <= 0 || isEmpty(vdrDb->getStrValue("IP")))
   {
      vdrDb->reset();
      return remoteAnswer(tcp, MHD_HTTP_NOT_FOUND, "{\"result\": {\"state\": 404, \"message\": \"osd2web of this VDR not known\"}}");
   }

   std::string ip = vdrDb->getStrValue("IP");
   int port = vdrDb->getIntValue("OSD2WEBP");
   vdrDb->reset();

   const char* upgrade = getStrHeader(tcp, "Upgrade", "");

   // -----------------------------
   // websocket

   if (strcasecmp(upgrade, "websocket") == 0)
   {
      int fd = remoteConnect(ip.c_str(), port, 3000);

      if (fd < 0)
      {
         tell(eloWarning, "Warning: osd2web at %s:%d not reachable", ip.c_str(), port);
         return remoteAnswer(tcp, MHD_HTTP_BAD_GATEWAY, "{}");
      }

      // handshake with osd2web, the key of the browser is passed through
      //   -> the 'Sec-WebSocket-Accept' of osd2web is valid for the browser

      std::string request = "GET / HTTP/1.1\r\n"
         "Host: " + ip + ":" + std::to_string(port) + "\r\n"
         "Upgrade: websocket\r\n"
         "Connection: Upgrade\r\n"
         "Sec-WebSocket-Version: 13\r\n"
         "Sec-WebSocket-Key: " + getStrHeader(tcp, "Sec-WebSocket-Key", "") + "\r\n";

      if (!isEmpty(getStrHeader(tcp, "Sec-WebSocket-Protocol", "")))
         request += std::string("Sec-WebSocket-Protocol: ") + getStrHeader(tcp, "Sec-WebSocket-Protocol", "") + "\r\n";

      request += "\r\n";

      std::string head;
      char buf[4096];
      size_t end {std::string::npos};
      struct timeval tv { 3, 0 };

      setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

      if (sendAll(fd, request.c_str(), request.size()))
      {
         while ((end = head.find("\r\n\r\n")) == std::string::npos && head.size() < 16 * 1024)
         {
            ssize_t n = recv(fd, buf, sizeof(buf), 0);

            if (n <= 0)
               break;

            head.append(buf, n);
         }
      }

      if (end == std::string::npos || head.compare(0, 12, "HTTP/1.1 101") != 0)
      {
         tell(eloWarning, "Warning: osd2web at %s:%d rejected the websocket handshake", ip.c_str(), port);
         close(fd);
         return remoteAnswer(tcp, MHD_HTTP_BAD_GATEWAY, "{}");
      }

      tv = { 0, 0 };
      setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

      RemoteTunnel* tunnel = new RemoteTunnel;
      tunnel->backend = fd;
      tunnel->toClient = head.substr(end + 4);

      std::string accept = headerValue(head, "Sec-WebSocket-Accept");
      std::string protocol = headerValue(head, "Sec-WebSocket-Protocol");

      MHD_Response* response = MHD_create_response_for_upgrade(&remoteUpgraded, tunnel);
      MHD_add_response_header(response, MHD_HTTP_HEADER_UPGRADE, "websocket");
      MHD_add_response_header(response, "Sec-WebSocket-Accept", accept.c_str());

      if (!protocol.empty())
         MHD_add_response_header(response, "Sec-WebSocket-Protocol", protocol.c_str());

      MHD_Result res = MHD_queue_response(tcp, MHD_HTTP_SWITCHING_PROTOCOLS, response);
      MHD_destroy_response(response);

      if (res != MHD_YES)
      {
         close(fd);
         delete tunnel;
      }

      tell(eloDetail, "osd2web: websocket tunnel to %s:%d opened", ip.c_str(), port);

      return res;
   }

   // -----------------------------
   // file

   if (file.empty())
      file = "fb.html";

   MemoryStruct data;
   int size {0};
   std::string target = "http://" + ip + ":" + std::to_string(port) + "/" + file;

   if (curl.downloadFile(target.c_str(), size, &data, 5) != success || !data.size)
   {
      tell(eloWarning, "Warning: Download of '%s' failed", target.c_str());
      return remoteAnswer(tcp, MHD_HTTP_BAD_GATEWAY, "{}");
   }

   size_t bodySize = data.size;

   if (bodySize && data.memory[bodySize-1] == '\0')     // the terminator of curl is counted in size
      bodySize--;

   std::string body(data.memory, bodySize);
   const char* sfx = suffixOf(file.c_str());
   const char* contentType = "application/octet-stream";

   if (strcmp(sfx, "html") == 0)
      contentType = "text/html; charset=utf-8";
   else if (strcmp(sfx, "css") == 0)
      contentType = "text/css; charset=utf-8";
   else if (strcmp(sfx, "js") == 0)
   {
      contentType = "application/javascript; charset=utf-8";

      // the websocket of fb.js and of the web frontend (skin.js, minified) goes to host and port
      //   of the page -> to this proxy (path of the page, the tunnel ignores the path behind the uuid)

      const char* wsUrls[] = { "\"ws://\" + location.hostname + \":\" + location.port", "\"ws://\"+location.host" };

      for (const char* wsUrl : wsUrls)
      {
         size_t pos = body.find(wsUrl);

         if (pos != std::string::npos)
            body.replace(pos, strlen(wsUrl), "(location.protocol == \"https:\" ? \"wss://\" : \"ws://\") + location.host"
                         " + location.pathname.replace(/[^\\/]*$/, \"\")");
      }
   }
   else if (strcmp(sfx, "svg") == 0)
      contentType = "image/svg+xml";
   else if (strcmp(sfx, "png") == 0)
      contentType = "image/png";
   else if (strcmp(sfx, "ico") == 0)
      contentType = "image/x-icon";

   MHD_Response* response = MHD_create_response_from_buffer(body.size(), (void*)body.data(), MHD_RESPMEM_MUST_COPY);
   MHD_add_response_header(response, "Content-Type", contentType);
   MHD_add_response_header(response, "Cache-Control", "no-cache");
   MHD_Result res = MHD_queue_response(tcp, MHD_HTTP_OK, response);
   MHD_destroy_response(response);

   return res;
}
