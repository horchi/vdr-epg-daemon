#! /bin/bash
#
# Author: OleS
#
# /etc/init.d/epgd
#
### BEGIN INIT INFO
# Provides:          epgd
# Required-Start:    $syslog mysql
# Required-Stop:
# Default-Start:     2 3 5
# Default-Stop:      0 1 2 6
# Short-Description: EPG Daemon
# Description:       EPG Daemon - collects EPG Data from VDR's
#                     and other ressources
### END INIT INFO

export LANG="de_DE.UTF-8"
export LC_ALL="de_DE.UTF-8"
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
NAME=epgd
DESC="EPG Daemon"

# Check for missing binaries (stale symlinks should not happen)
EPGD_BIN=/usr/local/bin/epgd
test -x $EPGD_BIN || exit 5

# Check for existence of needed config directory
EPGD_CONFDIR=/etc/epgd
test -d $EPGD_CONFDIR || exit 6

# Check for existence of needed config file and read it
EPGD_CONFIG=${EPGD_CONFDIR}/epgd.conf
test -r $EPGD_CONFIG || exit 6

# Check for existance of needed plugin directory
EPGD_PLGDIR=/usr/local/lib/epgd/plugins
test -d $EPGD_PLGDIR || exit 6

. /lib/lsb/init-functions

start_epgd() {
    log_daemon_msg "Starting $DESC" "$NAME" || true
    if start-stop-daemon --start --quiet --background --oknodo --exec ${EPGD_BIN} -- -n -c ${EPGD_CONFDIR} -p ${EPGD_PLGDIR}; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
}

stop_epgd()
{
    log_daemon_msg "Stopping $DESC" "$NAME" || true
    if start-stop-daemon --stop --signal KILL --verbose --oknodo --exec ${EPGD_BIN} 2>&1> /dev/null; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
}

status_epgd()
{
    status_of_proc /usr/local/bin/epgd $NAME && exit 0 || exit $?
}

case "$1" in
    start)
        start_epgd
        ;;
    stop)
        stop_epgd
        ;;
    restart)
        stop_epgd
        sleep 2
        start_epgd
        ;;
    status)
        status_epgd
        ;;
    *)
        N=/etc/init.d/$NAME
        echo "Usage: $N {start|stop|restart|status}" >&2
        exit 1
        ;;
esac
