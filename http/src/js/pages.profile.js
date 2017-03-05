epgd.pages.profile = {
    render: function () {
        var /*fav = '',
            rules= epgd.profile.favCond.split('\n');
        for (var i = 0; i < rules.length; i++) {
            var terms = rules[i].match(/if \((.+)\) return '([^']+)';$/);
            if (terms)
                fav += '<li style="border:2px solid ' + terms[2] + '"></li>';
        },*/
            startPage = epgd.profile.startPage.slice(5),
            namingmodeOptions = '<option>' + epgd.tr.pages.timerList.namingModes.join('</option><option>') + '</option>',
            html = '<form id="page_profile"><h3>Interface</h3><div><table>'
                + '<tr><td>startpage</td><td><select id="startPage">'
                    + jQuery.map(epgd.tr.menu, function (value, key) {
                        return '<option value="menu_' + key + (startPage == key ? '" selected="selected">' : '">') + value + '</option>';
                    }).join('') + '</select></td></tr>'
                + '<tr><td>default VDR</td><td><select id="defaultVDRuuid">' + $('#menu_vdrs').find('select').html() + '</select></td></tr>'
                + '<tr><td>datepicker first day</td><td><select id="pickerFirstDay"><option>' + epgd.tr.dateTimePicker.dayNames.join('</option><option>') + '</option></select></td></tr>'
                + '<tr><td>quicklinks</td><td><textarea rows="5" style="float:left;width:50%; margin-right:10px" id="quickTimes" onchange="epgd.pages.profile.validate.quickTimes(this)">' + epgd.profile.quickTimes.replace(/~/g, '\n') + '</textarea><span>enter in each line label=hh:mm(24h), eg:<br />prime time=20:15 or prime time=!20:15 (this time will not be highlighted in magazine)<br />now=@Now or next=@Next<br />tip=@searchtimerName</span></td></tr>'
                + '<tr><td>constabel-login</td><td><input type="text" class="full" id="constabelLoginPath" value="' + (epgd.profile.constabelLoginPath || '') + '" />'
                  + '<br />e.g.https://www.eplists.de/eplist.cgi?action=login&login=[username]&secret=[password]</td></tr>'
                + '<tr><td>' + epgd.tr.pages.profile.maxListEntries + '</td><td><input type="text" id="maxListEntries" value="' + epgd.profile.maxListEntries + '" data-valexp="^[1-9]{0,3}$" /></td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.menu.magazine + '</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.magazinePan + '</td><td><input type="text" id="magazinePan" value="' + epgd.profile.magazinePan + '" data-valexp="^[0-9]{1,2}$" /></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.magazinePanDelay + '</td><td><input type="text" id="magazinePanDelay" value="' + epgd.profile.magazinePanDelay + '" data-valexp="^[1-9][0-9]{2,3}$" /></td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.pages.timer.timerList + '</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.timerList.namingMode + '</td><td><b>' + epgd.tr.pages.eventDetail.scrapperSerieInfo + '</b><div>'
                        + epgd.tr.pages.timer.timerList + ': <select id="namingModeSerie">' + namingmodeOptions + '</select><input id="namingModeSerieTemplate" value="' + epgd.profile.namingModeSearchSerieTemplate + '" type="text" style="width:90%" /></div><div>'
                        + epgd.tr.pages.timer.searchTimerList + ': <select id="namingModeSearchSerie">' + namingmodeOptions + '</select><input id="namingModeSearchSerieTemplate" value="' + epgd.profile.namingModeSearchSerieTemplate + '" type="text" style="width:90%" /></div><b style="text-decoration:line-through">'
                       + epgd.tr.pages.eventDetail.scrapperSerieInfo + '</b><div>'
                        + epgd.tr.pages.timer.timerList + ': <select id="namingModeMovie">' + namingmodeOptions + '</select><input id="namingModeMovieTemplate" value="' + epgd.profile.namingModeMovieTemplate + '" type="text" style="width:90%" /></div><div>'
                        + epgd.tr.pages.timer.searchTimerList + ': <select id="namingModeSearchMovie">' + namingmodeOptions + '</select><input id="namingModeSearchMovieTemplate" value="' + epgd.profile.namingModeSearchMovieTemplate + '" type="text" style="width:90%" /></div></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.timerList.chFormat + '</td><td><input id="chFormat" readonly onclick="epgd.timerEditChFormat(this)" value="' + epgd.profile.chFormat + '" /></td></tr>'
                    + '<tr><td>VDR</td><td><select id="timerDefaultVDRuuid"><option value="">Auto</option>' + $('#menu_vdrs').find('select').html() + '</select></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.mailReceiver + '</td><td><input type="mail" value="' + (epgd.profile.mailReceiver || '') + '" id="mailReceiver" /><button onclick="epgd.utils.sendMail(\'checkMailAddress\',\'it works\',\'\',$(form.mailReceiver).val())">' + epgd.tr.test + '</button></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.sendMessages + '</td><td>' 
                        + jQuery.map(epgd.tr.pages.timerList.messageTypes, function (value, key) {
                            return '<input type="checkbox" value="' + key + '" name="messageMailTypes"' + (epgd.profile.messageMailTypes.indexOf(key) >= 0 ? ' checked="checked"' : '') + ' />' + value;
                        }).join('&nbsp;&nbsp;')                   
                    + '</td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.menu.search + '</th><tr>'
                    + '<tr><td>' + epgd.tr.advanced + '</td><td><input type="checkbox" id="searchAdv" /></td></tr>'
                + '<tr><th colspan="2">VDR OSD</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.vdr.startWithSched + '</td><td><input type="checkbox" id="startWithSched"' + (epgd.profile.startWithSched == "1" ? ' checked="checked"' : '') + ' /></td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.menu.records + '</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.record.subFolderSort + '</td><td><select id="recordSubFolderSort"><option value="1">' + epgd.tr.pages.eventDetail.title + ' up</option><option value="2">' + epgd.tr.pages.eventDetail.title + ' down</option><option value="3">' + epgd.tr.pages.timerList.folder + ' up</option><option value="4">' + epgd.tr.pages.timerList.folder + ' down</option><option value="5">' + epgd.tr.pages.timerList.recordTime + ' up</option><option value="6">' + epgd.tr.pages.timerList.recordTime + ' down</option></select></td></tr>'
             + '</table></div>';
        if ((epgd.login.rights & epgd.rights.umConfigEdit) == epgd.rights.umConfigEdit)
            html += '<h3>System</h3><div></div>';
        epgd.$con.html(html + '</form>'
            + '<br /><input type="button" value="' + epgd.tr.save + '" onclick="epgd.pages.profile.save()" class="ui-button ui-widget ui-state-default ui-corner-all">');
        this.form= $( "#page_profile" ).tooltip().accordion({
            headers: "<h3>",
            collapsible: true,
            heightStyle: "content",
            activate: function (event, ui) {
                var panel = ui.newPanel[0];
                if (panel && !panel.hasLoaded) {
                    panel.hasLoaded = true;
                    if (ui.newHeader.text() == "System") {
                        $(panel).html('<table>'
                            + '<tr><th colspan="2">' + epgd.tr.pages.login.label + '</th></tr>'
                            + '<tr><td>' + epgd.tr.pages.login.needLogin + '</td><td><input type="checkbox" id="needLogin" /></td></tr>'
                          + '</table>')
                        .find("#needLogin").click(function () {
                            if (this.checked && !this.hasUsers) {
                                this.checked = false;
                                var elem = this;
                                epgd.ajax({ url: epgd.login.url + "data/users", cache:false }, function (data) {
                                    var u = null,
                                        $dialog, 
                                        uName;
                                    for (uName in data.users) { u = data.users[uName]; if (u.active) return (elem.hasUsers = elem.checked = true) };
                                    $dialog = $('<form title="' + epgd.tr.pages.editUser.user + ' ' + (u ? u.user : epgd.tr.pages.editUser.add) + '"></form>');
                                    epgd.pages.editUser.showUser(u, $dialog, function () {
                                        $dialog.dialog("close");
                                        if (!u)
                                            elem.hasUsers = elem.checked = true;
                                        else
                                            $(elem).click();
                                    });
                                    $dialog.dialog({ modal: true, width: "auto" });
                                });
                            }
                        }).prop('checked', epgd.profile.needLogin == "1");
                        epgd.ajax({ url: epgd.login.url + "data/parameters", async: true, cache: false, dataType: "json" }, function (data) {
                            var html = '', i, p, val,
                                tr = epgd.tr.pages.profile.system,
                                ptTime = 1, ptBool = 2; // ptNum = 0, , ptAscii = 3
                            for (i in data.parameters) {
                                p = data.parameters[i];
                                if (p.owner == 'epgd') {
                                    html += '<tr><td>' + (tr[p.name] || p.name) + '</td><td>';
                                    val = typeof p.value == "undefined" ? p["default"] : p.value;
                                    if (p.type == ptTime)
                                        val= epgd.utils.formatDateTime(val); 
                                    if (p.readonly)
                                        html += val;
                                    else {
                                        html += '<input data-value="' + val + '" data-valexp="' + (p.valexp || '') + '" id="' + p.name + '"';
                                        if (p.type == ptBool)
                                            html += ' type="checkbox"' + (val == "1" ? ' checked' : '');
                                        else
                                            html += ' type="text" class="full" value="' + val + '"';
                                        html += ' /></td></tr>';
                                    }
                                }                                                                   
                            }                                                                                                      
                            html && $(panel).find('table').append('<tbody id="pSystem"><tr><th>' + tr.label + '</th><th style="min-width:300px"></th></tr>' + html + '</tbody>') //&& $( "#page_profile" ).accordion('refresh');
                        });
                    }
                }
            }
        })[0]; 
        this.form.namingModeSerie.selectedIndex = epgd.profile.namingModeSerie;
        this.form.namingModeSearchSerie.selectedIndex = epgd.profile.namingModeSearchSerie;
        this.form.namingModeMovie.selectedIndex = epgd.profile.namingModeMovie;
        this.form.namingModeSearchMovie.selectedIndex = epgd.profile.namingModeSearchMovie;

        $([this.form.namingModeSerie,this.form.namingModeSearchSerie,this.form.namingModeMovie,this.form.namingModeSearchMovie] ).change(function () {
            this.nextSibling.style.display = (this.selectedIndex == 6) ? 'block' : 'none';
        }).change();
        epgd.utils.addPlaceholders(this.form.namingModeSerieTemplate, '%', epgd.tr.pages.timerList.templateFields);
        epgd.utils.addPlaceholders(this.form.namingModeSearchSerieTemplate, '%', epgd.tr.pages.timerList.templateFields);
        epgd.utils.addPlaceholders(this.form.namingModeMovieTemplate, '%', epgd.tr.pages.timerList.templateFields);
        epgd.utils.addPlaceholders(this.form.namingModeSearchMovieTemplate, '%', epgd.tr.pages.timerList.templateFields);

        $(this.form.quickTimes).one("focus", function () {
            var quickTimes = this;
            epgd.ajax({ url: epgd.login.url + "data/searchtimers?type=S" }, function (data) {
                var placeholders = { "@Now": ": current time", "@Next": ": next event" };
                $.each(data.searchtimers, function (id, t) {
                    placeholders['@' + t.name || t.expression] = ': saved timer';
                });
                epgd.utils.addPlaceholders(quickTimes, '@', placeholders);
            });
        });

        this.form.searchAdv.checked = epgd.profile.searchAdv == "1";
        epgd.profile.defaultVDRuuid && $(this.form.defaultVDRuuid).val(epgd.profile.defaultVDRuuid);
        $(this.form.timerDefaultVDRuuid).val(epgd.profile.timerDefaultVDRuuid);
        $(this.form.recordSubFolderSort).val(epgd.profile.recordSubFolderSort);
       this.form.pickerFirstDay.selectedIndex= (epgd.profile.pickerFirstDay || epgd.tr.dateTimePicker.firstDay);
    },
    save: function () {
        var profile = epgd.profile,
            data = [],
            form = this.form,
            owner= "@" + epgd.login.user,
            panel;
        function checkData(p) {
            if (profile[p.name] != p.value)
                data.push(p);
        }

        if (!this.validate.quickTimes(form.quickTimes)
            || !this.validate.checkRegex(form.magazinePan)
            || !this.validate.checkRegex(form.magazinePanDelay))
            return false;

        checkData({ name: "defaultVDRuuid", value: $(form.defaultVDRuuid).val() || '', owner: owner });
        checkData({ name: "quickTimes", value: form.quickTimes.value.replace(/\n/g, '~'), owner: owner });
        checkData({ name: "startWithSched", value: $(form.startWithSched).prop('checked') ? "1" : "0", owner: owner });
        checkData({ name: "pickerFirstDay", value: new String(form.pickerFirstDay.selectedIndex), owner: owner });
        checkData({ name: "startPage", value: $(form.startPage).val() || '', owner: owner });
        checkData({ name: "namingModeSerie", value: new String(this.form.namingModeSerie.selectedIndex), owner: owner });
        checkData({ name: "namingModeSearchSerie", value: new String(this.form.namingModeSearchSerie.selectedIndex), owner: owner });
        checkData({ name: "namingModeMovie", value: new String(this.form.namingModeMovie.selectedIndex), owner: owner });
        checkData({ name: "namingModeSearchMovie", value: new String(this.form.namingModeSearchMovie.selectedIndex), owner: owner });
        checkData({ name: "namingModeSerieTemplate", value: new String(this.form.namingModeSerieTemplate.value), owner: owner });
        checkData({ name: "namingModeSearchSerieTemplate", value: new String(this.form.namingModeSearchSerieTemplate.value), owner: owner });
        checkData({ name: "namingModeMovieTemplate", value: new String(this.form.namingModeMovieTemplate.value), owner: owner });
        checkData({ name: "namingModeSearchMovieTemplate", value: new String(this.form.namingModeSearchMovieTemplate.value), owner: owner });
        checkData({ name: "timerDefaultVDRuuid", value: $(form.timerDefaultVDRuuid).val() || '', owner: owner });
        checkData({ name: "constabelLoginPath", value: $(form.constabelLoginPath).val() || '', owner: owner });
        checkData({ name: "chFormat", value: $(form.chFormat).val() || '', owner: owner });
        checkData({ name: "searchAdv", value: $(form.searchAdv).prop('checked') ? "1" : "0", owner: owner });
        checkData({ name: "messageMailTypes", value: $(form.messageMailTypes).map(function () { return this.checked ? this.value : "" }).toArray().join(''), owner: owner });
        checkData({ name: "mailReceiver", value: $(form.mailReceiver).val() || '', owner: owner });
        checkData({ name: "magazinePan", value: $(form.magazinePan).val() || '', owner: owner });
        checkData({ name: "magazinePanDelay", value: $(form.magazinePanDelay).val() || '', owner: owner });
        checkData({ name: "maxListEntries", value: $(form.maxListEntries).val() || '', owner: owner });
        checkData({ name: "recordSubFolderSort", value: $(form.recordSubFolderSort).val() || '1', owner: owner });

        panel = $('#pSystem').parent().parent()[0];
        if (panel && panel.hasLoaded) {
            checkData({ name: "needLogin", value: $(form.needLogin).prop('checked') ? "1" : "0", owner: "webif" });
            $('#pSystem input').each(function () {
                if (this.type == 'checkbox') {
                    if (this.checked != (this.getAttribute('data-value') == "1"))
                        data.push({ name: this.id, value: (this.checked ? "1" : "0"), owner: "epgd", valexp: this.getAttribute('data-valexp')});
                } else if (this.getAttribute('data-value') != this.value) {
                    if (epgd.pages.profile.validate.checkRegex(this))
                        data.push({ name: this.id, value: this.value, owner: "epgd" });
                    else{
                        data = [];
                        return false;
                    }
                }
            });
        }
       if (data.length) {
            if (panel) panel.hasLoaded = false;
            panel = $("#page_profile").accordion("option", "active");
            $("#page_profile").accordion("option", "active", false).accordion("option", "active", panel);
            epgd.ajax({
                url: epgd.login.url + 'data/save-parameters',
                type: 'post',
                data: JSON.stringify({ "parameters": data })
            }, function (res) {
                res = res.result;
                if (res && res.state == 200)
                    epgd.utils.topInfo(epgd.tr.dataSaved);
                else
                    epgd.utils.topInfo(res.message, { isError: 1 });
                epgd.profile_load();
            }, function (jqxhr) {
                try {
                    var msg = '';
                    $(jqxhr.responseJSON.result.failed).each(function () {
                        msg += '<li>' + form[data[this].name].parentNode.previousSibling.innerHTML + '</li>';
                    });
                    if (msg) {
                        epgd.utils.popup('<ol>' + msg + '</ol>', { title: epgd.tr.error.invalid });
                        return true;
                    }
                } catch (e) { }
                return false;
            });
        }
    },
    validate: {
        quickTimes: function (input) {
            input.value = input.value.replace(/\n{2,}/g, '\n').replace(/^\n+|\n+$/g, '');
            if (!/^(\n?[^=]+=!?(([0-1]?[0-9]|2[0-4]):[0-5]?[0-9]|@Now|@Next|@[A-Za-z0-9]*))*$/.test(input.value)) {
                input.focus();
                epgd.utils.popup(epgd.tr.error.invalid);
                return false;
            }
            return true;
        },
        checkRegex: function (input) {
            if (input.getAttribute('data-valexp') && !new RegExp(input.getAttribute('data-valexp')).test(input.value)) {
                input.focus();
                epgd.utils.popup(epgd.tr.error.invalid);
                return false;
            }
            return true;
        }
    }
};
