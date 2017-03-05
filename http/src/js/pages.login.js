epgd.pages.login = {
    useCookie: document.cookie.match(/login=([^;]+)/),
    render: function () {
        if (epgd.login.session)
            this.doLogin('logout');
        this.showForm();
    },
    showForm: function(callback){
        var tr = epgd.tr.pages.login,
            $con = $('#login');
        if (!$con.length) {
            $con = $('<div id="login" title="' + tr.label + '" class="searchDialog ui-dialog" style="margin:5% auto"><form class="ui-dialog-content ui-widget-content"><table cellpadding="5">'
            + '<tr><td>' + tr.userName + '</td><td><input type="text" id="lUser" /></td></tr>'
            + '<tr><td>' + tr.password + '</td><td><input type="password" id="lPass" /></td></tr>'
            + '<tr><td colspan="2"><input type="checkbox" id="lAlways" /> <label for="lAlways">' + tr.loggedAlwaysIn + '</label></td></tr>'
          + '</table></form></div>');
            $con.dialog({
                modal: true, width: "auto",
                closeOnEscape: false,
                buttons: [{
                    text: tr.label,
                    icons: {primary: "ui-icon-unlocked"},
                    click: function () {
                        var form = $con.find('form')[0];
                        if (!form.lUser.value)
                            return !!epgd.utils.topInfo(epgd.tr.error.emptyField.replace('$field$', tr.userName), { isError: 1 });
                        $(this).dialog("close");
                        epgd.pages.login.useCookie = form.lAlways.checked ? [] : null;
                        epgd.pages.login.doLogin(form.lUser.value, form.lPass.value, callback);
                    }
                }]
            }).keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click");
                }
            }).parent().find('.ui-dialog-titlebar-close').remove();
        } else
            $con.dialog('open');
    },
    doLogin: function (user, pass, callback) {
        var curLogin = epgd.login,
            uKey = '',
            storage = sessionStorage;

        try {
            storage.setItem('_storagetest_', 1);
            storage.removeItem('_storagetest_');
        } catch (ex) {
            storage = { removeItem: function () { }, setItem: function () { }, getItem: function () { return null; } }
        }

        function trigger_changed() {
            if (epgd.login.user != curLogin.user || epgd.login.rights != curLogin.rights) {
                if (!epgd.login.session) {
                    if (epgd.pages.login.useCookie) {
                        epgd.pages.login.useCookie[1] = null;
                        document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    }
                    storage.removeItem('login');
                    epgd.login.url = '';
                } else {
                    if (epgd.pages.login.useCookie) {
                        epgd.pages.login.useCookie[1] = uKey;
                        var d = new Date();
                        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
                        document.cookie = "login=" + uKey + "; expires=" + d.toUTCString();
                    }
                    storage.setItem('login', uKey);
                    epgd.login.url = 'sid' + epgd.login.session + '/';
                }
                $(window).trigger("login_changed", curLogin);
            }
            epgd.login.url = epgd.login.session ? 'sid' + epgd.login.session + '/' : '';
            if ($.isFunction(callback))
                callback();
        }

        if (user != 'logout') {
            if (curLogin.session) {
                $.ajax({ url: curLogin.url + "data/login", data: JSON.stringify({ key: '' }), type: 'post', contentType: "application/json; charset=utf-8", dataType: 'json' });
                epgd.login.url = '';
            }
            if (epgd.profile.needLogin == "0") {
                epgd.login = { user: '', session: '', rights: 4294967295, url: '' };
                return trigger_changed();
            }
            if (user)
                uKey = YaMD5.hashStr(user + pass);
            else {
                uKey = storage.getItem('login');
                if (!uKey && epgd.pages.login.useCookie)
                    uKey = epgd.pages.login.useCookie[1];
                if (!uKey)
                    return this.showForm(callback);
            }
        }
        $.ajax({ url: epgd.login.url + "data/login", data: JSON.stringify({ key: uKey }), type: 'post', contentType: "application/json; charset=utf-8", dataType: 'json' }).done(function (data) {
	        var tr = epgd.tr.pages.login;
	        epgd.login = data.login || { user: '', session: '', rights: 0, url: '' };
	        if (!epgd.login.session) {
	            if (user == 'logout') {
	                epgd.utils.topInfo(tr.logoutMessage);
	            } else
	                epgd.utils.topInfo(tr.error, { isError: 1 });
	            $('#menu_login a').text(tr.label);
	        } else {
	            $('#menu_login a').text(epgd.login.user + ' ' + tr.logout);
	            if (location.hash == "#menu_login" || location.hash == "#")
	                location.hash = "";
	        }
	        return trigger_changed();
	    });
    }
};
