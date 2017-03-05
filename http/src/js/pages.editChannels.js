epgd.pages.editChannels = {
    /* $.get("http://wwwa.tvmovie.de/static/tvghost/html/onlinedata/cftv520/datainfo.txt").done(function(data){console.log(data)}) */

    render: function () {
        if (!(epgd.login.rights & epgd.rights.umConfigEdit) == epgd.rights.umConfigEdit) return epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
        var tr = epgd.tr.pages.editChannels,
            $panel = epgd.$con,
            $but,
            lis='',
            vdrs= '',
            merge,
            src, id, plg, uuid,ch;
        for (id in epgd.channels.list) {
            ch = epgd.channels.list[id];
            merge = [];
            for (plg in ch.sources) {
                src = ch.sources[plg];
                merge[src.merge] = '<li><u>' + plg + '</u> <input type="text" readonly value="' + src.extid + '" /></li>';
            }
            //merge[99] = '<li>dvb</li>';
            lis+='<li><em class="i-check' + (ch.visible & 1 ? '' : '-empty')
                + '"></em><em style="display:none" class="i-check' + (ch.visible & 2 ? '' : '-empty')
                + '"></em><span>' + id + '</span><input type="text" value="' + (ch.name || '') + '" />'
                //+ '<ol>' + merge.join('') + '</ol>'
                + '</li>';
        };
        for (uuid in epgd.vdrs.list) 
            vdrs += '<li data-url="vdr&uuid=' + uuid + '">' + epgd.vdrs.list[uuid].name + '</li>';
        
        /*
                merge = [];
                merge[1] = '<li><u>tvm</u> <input type="text" value="enter id" /></li>';
                merge[2] = '<li><u>epgdata</u> <input type="text" value="enter id" /></li>';
                //merge[99] = '<li>dvb</li>';
                <a class="ui-icon ui-icon-trash">Trash</a>
        */
        $but = $panel.html('<div class="ui-widget"><div class="ui-state-highlight ui-corner-all" style="padding: 0.3em 0.7em; font-size:0.9em">'
             + '<button class="iAsButton i-down-dir">' + tr.menu.channelList + '</button> '
             + '<span class="i-info-circled" style="display:inline-block"></span>' + epgd.tr.pages.editChannels.headline
            + '</div></div>'
            + '<div class="pageEditChannels" id="pageEditChannelsHead"><div class="selMarkBlock"><b title="' + epgd.tr.markAll + '" class="selected" data-t="1"></b><b title="' + epgd.tr.markNone
            + '" data-t="0"></b><b title="' + epgd.tr.markToggle + '"><b class="selected"></b></b></div><div class="selMarkBlock" data-index="0" title="' + epgd.tr.pages.editChannels.checkWeb
            + '">Web<em title="' + epgd.tr.markAll + '" class="iAsButton i-check"></em><em title="' + epgd.tr.markNone
            + '" class="iAsButton i-check-empty"></em></div>'
            //+ '<div data-index="1" title="' + epgd.tr.pages.editChannels.checkVDR
            //+ '">VDR<em title="' + epgd.tr.markAll + '" class="iAsButton i-check"></em><em title="' + epgd.tr.markNone
            //+ '" class="iAsButton i-check-empty"></em></div>'
            + '<span><input type="text"/>channel-id</span><span><input type="text"/>channel-name</span>'
            //+ '<div>merging</div>'
            + '</div>'
            ).find('button');

        $but.click(function () {
            var $menu = this.$menu.show();
            $(document).bind("click.ui_menu", function (ev) {
                if (!$(ev.target).closest(".ui-menu").length) {
                    $menu.hide();
                    $(this).unbind("click.ui_menu");
                }
            });
            return false;
        })[0].$menu = $('<ul style="font-size:0.8em; width:200px;position:absolute">'
            + '<li data-id="loadList"><a>' + tr.menu.referenceList + '</a><ul style="width:100px">'
                + '<li data-id="channelpedia"><a>channelpedia</a></li>'
                + ( vdrs ? '<li><a>VDR</a><ul>' + vdrs + '</ul></li>' : '')
                + '<li data-id="insertList"><a>' + tr.menu.insertAsText + '</a></li>'
              + '</ul></li>'
            + '<li data-id="getChannelNames"><a>' + tr.menu.extentEmptyChannelNames + '</a></li>'
            + '<li data-id="getAllChannelNames"><a>' + tr.menu.applyAllChannelNames + '</a></li>'
            + '<li data-id="getOrder"><a>' + tr.menu.applyChannelSort + '</a></li></ul>').hide().insertAfter($but).menu({
                select: function (ev, ui) {
                    var $li = ui.item,
                        ul, path,
						filter = '';
                    if (!$li.attr('data-id'))
                        $li = $li.parents('li[data-id]:first');
                    switch ($li.attr('data-id')) {
                        case 'getChannelNames':
						    filter= '[value=""]';
						case 'getAllChannelNames':
                            epgd.utils.loader.process(function () {
                                var list = [];
                                $('#pageEditChannelsSource li').each(function () {
                                    list[this.lastChild.innerHTML] = this.firstChild.innerHTML;
                                })
                                $('#pageEditChannels > li > input' + filter).each(function () {
                                    this.value = list[this.previousSibling.innerHTML] || this.value;
                                });
                            }); 
                            break;
                        case 'getOrder':
                            epgd.utils.loader.process(function () {
                                var $list = $('#pageEditChannels'),
                                    $span;
                                $($('#pageEditChannelsSource span').get().reverse()).each(function () {
                                    $span = $list.find('> li > span:contains(' + this.innerHTML + ')');
                                    if ($span.length)
                                        $span.parent().prependTo($list);
                                });
                            });
                            break;
                        case 'insertList':
                            $('<div title="channel.conf"><p>' + tr.desc_insertList + ' <a href="http://channelpedia.yavdr.com/gen/DVB-S/S19.2E/S19.2E_complete_sorted_by_groups.channels.conf" target="forList">channelpedia.yavdr.com</p><textarea style="width:100%; height:60%"></textarea><button>ok</button></div>').dialog({
                                modal: true,
                                width: 500,
                                height: 400
                            }).find('textarea').change(function () {
                                epgd.pages.editChannels.insertReferenceList(this.value);
                                $(this).parent().dialog('destroy');
                            });
                            break;
                        case 'loadList':
                            if (ui.item.attr('data-url')) {
                                epgd.ajax({url:epgd.login.url + 'data/proxy?id=' + ui.item.attr('data-url'), dataType: "html", contentType: "text/plain; charset=utf-8"},epgd.pages.editChannels.insertReferenceList);
                                break;
                            }
                        case 'channelpedia':
                            ul = $('<ul style="width:100px" />').appendTo(ui.item)[0];
                            epgd.ajax({url:epgd.login.url + 'data/proxy?id=channelpedia', dataType: "html", contentType: "text/plain; charset=utf-8"},function (data) {
                                $li.attr('data-id', '');
                                var $ul = $(data.replace(/<img [^>]+>/g, '')).find('.entryMenu > ul:first');
                                $ul.find('br').remove();
                                $ul.find('a').each(function () {
                                    this.parentNode.setAttribute('data-url', this.getAttribute("href"));
                                    this.removeAttribute('href');
                                });
                                $ul.find('>li').each(function () {
                                    $('<li data-id="channelpediaList"><a>' + this.firstChild.innerHTML + '</a></li>').append($(this).next('ul').width(400)).appendTo(ul);
                                });
                                $(ev.target).menu("refresh").menu("expand");
                            });
                            return true;
                        case 'channelpediaList':
                            path = ui.item.attr('data-url');
                            $li.attr('data-id', 'loadList');
                            ui.item.removeAttr('data-url');
                            epgd.ajax({ url: epgd.login.url + 'data/proxy?id=channelpedia&path=' + path, dataType: "html", contentType: "text/plain; charset=utf-8" }, function (data) {
                                var $ul = $('<ul />');
                                $(data).find('.singleSourceMainMenu li:contains("channels.conf")').each(function () {
                                    var $this = $(this);
                                    $('<li title="' + $this.find('.description').text() + '" data-url="channelpedia&path='
                                        + path + $this.find('.button a').attr('href') + '"><a>'
                                        + $this.find('.caption').text() + '</a></li>').appendTo($ul);
                                });
                                $ul.appendTo(ui.item);
                                $(ev.target).menu("refresh").menu("expand");
                            });
                            return true;
                        default:
                            return false;
                    }
                    $(document).trigger("click.ui_menu");
                }
            }).position({
                my: "left top",
                at: "left bottom",
                of: $but[0]
            });
        $('<button class="iAsButton i-save">' + epgd.tr.save + '</button>').insertAfter($but).click(function () {
            var data = {};
            $('#pageEditChannels > li').each(function (index) {
                var $this = $(this),
                    sources = {};
                merge = {};
                $this.find('>ol>li').each(function (index) {
                    var $this = $(this),
                        extid = $this.find('input').val();
                    sources[$this.find('u').text()] = merge = { merge: index };
                    if (extid) merge.extid = extid;
                });
                data[$this.find('span').text()] = {
                    name: $this.find('input').val(),
                    visible: $this.find('em:eq(0)').hasClass('i-check') * 1 + $this.find('em:eq(1)').hasClass('i-check') * 2,
                    order: index + 1,
                    sources: sources
                }
            });
            epgd.ajax({
                url: epgd.login.url + 'data/save-channels',
                type: 'post',
                data: JSON.stringify({ "channels": data })
            },function (data) {
                    data = data.result;
                    if (data.state == 200) {
                        epgd.utils.popup(epgd.tr.dataSaved);
                        epgd.channels.isDirty = true;
                    }
                    else
                        epgd.utils.popup(data.message);
                });
        });

        $('<ol id="pageEditChannels" class="pageEditChannels">' + lis + '</ol>').appendTo($panel).sortable({
            revert: 'invalid',
            handle: ':not(em)'
        }).click(function (ev) {
            if (ev.target.nodeName == "EM")
                $(ev.target).toggleClass('i-check i-check-empty');
            else {
                $li = $(ev.target).closest('li');
                if ($li.parent('#pageEditChannels').length) {
                    $li.toggleClass('selected');
                    if (ev.shiftKey && this.lastSel) {
                        var $lastSel = $(this.lastSel),
                            delta = $li.index() - $lastSel.index();
                        if (delta > 0)
                            $lastSel.nextAll(':lt(' + delta + '):not(.filterHide)').toggleClass('selected', $lastSel.hasClass('selected'));
                        else
                            $lastSel.prevAll(':lt(' + -delta + '):not(.filterHide)').toggleClass('selected', $lastSel.hasClass('selected'));
                    }
                    else
                        this.lastSel = $li[0];
                }
            }
        });
        $('<ol id="pageEditChannelsSource" class="pageEditChannels"></ol>').appendTo($panel).sortable({
            connectWith: '#pageEditChannels',
            revert: "invalid",
            remove: function (e, ui) {
                $('<li><em class="i-check"></em>'
                    //+ '<em class="i-check"></em>'
                    + '<span>' + ui.item.find('span').text()
                    + '</span><input type="text" value="' + ui.item.find('i').text()  + '" />'
                    //+ '<ol></ol>'
                    +'</li>').insertAfter(ui.item);
                return false;
            },
        }).hide();
        $panel.append('<br clear="all" />');
        $(window).bind("resize.editChannels", function () {
            var h = $(window).height() - $('#pageEditChannels').offset().top -20;
            if ($('#pageEditChannelsSource:visible').length == 0 || ($panel.width() - $('#pageEditChannels').width() - $('#pageEditChannelsSource').width() - 80) > 0)
                $('#pageEditChannels,#pageEditChannelsSource').css({ height: h });
            else {
                $('#pageEditChannels').height(h*0.66);
                $('#pageEditChannelsSource').height(h * 0.33);
            }
        }).trigger('resize');
        $(window).bind("epgd_close.editChannels", function () {
            $(window).unbind(".editChannels");
            epgd.channels.load();
        });

        /*
                    .find('ol').sortable({
                    connectWith: "#mergeSrc"
                });
        */
        /*,
            cancel: ???
            accept: function (event, ui) {
                console.log(ui);
                return $(event.target).html().indexOf('>' + ui.item.find('u').text()  + '<') > 0;
            }*/
        /*
                $('#mergeSrc').droppable({
                    accept: "#pageEditChannels ol li",
                    drop: function (event, ui) {
                        $(ui.draggable).remove();
                    }
                }).find('li').draggable({
                    connectToSortable: "#pageEditChannels ol",
                    helper: "clone",
                });
        */

        $('#pageEditChannelsHead em').click(function () {
            var $sel = null,
                 $lis;
            try {
                $sel = $(window.getSelection().getRangeAt(0).cloneContents()).children();
            } catch (e) { $sel = null; }
            if (!$sel || !$sel.length) {
                $lis = $('#pageEditChannels > li');
                $sel = $lis.filter('.selected');
                if (!$sel.length)
                    $sel = $lis;
            }

            $sel.find('> em:eq(' + this.parentNode.getAttribute('data-index') + ').i-check' + (this.className.indexOf('i-check-empty') > 0 ? '' : '-empty')).toggleClass('i-check i-check-empty');
        });

        $('#pageEditChannelsHead b').click(function () {
            var t = this.getAttribute('data-t');
            $('#pageEditChannels > li').toggleClass('selected', t == 1 ? true : t == 0 ? false : undefined);
            return false;
        });
        this.inp_ChID = $('#pageEditChannelsHead input:eq(0)').keyup(this.filter)[0];
        this.inp_ChName = $('#pageEditChannelsHead input:eq(1)').keyup(this.filter)[0];
    },
    filter: function () {
        var id = epgd.pages.editChannels.inp_ChID.value.toLowerCase(),
            name = epgd.pages.editChannels.inp_ChName.value.toLowerCase();
        $('#pageEditChannels > li').each(function () {
            var $li = $(this);
            if ((!id || $li.find('span').text().toLowerCase().indexOf(id) >= 0) && (!name || $li.find('input').val().toLowerCase().indexOf(name) >= 0))
                $li.removeClass('filterHide');
            else
                $li.addClass('filterHide');
        });
    },
    insertReferenceList: function (data) {
        var html = '',
            terms;
        $(data.split('\n')).each(function () {
            terms = this.split(':');
            if (terms[0])
                html += '<li><i>' + terms[0].split(/,|;/)[0] + '</i><span>' + terms[3] + '-' + terms[10] + '-' + terms[11] + '-' + terms[9] + '</span></li>';
        })
        $('#pageEditChannelsSource').show().html(html);
        $(window).trigger("resize.editChannels");
    }
};
