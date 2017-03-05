#! /bin/bash
#
# Author: OleS
#
# /etc/init.d/epghttpd
#
### BEGIN INIT INFO
# Provides:          epghttpd
# Required-Start:    $syslog epgd
# Required-Stop:
# Default-Start:     2 3 5
# Default-Stop:      0 1 2 6
# Short-Description: EPG HTTP Daemon
# Description:       EPG HTTP Daemon - provides a web interface similar to vdr live
### END INIT INFO

export LANG="de_DE.UTF-8"
export LC_ALL="de_DE.UTF-8"
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
NAME=epghttpd
DESC="EPG HTTP Daemon"

# Check for missing binaries (stale symlinks should not happen)
EPGHTTPD_BIN=/usr/local/bin/epghttpd
test -x $EPGHTTPD_BIN || exit 5

. /lib/lsb/init-functions

start_epghttpd() {
    log_daemon_msg "Starting $DESC" "$NAME" || true
    if start-stop-daemon --start --quiet --background --oknodo --exec ${EPGHTTPD_BIN} -- -n; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
}

stop_epghttpd()
{
    log_daemon_msg "Stopping $DESC" "$NAME" || true
    if start-stop-daemon --stop --signal KILL --verbose --oknodo --exec ${EPGHTTPD_BIN} 2>&1> /dev/null; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
}

status_epghttpd()
{
    status_of_proc /usr/local/bin/epghttpd $NAME && exit 0 || exit $?
}

case "$1" in
    start)
        start_epghttpd
        ;;
    stop)
        stop_epghttpd
        ;;
    restart)
        stop_epghttpd
        sleep 2
        start_epghttpd
        ;;
    status)
        status_epghttpd
        ;;
    *)
        N=/etc/init.d/$NAME
        echo "Usage: $N {start|stop|restart|status}" >&2
        exit 1
        ;;
esac
