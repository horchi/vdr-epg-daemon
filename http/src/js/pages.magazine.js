epgd.pages.magazine = {
    startTime: null,
    endTime: null,
    $head: null,
    $con: null,
    list: [],
    viewCnt: 0,
    scrollStart:0,
    timeLineL: null,
    timeLineR: null,
    qt:{},
    imgPath: epgd.profile.eventImgPath ? epgd.profile.eventImgPath + '?no=0&maxW=100&maxH=70&id=' : false,
    init: function () {
        //this.initQT();
        this.select = epgd.channels.selBox;

        $(window).bind('channels_load', function () {
            var self= epgd.pages.magazine,
                id;
            if (!self.$head)
                return;
            self.$head.empty();
            for (id in self.list)
                self.list[id].index = -1;
            self._initChannels();
            for (id in self.list)
                if (self.list[id].index == -1) {
                    self.preTime.removeChild(self.list[id].col);
                    delete self.list[id];
                };
        });
    },
    initQT: function () {
        var qt = {};
        epgd.profile.quickTimes.replace(/=([0-9]{1,2}):([0-9]{1,2})/g, function (a, h, m) {
            qt[parseInt(h,10)] = '<p' + (m ? ' style="margin-top:' + (m * 2) + 'px"' : '') + '> </p>';
        });
        this.qt= qt;
    },
    _initChannels: function () {
        var ch,i;
        for (i = 0; i < this.select.length; i++) {
            ch = this.list[this.select[i].value];
            if (!ch) {
                ch = new epgd.pages.magazine.channel(this.select[i].value, i, $('<div class="ui-widget-content"/>')[0]);
                this.list[ch.id] = ch;
            } else {
                ch.index = i;
            }
            this.preTime.appendChild(ch.col);
            this.select[i].ch = ch;
            this.$head.append('<div class="ui-widget-content ui-corner-top">' + epgd.channels.getHtml(ch.id) + '</div>')
        }
        this.$head.css('width',(208 * this.select.length + 55) + 'px');
    },
    _initWinBindings: function(){
        $(window)
         .bind("epgd_close.pages_magazine", function () {
             epgd.$dtPicker.hide();
             $(window).unbind(".pages_magazine");
             clearInterval(this.pages_magazine.timeInterval);
             delete this.pages_magazine;
         })
         .bind("resize.pages_magazine", function () {
             var w = $(window).width(),
                 l = $(this).scrollLeft();
             this.pages_magazine.$nav.width(w + 'px');
             this.pages_magazine.$con.css('height', ($(window).height() - 10 - $('#magazine').offset().top) + 'px');
             this.pages_magazine.viewCnt = parseInt((w - 110) / 208, 10);
             if (this.pages_magazine.viewCnt < 5 ) {
                 this.pages_magazine.timeLineR.style.left = '-50px';
                 this.pages_magazine.$con.css('width', (208 * this.pages_magazine.select.length + 25) + 'px');
             } else if (this.pages_magazine.viewCnt >= this.pages_magazine.select.length) {
                 this.pages_magazine.viewCnt = this.pages_magazine.select.length;
                 this.pages_magazine.timeLineR.style.left = '-50px';
                 w = this.pages_magazine.viewCnt * 208 + 55;
                 this.pages_magazine.$con.css('width', (w -30) + 'px');
             } else {
                 this.pages_magazine.timeLineR.style.left = (l + w - 52) + 'px';
                 this.pages_magazine.$con.css('width', (208 * this.pages_magazine.select.length + 150) + 'px');
             }
             this.pages_magazine.lineNow.style.width = (w - 10) + 'px';
             epgd.$menu.parent().offset({ 'left': l });
             this.pages_magazine.$nav.offset({ 'left': l });
             this.pages_magazine.update();
         })
         .bind("scroll.pages_magazine", function () {
             this.pages_magazine.timeLineL.style.left = '-50px';
             this.pages_magazine.timeLineR.style.left = '-50px';
         })
         .bind("scrollstop.pages_magazine", function () {
             var l = $(this).scrollLeft();
             this.pages_magazine.timeLineL.style.left = this.pages_magazine.lineNow.style.left = l + 'px';
             if (this.pages_magazine.viewCnt >= 5 && this.pages_magazine.viewCnt < this.pages_magazine.select.length)
                this.pages_magazine.timeLineR.style.left = (l + $(window).width() - 52) + 'px';
             this.pages_magazine.nextMain = parseInt((l + 104) / 208, 10);
             if (this.pages_magazine.select.selectedIndex != this.pages_magazine.nextMain)
                 this.pages_magazine.setMain(0, this.pages_magazine.nextMain, true);
             epgd.$menu.parent().offset({ 'left': l });
             this.pages_magazine.$nav.offset({ 'left': l });
             return false;
         })
         .bind("datepicker.pages_magazine", function () {
             this.pages_magazine.setTime(epgd.utils.unixTime(epgd.$dtPicker.datetimepicker('getDate') || epgd.utils.now()), true);
         })[0].pages_magazine = this;

        this.$con.bind('scrollstop.pages_magazine', function () {
            var s = $(this).scrollTop();
            if (s > this.pages_magazine.scrollEnd)
                this.pages_magazine.setTime(s * 30 + epgd.profile.minEventTime);
            else if (s < this.pages_magazine.scrollStart)
                this.pages_magazine.setTime(Math.max(this.pages_magazine.startTime - 43200, epgd.profile.minEventTime));   // 60 * 60 *12
        });

        this._setLineNow();
        this.timeInterval = setInterval(this._setLineNow, 60000);
      },
    _setLineNow: function(){
        var m = window.pages_magazine,
            now = new Date().getTime() / 1000;
        if (now > m.endTime || (m.startTime - epgd.profile.minEventTime) < -3600 ) {
            $(window).trigger("epgd_close");
            $('<div class="ui-widget-overlay ui-front"></div>').click(function () {
                epgd.profile.minEventTime = epgd.utils.now().getTime() / 1000 - 10800;
                $(window).trigger("profile_updated", { "minEventTime": true });
                epgd.$dtPicker.datetimepicker('setDate', epgd.utils.now());
                m.$con.empty();
                m.render();
                $(this).remove();
            }).appendTo(document.body);
            return;
        }
        m.lineNow.style.top = ((now - m.startTime) / 30 + m.scrollStart) + 'px';
        m.lineNow.innerHTML= epgd.utils.formatTime(now);
    },
    render: function (channel) {
        $('#menu_magazine').addClass("menu-active").append(epgd.$dtPicker.show());
        var startTime = epgd.utils.unixTime(epgd.utils.now()),
            d;
        if (this.startTime && (this.startTime - epgd.profile.minEventTime) < -3600) {
            this.startTime = null;
            this.list = [];
        }
        if (!this.startTime) {
            $(window).trigger("epgd_close");
            $(this.select).appendTo(epgd.$menu.find('#menu_magazine')).mousedown(function (ev) {
                ev.stopPropagation();
                return true;
            }).click(function (ev) {
                return false;
            }).change(function () {
                epgd.pages.magazine.render($(this).val());
            });
            if (this.select.selectedIndex < 0)
                this.select.selectedIndex = 0;
            this.$nav= $('<div id="magazine-nav"><div class="ui-widget-content ui-corner-top left"><div class="ui-widget-content ui-corner-top"><span class="iAsButton i-left-dir"></span><span class="iAsButton i-rewind"></span></div></div>'
                + '<div class="ui-widget-content ui-corner-top right"><div class="ui-widget-content ui-corner-top"><span class="iAsButton i-right-dir"></span><span class="iAsButton i-forward"></span></div></div></div>')
            this.$head = $('<div id="magazine-head"></div>');
            this.$con = $('<div id="magazine"></div>');
            this.$con[0].pages_magazine = this;
            this.preTime = $('<div style="height:' + parseInt((epgd.profile.maxEventTime - epgd.profile.minEventTime) / 30,10) + 'px"></div>').appendTo(this.$con)[0];
            this.timeLineL = $('<div class="ui-widget-content timeLine"></div>').appendTo(this.preTime)[0];
            this.timeLineR = $('<div class="ui-widget-content timeLine tlr"></div>').appendTo(this.preTime)[0];
            this.lineNow = $('<p class="timeNow"></p>').appendTo(this.preTime)[0];
            this._initChannels();
            this.startTime = startTime+3600;
            d = new Date(this.startTime * 1000);
            if (d.getMinutes() > 0) {
                d.setMinutes(0);
                this.startTime = d.getTime() / 1000;
            }
            this.endTime = this.startTime;
            this.setTime(this.startTime-7200);
        }
        if (!window.pages_magazine) {
            this._initWinBindings();
            epgd.$con.empty();
            this.$nav.appendTo(epgd.$con).bind("click", this.actionHead);
            this.$head.appendTo(epgd.$con).bind('click', function (ev) {
                if (ev.target.className == 'i-tv')
                    epgd.vdrs.current.switchChannel(ev.target.parentNode.id);
            });
            this.$con.appendTo(epgd.$con).bind("click", this.actionCon).bind("touchend",this.actionConOpen);
            if (!$.support.touch && epgd.profile.magazinePan > 0)
                this._pan();
        }
        $(window).trigger("resize.pages_magazine");
        if (channel)
            this.setChannel(channel);
        if (startTime < this.startTime || startTime > this.endTime)
            this.setTime(startTime);
        this.$con.scrollTop((startTime - epgd.profile.minEventTime) / 30 - 15);
        $(window).trigger("resize.pages_magazine");
    },
    _pan: function(){
        var pan = false,
            tp = $('<div style="width:90%; height:35px; margin-top:15px; position:fixed;z-index:99;left:5%"></div>').prependTo(epgd.$con)[0],
            bot = $('<div style="width:90%; height:35px; position:fixed;z-index:99;bottom:0;left:5%"></div>').appendTo(epgd.$con)[0];
        this.timeLineL.pan = -1;
        this.timeLineR.pan = 1;
        tp.pan = epgd.profile.magazinePan * -30;  
        bot.pan = epgd.profile.magazinePan * 30;

        window.tp = tp;
        window.bp = bot;
        window.p = pan;
        $([this.timeLineL, this.timeLineR, tp, bot]).mouseover(function (ev) {
            if (pan) return;
            pan = this.pan;
            window.setTimeout(function () {
                if (pan) {
                    var checkPan = window.setInterval(function () {
                        if (!pan || !window.pages_magazine)
                            return window.clearInterval(checkPan);
                        if (pan < -1 || pan > 1)
                            window.pages_magazine.setTime((window.pages_magazine.$con.scrollTop() + 15) * 30 + epgd.profile.minEventTime + pan, true);
                        else
                            window.pages_magazine.setMain(pan);
                    }, (pan < -1 || pan > 1 ? 100 : 1200));
                }
            }, epgd.profile.magazinePanDelay);
        }).mouseout(function () {
            pan = false;
        });
    },
    setChannel: function (channel) { 
        if (this.list.lengt > 0)
            this.setMain(0, this.list[channel].index); 
        else{
            var self= this; 
            $(window).one("resize.pages_magazine",function(){
                self.setMain(0, self.list[channel].index); 
            })
        }
    },
    setMain: function (delta, baseIndex, dontScroll) {
        var optList = this.select,
            i = isNaN(baseIndex) ? optList.selectedIndex : baseIndex;
        i += delta;
        if (i < 0)
            i = 0;//+= optList.length;
        else if (i >= optList.length - this.viewCnt)
            i = optList.length - this.viewCnt;// -= optList.length;
        optList.selectedIndex = i;
        this.update();
        !dontScroll && $(window).scrollLeft(i * 208);
    },
    setTime: function (start, doScroll) {
        var t, insHtml = '',
            h,
            newEndTime = start + 43200; //86400; //60 * 60 * 24
        if (start < this.startTime) {
            do {
                this.startTime -= 3600;
                t = epgd.utils.formatTime(this.startTime);
                h = parseInt(t, 10);
                if (h % 4 == 0) //if (t == '00:00')
                    t += $.datepicker.formatDate('<br />D,<br />dd<br />MM<br />yy', new Date(this.startTime * 1000))
                insHtml = (this.qt[h] || '') + '<dfn>' + t + '</dfn>' + insHtml;
            } while (this.startTime > start);
            $(this.timeLineL).prepend(insHtml);
            $(this.timeLineR).prepend(insHtml);
            this.scrollStart = (this.startTime - epgd.profile.minEventTime) / 30;
            if (this.scrollStart < 0) {
                this.scrollStart = 0;
                this._setLineNow();
            } 
            this.preTime.style.paddingTop = this.scrollStart + 'px';
        }
        if (this.endTime < newEndTime) {
            insHtml = '';
            newEndTime = Math.max(newEndTime, this.endTime + 43200);  //60 * 60 * 12
            for (; this.endTime < newEndTime; this.endTime += 3600) {
                t = epgd.utils.formatTime(this.endTime);
                h = parseInt(t, 10);
                if (h % 4 == 0)
                    t += $.datepicker.formatDate('<br />D,<br />dd<br />M<br />yy', new Date(this.endTime * 1000));
                insHtml += (this.qt[h] || '') + '<dfn>' + t + '</dfn>';
            }
            $(this.timeLineL).append(insHtml);
            $(this.timeLineR).append(insHtml);
            this.scrollEnd = (this.endTime - epgd.profile.minEventTime - 43200) / 30; // 60 * 60 *12
        }
        insHtml && this.update();
        doScroll && this.$con.scrollTop((start - epgd.profile.minEventTime) / 30 - 15);
    },
    actionHead: function (ev) {
        var self = epgd.pages.magazine,
            c;
        if (ev.target.nodeName == 'SPAN') {
            c = ev.target.className;
            if (c.indexOf('i-left-dir') > -1)
                self.setMain(-1);
            else if (c.indexOf('i-rewind') > -1)
                self.setMain(-self.viewCnt);
            else if (c.indexOf('i-right-dir') > -1)
                self.setMain(1);
            else if (c.indexOf('i-forward') > -1)
                self.setMain(self.viewCnt);
        }
    },
    actionConOpen: function (ev) {
        var dt = $(ev.target).closest('dt')[0];
        if (dt)
            dt.firstOpen = (dt.clientHeight != dt.scrollHeight);
    },
    actionCon: function (ev) {
        var dt = $(ev.target).closest('dt')[0];
        if (dt) {
            if (dt.firstOpen)
                return false;
            if (!dt.eventDetail)
                dt.eventDetail = new epgd.eventDetail(dt.title);
            epgd.utils.loader.process(function () {
                dt.eventDetail.render();
            });
        }
    },
    update: function () {
        var self = this,
            i;
        for (i = 0, j = this.select.selectedIndex; i < this.viewCnt && j < this.select.length; i++)
            this.select[j++].ch.updateTime();
        window.setTimeout(function () {
            for (var i = 0, j = self.select.selectedIndex + self.viewCnt; i < self.viewCnt && j < self.select.length; i++)
                self.select[j++].ch.updateTime();
        }, 500);                                                                                     
    }
};

epgd.pages.magazine.channel = function (id,index, col) {
    this.id = id;
    this.index = index;
    this.col = col;
    this.startTime;
    this.endTime;
}
epgd.pages.magazine.channel.prototype = {
    updateTime: function () {
        if (!this.startTime) {
            this.startTime = epgd.pages.magazine.startTime;
            this.endTime = epgd.pages.magazine.endTime;
            this.loadData(epgd.pages.magazine.startTime, epgd.pages.magazine.endTime);
        } else {
            if (epgd.pages.magazine.startTime < this.startTime)
                this.loadData( epgd.pages.magazine.startTime, this.startTime);
            if (epgd.pages.magazine.endTime > this.endTime)
                this.loadData(this.endTime, epgd.pages.magazine.endTime);
        }
    },
    loadData: function (startTime, endTime) {
        var self = this,
            insAfter= (self.endTime < endTime);
        if (insAfter)
            self.endTime = endTime;
        else
            self.startTime = startTime;
        epgd.ajax({ url: epgd.login.url + "data/events?time=" + startTime + '&endtime=' + endTime + '&channelid=' + this.id }, function (data) {
            var insHtml = '',
                first = data.events[0],
                i,
                event,
                $dt= null,
                $col = $(self.col),
                desc,h,d,
                eTime;
            if (first) {
                if (insAfter) {
                    $dt = $col.find('dt:last');
                    eTime = $dt[0].eTime;
                    if ($dt.attr('title') == first.id)
                        delete data.events[0];
                } else {
                    eTime = first.starttime;
                    $dt = $col.find('dt:first');
                    if ($dt.attr('title') == data.events[data.events.length - 1].id)
                        delete data.events[data.events.length-1];
                }
                for (i = 0; i < data.events.length; i++) {
                    event = data.events[i];
                    desc = event.shortdescription || event.shorttext;
                    h = event.duration;
                    d = parseInt(h / 60, 10);/*,
                    fav = epgd.profile.fav ? ';border-color:' + epgd.profile.fav(event) : ''*/;
                    h += (event.starttime - eTime);
                    h = h < 600 ? 20 : parseInt(h / 30, 10);     // 20px = 10 Minuten
                    eTime += h * 30;
                    insHtml += '<dt title="' + event.id + '" style="height:' + h + 'px;min-height:' + h + 'px">'     //' + fav + '
                        + '<div class="title">' + event.title + '</div>'
                        + (epgd.pages.magazine.imgPath && event.imagecount ? '<img src="' + epgd.pages.magazine.imgPath + event.id + '" />' : '')
                        + '<div class="time' + (event.timerid ? ' hasTimer' : '') + '"><u>' + epgd.utils.formatTime(event.starttime) + '</u><i>' + d + '&nbsp;' + epgd.tr.minutes + '</i></div>'
                        + (event.numrating ? '<span class="rate rate' + event.numrating + '"> </span>' : '')
                        + (event.tipp ? '<b class="tipp">' + event.tipp + '</b>' : '')
                        + '<div class="desc">' + (event.genre ? '<span>' + event.genre + '</span> ' : '') + (desc ? desc.replace(/\n/g, '<br />') : '')
                      + '</div></dt>';
                };
            } else {
                h = (endTime - startTime) / 30;
                insHtml = '<div style="height:' + h + 'px;min-height:' + h + 'px"></div>';
                first = { starttime: startTime };
                eTime = startTime;
            } 
            if (insAfter) {
                $col.append(insHtml);
                $col.find('dt:last')[0].eTime = eTime;
            } else {
                $col.prepend(insHtml);
                if ($dt && $dt.length) {
                    $dt.css('margin-top', '');
                    h = $dt[0].starttime - eTime;
                    if (h) {
                        h = parseInt(h/30,10) + parseInt($dt.css('min-height'), 10);
                        $dt.css({ "height": h + 'px', "min-height": h + 'px' })
                    }
                } else
                    $col.find('dt:last')[0].eTime = eTime;
                $col.find('dt:first').css('margin-top', parseInt((first.starttime - startTime) / 30, 10))[0].starttime= first;
            }
            //self.html = $(col).html();
        });
    }
};
