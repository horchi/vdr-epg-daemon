// Timer Dialoge - Basis Klasse
epgd.timerDialogBase = function (options) {
    this.$win = null;
    this.list = null;
    if ( options )
        this.options= $.extend({}, this.options, options);
}
epgd.timerDialogBase.prototype = {
    options: {
        id: "baseDialog",
        modal: true,
        draggable: true,
        resizable: true,
        autoOpen: false,
        width: 'auto',
        maxHeight: $(window).height(),
        close: function () {
            this.list.dialog.form.reset();
            $(this.list.dialog.form).next().remove();
            //allFields.removeClass("ui-state-error");
        },
        buttons: [{
            text: epgd.tr.del,
            icons: { primary: "ui-icon-trash" },
            id: 'tBDel',
            click: function () {
                $(this).dialog("close");
                this.list.del(this.list.dialog.form.tID.value);
            }
        }, {
            text: epgd.tr.cancel,
            icons: { primary: "ui-icon-close" },
            click: function () {
                $(this).dialog("close");
            }
        }, {
            text: epgd.tr.save,
            icons: { primary: "ui-icon-disk" },
            click: function () { this.list.dialog.save() }
        }]
    },
    save: function (data, url, failFunc, succFunc) {
        this.list.save(data || this.getData(), url, failFunc, succFunc) && !this.options.embed && this.$win.dialog("close");
    },
    showError: function (msg, field) {
        epgd.utils.popup((field && field.id ? '<b>' + $('label[for="' + field.id + '"]').text() + '</b>' : '') + '<div>' + msg + '</div>', { autoClose: 3000 });
        field && field.focus();
        return false;
    },
    loadFolder: function () {
        var dialog = this;
        epgd.ajax({ url: epgd.login.url + "data/recordingdirs" }, function (data) {
            if (data.recordingdirs.length) {
                var folder = [],
                    vdrs = epgd.vdrs.list,
                    vdr;
                $.each(data.recordingdirs, function (id, f) {
                    vdr = vdrs[f.vdruuid];
                    folder.push({ value: f.directory, category: vdr ? vdr.name : '-' });
                });
                $(dialog.form.tFolder).catcomplete("option", "source", folder);
            }
        });
    },
    close: function () {
        if (this.$win)
            this.$win.dialog("close");
    },
    create: function () {
        var o = this.options,
            tr = epgd.tr.pages.timerList,
            week = '',
            i;
        for (i = 1; i < epgd.tr.dateTimePicker.dayNamesShort.length; i++)
            week += '<input name="tWeek" type="checkbox" />' + epgd.tr.dateTimePicker.dayNamesShort[i];
        week += '<input name="tWeek" type="checkbox" />' + epgd.tr.dateTimePicker.dayNamesShort[0];
        this.$win = $('<div id="' + o.id + '" class="searchDialog"><form>'
         + '<div class="colBlock">'
            + '<div><label>&nbsp;</label><select id="tType"><option value="R">' + epgd.tr.pages.eventDetail.record + '</option><option value="V">' + epgd.tr.pages.eventDetail.ch_switch + '</option></select></div>'
            + '<div><label for="tSName">' + epgd.tr.pages.search.searchName + '</label><input type="text" id="tSName" /></div>'
            +'<div><label for="tInactive">' + tr.inactive + '</label><input type="checkbox" id="tInactive" /></div>'
         + '</div><div class="ui-corner-all week">' + week + '</div>'
         + '<div class="onlyTypeR"><label for="tNameMode">' + tr.namingMode + epgd.pages.help.getIcon('sTNameMode') + '</label><br /><select id="tNameMode"><option>' + tr.namingModes.join('</option><option>') + '</option></select></div>'
         + '<div class="onlyTypeR"><label for="tTemplate">' + tr.template + '</label><input class="full" id="tTemplate" type="text" value="" /></div>'
         + '<div class="onlyTypeR"><label for="tFolder">' + tr.folder + '</label><input class="full" type="text" id="tFolder" /></div>'
         + '<div class="colBlock">'
             + '<div class="noTypeS"><label for="tVdr">VDR</label><select id="tVdr"><option value="">Auto</option>' + $('#menu_vdrs').find('select').html() + '</select></div>'
             + '<div class="onlyTypeR"><label for="tPrio">' + tr.prio + '</label><input  type="number" placeholder="..." min="0" max="99" id="tPrio" style="width:40px" /></div>'
             + '<div class="onlyTypeR"><label for="tLife">' + tr.lifetime + '</label><input type="number" placeholder="..." min="0" max="99" style="width:40px" id="tLife"/></div>'
             + '<div class="onlyTypeR"><label for="tVPS">' + 'VPS' + '</label><input type="checkbox" id="tVPS" /></div>'
         + '</div>'
         + '<input type="hidden" id="tID" /><br clear="all" />'
         + '</form></div>');//.dialog(o);//.dialog("option", "buttons", o.buttons);
        !o.embed && this.$win.appendTo(document.body).dialog(o);
        this.$win[0].list = this.list;
        this.form = this.$win.find('form')[0];
        $(this.form.tFolder).catcomplete({
            minLength: 0,
            maxHeight: 300
        }).focus(function () {
            $(this).catcomplete("search", "");
        });
        $(this.form.tType).change(function () {
            if (this.selectedIndex < 0)
                this.selectedIndex = 0;
            this.form.className = this.form.className.replace(/ ?type./, '') + ' type' + this[this.selectedIndex].value;
            //        $('.onlyTypeR', this.form).toggle(this[this.selectedIndex].value == 'R');
            //        $('#tSName').parent().toggle(this[this.selectedIndex].value == 'S');
            //        $('#tRepeat,#tChFormat').parent().toggle(this[this.selectedIndex].value != 'S');
        });
        $(this.form.tNameMode).change(function () {
            this.form.tTemplate.parentNode.style.display = (this.selectedIndex == 6) ? 'block': 'none';
        });
        epgd.utils.addPlaceholders(this.form.tTemplate, '%', tr.templateFields);
        this.loadFolder();
    },
    render : function (t) {
        t = t || {};
        if (!this.$win)
            this.create();
        !this.options.embed && this.$win.dialog('open').dialog('moveToTop');
        var form = this.form,
            d, i;
        form.tSName.focus();
        if (t.id) {
            form.tID.value = t.id;
            this.$win.parent().find('#tBDel').show();
            this.$win.parent().find('#tBToggle').hide();
        } else {
            form.tID.value = '';
            this.$win.parent().find('#tBDel').hide();
            this.$win.parent().find('#tBToggle').show();
        }
        $(form.tType).val(t.type || 'R').change();
        $(form.tVdr).val(t.vdruuid || epgd.profile.timerDefaultVDRuuid);
        d = t.weekdays || 0;
        for (i = 0, f = 1; i < form.tWeek.length; i++, f *= 2)
            form.tWeek[i].checked = (d & f);
        form.tPrio.value = t.priority || '';
        form.tLife.value = t.lifetime || '';
        form.tVPS.checked = t.vps == 1;
        form.tInactive.checked = t.active === 0;
        form.tFolder.value = t.directory || '';
        form.tSName.value = t.name || '';
        epgd.pages.help.initButtons(this.$win);
        this.resize();
    },
    resize: function () {
        /*var dlgOpt = this.$win.dialog("instance").options;
        dlgOpt.position.my = "center top";
        dlgOpt.position.at = "center top"; */
        this.$win.dialog("option", "maxHeight", $(window).height());
    }
 };

// Timerdialog - Klasse
epgd.timerDialog = epgd.utils.inherits(function () {
    epgd.timerDialogBase.call(this,{
        id: 'timerDialog',
        title: epgd.tr.pages.timer.timerList + ' ' + epgd.tr.edit,
        buttons: [{
            text: epgd.tr.pages.timer.searchTimerList,
            icons: { primary: "ui-icon-transferthick-e-w" },
            id: "tBToggle",
            click: function () {
                var t = this.list.dialog.getData(true);
                if (t) {
                    $(this).dialog("close");
                    //t.channelid && (t.channelids = t.channelid);
                    if (t.title) {
                        t.expression = t.title;
                        t.searchfields = 1;
                    }
                    epgd.pages.searchTimerList.dialog.render(t);
                }
            }
        }].concat(epgd.timerDialog.base.options.buttons)
    });
}, epgd.timerDialogBase);
epgd.timerDialog.prototype.create = function () {
    epgd.timerDialog.base.create.call(this);

    var tr = epgd.tr.pages.timerList,
        form = this.form;

    $(form).prepend('<input type="hidden" id="tEvID" /><div id="tTitle"></div>');
    $(form.tWeek[0]).parent().before('<div><label for="tStart">' + tr.recordTime + '</label>'
        + '<br /><span id="tEvTime"></span>&nbsp;<input type="text" id="tStart" style="width:165px" /> - <input type="text" id="tEnd" style="width:40px" /></div>');
    $(form.tNameMode).after('&nbsp;<span id="tFile"></span>');
    $(form.tFolder).parent().after('<div><label for="tChannels">' + epgd.tr.channel
        + '</label><input id="tChannel" type="text" class="full"/></div>');
    $(this.form.tStart).datetimepicker({
        minDateTime: epgd.utils.now(),
    });
    $(this.form.tEnd).timepicker({
        //        minDateTime: epgd.utils.now()
    });
    epgd.utils.addAutoComplete(form.tChannel, { source: epgd.channels.autoCompleteData });
    form.tFile = $(form).find('#tFile')[0];
    form.tEvTime = $(form).find('#tEvTime')[0];
    form.tTitle = $(form).find('#tTitle').click(function () {
        if (form.tEvID.value) {
            epgd.utils.loader.process(function () {
                new epgd.eventDetail(form.tEvID.value).render();
            });
        }
    })[0];
};
epgd.timerDialog.prototype.render = function (t) {
    t = t || {};
    epgd.timerDialog.base.render.call(this, t);
    var form = this.form,
        d;

    form.tFile.innerHTML = t.file || '...';
    form.tEvID.value = t.eventid || '';
    epgd.utils.setAutoCompleteValues(form.tChannel, t.channelid ? [t.channelid] : null);
    form.tTitle.innerHTML = t.title || '';
    form.tEvTime.innerHTML = t.evStartTime ? epgd.utils.formatDateTime(t.evStartTime) + ' - ' + epgd.utils.formatTime(t.evStartTime + t.evDuration) : '';

    $([form.tStart, form.tEnd]).datetimepicker("option", "disabled", !!t.eventid);
    if (t.day || !t.evStartTime) {
        if (t.starttime)
            d = epgd.utils.date((t.day + parseInt(t.starttime / 100, 10) * 60 * 60 + (t.starttime % 100) * 60));
        else if (t.day)
            d = epgd.utils.date(t.day);
        else
            d = epgd.utils.now();
        $(form.tStart).datetimepicker('setDate', d);
        $(form.tStart).datetimepicker('setTime', d);
        if (t.endtime)
            d = epgd.utils.date((t.day + parseInt(t.endtime / 100, 10) * 60 * 60 + (t.endtime % 100) * 60));
        else
            d = new Date(d.getTime() + 2 * 60 * 60000);
        $(form.tEnd).datetimepicker('setTime', d);
    } else {
        $([form.tStart, form.tEnd]).val('...');
    }
    //form.tNameMode.defaultIndex = parseInt(t.category == 'Serie' ? epgd.profile.namingModeSerie : epgd.profile.namingModeMovie, 10);
    form.tNameMode.selectedIndex = typeof t.namingmode == "undefined" ? parseInt(t.category == 'Serie' ? epgd.profile.namingModeSerie : epgd.profile.namingModeMovie, 10) : t.namingmode;
    form.tTemplate.value = t.template || (t.category == 'Serie' ? epgd.profile.namingModeSerieTemplate : epgd.profile.namingModeMovieTemplate);
    $(form.tNameMode).change();
};
epgd.timerDialog.prototype.getData = function (dontValid) {
    var form = this.form,
        d, i,
        data = {};
    if (form.tEvID.value) data.eventid = parseInt(form.tEvID.value, 10);
    data.active = form.tInactive.checked ? 0 : 1;
    if (form.tID.value) data.id = parseInt(form.tID.value, 10);
    if (form.tStart.value && form.tStart.value != '...') {
        d = $(form.tStart).datepicker('getDate');
        data.starttime = d.getHours() * 100 + d.getMinutes();
        d.setHours(0);
        d.setMinutes(0);
        data.day = parseInt(d.getTime() / 1000, 10);
        data.endtime = parseInt(form.tEnd.value.replace(':', ''), 10);
    } else if (!data.eventid && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", epgd.tr.pages.timerList.recordTime), form.tStart);
    data.weekdays = 0;
    for (i = 0, f = 1; i < form.tWeek.length; i++, f *= 2)
        if (form.tWeek[i].checked)
            data.weekdays += f;
    data.vps = form.tVPS.checked ? 1 : 0;
    if (form.tPrio.value) data.priority = parseInt(form.tPrio.value, 10);
    if (form.tLife.value) data.lifetime = parseInt(form.tLife.value, 10);
    //if (form.t) data.childlock = form.t;
    data.channelid = epgd.utils.getAutoCompleteValues(form.tChannel);
    if (!data.channelid && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", epgd.tr.channel), form.tChannel);
    /*data.file = form.tFile.value;
    if (form.tFolder.value)
        data.file = form.tFolder.value + '~' + data.file;
        */
    d = $(form.tVdr).val();
    if (d) data.vdruuid = d;
    //if (!dontValid || form.tNameMode.defaultIndex != form.tNameMode.selectedIndex)
    data.namingmode = form.tNameMode.selectedIndex;
    data.template = form.tTemplate.value;
    data.type = $(form.tType).val();
    if (data.type == 'V' && !d && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", "VDR"), form.tVdr);
    data.directory = form.tFolder.value;
    data.title = form.tTitle.innerHTML || '';
    data.name = form.tSName.value;
    return data;
}
// Suchtimerdialog - Klasse
epgd.searchTimerDialog = epgd.utils.inherits(function (options) {
    this.searchResultList = null;
    epgd.timerDialogBase.call(this,$.extend({},{
        id: 'searchTimerDialog',
        width: 530,
        title: epgd.tr.pages.timer.searchTimerList + ' ' + epgd.tr.edit,
        buttons: [{
            text: epgd.tr.pages.timer.timerList,
            icons: { primary: "ui-icon-transferthick-e-w" },
            id: "tBToggle",
            click: function () {
                var t = this.list.dialog.getData(true);
                if (t) {
                    $(this).dialog("close");
                    t.channelids && (t.channelid = t.channelids.split(',')[0]);
                    t.expression && (t.title = t.expression);
                    epgd.pages.timerList.dialog.render(t);
                }
            }
        }, {
            text: epgd.tr.test,
            click: function () {
                this.list.dialog.search();
            }
        }].concat(epgd.searchTimerDialog.base.options.buttons, {
            text: epgd.tr.copy,
            icons: { primary: "ui-icon-copy" },
            id: "tBCopy",
            click: function (ev) {
                $(ev.currentTarget).hide();
                this.list.dialog.form.tID.value = '';
                this.list.dialog.form.tSName.value += ' copy';
                this.list.dialog.form.tSName.select();
            }
        })
    },options));
}, epgd.timerDialogBase);
epgd.searchTimerDialog.prototype.search = function ($con, searchData) {
    if (!this.searchResultList)
        this.searchResultList = new epgd.searchResultList(null);//,this);
    if (!this.searchResultList.$con || ($con && $con[0] != this.searchResultList.$con[0]))
        this.searchResultList.render($con || ($('<div style="border-top:1px solid #ccc"></div>').insertAfter(this.form)));
    else
        this.searchResultList.$con.find('tbody').empty();
    if (!this.searchResultList.$con.parent().length) {
        this.searchResultList.$con.insertAfter(this.form);
        this.searchResultList.init();
    }
    this.searchResultList.update(searchData || this.getData());
    this.searchResultList.$con[0].scrollIntoView(true);
}
epgd.searchTimerDialog.prototype.create = function () {
    epgd.searchTimerDialog.base.create.call(this);

    var tr = epgd.tr.pages.timerList,
        trS = epgd.tr.pages.search,
        sModes = '',
        form = this.form,
        key;

    for (key in trS.searchModes)
        sModes += '<option value="' + (parseInt(key, 10) + 1) + '">' + trS.searchModes[key] + '</option>';
    if (!epgd.categories) {
        epgd.categories = [];
        epgd.ajax({ url: 'data/categories', async: false }, function (data) { epgd.categories = data.categories; });
    }
    if (!epgd.genres) {
        epgd.genres = [];
        epgd.ajax({ url: 'data/genres', async: false }, function (data) { epgd.genres = data.genres; });
    }

    $(form.tSName).parent().parent().after('<div><label for="tExpr">' + trS.searchExpression + epgd.pages.help.getIcon('sExpr') + '</label> <input type="text" id="tExpr" style="width:300px" /></div>'
        + '<div class="full"><select id="tSMode" style="width:auto">' + sModes + '</select>'
        + '&nbsp;&nbsp;<input type="checkbox" id="tCaseSens" />&nbsp;<label for="tCaseSens">'
        + trS.caseSensitive + '</label></div>'
        + '<div class="ui-corner-all week">' + [""].concat(trS.searchFields).join('<input type="checkbox" name="tSFields" />') + '</div>'
        + '<div><label for="tAdv"><input type="checkbox" id="tAdv" />&nbsp;' + epgd.tr.advanced + epgd.pages.help.getIcon('sTAdv') + '</label><div class="ui-corner-all week">'
            + '<span>' + tr.episode + '</span><input type="text" id="tSFEpisode" style="width:200px" /> '
            + '<span>' + epgd.tr.pages.eventDetail.season + '</span><input type="text" id="tSFSeason" style="width:40px" /> '
            + '<span>' + epgd.tr.pages.eventDetail.part + '</span><input type="text" id="tSFSPart" style="width:40px" /> '
            + '<br /><span>' + epgd.tr.pages.eventDetail.category + '</span><input type="text" id="tSFCat"  style="width:300px" /> '
            + '<br /><span>' + epgd.tr.pages.eventDetail.genre + '</span><input type="text" id="tSFGenre" style="width:300px" /> '
            + '<br /><input type="checkbox" name="tSFTip" value="GoldTipp" />GoldTipp<input type="checkbox" name="tSFTip" value="TagesTipp" />TagesTipp<input type="checkbox" name="tSFTip" value="TopTipp" />TopTipp'
            + '<br /><span>' + epgd.tr.pages.eventDetail.year + '</span><input type="text" id="tSFYear" style="width:70px" />'
            + '<br /><input type="checkbox" id="tSFNoEpgMatch" />' + tr.noEpgMatch
        + '</div></div>'
        + '<div class="noTypeS"><div><label for="tRepeat"><input type="checkbox" id="tRepeat" />&nbsp;'
            + tr.noRepeat + epgd.pages.help.getIcon('sTRepeat') + '</label><div class="ui-corner-all week">' + [""].concat(trS.searchFields).join('<input type="checkbox" name="tRFields" />') + '</div></div></div>'
        + '<div><input type="radio" name="tChExclude" value="1" id="tChExclude0" /><label for="tChInclude">' + tr.chInclude
            + '</label>' + epgd.pages.help.getIcon('sTChannels') + '<input type="radio" name="tChExclude" value="0" id="tChExclude1" /><label for="tChExclude">' + tr.chExclude
            + '</label></div><input type="text" id="tChannels" class="full"/>'
        + '<div class="noTypeS"><label for="tChFormat">' + tr.chFormat + epgd.pages.help.getIcon('sTChFormat') + '</label><input id="tChFormat" readonly onclick="epgd.timerEditChFormat(this)" /></div>'
        + '<div><label for="tTime"><input type="checkbox" id="tTime" />&nbsp;' + epgd.tr.dateTimePicker.timeText + epgd.pages.help.getIcon('sTime') + '</label></div>');
    $(form.tWeek[0]).before('<span>' + epgd.tr.dateTimePicker.timeTextBetween + ' <input type="text" id="tStart" style="width:40px" /> - <input type="text" id="tEnd" style="width:40px" /></span>')
        .parent().append('<br /><span class="onlyTypeS">' + tr.nextDays.replace('$field$','<input style="width:40px" type="text" id="tNextDays" />') + '</span>').insertAfter(form.tTime.parentNode);
    $([form.tStart,form.tEnd]).timepicker({
        alwaysSetTime: false
    });
    $([form.tTime, form.tRepeat, form.tAdv]).change(function () {
        $(this).parent().next().toggle(this.checked);
    });
    $([form.tSFSeason, form.tSFSPart, form.tSFYear]).change(function () {
        this.value = this.value.replace(/[^0-9-]/g, '');
        if (this.value.length == 1 && this.value == '-')
            this.value = '';
    });
    $(form.tType).append('<option value="S">' + epgd.tr.menu.search + '</option>');
    epgd.utils.addAutoComplete(form.tChannels, { source: epgd.channels.autoCompleteData, multiselect: true });
    epgd.utils.addAutoComplete(form.tSFCat, { source: epgd.categories, multiselect: true });
    epgd.utils.addAutoComplete(form.tSFGenre, { source: epgd.genres, multiselect: true });
};
epgd.searchTimerDialog.prototype.render = function (t) {
    t = t || { searchfields: 1 };
    epgd.searchTimerDialog.base.render.call(this, t);
    var form = this.form,
        d, i;
    form.tExpr.value = t.expression || '';
    $(form.tSMode).val(t.searchmode || 4);
    form.tCaseSens.checked = t.casesensitiv == 1;
    d = t.searchfields || 0;
    for (i = 0, f = 1; i < form.tSFields.length; i++, f *= 2)
        form.tSFields[i].checked = (d & f);
    if (t.starttime || t.endtime || t.weekdays || t.nextdays) {
        form.tTime.checked = true;
        t.starttime ? $(form.tStart).datetimepicker('setTime', new Date(0, 0, 0, parseInt(t.starttime / 100, 10), (t.starttime % 100))) : form.tStart.value = '';
        t.endtime ? $(form.tEnd).datetimepicker('setTime', new Date(0, 0, 0, parseInt(t.endtime / 100, 10), (t.endtime % 100))) : form.tEnd.value;
        form.tNextDays.value = t.nextdays || '';
    } else
        form.tTime.checked = false;
    $(form.tTime).change();
    d = t.repeatfields || 0;
    for (i = 0, f = 1; i < form.tRFields.length; i++, f *= 2)
        form.tRFields[i].checked = (d & f);
    form.tRepeat.checked = d > 0;
    $(form.tRepeat).change();

    form.tSFEpisode.value = t.episodename || '';
    form.tSFSeason.value = t.season || '';
    form.tSFSPart.value = t.seasonpart || '';
    form.tSFYear.value = t.year || '';

    epgd.utils.setAutoCompleteValues(form.tSFCat, new String(t.category).replace(/'/g, '').split(','));
    epgd.utils.setAutoCompleteValues(form.tSFGenre, new String(t.genre).replace(/'/g, '').split(','));
    d = t.tipp || '';
    for (i = 0; i < form.tSFTip.length; i++)
        form.tSFTip[i].checked = d.indexOf("'" + form.tSFTip[i].value + "'") >= 0;
    form.tSFNoEpgMatch.checked = t.noepgmatch == 1;

    form.tAdv.checked = t.episodename || t.season || t.seasonpart || t.year || t.category || t.genre || t.tipp || t.noepgmatch;
    $(form.tAdv).change();
    epgd.utils.setAutoCompleteValues(form.tChannels, new String(t.channelids).split(','));

    if (t.chexclude)
        form.tChExclude1.checked = 1;
    else
        form.tChExclude0.checked = 1;
    form.tChFormat.value = t.chformat || (t.id ? '' : epgd.profile.chFormat);
    form.tNameMode.defaultIndex = parseInt(t.category == 'Serie' ? epgd.profile.namingModeSearchSerie : epgd.profile.namingModeSearchMovie, 10);
    form.tNameMode.selectedIndex =  typeof t.namingmode == "undefined" ? form.tNameMode.defaultIndex : t.namingmode;
    form.tTemplate.value = typeof t.template == "undefined" ? (t.category == 'Serie' ? epgd.profile.namingModeSearchSerieTemplate : epgd.profile.namingModeSearchMovieTemplate) : t.template;
    $(form.tNameMode).change();
    this.$win.parent().find('#tBCopy').toggle(!!t.id);
};
epgd.searchTimerDialog.prototype.getData = function (dontValid) {
    var form = this.form,
        d, i,
        data = { expression: form.tExpr.value };
    if (form.tSFSeason.value) data.season = form.tSFSeason.value;
    if (form.tSFSPart.value) data.seasonpart = form.tSFSPart.value;
    if (form.tSFYear.value) data.year = form.tSFYear.value;
    if (!dontValid) {
        if (!data.expression)
            return this.showError(epgd.tr.error.emptyField.replace("$field$", epgd.tr.pages.search.searchExpression), form.tExpr);
        if (data.season && !/^[0-9]{0,3}-?[0-9]{0,3}$/.test(data.season))
            return this.showError(epgd.tr.error.invalid, form.tSFSeason);
        if (data.seasonpart && !/^[0-9]{0,3}-?[0-9]{0,3}$/.test(data.seasonpart))
            return this.showError(epgd.tr.error.invalid, form.tSFSPart);
        if (data.year && !/^((19|20)[0-9]{2})?(-|-(19|20)[0-9]{2})?$/.test(data.year))
            return this.showError(epgd.tr.error.invalid, form.tSFYear);
    }
    if (form.tID.value) data.id = parseInt(form.tID.value, 10);
    if (form.tSFEpisode.value) data.episodename = form.tSFEpisode.value;
    data.category = epgd.utils.getAutoCompleteValues(form.tSFCat, "'");
    data.genre = epgd.utils.getAutoCompleteValues(form.tSFGenre, "'");
    d = '';
    for (i = 0; i < form.tSFTip.length; i++)
        if (form.tSFTip[i].checked) d += ",'" + form.tSFTip[i].value + "'";
    data.tipp = d.slice(1);
    data.noepgmatch = form.tSFNoEpgMatch.checked ? 1 : 0;

    data.searchmode = parseInt($(form.tSMode).val(), 10);
    data.searchfields = 0;
    for (i = 0, f = 1; i < form.tSFields.length; i++, f *= 2)
        if (form.tSFields[i].checked)
            data.searchfields += f;
    data.casesensitiv = form.tCaseSens.checked ? 1 : 0;
    data.repeatfields = 0;
    if (form.tRepeat.checked) {
        for (i = 0, f = 1; i < form.tRFields.length; i++, f *= 2)
            if (form.tRFields[i].checked)
                data.repeatfields += f;
    }
    data.active = form.tInactive.checked ? 0 : 1;

    data.channelids = epgd.utils.getAutoCompleteValues(form.tChannels);
    data.chformat = form.tChFormat.value;
    data.chexclude = form.tChExclude1.checked ? 1 : 0;
    if (form.tTime.checked) {
        data.starttime = parseInt(form.tStart.value.replace(':', ''), 10);
        data.endtime = parseInt(form.tEnd.value.replace(':', ''), 10);
        data.weekdays = 0;
        for (i = 0, f = 1; i < form.tWeek.length; i++, f *= 2)
            if (form.tWeek[i].checked)
                data.weekdays += f;
    }
    data.vps = form.tVPS.checked ? 1 : 0;
    if (form.tPrio.value) data.priority = parseInt(form.tPrio.value, 10);
    if (form.tLife.value) data.lifetime = parseInt(form.tLife.value, 10);
    //if (form.t) data.childlock = form.t;
    data.directory = form.tFolder.value;
    d = $(form.tVdr).val();
    if (d) data.vdruuid = d;
    //if (!dontValid || form.tNameMode.defaultIndex != form.tNameMode.selectedIndex)
    data.namingmode = form.tNameMode.selectedIndex;
    data.template = form.tTemplate.value;
    data.type = $(form.tType).val();
    if (data.type == 'V' && !d && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", "VDR"), form.tVdr);
    data.name = form.tSName.value;
    if (form.tNextDays.value) data.nextdays = parseInt(form.tNextDays.value,10);
    return data;
}
epgd.searchTimerDialog.prototype.save = function (d, url, failFunc, succFunc) {
    d = d || this.getData();
    var self = this,
        id= d.id,
        name= d.name;
    d.max = 0;
    d.id && delete d.id;
    d.name && delete d.name;
    epgd.utils.loader.process(function () {
        epgd.ajax({
            url: epgd.login.url + "data/search",
            type: 'post',
            data: JSON.stringify(d)
        }, function (data) {
            d.id = id;
            d.name = name;
            if (data.count > 50) {
                epgd.utils.confirm(epgd.tr.pages.timerList.confirmSaveBigResult.replace('$cnt$', data.count), function (ok) {
                    ok && epgd.searchTimerDialog.base.save.call(self, d);
                });
            } else
                epgd.searchTimerDialog.base.save.call(self, d, url, failFunc, succFunc);
            epgd.utils.loader.close();
        });
    },true);
}
// Suche - Klasse
epgd.searchDialog = epgd.utils.inherits(function () {
    epgd.searchTimerDialog.call(this, {
        id: 'search',
        embed: true,
        buttons: null
    });
    this.searchResultList = new epgd.searchResultList({
        empty: epgd.tr.pages.search.empty
    }, this);
}, epgd.searchTimerDialog);
epgd.searchDialog.prototype.create = function () {
    epgd.searchDialog.base.create.call(this);
    var form = this.form,
        search= this,
        $result = $('<div id="searchResult"></div>').appendTo(this.$win);
    $('<button type="submit" id="sSearch" class="iAsButton i-search">' + epgd.tr.pages.search.search + '</button>')
        .insertAfter(form.tExpr)
        .after(' <input type="checkbox" id="sAdv" />&nbsp;<label for="sAdv">' + epgd.tr.advanced + '</label>');
    $(form.tType).parent().hide().parent().css('border-top','1px solid #ccc').insertAfter($(form.tVdr.parentNode.parentNode).hide());
    $('<input type="button" class="iAsButton" id="tCopy" value="' + epgd.tr.copy + '" />').insertAfter(form.tSName).click(function () {
        search.form.tID.value = '';
        search.form.tSName.value += ' copy';
        search.form.tSName.select();
    }).prop("disabled", true);
    $('<input type="button" class="iAsButton" id="tDel" value="' + epgd.tr.del + '" />').insertAfter(form.tSName).click(function () {
        search.list.del(this.form.tID.value, function () { search.form.tID.value = '';search.loadSavedSearch() });
    }).prop("disabled", true); $('<input type="button" class="iAsButton" value="' + epgd.tr.save + '" />').insertAfter(form.tSName).click(function () {
        var d = search.getData();
        if (!d.name)
            return this.showError(epgd.tr.error.invalid, form.tSName);
        search.save(d, null, null, function () { search.loadSavedSearch() });
    });
    $(form).submit(function () {
        search.search($result);
        return false;
    });
    this.$win.find('#sExpr').keyup(function (ev) { if (ev.keyCode == 13) { this.form.sSearch.click(); $(this).blur(); } }).focus();
    //$(form.tExpr).parent().next().nextAll().wrapAll('<div id="sAdvView"/>');
    this.$win.find('#sAdv').change(function () {
        $(form).toggleClass("noAdv", !this.checked);
        search.resize();
    }).prop('checked', epgd.profile.searchAdv == "1").change();
    $(form.tSName).autocomplete({
        minLength: 0,
        maxHeight: 300,
        source:function(){return false}, // damit bei einem focus kein error ausgel�st wird
        select: function (ev, ui) {
            var d = ui.item.data || { id: '' };
            if (d.id) {
                search.render(d);
                search.form.sSearch.click();
                $([form.tDel, form.tCopy, form.tInactive]).prop("disabled", false);
                return false;
            } else {
                form.tID.value = '';
                $([form.tDel, form.tCopy, form.tInactive]).prop("disabled", true);
            }
        }
    }).focus(function () {
        $(this).autocomplete("search", "");
    });
    this.loadSavedSearch();
}
epgd.searchDialog.prototype.loadSavedSearch = function () {
    var form = this.form;
    epgd.ajax({ url: epgd.login.url + "data/searchtimers?type=S" }, function (data) {
        var list = [];
        $.each(data.searchtimers, function (id, t) {
           list.push({ value: t.name || t.expression, label: t.name || t.expression, data: t });
        });
        $(form.tSName).autocomplete("option", "source", list);
    });
}
epgd.searchDialog.prototype.resize = function () {
    var $result = this.$win.find('#searchResult'),
        h = $(window).height() - $result.offset().top - 20;
    if (h < 100)
        $result.css({ 'height': 'auto', 'overflow-y': 'visible' });
    else
        $result.css({ 'height': h + 'px', 'overflow-y': 'auto' });
}
epgd.searchDialog.prototype.render = function (t) {
    if (!epgd.$con.find('#search').length) {
        $('#menu_search').addClass("menu-active");
        this.create();
        epgd.$con.html('');
        this.$win.appendTo(epgd.$con);
    }
    t = t || { searchfields: 1 };
    t.type = 'S';
    epgd.searchDialog.base.render.call(this, t);
}
epgd.searchDialog.prototype.close = function () { }
