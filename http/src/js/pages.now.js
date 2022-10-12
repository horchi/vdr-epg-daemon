epgd.pages.now = {
    $ul: null,
    timestamp_min: -1,
    timestamp_max: 0,
    timestamp_cur: 0,

    init: function () {
        $(window).bind('channels_load', function () { epgd.pages.timestamp_max = 0; });
    },
    render: function () {
        //this.renderTime = new Date().getTime();
        if (!window.pages_now) {
            this.$search = $('<div style="float:left;margin-left:5px"></div>').appendTo($('#menu_now')).click(function () {
                if (this.curType == '@Now')
                    window.pages_now.setTime(null,'@Now');
            });
            var $searchMenu = this.$searchMenu = $('<ul class="ui-menu ui-widget ui-widget-content"></ul>').appendTo($('#menu_now')).hide();
            epgd.profile.quickTimes && epgd.profile.quickTimes.replace(/([^=]+)=!?([^~]+)~?/g, function (a, l, v) {
                $searchMenu.append('<li data-type="' + v + '" class="ui-menu-item ' + (v.indexOf('@') == 0 && v != '@Next' && v != '@Now' ? 'i-search' : 'i-clock') + '">' + l + '</li>');
            });
            if (!$searchMenu.find('li[data-type="@Next"]').length)
                $searchMenu.prepend('<li data-type="@Next" class="ui-menu-item">' + epgd.tr.pages.eventDetail.eventNext + '</li>');
            if (!$searchMenu.find('li[data-type="@Now"]').length)
                $searchMenu.prepend('<li data-type="@Now" class="ui-menu-item">' + epgd.tr.pages.dateTimePicker.currentText + '</li>');
            this.$searchMenu.click(function (ev) {
                if (ev.target.getAttribute('data-type')) {
                    window.pages_now.setTime(null, ev.target.getAttribute('data-type'));
                    $searchMenu.hide();
                }
            });
            $(window).bind("epgd_close.pages_now", function () {
                if (window.pages_now) {
                    epgd.$dtPicker.hide();
                    window.pages_now.$searchMenu.remove();
                    window.pages_now.$search.remove();
                    delete window.pages_now;
                }
                $(window).unbind(".pages_now");
                $('#menu_now').unbind(".pages_now");
            }).bind("datepicker.pages_now", function () {
                this.pages_now.setTime(epgd.utils.unixTime(epgd.$dtPicker.datetimepicker('getDate')));
            })[0].pages_now = this;
            this.$ul = epgd.$con.html('<div id="pageNow"><ul class="teaserList"></ul></div>').find('ul')
                .click(function (ev) {
                    if ($(ev.target).closest('.channel').length) {
                        $(window).trigger("epgd_close.eventDetail");
                        if (ev.target.className == 'i-tv')
                            epgd.vdrs.current.switchChannel(ev.target.parentNode.id);
                        else {
                            epgd.$menu.menu("select", { target: "#menu_magazine" });
                            epgd.pages.magazine.setChannel($(ev.target).closest('.channel').attr("id")); 
                        }
                        return;
                    }
                    var li = $(ev.target).closest('li')[0];
                    if (!li) return;
                    if (!li.eventDetail)
                        li.eventDetail = new epgd.eventDetail(li.title);
                    epgd.utils.loader.process(function () {
                        li.eventDetail.render();
                    });
                });
            this.setTime(null, '@Now');
        };
        $('#menu_now').addClass("menu-active").bind("click.pages_now", function (ev) {
            if ((ev.target == this || ev.target.nodeName == 'A') && window.pages_now) {
                window.pages_now.$searchMenu.show();
                ev.preventDefault();
            }
            return false;
        }).append(epgd.$dtPicker.show());
    },
    setTime: function (start, type) {
        type = type || '@time';
        var at = ' ' + epgd.tr.pages.now.at;
        if (type == '@Now' || type == '@time') {
            this.timestamp_cur = start || epgd.utils.unixTime(epgd.utils.now());
            this.load("data/events?time=" + this.timestamp_cur);
            epgd.$dtPicker.datetimepicker('setDate', epgd.utils.date(this.timestamp_cur));
        } else if (type == '@Next')
            this.load("data/events?next=1&time=" + this.timestamp_cur);
        else if (type[0] == '@') {
            at = ' ' + epgd.tr.menu.search;
            this.load("data/search", 'post', JSON.stringify({ autotimername: type.slice(1) }));
        } else {
            $.timepicker.quicklink({ target: { nodeName: 'U', innerHTML: type }, data: { unit: 'time' } });
            $(window).trigger('datepicker');
        }
        this.$search[0].curType = type;
        this.$search.text(this.$searchMenu.find('li[data-type="' + type + '"]').text() + at);
    },
    load: function (url,type,data) {
        epgd.utils.loader.process(function () {
            pages_now.$ul.empty();
            epgd.ajax({ url: epgd.login.url + url, async: false, cache: false, type:type,data:data }, function (data) {
                if (!data.events || !data.events.length) {
                    epgd.utils.loader.close();
                    return epgd.utils.popup(epgd.tr.error.noData);
                }
                var imgPath = epgd.profile.eventImgPath ? epgd.profile.eventImgPath + '?no=0&maxW=100&maxH=70&id=' : false,
                    min = 0,
                    max = 2000000000,
                    dFormat = epgd.tr.dateTimePicker.dateFormat.replace(/\.?y+/,'');
                    now = parseInt(epgd.utils.now().getTime() / 1000, 10);
                    //maxHeight = 0,
                $.each(data.events, function (id, event) {
                    var end = event.starttime + event.duration,
                        progress = ((now - event.starttime) / event.duration * 100),
                        desc = event.shortdescription || event.shorttext;
                    if (event.starttime > min) min = event.starttime;
                    if (end < max) max = end;
                    $('<li title="' + event.id + '" class="ui-widget-content ui-corner-all">'
                      + epgd.channels.getHtml(event.channelid)
                      + '<div class="time' + (event.timerid ? ' hasTimer' : '') + '"><b>' + epgd.utils.formatTime(event.starttime)
                        + '</b>&nbsp;&ndash;&nbsp;' + epgd.utils.formatTime(end) + ' ' + epgd.tr.oClock
                        + (event.tipp ? '<b class="tipp">' + event.tipp + '</b>' : '')
                      + '</div>'
                      + (progress > 0 && progress <= 100 ? '<div class="progress"><div style="width: ' + progress + '%"></div></div>' : '<div class="date">' + epgd.utils.formatDate(event.starttime, dFormat) + '</div>')
                      + '<div class="desc">'
                        + (imgPath && event.imagecount ? '<img src="' + imgPath + event.id + '" />' : '')
                        + '<div class="title">' + event.title
                            + (event.numrating ? '<span class="rate rate' + event.numrating + '"> </span>' : '')
                        + '</div>'
                        + (event.genre ? '<span>' + event.genre + '</span> ' : '') + (desc ? desc.replace(/\n/g, '<br />') : '')
                      + '</div>'
                      + '</li>').appendTo(pages_now.$ul);
                });
                epgd.pages.now.timestamp_min = min;
                epgd.pages.now.timestamp_max = max;
                epgd.utils.loader.close();
            });
        }, true);
    }
   
};
