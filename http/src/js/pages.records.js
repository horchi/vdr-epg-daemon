epgd.pages.records = {
    render: function () {
        if (!(epgd.login.rights & epgd.rights.umRecordings) == epgd.rights.umRecordings) return epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
        if (!epgd.profile.recordSubFolderSort)
            epgd.profile.recordSubFolderSort = 1;
        $('#menu_records').addClass("menu-active");
        var tr = epgd.tr.pages.records;

        if (!this.$bar) {
            this.$bar = $('<div class="ui-widget ui-state-highlight ui-corner-all" style="padding:3px 10px">'
                + '<button class="iAsButton i-trash" title="' + epgd.tr.del + '"/>'
                + '<div id="recBar">'
                    + '<button class="iAsButton i-refresh" onclick="epgd.pages.records.update()">' + epgd.tr.reload + '</button>'
                    + epgd.pages.help.getIcon('recRefresh') + '&nbsp;&nbsp; '
                    + epgd.tr.pages.search.search + epgd.pages.help.getIcon('recSearch') + '<button class="iAsButton" onclick="this.checked = !this.checked; $(this).toggleClass(\'ui-state-highlight\', this.checked); epgd.pages.records.search();">&nbsp;&#8727;</button>'
                        + '<input id="rSVal" type="text" onkeyup="epgd.pages.records.search(this.value)" />'
                        + '<button class="iAsButton" onclick="this.checked = !this.checked;$(this).toggleClass(\'ui-state-highlight\', this.checked); epgd.pages.records.search();">&#8727;&nbsp;</button>'
                        + '<span style="display:none">'
                            + '<button class="iAsButton i-rewind" onclick="epgd.pages.records.searchMove(1)"></button>'
                            + '<span id="rSCnt">0</span>'
                            + '<button class="iAsButton i-forward" onclick="epgd.pages.records.searchMove(-1)"></button>'
                        + '</span>&nbsp;&nbsp; <input type="checkbox" id="dragdrop"' + ($.support.touch ? '' : ' checked="checked"') + ' onchange="epgd.pages.records.dd(this.checked)" />'
                    + tr.ddLabel + epgd.pages.help.getIcon('recDD')
                + '</div>'
              +'</div>');
            this.$trash = this.$bar.find('.i-trash');
            this.curSearch = {
                pattern: '', searchValue: '', hits: $(), cur: 0, $count: this.$bar.find('#rSCnt')
                , fromStart: this.$bar.find('#rSVal').prev('button')[0]
                , toEnd: this.$bar.find('#rSVal').next('button')[0]
            }
        }
        this.$bar.insertAfter(epgd.$menu);
        this.$trash.droppable({
            accept: ".rec",
            hoverClass: "ui-state-hover",
            tolerance: "pointer",
            drop: function (ev, ui) {
                var elem = ui.helper.context;
                epgd.utils.confirm(epgd.tr.pages.records.deleteMessage.replace("$src$", elem.getAttribute('data-path')), function (ok) {
                    ok && epgd.pages.records.del(elem);
                });
                return false;
            }
        }).click(function () {
            var $recs = $("#records").find('.rec.selected');
            $recs.length && epgd.utils.confirm(epgd.tr.confirmDelete + ($recs.length > 1 ? '<br />' + $recs.length + epgd.tr.entries : ''), function (ok) {
                ok && $recs.each(function () {
                    epgd.pages.records.del(this);
                });
            });
        });
        epgd.pages.help.initButtons(this.$bar);
        epgd.$menu.checkMenuSize();
        $(window).bind("epgd_close.records", function () {
            epgd.pages.records.$bar.remove();
            epgd.$menu.checkMenuSize();
            $(window).unbind(".records");
        });
        epgd.$con.html('<div id="records"></div>');
        epgd.utils.loader.process(function () {
            epgd.ajax({ url: epgd.login.url + "data/recordings", cache: false }, function (data) {
                var recs = data.recordings,
                    rec, key, paths, t, p, i,
                    tree = { f: {}, r: [] },
                    vdrs = {},
                    vdr, v,
                    html = '',
                    min = ' ' + epgd.tr.minutes,
                    $divs,
                    sortFunc = epgd.profile.recordSubFolderSort == 6 ? function (a, b) { return a.starttime > b.starttime ? -1 : 1 }
                        : epgd.profile.recordSubFolderSort == 5 ? function (a, b) { return a.starttime > b.starttime ? 1 : -1 }
                        : epgd.profile.recordSubFolderSort == 4 ? function (a, b) { return a.path > b.path ? -1 : 1 }
                        : epgd.profile.recordSubFolderSort == 3 ? function (a, b) { return a.path > b.path ? 1 : -1 }
                        : epgd.profile.recordSubFolderSort == 2 ? function (a, b) { return a.tit > b.tit ? -1 : 1 }
                        : function (a, b) { return a.tit > b.tit ? 1 : -1 };

                for (vdr in epgd.vdrs.list) {
                    v = epgd.vdrs.list[vdr];
                    if (!v.usecommonrecfolder)
                        vdrs[vdr] = { f: {}, r: [] };
                    html += '<div>VDR - ' + v.name + ': ' + v.videodir + ' - ' + parseInt(v.videofree / 1000, 10) + ' GB ' + tr.available + ' / ' + parseInt(v.videototal / 1000, 10) + ' GB</div>';
                }
                if (!$('#dragdrop').parent().length)       //.append(html)
                    return false;
                epgd.$con.find('#records').before(html);
                html = '';

                for (i in recs) {
                    rec = recs[i];
                    t = vdrs[rec.vdruuid] || tree;
                    paths = rec.path.split('/');
                    paths.pop();
                    for (p = 0; p < paths.length; p++) {
                        key = paths[p].replace(/_/g, ' ');
                        t = t.f[key] || (t.f[key] = { f: {}, r: [] });
                    }
                    t.r.push(rec);
                }

                function checkTree(t) {
                    var hasContent = false,
                        subFolder, subTree;
                    t.cnt = 0;
                    for (subFolder in t.f) {
                        subTree = t.f[subFolder];
                        if (subTree.r.length == 1)
                            t.r.push(subTree.r.pop());
                         checkTree(subTree);
                         if (checkTree(subTree)) {
                             hasContent = true;
                             t.cnt += subTree.cnt;
                         } else
                             delete t.f[subFolder];
                    }
                    if (!hasContent)
                        delete t.f;
                    t.cnt += t.r.length;
                    return hasContent || t.r.length > 0;
                }

                function renderTree(t) {
                    Object.keys(t.f).sort().forEach(function (subFolder) {
                        var subTree = t.f[subFolder],
                            i;
                        html += subFolder ? '<div class="folder"><h4><span class="i-folder-closed">(' + (subTree.cnt) + ')</span><m class="i-"/>' + subFolder + '</h4>' : '<div>';
                        subTree.f && renderTree(subTree);
                        if (subTree.r.length) {
                            for (i in subTree.r) {
                                rec = subTree.r[i];
                                rec.tit = ((rec.name != subFolder ? rec.name : '')
                                  + (subFolder != rec.title && (rec.title != rec.name) ? '<br />' + rec.title : '')
                                  + (rec.shorttext && (rec.shorttext != rec.name) ? '<i>' + rec.shorttext + '</i>' : '')) || subFolder;
                                rec.html = '<div class="rec" data-start="' + rec.starttime + '" data-owner="' + (rec.owner || '')
                                  + '" data-md5="' + rec.md5path + '" data-path="' + rec.path + '">'
                                  + '<em>' + epgd.utils.formatDateTime(rec.starttime) + '</em><u>' + parseInt(rec.duration / 60, 10) + min + '</u><b>'
                                  + rec.tit
                                  + '</b></div>';
                            };
                            subTree.r.sort(sortFunc);
                            for (i in subTree.r) { html += subTree.r[i].html; }
                        }
                        html += '</div>';
                    });
                }

                p = {};
                if (checkTree(tree))
                    p[tr.commonRecFolder] = tree;
                for (vdr in vdrs) {
                    t = vdrs[vdr];
                    if (checkTree(t)) {
                        p['VDR - ' + epgd.vdrs.list[vdr].name] = t;
                    }
                }
                renderTree({ f: p });

                $divs = epgd.$con.find('#records').html(html);
                if (!$divs.length)
                    return false;
                $divs = $divs.click(epgd.pages.records.action).find('>div');
                if ($divs.length == 1)
                    $divs.first().toggleClass('open');
                epgd.pages.records.$menu = $('<ul class="ui-menu ui-widget ui-widget-content" style="position:absolute">'
                    + '<li class="ui-menu-item" data-type="title"><a class="iAsButton i-sort-name-up" data-sort="1"></a>&nbsp;<a class="iAsButton i-sort-name-down" data-sort="2"></a>&nbsp;' + epgd.tr.pages.eventDetail.title + '</li>'
                    + '<li class="ui-menu-item" data-type="path"><a class="iAsButton i-sort-name-up" data-sort="3"></a>&nbsp;<a class="iAsButton i-sort-name-down" data-sort="4"></a>&nbsp;' + epgd.tr.pages.timerList.folder + '</li>'
                    + '<li class="ui-menu-item" data-type="start"><a class="iAsButton i-sort-name-up" data-sort="5"></a>&nbsp;<a class="iAsButton i-sort-name-down" data-sort="6"></a>&nbsp;' + epgd.tr.pages.timerList.recordTime + '</li>'
                    + '</ul>').hide().appendTo(epgd.$con);
                $('#dragdrop').change();
                epgd.pages.records.curSearch.$recs = null;
                epgd.utils.loader.close();
            });
        },true);
    },
    search: function (searchValue) {
        var cs = this.curSearch,
            sLength,
            $recs,
            pattern,
            fromStart = cs.fromStart.checked,
            toEnd = cs.toEnd.checked;

        if (!cs.$recs)
            cs.$recs= epgd.$con.find('#records .rec,h4');
        if (typeof searchValue == "string")
            cs.searchValue = searchValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
       
        pattern = (fromStart ? '>' + cs.searchValue : cs.searchValue).toLowerCase() + (toEnd ? '<' : '');
        if (pattern == cs.pattern)
            return;
        sLength = cs.searchValue.length;
        $recs = cs.$recs;

        if (cs.hits.length) {
            $(cs.hits).each(function () {
                this.innerHTML = this.innerHTML.replace(/<mark>([^<]+)<\/mark>/gi, '$1');
            }).parents('.tmp-open').removeClass('tmp-open');
            if (pattern.indexOf(cs.pattern) == 0)
                $recs = $(cs.hits);
            else
                cs.cur = 0;
            cs.hits = [];
        } else
            cs.cur = 0;
        cs.pattern = pattern;
        if (sLength > 2) {
            $recs.each(function () {
                var pos = this.innerHTML.toLowerCase().indexOf(pattern);
                if (pos > 0) {
                    cs.hits.push(this)
                    $(this).parents('.folder').addClass('tmp-open');
                    do {
                        if (fromStart)
                            pos++;
                        this.innerHTML = this.innerHTML.slice(0, pos) + "<mark>" + cs.searchValue + "</mark>" + this.innerHTML.slice(pos + sLength);
                    } while ((pos = this.innerHTML.toLowerCase().indexOf(pattern, pos + 13)) > 0)  //  "<mark></mark>"  = 13 Zeichen
                }
            });
            cs.$count.text(cs.hits.length).parent().show();
            this.searchMove(0);
        } else
            cs.$count.parent().hide();
    },
    searchMove: function (dir) {
        this.curSearch.cur += dir;
        var n = this.curSearch.hits[this.curSearch.cur];
        if (!n) {
            this.curSearch.cur = dir < 0 ? this.curSearch.hits.length - 1 : 0;
            n = this.curSearch.hits[this.curSearch.cur];
        }
        if (n) {
            n.scrollIntoView(false);
            $(n).css({ 'background-color': 'green' });
            window.setTimeout(function () { $(n).css({ 'background-color': '' }); },1500);
        }
    },
    action: function (ev) {
        var elem = ev.target;                // aktueller Sortiebutton, bzw. inital jquery-elment
        if (elem.nodeName == 'MARK')
            elem = elem.parentNode;
        if (elem.nodeName == 'M') {
            epgd.pages.records.$menu.show().position({
                my: "left top",
                at: "left bottom",
                of: elem
            }).find('a').removeClass('ui-state-highlight');
           epgd.pages.records.$menu.find('a[data-sort=' + (elem.curSort || epgd.profile.recordSubFolderSort) +']').addClass('ui-state-highlight');
           $(document).one('click.recmenu', function (ev) {
                if (ev.target.nodeName == 'A') {
                    var t = ev.target.parentNode.getAttribute('data-type');
                    if (t ){
                        elem.curSort= ev.target.getAttribute('data-sort');
                        epgd.pages.records.sort(elem.parentNode.parentNode, elem.curSort);
                     }
                }
                epgd.pages.records.$menu.hide();
                $(document).unbind('.recmenu');
            }).bind("keyup.recmenu", function (e) {
                if (e.keyCode == 27)
                    $(document).trigger("click.recmenu");
            });
            return false;
        }

        if (elem.nodeName == 'I' || elem.nodeName == 'SPAN')
            elem = elem.parentNode;
        if (elem.nodeName == 'B') {
            elem = elem.parentNode;
            if (!elem.recDetail)
                elem.recDetail = new epgd.recordDetail(elem);
            epgd.utils.loader.process(function () {
                elem.recDetail.render();
            });
        } else if (elem.nodeName == 'H4') {
            elem = elem.parentNode;
            if (elem.nodeName == 'DIV' && elem.className.indexOf('folder') >= 0) {
                if (elem.className.indexOf('open') == -1) {
                    if ($(window).width() < 500) {
                        $(elem).siblings('.open').removeClass('open');
                        document.body.scrollTop = $(elem).offset().top - 35;
                    }
                    $(elem).addClass('open');

                } else
                    $(elem).removeClass('open');
            }
        } else
            $(elem).closest('.rec').toggleClass('selected');
    },
    dd: function (enable) {
        var $records = $("#records"),
            $recs = $records.find('.rec').has('.ui-draggable');
        if (enable && $recs.length == 0) {
            $records.find("h4").droppable(this.__dropSettings);
            $recs.end().draggable({
                cancle: "b",
                revert: "invalid",
                distance: 15,
                helper: function () {
                    return $(this).clone().css("display", "block");
                },
                appendTo: 'body',
                cursor: 'pointer',
                cursorAt: { left: -15, top: 5 },
                start: function (ev, ui) {
                    $(document).trigger("click.recmenu");
                    $(document.body).addClass('dd-open');
                    document.body.style.paddingTop = epgd.pages.records.$bar.height() + 'px';
                    document.body.scrollTop -= ev.pageY - $(ev.delegateTarget).closest('.folder').offset().top;
                    /*$(document).bind("keyup.dd", [this], function (ev) {
                        if (ev.keyCode == 27)
                            $.ui.ddmanager.dragStop($(ev.data[0]).draggable("instance"), ev); //$(ev.data[0]).draggable("cancel");
                    });  */
                },
                stop: function (ev, ui) {
                    // $(document).unbind(".dd");
                    $(document.body).removeClass('dd-open');
                    epgd.$menu.checkMenuSize();
                }
            });
        } else if ($recs.length){
            $recs.draggable(enable ? "enable" : "disable");
        }
    }, 
    __dropSettings: {
        accept: ".rec",
        hoverClass: "ui-state-hover",
        tolerance: 'pointer',
        drop: function (ev, ui) {
            console.log("Dropped!", ev, ui);
            var $elem = $(ev.target),
                path = '';
            do {
                path = $elem.text().replace(/^\(.*\)/,'') + '/' + path;
                $elem = $elem.parent();
            } while (($elem = $elem.prevAll('h4')).length);
            epgd.pages.records.move(ui.draggable.context, path.slice(path.indexOf('/', 2) + 1).replace(/ /g, '_'),ev.target.parentNode)
            return false;
        }
    },
    update: function () {
        epgd.ajax({ url: epgd.login.url + "data/updaterecordings" }, function (data) {
            epgd.utils.topInfo(epgd.tr.pages.records.refreshMessage.replace('$sec$', 5), { autoClose: 5000 });
            $(window).trigger("epgd_close.records");
            window.setTimeout(function () { epgd.pages.records.render(); }, 5000);
        });
    },
    move: function (elem, path, folder) {
        var curPath = elem.getAttribute('data-path').split('/'),
            name = curPath.pop(), // 2016-08-21.11.18.59-0.rec entfernen
            i,
            endPos= 0;
        curPath = curPath.join('/') + '/';
        for (i = 0; i <  Math.min(path.length, curPath.length) && path[i] == curPath[i]; i++) {
            if (path[i] == '/')
                endPos= i;
        }
        curPath = window.prompt(epgd.tr.pages.records.moveMessage.replace("$src$", curPath), path.concat(curPath.slice(endPos)).replace(/\/{2,}/g, '/').replace(/\/$/, ''));
        if (curPath) {
            epgd.ajax({ url: epgd.login.url + 'data/renamerecording?starttime=' + elem.getAttribute('data-start') + '&md5path=' + elem.getAttribute('data-md5') + '&owner=' + elem.getAttribute('data-owner') + '&name=' + curPath.replace(/\//g, '~'), async: true }, function (data) {
                data = data.result;
                if (data && data.state == 200) {
                    var $elem = $(elem),
                        $counter = $elem.prevAll('h4').find('span'),
                        $folder= $(folder),
                        newPath = curPath.split('/'), i;
                    $elem.attr('data-path', curPath + '/' + name);
                    $elem.attr('data-md5', "").draggable("disable").addClass("ui-state-disabled");
                    newPath.shift(); //erster Ordner ist ja == folder
                    $elem.parents('.folder:not(:last)').find('>h4>span').each(function () {
                        this.innerHTML = '(' + (parseInt(this.innerHTML.slice(1, -1), 10) - 1) + ')';
                    });
                    $counter = $folder.find('span');
                    $counter.text('(' + (parseInt($counter.text().slice(1, -1), 10) + 1) + ')');
                    for (i = 0; i < newPath.length; i++) {
                        if ($folder.find('>.folder>h4').each(function () {
                            if (this.lastChild.nodeValue == newPath[i]) {
                               $folder = $(this.parentNode);
                               $counter = $folder.find('span');
                               $counter.text('(' + (parseInt($counter.text().slice(1, -1), 10) + 1) + ')');
                               return true;
                        } else
                                return false;
                        }).length == 0) {
                            for (; i < newPath.length; i++) {
                                $folder = $('<h4><span class="i-folder-closed">(1)</span><m class="i-"/>' + newPath[i] + '</h4></div>').droppable(epgd.pages.records.__dropSettings).wrap('<div class="folder open"></div>').parent().appendTo($folder);
                            }
                        };
                    }
                    $elem.appendTo($folder);
                    epgd.pages.records.sort(folder);
                    epgd.utils.topInfo(epgd.tr.dataSaved);
                    epgd.pages.records.__updateRec(elem);
                 }
                else {
                    epgd.utils.topInfo(data.message, { isError: 1 });
                    return false;
                }
            });
        }
        return !!curPath;
    },
    __updateRec: function (elem, cnt) {
        epgd.ajax({ url: epgd.login.url + 'data/recording?starttime=' + elem.getAttribute('data-start') + '&path=' + elem.getAttribute('data-path') + '&owner=' + elem.getAttribute('data-owner') + '&'+cnt, async: true }, function (data) {
            $(elem).attr('data-md5', data.recording.md5path).draggable("enable").removeClass("ui-state-disabled");
        }, function (jqxhr, e) {
            if (!cnt)
                cnt = 0;
            else if (cnt >= 5) 
                return epgd.utils.popup(epgd.tr.pages.records.notFoundMessage, { title: epgd.tr.error.error });
            
            window.setTimeout(epgd.pages.records.__updateRec, 3000,elem,++cnt);
            return true;
        });
    },
    del: function (elem) {
        epgd.ajax({ url: epgd.login.url + 'data/deleterecording?starttime=' + elem.getAttribute('data-start') + '&md5path=' + elem.getAttribute('data-md5') + '&owner=' + elem.getAttribute('data-owner'), async: true }, function (data) {
            data = data.result;
            if (data && data.state == 200) {
                epgd.utils.topInfo(elem.getAttribute('data-path') + '<br />' + epgd.tr.dataSaved);
                $(elem).parents('.folder:not(:last)').find('>h4>span').each(function () {
                    this.innerHTML = '(' + (parseInt(this.innerHTML.slice(1, -1), 10) - 1) + ')';
                });
                $(elem).remove();
            } else
                epgd.utils.topInfo(elem.getAttribute('data-path') + '<br />' + data.message, { isError: 1 });
        });
    },
    sort: function (con, sort) {
        var $elems = $(con).find('>div.rec'),
            dir = sort % 2 ? 1 : -1,
            t;
        if (!sort)
            sort = $(">h4>m", con)[0].curSort || epgd.profile.recordSubFolderSort;
        if (sort < 3) 
            $elems.sort(function (a, b) { return a.lastChild.innerHTML > b.lastChild.innerHTML ? dir : -dir }).appendTo(con);
        else{
            t= sort < 5 ? 'data-path' : 'data-start';
            $elems.sort(function (a, b) { return a.getAttribute(t) > b.getAttribute(t) ? dir : -dir }).appendTo(con);
        } 
        $(con).find('>div.folder').each(function () {
            epgd.pages.records.sort(this, sort);
        });
    }
};
/*
$.widget("ui.draggable", $.ui.draggable, {
    _mouseStart: function (ev) {
        if (this.options.beforeStart && this.options.beforeStart(ev) === false)
            return false;
        return this._super(ev);
    }
});
*/