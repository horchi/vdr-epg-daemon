epgd.sortTable = function (options) {
    this.o = $.extend({
        conSel: epgd.$con,
        empty: '',
        right: 1
    }, options);
}
epgd.sortTable.prototype = {
    sortIcons: '<span class="iAsButton i-sort-name-down sort"></span><span class="iAsButton i-sort-name-up sort"></span>',
    update: function () { },
    hideHead: function(){
        var $ths = this.$con.find('thead:first').hide().find('>tr>th');
        this.$con.find('tbody:first').html('<tr><td colspan="' + $ths.length + '">' + this.o.empty
            + ($ths.last().find('.i-doc-new').wrapAll('<div />').parent().html() || '') + '</td></tr>');
    },
    showHead: function(){
        this.$con.find('>table>thead').show();
        this.filter();
        this.sort();
    },
    getTable: function () { },
    action: function ($el, iconName, data) {
        switch (iconName) {
            case 'refresh':
                this.update();
                break;
            case 'detail':
                if (!$el[0].eventDetail)
                    $el[0].eventDetail = new epgd.eventDetail(data);
                epgd.utils.loader.process(function () {
                    $el[0].eventDetail.render();
                });
                break;
        }
    },
    render: function ($con, searchData) {
        this.trs = [];
        this.$con = $con || $(this.o.conSel);
        this.$con.empty();
        if (!(epgd.login.rights & this.o.right) == this.o.right) return epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
        this.$con.html(this.getTable());
        this.init();
        this.update(searchData);
    },
    init: function () {
        var list = this,
            cIndex = 0;
        this.$con.find('>table').click(function (ev) {
            var $el = $(ev.target),
                el = $el[0],
                data = el.getAttribute('data-evId'),
                d,
                $lastSel;
            if (data)
                list.action($el, 'detail', data);
            else if (ev.target.className == 'i-tv') {
                epgd.vdrs.current.switchChannel(ev.target.parentNode.id);
            } else {
                //if (!searchData || searchData.fromEventDetail != true)
                //    $(window).trigger("epgd_close.eventDetail");
                $el = $el.closest('span.sort');
                if ($el.length) {
                    $el.parent().parent().find('.ui-state-highlight').removeClass('ui-state-highlight');
                    $el.addClass("ui-state-highlight");
                    list.sort($el);
                } else {
                    $el = $(el).closest('span.edit');
                    if ($el.length) {
                        list.action($el, $el[0].className.match(/i-([a-z0-9-]+)/)[1]);
                    } if (list.o.selectable) {
                        if (el.nodeName == 'TD') {
                            $el = $(el).parent().toggleClass('selected');
                            if (ev.shiftKey && this.lastSel) {
                                $lastSel = $(this.lastSel);
                                d = $el.index() - $lastSel.index();
                                if (d > 0)
                                    $lastSel.nextAll(':lt(' + d + '):visible').toggleClass('selected', $lastSel.hasClass('selected'));
                                else
                                    $lastSel.prevAll(':lt(' + -d + '):visible').toggleClass('selected', $lastSel.hasClass('selected'));
                            }
                            else
                                this.lastSel = $el[0];
                        } else if (el.nodeName == 'B') {
                            d = el.getAttribute('data-t');
                            $(list.trs).filter(":visible").toggleClass('selected', d == 1 ? true : d == 0 ? false : undefined);
                            return false;
                        }
                    }
                }
                return false;
            }
        }).find('>thead>tr').find('>th').each(function () {
            this.cIndex = cIndex;
            cIndex += this.colSpan;
        }).end().find('[data-defaultSort="1"]>span.sort:last,[data-defaultSort="-1"]>span.sort:first').addClass('ui-state-highlight');
        this.$con.find('>table>thead input.filter').keyup(function () {
            list.filter();
        }).each(function () {
            if (!this.result)
                this.result = $('<i style="padding-left:5px;font-weight:normal"></i>').insertAfter(this)[0];
        });
    },
    sort: function ($el) {
        $el = $el || this.$con.find('>table>thead .ui-state-highlight');
        if (!$el.length) return;
        var i = $el.parent()[0],
            d = ($el.hasClass('i-sort-name-down') ? -1 : 1),
            trs = this.trs,
                l,td;
        if (!i.sortInfo) {
            i = i.cIndex;
            for (l = 0; l < trs.length; l++) {
                td = trs[l].cells[i];
                td.sort = td.getAttribute('data-sort') || $(td).text().toLowerCase();
            };
        } else
            i = i.cIndex;
        trs.sort(function (a, b) {
            var va = a.cells[i].sort,
                vb = b.cells[i].sort;
            return (va > vb ? 1 * d : va == vb ? 0 : -1 * d);
        });
        this.$con.find('>table>tbody').append(trs.slice());
    },
    filter: function(){
        var cells = {},
            l, i,
            tr, hide;
        this.$con.find('>table>thead input.filter').each(function () {
            if (this.value)
                cells[this.parentNode.cIndex] = [this.value.toLowerCase(),0,this.result || {}];
            else if (this.result)
                this.result.innerHTML= '';
        });
        for (l = 0; l < this.trs.length; l++) {
            tr = this.trs[l];
            hide = '';
            for (i in cells) {
                if (tr.cells[i].innerHTML.toLowerCase().indexOf(cells[i][0]) == -1) 
                    hide = 'none';
                else
                    cells[i][1]++;
            }
            tr.style.display = hide;
        };
        for (i in cells)
            if (cells[i][2].innerHTML = cells[i][1]);
    }
}

epgd.timerEditChFormat = function (input) {
    var formats = ',SD,HD,3D',
		values = input.value,
        i;
    if (values) {
        values = values.split(',');
        for (i = 0; i < values.length; i++)
            formats = formats.replace(',' + values[i] + ',', ',');
    }
    $('<div title="' + epgd.tr.pages.timerList.chFormat + '"><ol style="float:left; border:2px inset #ddd; min-height:50px; margin-right:20px;">'
		+ (values.length ? '<li>' + values.join('</li><li>') + '</li>' : '')
		+ '</ol><ul style="float:left; border:2px inset #ddd; min-height:50px;list-style-type:none">'
		+ (formats.length > 1 ? '<li>' + formats.slice(1).replace(/,/g, '</li><li>') + '</li>' : '') + '</div>')
		.dialog({
		    modal: true,
		    buttons: [{
		        text: epgd.tr.apply,
		        click: function () {
		            var val = '';
		            $(this).find('ol > li').each(function () { val += ',' + this.innerHTML; });
		            input.value = val.slice(1);
		            $(this).dialog("close");
		        }
		    }, {
		        text: epgd.tr.cancel,
		        click: function () {
		            $(this).dialog("close");
		        }
		    }]
		}).find('ul,ol').sortable({
		    connectWith: "ul,ol"
		}).disableSelection();
};


// Timer Listen Base Klasse
epgd.timerListBase = epgd.utils.inherits(function (options, dialog) {
    this.dialog = dialog;
    if (this.dialog)
        this.dialog.list = this;
    if (!options.conSel) options.conSel = '#content';//'#tabCon';
    if (!options.empty) options.empty = epgd.tr.pages.timerList.empty;
    epgd.sortTable.call(this,options);
}, epgd.sortTable);                  
epgd.timerListBase.prototype.getTable = function () {
    var tr = epgd.tr.pages.timerList;
    return '<table id="timerList" class="timerTable"><thead><tr><th style="min-width:120px">' + epgd.tr.channel + this.sortIcons
        + '</th><th></th><th data-defaultSort="1" colspan="2">' + tr.startTime + this.sortIcons + ' <input type="text" class="filter" style="width:50px" /></th><th>'
        + tr.endTime + '</th><th style="min-width:120px">' + epgd.tr.pages.eventDetail.title + this.sortIcons
        + ' <input type="text" class="filter" style="width:100px" /></th><th style="min-width:120px">VDR' + this.sortIcons
        + ' <input type="text" class="filter" style="width:50px" /></th><th style="min-width:130px">' + this.sortIcons
        + (this.o.addNew ? '<span class="iAsButton i-doc-new edit" title="' + tr.newTimer + '"></span>'
        + '<span class="iAsButton i-refresh edit" title="' + epgd.tr.reload + '"></span>' : '')
        + (this.o.selectable ? '<br clear="all" /><span style="margin-top:3px" class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>'
           + '<div class="selMarkBlock" style="width:auto"><b title="' + epgd.tr.markAll + '" class="selected" data-t="1"></b><b title="' + epgd.tr.markNone
           + '" data-t="0"></b><b title="' + epgd.tr.markToggle + '"><b class="selected"></b></b></div>' : '')
        + '</th></tr></thead><tbody></tbody></table>';
}
epgd.timerListBase.prototype.update = function () {
    var timerList = this;
    epgd.utils.loader.process(function () {
        timerList.$con.find('tbody').empty();
        epgd.ajax({ url: epgd.login.url + timerList.o.updateUrl, async: false, cache: false }, function (data) {
            if (!data.timers.length) {
                timerList.hideHead();
            } else {
                var trs = [],
                    editIcons = timerList.editIcons,
                    noEditStates = 'DF',
                    stateIcons = {
                        'D': '<div class="i-trash">' + epgd.tr.pages.timerList.timerStates.D + '</div>',            // gelöscht
                        'E': '<div class="i-warning">' + epgd.tr.pages.timerList.timerStates.E + '</div>',          // Fehler
                        'F': '<div class="i-ok">' + epgd.tr.pages.timerList.timerStates.F + '</div>',               // Aufnahme erfolgreich
                        'R': '<div class="i-progress">' + epgd.tr.pages.timerList.timerStates.R + '</div>',         // nimmt gerade auf
                        'P': '<div class="i-clock">' + epgd.tr.pages.timerList.timerStates.P + '</div>',            // wartet auf Aufnhemebeginn
                        'U': '<div class="i-help">' + epgd.tr.pages.timerList.timerStates.U + '</div>'             // unbekannt
                    },
                    timerActions = epgd.tr.pages.timerList.timerActions,
                    searchTimerIcon = '<span class="iAsButton i-flashlight edit" title="' + epgd.tr.pages.timer.searchTimerList + ' ' + epgd.tr.edit + '" data-id="$id$">$title$</span>';
                $.each(data.timers, function (id, t) {
                    t.action = t.action ? t.action.toUpperCase() : 'A';
                    t.state = t.state ? t.state.toUpperCase() : 'U';
                    var vdr = epgd.vdrs.list[t.vdruuid] || { name: '--' },
                        //start = t.day ? t.day + parseInt(t.starttime / 100, 10) * 60 * 60 + (t.starttime % 100) * 60 : new String(100 + parseInt(t.endtime / 100, 10)).slice(1) + ':' + (t.endtime % 100),
    //                    searchTimer = t.aux && t.aux.match(/<epgd>.*<expression>([^<]+)<\/expression>/),
                        tr = $('<tr' + (t.active ? '' : ' class="ui-state-disabled"') + '><td>'
                        + epgd.channels.getHtml(t.channelid) + '</td><td>'
                        + (t.action != 'A'
                            ? '<div class="i-wait">' + timerActions[t.action] + '</div>'
                            : stateIcons[t.state]
                           ) + (t.info || '') + '</td>'
                        + '<td data-sort="' + new String(t.day) + new String(10000 + t.starttime).slice(1) + '">'
                        + (t.day ? epgd.utils.formatDate(t.day) : '-')
                        + '</td><td>'
                        + new String(100 + parseInt(t.starttime / 100, 10)).slice(1) + ':' + new String(100 + parseInt(t.starttime % 100, 10)).slice(1)
                        + '</td><td>'
                        + new String(100 + parseInt(t.endtime / 100, 10)).slice(1) + ':' + new String(100 + parseInt(t.endtime % 100, 10)).slice(1)
                        + '</td><td' + (t.eventid ? ' data-evId="' + t.eventid + '">' + (t.title || '') + '<br />' + (t.shorttext || '') : '>') + '</td><td>'
                        + vdr.name + '<br />' + (t.directory ? t.directory + '~' : '') + (t.file || '') + '</td><td>'
                        + (t.autotimerid ? searchTimerIcon.replace('$id$', t.autotimerid).replace('$title$', t.autotimername || t.expression || epgd.tr.pages.timer.searchTimerList) : '')
                         + (noEditStates.indexOf(t.state) == -1 ? editIcons : '') + '</td></tr>')[0];
                    tr.tData = t;
                    trs.push(tr);
                });
                timerList.trs = trs;
                timerList.showHead();
                /*timerList.$con.find('>table>tbody>tr').find('>td:eq(1)').tooltip({
                    items: "div", content: function () {
                        return this.innerHTML;
                    }
                })*/
            }
            epgd.utils.loader.close();
            $(window).trigger('timerlist_updated', timerList);
        });
    },true);
}
epgd.timerListBase.prototype.action = function ($el, iconName,data) {
    //this.dialog && this.dialog.close && this.dialog.close();
    var id;
    switch (iconName) {
        case 'edit':
        case 'doc-new':
            this.dialog.render($el.closest('tr')[0].tData);
            break;
        case 'trash':
            this.del(this.getSelectedIds($el));
            break;
        case 'flashlight':
            id = $el.attr('data-id'),
                list = this;
            $(window).one('searchTimerList_updated', function () {
                list.$con.find('tbody>tr').each(function () {
                    if (this.tData.id == id) {
                        epgd.pages.searchTimerList.dialog.render(this.tData);
                        return false;
                    }
                });
            });
            epgd.$menu.menu("select", { target: "#menu_searchTimerList" });
            break;
        default:
            epgd.sortTable.prototype.action.call(this,$el, iconName, data);
    }
};
epgd.timerListBase.prototype.editIcons = '<span class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span><span class="iAsButton i-edit edit" title="' + epgd.tr.edit + '"></span>';
epgd.timerListBase.prototype.getSelectedIds = function ($el) {
    var ids = [];
    if ($el[0].parentNode.nodeName == 'TH') {
        $(this.trs).filter(".selected:visible").each(function () {
            ids.push(this.tData.id);
        });
    } else
        ids.push($el.closest('tr')[0].tData.id);
    return ids;
}
epgd.timerListBase.prototype.del = function (ids, succFunc, arrayName) {
    var self = this,
        allIDs= $.isArray(ids) ? ids : [parseInt(ids,10)];
    ids && allIDs.length && epgd.utils.confirm(epgd.tr.confirmDelete + (allIDs.length > 1 ? '<br />' + allIDs.length + epgd.tr.entries : ''), function (ok) {
        ok && self.saveArray(allIDs, arrayName || "delete", succFunc);
    });
}
epgd.timerListBase.prototype.saveArray = function (ids, arrayName, succFunc) {
    var self = this,
        allIDs= $.isArray(ids) ? ids : [parseInt(ids,10)],
        data= {};
    data[arrayName] = allIDs;
    ids && allIDs.length && this.save(data, null, function (jqxhr) {
        try {
            var ids = ',';
            $(jqxhr.responseJSON.result.failed).each(function () {
                ids += allIDs[this] + ',';
            });
            if (ids.length > 1) {
                $(self.trs).each(function () {
                    if (ids.indexOf(',' + this.tData.id + ',') >= 0)
                        this.style.backgroundColor = 'red';
                });
            }
        } catch (e) { }
        return false;
    }, succFunc);
};
epgd.timerListBase.prototype.save = function (data, url, failFunc, succFunc) {
    if (!data) return false;
    var timerList = this;
    epgd.utils.loader.process(function () {
        epgd.ajax({
            url: epgd.login.url + (url || timerList.o.saveUrl),
            type: 'post',
            data: JSON.stringify(data)
        }, function (data) {
            data = data.result;
            if (data.state == 200)
                epgd.utils.topInfo(epgd.tr.dataSaved);
            else
                epgd.utils.topInfo(data.message, { isError: 1 });
            epgd.utils.loader.close();
            timerList.$con && timerList.$con.parent().length && timerList.update();
            succFunc && succFunc.call(timerList);
        }, failFunc);
    },true);
    return true;
}

// searchResult List - Klasse
epgd.searchResultList = epgd.utils.inherits(function (options, dialog) {
    epgd.timerListBase.call(this, $.extend({
        saveUrl: 'data/save-searchtimer'
    }, options),dialog);
}, epgd.timerListBase);
epgd.searchResultList.prototype.getTable = function () {
    var tr = epgd.tr.pages.timerList;
    return '<table id="searchResultList" class="timerTable"><thead><tr><th style="min-width:120px">' + epgd.tr.channel + this.sortIcons + '</th><th data-defaultSort="1" colspan="2">' + tr.startTime + this.sortIcons + '</th><th>'
     + tr.endTime + '</th><th>' + epgd.tr.pages.eventDetail.title + this.sortIcons + '</th><th></th></tr></thead><tbody></tbody></table>';
}
epgd.searchResultList.prototype.update = function (d) {
    if (!d)
        return false;
    var timerList = this;
    d.id && delete d.id;
    d.name && delete d.name;
    d.max = epgd.profile.maxListEntries;
    epgd.utils.loader.process(function () {
        timerList.$con.find('tbody').empty();
        epgd.ajax({
            url: epgd.login.url + "data/search",
            type: 'post',
            data: JSON.stringify(d)
        }, function (data) {
            var trs = [], i;
            if (!data.events || !data.events.length) {
                timerList.hideHead();
            } else {
                data.count > d.max && epgd.utils.popup('Achtung! Es wurden ' + data.count + ' Ergebnisse gefunden. Angezeigt werden aber nur ' + d.max + '.<br /> Das Nachladen ist noch nicht implementiert! Der Wert kann in den Einstellungen angepasst werden');
                $.each(data.events, function (id, e) {
                    var trClass = '',
                        icons = '',
                        d;
                    if (e.dones) {
                        for (i in e.dones) {
                            d = e.dones[i];
                            icons += '<span class="iAsButton" title="' + epgd.tr.pages.timerList.doneStates[d.state] + ' data-id=' + d.id + '">' + d.state + '</span>';
                            if (d.state == 'R')
                                trClass = ' class="ui-state-disabled"';
                        }
                    }
                    trs.push($('<tr' + trClass + '><td>'
                        + epgd.channels.getHtml(e.channelid) + '</td><td data-sort="' + e.starttime + '">'
                        + epgd.utils.formatDate(e.starttime) + '</td><td>'
                        + epgd.utils.formatTime(e.starttime) + '</td><td>'
                        + epgd.utils.formatTime(e.starttime + e.duration)
                        + '</td><td data-evId="' + e.id + '">' + e.title + '<br />' + (e.shorttext || '')
                        + '</td><td>' + icons + '</td></tr>').tooltip()[0]);
                });
                timerList.trs = trs;
                timerList.showHead();
            }
            epgd.utils.loader.close();
            timerList.dialog && timerList.dialog.resize && window.setTimeout(function(){timerList.dialog.resize();},100); 
        });
    },true);
};
// Timerliste eines Suchtimers - Klasse
epgd.searchTimerTimerList = epgd.utils.inherits(function (options, dialog) {
    epgd.timerListBase.call(this, $.extend({
        saveUrl: 'data/save-timer',
        updateUrl: 'data/timers?state=P,R'
    }, options), dialog);
}, epgd.timerListBase);
epgd.searchTimerTimerList.prototype.getTable = function () {
    var tr = epgd.tr.pages.timerList;
    return '<table class="timerTable"><thead><tr><th>' + epgd.tr.channel + this.sortIcons + '</th><th data-defaultSort="1" colspan="2">' + tr.startTime + this.sortIcons + '</th><th>'
     + tr.endTime + '</th><th>' + epgd.tr.pages.eventDetail.title + this.sortIcons + '</th><th>VDR' + this.sortIcons + '</th><th>'
     + '</th></tr></thead><tbody></tbody></table>';
}
epgd.searchTimerTimerList.prototype.update = function (d) {
    if (!d)
        return false;
    var timerList = this;
    epgd.utils.loader.process(function () {
        timerList.$con.find('tbody').empty();
        epgd.ajax({ url: epgd.login.url + timerList.o.updateUrl + '&autotimerid=' + d.id, async: true, cache: false }, function (data) {
            var trs = [],
                editIcons = '<span class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>';
            if (!data.timers.length) {
                timerList.hideHead();
            } else {
                $.each(data.timers, function (id, t) {
                    var vdr = epgd.vdrs.list[t.vdruuid] || { name: '--' },
                        tr = $('<tr' + (t.active ? '' : ' class="ui-state-disabled"') + '><td>'
                        + epgd.channels.getHtml(t.channelid) + '</td><td data-sort="' + new String(t.day) + new String(10000 + t.starttime).slice(1) + '">'
                        + (t.day ? $.datepicker.formatDate(epgd.tr.dateTimePicker.dateFormat, epgd.utils.date(t.day)) : '-')
                        + '</td><td>'
                        + new String(100 + parseInt(t.starttime / 100, 10)).slice(1) + ':' + new String(100 + parseInt(t.starttime % 100, 10)).slice(1)
                        + '</td><td>'
                        + new String(100 + parseInt(t.endtime / 100, 10)).slice(1) + ':' + new String(100 + parseInt(t.endtime % 100, 10)).slice(1)
                        + '</td><td' + (t.eventid ? ' data-evId="' + t.eventid + '">' + t.title + '<br />' + (t.shorttext || '') : '>') + '</td><td>'
                        + vdr.name + '<br />' + t.file + '</td><td>'
                        + editIcons + '</td></tr>')[0];
                    tr.tData = t;
                    trs.push(tr);
                });
                timerList.trs = trs;
                timerList.showHead();
            }
            timerList.dialog && timerList.dialog.resize && window.setTimeout(function () { timerList.dialog.resize(); }, 100);
            epgd.utils.loader.close();
        });
    });
}

// anstehende Timer
epgd.pages.timerList = new epgd.timerListBase({
    updateUrl: 'data/timers?state=P,R',
    saveUrl: 'data/save-timer',
    selectable: true,
    addNew: true,
    right: epgd.rights.umTimer
}, new epgd.timerDialog());
// Küzlich erledigte Timer
epgd.pages.timersDone = new epgd.timerListBase({
    updateUrl: 'data/timers?state=D,F,E&action=A',
    right: epgd.rights.umTimer
});
epgd.pages.timersDone.getTable = function () {
    return epgd.timerListBase.prototype.getTable.call(this).replace('data-defaultSort="1"', 'data-defaultSort="-1"')
}
// Timerhistorie
epgd.pages.timerListDone = new epgd.timerListBase({
    updateUrl: 'data/donetimers', saveUrl: 'data/store-donetimers',
    selectable: true,
    right: epgd.rights.umTimer
});
epgd.pages.timerListDone.getTable = function () {
    return '<table id="timerListDone" class="timerTable"><thead><tr><th style="min-width:120px"><input type="text" class="filter" style="width:40px" />'
       + this.sortIcons + '</th><th data-defaultSort="-1" style="min-width:180px">'
       + epgd.tr.pages.timerList.recordTime + this.sortIcons + '</th><th>'
       + epgd.tr.pages.eventDetail.title + ' <input type="text" class="filter" />' + this.sortIcons + '</th><th style="min-width:120px">'
       + epgd.tr.channel + this.sortIcons + '</th><th style="min-width:100px">' + this.sortIcons
       + '<span style="margin-top:3px" class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>'
       + '<div class="selMarkBlock" style="width:auto"><b title="' + epgd.tr.markAll + '" class="selected" data-t="1"></b><b title="' + epgd.tr.markNone
       + '" data-t="0"></b><b title="' + epgd.tr.markToggle + '"><b class="selected"></b></b></div>'
       + '</th></tr></thead><tbody></tbody></table>';
}
epgd.pages.timerListDone.action = function ($el, iconName,data) {
    if (iconName == 'detail' && !$el[0].eventDetail) 
       $el[0].eventDetail = new epgd.doneTimerDetail($el.parent()[0]);
    epgd.timerListBase.prototype.action.call(this, $el, iconName, data);
}
epgd.pages.timerListDone.stateIcons = {
    'D': '<div class="i-trash">' + epgd.tr.pages.timerList.doneStates.D + '</div>',            // gelöscht
    'F': '<div class="i-warning">' + epgd.tr.pages.timerList.doneStates.F + '</div>',          // Aufnahme fehlgeschlagen
    'f': '<div class="i-warning">' + epgd.tr.pages.timerList.doneStates.f + '</div>',          // Timer konnte nicht erstellt werden
    'R': '<div class="i-ok">' + epgd.tr.pages.timerList.doneStates.R + '</div>',               // Aufnahme fertig
    'C': '<div class="i-buffer">' + epgd.tr.pages.timerList.doneStates.C + '</div>',         // Timer bereits erstellt 
    'Q': '<div class="i-clock">' + epgd.tr.pages.timerList.doneStates.Q + '</div>'             // Timer in Vorbereitung
}
epgd.pages.timerListDone.update = function () {
    var timerList = this;
    epgd.utils.loader.process(function () {
        epgd.ajax({ url: epgd.login.url + timerList.o.updateUrl, async: false, cache: false }, function (data) {
            timerList.$con.find('tbody').empty();
            if (!data.donetimers.length) {
                timerList.hideHead();
            } else {
                var trs = [],
                    tr, i, t,
                searchTimerIcon = '<span class="iAsButton i-flashlight edit" title="' + epgd.tr.pages.timer.searchTimerList + ' ' + epgd.tr.edit + '" data-id="$id$">$title$</span>';
                for (i in data.donetimers) {
                    t = data.donetimers[i];
                    tr = $('<tr><td>'
                        + (t.state && timerList.stateIcons[t.state] || '') + '</td>'
                        + '<td data-sort="' + t.starttime + '">'
                        + epgd.utils.formatDateTime(t.starttime) + '<br />' + parseInt(t.duration / 60, 10) + ' ' + epgd.tr.minutes
                        + '</td><td data-evId="' + t.id + '">' + (t.title || '') + '<br />' + (t.shorttext || '') + '</td><td data-sort="' + t.channelid + '">'
                        + epgd.channels.getHtml(t.channelid) + '</td><td>'
                        + '<span class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>'
                        + (t.autotimerid ? searchTimerIcon.replace('$id$', t.autotimerid).replace('$title$', t.autotimername || t.expression || epgd.tr.pages.timer.searchTimerList) : '')
                        + '</td></tr>')[0];
                    tr.tData = t;
                    trs.push(tr);
                };
                timerList.trs = trs;
                timerList.showHead();
            }
            epgd.utils.loader.close();
            $(window).trigger('timerlist_updated', timerList);
        });
    },true);
}
// ungesyncte Aufträge
epgd.pages.timerJobList = new epgd.timerListBase({
    updateUrl: "data/timers?notaction=A",
    saveUrl: 'data/delete-timerjobs',
    selectable: true,
    right: epgd.rights.umTimer
}, new epgd.timerDialog());

// Suchtimer
epgd.pages.searchTimerList = new epgd.timerListBase({
    saveUrl: 'data/save-searchtimer',
    right: epgd.rights.umSearchTimer
}, new epgd.searchTimerDialog());
epgd.pages.searchTimerList.getTable = function () {
    var tr = epgd.tr.pages.timerList;
    return '<table id="timerSearchList" class="timerTable"><thead><tr><th data-defaultSort="1">'
        + epgd.tr.pages.search.searchName + '/' + epgd.tr.pages.search.searchExpression + ' <input type="text" class="filter" />' + this.sortIcons + '</th><th>' + 'hits' + this.sortIcons
        + '</th><th style="min-width:120px">VDR' + this.sortIcons + '</th><th>'
        + '<span class="iAsButton i-doc-new edit" title="' + tr.newTimer + '"></span>'
        + '<span class="iAsButton i-refresh edit" title="' + epgd.tr.reload + '"></span>'
        + '<span class="iAsButton i-link-ext edit" title="' + tr.searchTimerReload + '"></span>'
     + '</th></tr></thead><tbody></tbody></table>';
}
epgd.pages.searchTimerList.action = function ($el, iconName, data) {
    epgd.timerListBase.prototype.action.call(this,$el, iconName, data);
    switch (iconName) {
        case 'link-ext':
            this.triggerUpdate();
            break;
        case 'down-dir':
            if (!$el[0].tList) {
                var dialog={
                    $td: $el.parent().css("position", "relative"),
                    tdHeight: $el.parent().outerHeight() + 10,
                    data: $el.parent().parent()[0].tData,
                    resize: function () {
                        var $table = this.list.$con.find('>table').addClass("sub");
                        $table.width(this.$td.parent().outerWidth());
                        this.$td.height(this.tdHeight + $table.outerHeight(true) + 10);
                        //this.$td.append(this.list.$con);
                    },
                    toggle : function (doShow) {
                        this.list.$con.toggle(doShow);
                        if (doShow) {
                            this.$td.css("height", "100px");
                            this.list.update(this.data);
                        } else
                            this.$td.css("height", "auto");
                    }
                },
                    options= {
                        conSel: $('<div style="position:absolute;z-index:5;top:' + dialog.tdHeight + 'px" />').appendTo(document.body)
                    };
                $el[0].tList = dialog.data.type == 'S' ? new epgd.searchResultList(options, dialog) : new epgd.searchTimerTimerList(options, dialog);
                $el[0].tList.render();
                dialog.$td.append(dialog.list.$con);
            }
            $el[0].tList.dialog.toggle(true);
            $el.removeClass('i-down-dir').addClass('i-right-dir');
            break;
        case 'right-dir':
            $el.removeClass('i-right-dir').addClass('i-down-dir');
            if ($el[0].tList)
                $el[0].tList.dialog.toggle(false);
            break;
    }
}
epgd.pages.searchTimerList.update = function () {
    var timerList = this;
    this.$con.find('tbody').empty();
    epgd.utils.loader.process(function () {
        epgd.ajax({ url: epgd.login.url + "data/searchtimers", async: false, cache: false }, function (data) {
            var trs = [],
                editIcons = timerList.editIcons,
                typeIcons = { 'V': 'i-tv', 'R': 'i-record', 'S': 'i-search' };
            if (!data.searchtimers.length) {
                timerList.hideHead();
            } else {
                $.each(data.searchtimers, function (id, t) {
                    var vdr = epgd.vdrs.list[t.vdruuid] || { name: '--' },
                        tr = $('<tr' + (t.active ? '' : ' class="ui-state-disabled"') + '><td>'
                            + '<span class="iAsButton i-down-dir edit" title="' + epgd.tr.pages.timer.timerList + '"></span>'
                            + '<div class="' + typeIcons[t.type] + '">' + (t.name || t.expression) + '</div></td><td'
                            + (t.type == 'S' ? '>--' : ' data-sort="' + new String('00000' + t.hits).slice(-5) + '">' + t.hits) + '</td><td>'
                            + vdr.name + '</td><td>' + editIcons + '</td></tr>')[0];
                    tr.tData = t;
                    trs.push(tr);
                });
                timerList.trs = trs;
                timerList.showHead();
            }
            epgd.utils.loader.close();
            $(window).trigger('searchTimerList_updated', timerList);
        });
    });
}
epgd.pages.searchTimerList.triggerUpdate = function () {
    var timerList = this;
    epgd.ajax({url: epgd.login.url + 'data/updatesearchtimer'},function (data) {
            if (data.result.state == 200)
                epgd.utils.topInfo(epgd.tr.dataSaved);
            else
                epgd.utils.topInfo(data.message, { isError: 1 });
            timerList.update();
    });
}

epgd.pages.search = new epgd.searchDialog();

//message List
epgd.pages.messageList = new epgd.timerListBase({
    saveUrl: 'data/markmessages',
    selectable: true
})
epgd.pages.messageList.getTable = function () {
    return '<table id="messageList" class="timerTable"><thead><tr><th style="width:70px">id' + this.sortIcons + '</th>'
        + '<th style="width:120px">' + 'Typ' + ' <input type="text" class="filter" style="width:18px" />' + this.sortIcons + '</th>'
        + '<th style="width:140px">' + 'Zeit' + this.sortIcons + '</th>'
        + '<th style="width:100px">' + 'Titel' + ' <input type="text" class="filter" style="width:50px" />' + this.sortIcons + '</th>'
        + '<th style="min-width:140px">' + 'infotext' + ' <input type="text" class="filter" />' + this.sortIcons + '</th>'
        + '<th style="min-width:190px"><div class="selMarkBlock" style="width:auto;float: right;">'
            +'<b title="' + epgd.tr.markAll + '" class="selected" data-t="1"></b><b title="' + epgd.tr.markNone + '" data-t="0"></b><b title="' + epgd.tr.markToggle + '"><b class="selected"></b></b></div>'
            + 'Status' + ' <input type="text" class="filter" style="width:20px" />' + '<br />' + this.sortIcons
            + '<span class="iAsButton i-refresh edit" title="' + epgd.tr.reload + '"></span>'
            + '<span style="margin-top:3px" class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>'
            + '<span style="margin-top:3px" class="iAsButton i-check edit" title="' + epgd.tr.pages.timerList.messageStates.R + '"></span>'
            + '<span style="margin-top:3px" class="iAsButton i-check-empty edit" title="' + epgd.tr.pages.timerList.messageStates.N + '"></span></th>'
        + '</tr></thead><tbody></tbody></table>';
}
epgd.pages.messageList.update = function (d) {
    var messList = this;
    epgd.utils.loader.process(function () {
        epgd.ajax({ url: epgd.login.url + "data/messages", async: false, cache: false }, function (data) {
            messList.$con.find('tbody').empty();
            if (!data.messages.length) {
                messList.hideHead();
            } else {
                var trs = [],
                    tr, i, t,
                    icons = {
                        'N': '<span class="iAsButton i-check-empty edit">' + epgd.tr.pages.timerList.messageStates.N + '</span>',
                        'R': '<span class="iAsButton i-check edit">' + epgd.tr.pages.timerList.messageStates.R + '</span>'
                    },
                    types = {
                        'E': '<div class="i-error">' + epgd.tr.pages.timerList.timerStates.E + '</div>',
                        'F': '<div class="i-flash-outline">' + epgd.tr.pages.timerList.timerStates.F + '</div>',
                        'I': '<div class="i-info">' + epgd.tr.pages.timerList.messageTypes.I + '</div>',
                        'W': '<div class="i-warning">' + epgd.tr.pages.timerList.messageTypes.W + '</div>'
                    };
                for (i in data.messages) {
                    t = data.messages[i];
                    tr = $('<tr><td data-sort="' + new String('0000000' + t.id).slice(-7) + '">' + t.id + '</td>'
                        + '<td>' + (types[t.type] ||'') +'</td>'
                        + '<td data-sort="' + t.updsp + '">'
                        + epgd.utils.formatDateTime(t.updsp) + '</td>'
                        + '<td>' + t.title + '</td>'
                        + '<td>' + t.text + '</td>'
                        + '<td data-sort="' + t.state + t.updsp + '"><span class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>' + (icons[t.state] || '') + '</td>'
                        + '</tr>')[0];
                    tr.tData = t;
                    trs.push(tr);
                };
                messList.trs = trs;
                messList.$con.find('>table>tbody').append(trs.sort(function (a,b) {
                    return a.tData.state == b.tData.state
                        ? a.tData.state.updsp > b.tData.state.updsp ? -1 : 1
                        : a.tData.state > b.tData.state
                }).slice());
                messList.showHead();
            }
            epgd.utils.loader.close();
            $(window).trigger('messagelist_updated', messList);
        });
    }, true);
};
epgd.pages.messageList.action = function ($el, iconName, data) {
    var ids = this.getSelectedIds($el),
        state= null,
        i;
    if (ids) {
        switch (iconName) {
            case 'check':
                state = $el[0].parentNode.nodeName == 'TH' ? 'R' : 'N';
                break;
            case 'check-empty':
                state = $el[0].parentNode.nodeName == 'TH' ? 'N' : 'R';
                break;
            case 'trash':
                state = 'D'
                break;
        }
        if (state) {
            for (i in ids)
                ids[i]= {"id":ids[i], "state":state}
            state == 'D' ? this.del(ids, null,"messages") : this.saveArray(ids, "messages");
            return true;
        }
    }
    return epgd.timerListBase.prototype.action.call(this, $el, iconName, data);
}

