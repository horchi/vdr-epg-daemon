epgd.pages.editUser = {
    cur: null,
    render: function () {
        if (!(epgd.login.rights & epgd.rights.umConfigUsers) == epgd.rights.umConfigUsers) return epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
        var tr = epgd.tr.pages.editUser,
            $form= $('<form></form>'),
            $sel = $('<select size="10"></select>').change(function () {
                epgd.pages.editUser.showUser(this[this.selectedIndex].data, $form, epgd.pages.editUser.render);
            });
        $('<option>' + tr.add + '</option>').appendTo($sel)[0];
        epgd.$con.html('<div id="page_editUser"><div><h2>' + tr.user + '</h2></div></div>');
        epgd.ajax({ url: epgd.login.url + "data/users", cache: false }, function (data) {
            for (var uName in data.users) {
                $('<option>' + uName + '</option>').appendTo($sel)[0].data = data.users[uName];
            }
        });
        epgd.$con.find('#page_editUser').append($form).children().first().append($sel);
    },
    showUser: function (userData, $form, callback) {
        epgd.pages.editUser.cur = userData || {"user": "", "active": 1, "rights": epgd.login.rights};
        var tr = epgd.tr.pages.editUser,
            u = epgd.pages.editUser.cur,
            rightForm = '',
            um;
        //epgd.rights = {}; for (var i = 1; i < 1025; i = i * 2) epgd.rights['um' + i] = i;// zum Test
        for (um in epgd.rights)
            rightForm += '<div><input type="checkbox"' + ((u.rights & epgd.rights[um]) == epgd.rights[um] ? ' checked="checked"' : '') + ' name="uRights" id="uR' + um + '" value="' + epgd.rights[um] + '"/><label for="uR' + um + '">' + (tr.rights[um] || um) + '</label></div>';
        $form.html((!u.user ? '<h2>' + epgd.tr.pages.login.userName + '</h2><div><input type="text" id="uName" value="" /></div><br />' : '')
                + '<div><input type="radio"' + (u.active == "1" ? ' checked="checked"' : '') + ' name="uActive" value="1" id="uActive"/><label for="uActive">' + tr.active + '</label>'
                    + ' <input type="radio"' + (u.active == "0" ? ' checked="checked"' : '') + ' name="uActive" value="0" id="uInactive" /><label for="uInActive">' + tr.inActive + '</label>'
                    + (u.user && ' <input type="radio" name="uActive" value="-1" id="uDel"/><label for="uDel">' + epgd.tr.del + '</label>')
                + '</div>'
                + '<h2>' + epgd.tr.pages.login.password + '</h2><div><input type="password" id="uPass" /></div>'
                + '<h2>' + tr.rights.label + '</h2><div>' + rightForm + '</div>'
                + '<div><br /><button class="iAsButton i-save">' + epgd.tr.save + '</button></div>');
        $form.find('button').click(function () {
            return epgd.pages.editUser.save(this.form, callback);
        });
        $uRights = $($form[0].uRights).each(function () {
            this.r = parseInt(this.value, 10);
        });
        function check() {
            var flag = this.r;
            if (this.checked)
                $uRights.each(function () { // Alle unterrechte automatisch setzen und fixieren 
                    if (this.r < flag && (flag & this.r) == this.r) this.checked = this.disabled = true;
                });
            else
                $uRights.each(function () {
                    if (this.r < flag && (flag & this.r) == this.r) {
                        this.disabled = false; // Es ist ein Unterrecht, also erst mal wieder erlauben
                        var sub = this; // Suchen, ob dieses recht noch ein von einem weiteren Recht ein Unterrecht ist und dann ggf. wieder setzen und fixieren
                        $uRights.each(function () {
                            if (this.checked && this.r > sub.r && (this.r & sub.r) == sub.r) sub.checked = sub.disabled = true;
                        });
                    }
                });
        }
        $uRights.each(check).click(check);
    },
    save: function (form, callback) {
        var u = {rights:1},
            cur = epgd.pages.editUser.cur;
        $(form.uRights).each(function () { if (this.checked) u.rights |= this.r; });
        u.active = parseInt(form.uActive.value,10);
        if (cur.user) {
            u.user = cur.user;
            if (u.active == -1) {
                delete u.active;
                u.state = 'D';
            } else {
                u.state = 'M';
                if (u.active == cur.active)
                    delete u.active;
                if (u.rights == cur.rights)
                    delete u.rights;
                if (form.uPass.value)
                    u.passwd = YaMD5.hashStr(u.user + form.uPass.value);
            }
        } else{
            u.state = 'C';
            u.user = form.uName.value;
            if (!u.user)
                return !epgd.utils.topInfo(epgd.tr.error.emptyField.replace('$field$', epgd.tr.pages.login.userName), { isError: 1 });
            u.passwd = YaMD5.hashStr(u.user + form.uPass.value);
        }
        epgd.ajax({url: epgd.login.url + "data/save-users",type: 'post',data: JSON.stringify({ users: [u] })},function (data) {
                if (data.Error || data.result.state != 200)
                    return epgd.utils.topInfo(data.Error || data.result.message, { isError: 1 });
                (u.user == epgd.login.user) && $(window).trigger("login_changed",u);
                if ( $.isFunction(callback))
                    callback(data);
            });
        return false;
    }
};
