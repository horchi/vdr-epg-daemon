epgd.eventDetail = function (id) {
    this.id = id;
    this.data = null;
    this.expire = 0;
}
epgd.eventDetail.prototype.imgPath = false;
epgd.eventDetail.prototype.load = function (channelId, time) {
    var self = this;
    epgd.ajax({
        url: epgd.login.url + "data/event?" + (channelId && time ? "channelid=" + channelId + "&time=" + time : "id=" + this.id), async: false, cache: false
    }, function (data) {
        self.data = data.event; self.id = data.id; self.expire = epgd.utils.now().getTime() + 900000;
    });     //15*60*1000
    return this;
}
epgd.eventDetail.prototype.render = function () {
    if (this.expire < epgd.utils.now().getTime())
        this.load();
    if (!this.data)
        return '';
    this.win.render(this);
};
epgd.eventDetail.prototype.doRecord = function (eData) {
    if (eData === true) return epgd.tr.pages.eventDetail.record; // eData = getTitle
    eData = eData || this.data;
    var tData = {
        id: eData.timerid,
        eventid: eData.id,
        channelid: eData.channelid,
        title: eData.title,
        evStartTime: eData.starttime,
        evDuration: eData.duration,
        category: eData.category,
        shorttext: eData.shorttext,
        expression: eData.title
    };
    if (tData.eventid)
        epgd.pages.timerList.dialog.render(tData);
    else
        epgd.pages.searchTimerList.dialog.render(tData);
}
epgd.eventDetail.prototype.doRepeat = function (checkAvail) {
    if (checkAvail) return true;
    var win = this.win,
        $repeatHdl = win.$con.find('.repeat'),
        searchData;
    if (!$repeatHdl.length) {
        if (!this.searchResultList) {
            this.searchResultList = new epgd.searchResultList(null, {
                resize: function () {
                    win.$con.last().find('td[data-evId="' + win.detail.data.id + '"]').parent().remove();
                    win.$con.accordion("refresh");
                    $repeatHdl.click();
                }
            });
        }
        $repeatHdl = $('<h3 class="repeat">' + epgd.tr.pages.eventDetail.repeat + '</h3>').appendTo(win.$con);
        searchData = { searchfields: 1, expression: this.data.title, searchmode: 1, casesensitiv: 1, fromEventDetail: true };
        if (this.data.shorttext) {
            searchData.searchfields1= 2;
            searchData.expression1 = this.data.shorttext;
        }
        epgd.pages.search.search.call(this, $('<div class="desc"></div>').appendTo(win.$con), searchData);
    } else 
        $repeatHdl.click();
}
epgd.eventDetail.prototype.doPlay = function (checkAvail) {
    var t = parseInt(epgd.utils.now().getTime() / 1000, 10) - this.data.starttime;
    if (t < 0 || t > this.data.duration)
        return false;
    if (checkAvail) return true;
    epgd.vdrs.current.switchChannel(this.data.channelid);
}
epgd.eventDetail.prototype.doPrev = function (checkAvail) {
    var t = this.data.starttime - 500,
        self = this;
    if (t < epgd.profile.minEventTime)
        return false;
    if (checkAvail) return true;
    epgd.utils.loader.process(function () {
        new epgd.eventDetail().load(self.data.channelid, t).render();
    });
}
epgd.eventDetail.prototype.doNext = function (checkAvail) {
    var t = this.data.starttime + this.data.duration + 500,
        self = this;
    if (t > epgd.profile.maxEventTime)
        return false;
    if (checkAvail) return true;
    epgd.utils.loader.process(function () {
        new epgd.eventDetail().load(self.data.channelid, t).render();
    });
}

epgd.eventDetail.win = function () {
    this._create();
    this.closed = true;
    this.detail = null;
    var win = this;
    $(window).bind("epgd_close.eventDetail", function () {
        if (!win.closed) {
            //win.$win.css('left', '');
            win.$win.css('z-Index', '');
            win.$win.hide();
            $(document).unbind("keyup.eventDetail");
            win.closed = true;
            win.$openDialogs && win.$openDialogs.removeClass("ui-state-disabled");
        }
    });
    $(window).bind("resize.eventDetail", function (ev) {
        if (!win.closed) {
            try {
                win.$win.css("max-width", $(window).width());
                win.$win.show().position({ of: window });
                win.$con.accordion("refresh");
            } catch (e) { }
            if (parseInt(win.$win.css('top'), 10) < 69)
                win.$win.css('top', '69px');
        };
    });
}
epgd.eventDetail.win.prototype._create = function () {
    this.imgPath = epgd.profile.eventImgPath ? epgd.profile.eventImgPath + '?no=0&maxW=270&maxH=146&id=' : false;
    this.movieImgPath = epgd.profile.movieMediaPath ? epgd.profile.movieMediaPath + '?actor_id=0&movie_id=' : false;
    this.movieActorImgPath = epgd.profile.movieMediaPath ? epgd.profile.movieMediaPath + '?maxW=60&maxH=90&media_type=4&actor_id=' : false;
    this.serieImgPath = epgd.profile.serieImgPath ? epgd.profile.serieImgPath + '?actor_id=0&series_id=' : false;
    this.serieActorImgPath = epgd.profile.serieImgPath ? epgd.profile.serieImgPath + '?maxW=60&maxH=90&season_number=0&episode_id=0&media_type=11&actor_id=' : false;

    this.$win = $('<div id="eventDetail" class="ui-front">'
        + '<div class="ui-front ui-widget ui-widget-content ui-corner-all" style="position:absolute;width:100%;height:100%">'
            + '<div class="toolbar ui-widget-header ui-corner-all"></div>'
            + '<div></div>'
        + '</div>'
        + '<div class="ui-widget ui-widget-shadow ui-corner-all" style="position:absolute;width:100%;height:100%"></div>'
        + '</div>').appendTo(document.body);
    this.$con = this.$win.find(':first :last');
    var win = this,
        tr = epgd.tr.pages.eventDetail,
        toolbar = this.$win.find('.toolbar')[0];
    this.$rec= $('<button class="iAsButton i-record"/>').css('float', 'left').appendTo(toolbar).click(function () { win.detail.doRecord() });
    $('<button class="iAsButton i-buffer" title="' + tr.repeat + '" />').css('float', 'left').appendTo(toolbar).click(function () { win.detail.doRepeat() });
    this.$play = $('<button class="iAsButton i-tv" title="' + tr.ch_switch + '" />').css('float', 'left').appendTo(toolbar).click(function () { win.detail.doPlay() });
    this.$prev = $('<button class="iAsButton i-rewind" title="' + tr.eventPrev + '" />').appendTo(toolbar).click(function () { win.detail.doPrev() });
    this.$next = $('<button class="iAsButton i-forward" title="' + tr.eventNext + '" />').appendTo(toolbar).click(function () { win.detail.doNext() });
    $('<button class="iAsButton i-cancel" title="' + epgd.tr.close + '" />').css('float', 'right').appendTo(toolbar).click(function () { $(window).trigger("epgd_close.eventDetail"); });
}

epgd.eventDetail.win.prototype.render = function (detail) {
    this.detail = detail;
    var e = detail.data,
        tr = epgd.tr.pages.eventDetail,
        progress = ((parseInt(epgd.utils.now().getTime() / 1000, 10) - e.starttime) / e.duration * 100),
        stars = '',
        ep = e.episode || {},
        desc = e.longdescription ? '<div title="longdescription">' + e.longdescription + '</div>' : '',
        extInfo = '',
        actors = null,
        mainImg = (this.imgPath && e.imagecount ? this.imgPath + e.id : ''),
        firstImg = null,
        constTitle= ep.episodename || e.title,
        isMobile = $(window).width() < 500,
        terms, i, sc, actor, info1, info2,
        recordings= '';
    if (e.cntlongdescription)
        desc += '<hr><div title="cntlongdescription">' + e.cntlongdescription + '</div>';
    if (e.rating) {
        terms = e.rating.slice(e.rating.indexOf('/')).split(' ');
        for (i = 1; i < terms.length; i += 3)
            stars += terms[i] + '<div class="stars' + terms[i + 1].length + '"> </div>';
    }

    extInfo = "";
    for (i in tr.extInfo)
        if (e[i]) extInfo += '<tr><th>' + tr.extInfo[i] + '</th><td>' + e[i] + '</td></tr>';

    if (e.scraper && (sc = e.scraper.movie || e.scraper.serie)) {
        sc.media = sc.media || [];
        if (sc.actors) {
            actors = '';
            for (i in sc.actors) {
                actor = sc.actors[i];
                actors += '<div>' + (this.movieActorImgPath && actor.actorid ? '<img src="' + this.movieActorImgPath + actor.actorid + '" />' : '')
                    + '<a href="' + epgd.profile.movieActorPath + actor.actorid + '" target="_blank">' + actor.actorname + '</a>' + (actor.actorrole || '') + '</div>';
            }
        }
        if (e.scraper.movie) {
            sc.isMovie= true;
            if ( sc.media  && this.movieImgPath){
                if (!mainImg && sc.media["1"])
                    mainImg = this.movieImgPath + sc.movieid + '&media_type=1&maxW=270&maxH=146';
                if (sc.media["3"])
                    firstImg = this.movieImgPath + sc.movieid + '&media_type=3&maxW=400&maxH=999';
                else if (sc.media["1"])
                    firstImg = this.movieImgPath + sc.movieid + '&media_type=1&maxW=400&maxH=999';
            }

            if (sc.actors) {
                actors = '';
                for (i in sc.actors) {
                    actor = sc.actors[i];
                    actors += '<div>' + (this.movieActorImgPath ? '<img src="' + this.movieActorImgPath + i + '" />' : '')
                        + '<a href="' + epgd.profile.movieActorPath + i + '" target="_blank">' + actor.actorname + '</a>' + (actor.actorrole || '') + '</div>';
                }
            } 
            if (sc.overview)
                desc = '<div title="overview">' + sc.overview + "</div><hr />" + desc;

            /* 0=mmPoster,  1=mmFanart,    2=mmCollectionPoster,   3=mmCollectionFanart,   4=mmActorThumb, 5=mmPosterThumb */
            extInfo = '<h3><span>' + tr.scrapperMovieInfo + '</span></h3><div>'
                + '<table class="colFull">'
                + (sc.media["1"] && this.movieImgPath ? '<tr><th colspan="2"><img src="' + this.movieImgPath + sc.movieid + '&media_type=1&maxW=397&maxH=400" /></th></tr>' : '')
                + (sc.title ? '<tr><th>' + tr.title + '</th><td>' + sc.title + '</td></tr>' : '')
                + (sc.originaltitle ? '<tr><th>' + tr.original_title + '</th><td>' + sc.originaltitle + '</td></tr>' : '')
                + (sc.runtime ? '<tr><th>' + tr.runtime + '</th><td>' + sc.runtime + ' ' + epgd.tr.minutes + '</td></tr>' : '')
                + (sc.movie_release_date ? '<tr><th>' + tr.release_date + '</th><td>' + sc.movie_release_date + '</td></tr>' : '')
                + (sc.genres ? '<tr><th>' + tr.genre + '</th><td>' + sc.genres.replace(/^\||\|$/g, '').replace(/ ?\| ?/g, ', ') + '</td></tr>' : '')
                + (sc.voteaverage ? '<tr><th>' + tr.vote_average + '</th><td class="stars"><div class="stars5" style="width:' + parseInt(sc.voteaverage * 8, 10) + 'px"></div> (' + sc.voteaverage.toFixed(1) + ' / 10)</td></tr>' : '')
                + (sc.popularity ? '<tr><th>' + tr.popularity + '</th><td>' + sc.popularity.toFixed(1) + '</td></tr>' : '')
                + extInfo
                + (sc.budget ? '<tr><th>Budget</th><td>$' + sc.budget + '</td></tr>' : '')
                + (sc.revenue ? '<tr><th>Einnahmen</th><td>$' + sc.revenue + '</td></tr>' : '')
                + (sc.homepage ? '<tr><th>' + tr.homepage + '</th><td><a href="' + sc.homepage + '">' + sc.homepage + '</a></td></tr>' : '')
                + '</table>'
                + (sc.media["0"] && this.movieImgPath ? '<img class="poster" src="' + this.movieImgPath + sc.movieid + '&media_type=0&maxW=390&maxh=999" />' : '');
        } else {
            sc.isSerie = true;
            /*0=msBanner1, 1=msBanner2, 2=msBanner3, 3=msPoster1, 4=msPoster2, 5=msPoster3, 7=msFanart1,8=msFanart2, 9=msFanart3, 
              6=msSeasonPoster, 10=msEpisodePic, 
              11=msActorThumb, 12=msPosterThumb, 13=msSeasonPosterThumb, */
            if (sc.actors) {
                actors = '';
                for (i in sc.actors) {
                    actor = sc.actors[i];
                    actors += '<div>' + (this.serieActorImgPath ? '<img src="' + this.serieActorImgPath + i + '&series_id=' + sc.seriesid + '" />' : '')
                        + '<a>' + actor.actorname + '</a>' + (actor.actorrole ? actor.actorrole.replace(/\|/g, '<br />') : '') + '</div>';
                }
            }
            terms = sc.episode;
            if (terms) {
                if (terms.episodeoverview){
                    if ( e.longdescription && terms.episodeoverview.length > e.longdescription.length)
                        desc = desc.replace(/^<div.+<\/div>/i, '');
                    desc= '<div title="episodeoverview">' + terms.episodeoverview + '</div>' + desc;
                }
                desc = '<h5>' + terms.episodename + '</h5>' + desc;
                if (terms.episodegueststars)
                    actors += '</div><div class="colFull actors"><h5>' + tr.gueststars + '</h5><br />' + terms.episodegueststars.replace(/^\||\|$/g, '').replace(/\|/g, '<br />');
            }
            if (!mainImg && sc.media["10"] && this.serieImgPath)
                mainImg = this.serieImgPath + sc.seriesid + '&season_number=' + terms.seasonnumber + '&episode_id=' + terms.episodeid + '&media_type=10&maxW=270&maxH=146';
            if (sc.media["7"])
                firstImg = this.serieImgPath + sc.seriesid + '&season_number=0&episode_id=0&media_type=7&maxW=400&maxh=999';
            if (sc.seriesoverview)
                desc += desc ? '<hr /><a href="#" onclick="return !$(this).next().toggle()">Serienbeschreibung</a><div style="display:none" title="seriesoverview">' + sc.seriesoverview + "</div>" : '<div>' + sc.seriesoverview + '</div>';
            extInfo = '<h3><span>' + tr.scrapperSerieInfo + '</span></h3><div>'
                + '<table class="colFull">'
                + (sc.media["1"] && this.serieImgPath ? '<tr><th colspan="2"><img src="' + this.serieImgPath + sc.seriesid + '&season_number=0&episode_id=0&media_type=1&maxW=397&maxH=250" /></th></tr>' : '')
                + (sc.media["10"] && this.serieImgPath ? '<tr><th colspan="2"><img src="' + this.serieImgPath + sc.seriesid + '&season_number=' + terms.seasonnumber + '&episode_id=' + terms.episodeid + '&media_type=10&maxW=397&maxH=400" /></th></tr>' : '')
                + (sc.seriesname ? '<tr><th>' + tr.title + '</th><td>' + sc.seriesname + '</td></tr>' : '')
                + (sc.seriesnetwork ? '<tr><th>' + tr.network + '</th><td>' + sc.seriesnetwork + '</td></tr>' : '')
                + (sc.seriesstatus ? '<tr><th>' + tr.seriesstatus + '</th><td>' + sc.seriesstatus + '</td></tr>' : '')
                + (sc.seriesfirstaired ? '<tr><th>' + tr.release_date + '</th><td>' + sc.seriesfirstaired + '</td></tr>' : '')
                + (sc.seriesgenre ? '<tr><th>' + tr.genre + '</th><td>' + sc.seriesgenre.replace(/^\||\|$/g, '').replace(/ ?\| ?/g, ', ') + '</td></tr>' : '')
                + (sc.seriesrating ? '<tr><th>' + tr.vote_average + '</th><td class="stars"><div class="stars5" style="width:' + parseInt(sc.seriesrating * 8, 10) + 'px"></div> (' + sc.seriesrating.toFixed(1) + ' / 10)</td></tr>' : '')
                + extInfo
                + (epgd.profile.serieSeasonPath ? '<tr><td colspan="2"><a href="' + epgd.profile.serieSeasonPath + sc.seriesid + '" target="_blank">' + tr.homepage + '</a></td></tr>' : '')
                + '</table>'
                + (sc.media["6"] && this.serieImgPath ? '<img class="poster" src="' + this.serieImgPath + sc.seriesid + '&season_number=' + terms.seasonnumber + '&episode_id=0&media_type=6&maxW=390&maxh=999" />' : '')
                + (sc.media["3"] && this.serieImgPath ? '<img class="poster" src="' + this.serieImgPath + sc.seriesid + '&season_number=0&episode_id=0&media_type=3&maxW=390&maxh=999" />' : '');
        }
    } else {
        sc = {};
        extInfo = '<h3><span>' + tr.extentedInfo + '</span></h3><div><table class="colFull">'
            + '<tr><th>' + tr.title + '</th><td>' + e.title + '</td></tr>'
            + (ep.partname ? '<tr><th>' + tr.part + '</th><td>' + ep.partname + '</td></tr>' : '')
            + (e.year ? '<tr><th>' + tr.release_date + '</th><td>' + e.year + '</td></tr>' : '')
            + (ep.lang ? '<tr><th>' + tr.lang + '</th><td>' + ep.lang + '</td></tr>' : '')
            + extInfo
            + '</table>';
    }
    if (!actors && e.actor)
        actors = e.actor.replace(/, /g, '<br />');
    actors && (extInfo += '<div class="colFull actors"><h5>' + tr.actors + '</h5>' + actors + '</div>');
    extInfo && (extInfo += '</div>');

    info1 = (e.path ? epgd.tr.pages.timerList.folder + '<br />' + e.path.replace(/\//g, ' / ') + '<br />' : '')
        + (e.genre ? (tr.genre + '<b>' + e.genre + '</b><br />') : '')
        + (e.category ? tr.category + '<b>' + e.category + '</b><br />' : '')
        + (e.country ? tr.country + '<b>' + e.country + '</b><br />' : '')
        + (e.year ? tr.year + '<b>' + e.year + '</b><br />' : '');
    info2 = (ep.part ? tr.part + '<b>' + ep.part + (ep.parts ? ' / ' + ep.parts + '' : '') + '</b><br />' : '')
        + (ep.season ? tr.season + '<b>' + ep.season + '</b><br />' : '')
        + (ep.number ? tr.number + '<b>' + ep.number + '</b><br />' : '')
        + (ep.extracol1 ? ep.extracol1 + '<br />' : '')
        + (ep.extracol2 ? ep.extracol2 + '<br />' : '')
        + (ep.extracol3 ? ep.extracol3 + '<br />' : '');

   /*
    e.recordings = [
         {
             "matchdensityshorttext": 12,
             "owner": "7F13E490-09B3-401C-B26C-8B7F2F111014",
             "name": "Star Wars: Episode III - Die Rache der Sith",
             "duration": 10736,
             "path": "Die_Biene_Maja/S03E04/2014-03-23.06.53.29-0.rec",
             "md5path": "f6abd21ea13f52626723b3321c7a8c42",
             "matchdensitytitle": 68,
             "starttime": 1395553980,
             "title": "Star Wars: Episode III - Die Rache der Sith",
             "shorttext": "Science-Fiction (USA 2005)"
         },
         {
             "matchdensityshorttext": 48,
             "owner": "7F13E490-09B3-401C-B26C-8B7F2F111014",
             "name": "Star Wars: Das Erwachen der Macht",
             "duration": 8783,
             "path": "Das_Traumhotel/2016-05-15.18.28.64-0.rec",
             "md5path": "0279b0d04b68e891ef2b7e6d8bcdd059",
             "matchdensitytitle": 70,
             "starttime": 1463329680,
             "title": "Star Wars: Das Erwachen der Macht",
             "sho__rttext": "Star Wars - Episode VII: The Force Awakens"
         }
    ];
    */

    if (e.recordings)
        for (i in e.recordings) {
            terms= e.recordings[i];
            recordings += '<div class="rec" data-start="' + terms.starttime + '" data-owner="' + (terms.owner || '')
                + '" data-md5="' + terms.md5path + '" data-path="' + terms.path + '">'
                + '<em>' + epgd.utils.formatDateTime(terms.starttime) + '</em><u>' + parseInt(terms.duration / 60, 10) + ' ' + epgd.tr.minutes
                + '</u><b onclick="new epgd.recordDetail(this.parentNode).render()">'
                + '<div class="progress" title="' + terms.matchdensitytitle + '% ' + epgd.tr.pages.search.matchdensity + '"><div style="width:' + terms.matchdensitytitle + '%" ></div></div>' + terms.title
                + (terms.shorttext ? '<i><div class="progress" title="' + terms.matchdensityshorttext + '% ' + epgd.tr.pages.search.matchdensity + '"><div style="width:' + terms.matchdensityshorttext + '%" ></div></div>' + terms.shorttext + '</i>' : '')
                + '</b></div>';
        }

    this.$con = $('<div><h3><div class="date">' + $.datepicker.formatDate(isMobile ? 'd. M y' : 'd. MM yy', epgd.utils.date(e.starttime)) + '</div>'
               + (isMobile ? '' : e.title) + '<div class="time"><b>'
          + epgd.utils.formatTime(e.starttime) + '</b>&nbsp;&ndash;&nbsp;' + epgd.utils.formatTime(e.starttime + e.duration)
          + ' ' + epgd.tr.oClock + '&nbsp;|&nbsp;' + parseInt(e.duration / 60, 10) + ' ' + epgd.tr.minutes + '</div></h3>'
          + '<div>'
              + '<div class="colFull">'
                 + '<div class="imgBox">' + (mainImg ? '<img src="' + mainImg + '" />' : '') + '</div>'
                 + '<div class="chPrFl">'
                    + epgd.channels.getHtml(e.channelid)
                    + (progress > 0 && progress <= 100 ? '<div class="progress"><div style="width: ' + progress + '%"></div></div>' : '')
                    + '<div class="audio">'
                        + (e.flags && e.flags.indexOf('16:9') > 0 ? '<span class="a-169"></span>' : '')
                        + (e.audio && e.audio.indexOf('DolbyDigital') >= 0 ? '<span class="a-dd" title="DolbyDigital"></span>' : '')
                        + (e.flags && e.flags.indexOf('Live') > 0 ? 'Live' : '')
                        + (e.parentalrating ? '<div class="parRate' + e.parentalrating + '">' + tr.parentalrating + e.parentalrating + '</div>' : '')
                    + '</div>'
                    + (e.merge ? '<div>' + tr.mergeSrc + e.merge + '</div>' : '')
                + '</div>'
                + (stars ? '<div class="stars">' + stars + '</div>' : '')
                + '<div class="col2">'
                    + e.title + (ep.partname ? '<br /><i>' + ep.partname + '</i>' : (e.shorttext ? '<br /><i>' + e.shorttext + '</i>' : ''))
                + '</div><div class="col2 rate rate' + (e.numrating || '0') + '">'
                    + (e.tipp ? '<b class="tipp">' + e.tipp + '</b>' : '')
                    + (e.txtrating ? '<span>' + e.txtrating + '</span>' : '')
                    + (e.shortreview || '')
                + '</div>'
                + (info1 ? '<div class="info">' + info1 + '</div>': '')
                + (info2 ? '<div class="info">' + info2 + '</div>' : '')
                + (firstImg ? '<img src="' + firstImg + '" />' : '')
            + '</div>'
            + '<div class="colFull desc">' + (desc ? desc.replace(/\n/g, '<br />') : '') + '</div>'
          + '</div>'
          + extInfo
          + (e.category == 'Serie' || sc.isSerie || ep.episodename ? '<h3 data-conti="' + constTitle + '"><span>' + tr.constabelInfo + '</span></h3><div class="desc">'
            + '<a class="iAsButton i-edit" href="' + epgd.profile.constabelEditPath + encodeURIComponent(constTitle) + '.episodes' + '" target="constabel">' + epgd.tr.edit + '</a>'
            + '<a class="iAsButton i-link-ext" href="' + epgd.profile.constabelLinkPath + encodeURIComponent(constTitle) + '" target="constabel">' + epgd.tr.pages.eventDetail.addConstableLink + '</a>'
            + epgd.pages.help.getButton('constabel',true)
            + (epgd.profile.constabelLoginPath ? '<a class="iAsButton i-login" href="' + epgd.profile.constabelLoginPath + '" target="constabel">' + epgd.tr.pages.eventDetail.loginConstable + '</a>' : '')
            + '<pre id="cRaw"></pre>'
            + '</div>'
          : '')
          + (recordings ? '<h3><span>' + epgd.tr.menu.records + '</span></h3><div class="recordings">' + recordings + '</div>' : '')
          + '</div>').replaceAll(this.$con);
    this.$con.accordion({
        heightStyle: "fill",
        header: "h3",
        active: 0,
        beforeActivate: function(ev, ui){
            if (ui.newHeader.attr('data-conti')) {
                epgd.utils.loader.process(function () {
                    epgd.ajax({ url: epgd.login.url + 'data/proxy?id=constabel&title=' + encodeURIComponent(encodeURIComponent(ui.newHeader.attr('data-conti'))) + '&_' + new Date().getTime(), dataType: "html", contentType: "text/plain; charset=utf-8" }, function (data) {
                        if (data.indexOf('Error:') == -1) {
                            var $pre = ui.newPanel.find('#cRaw'),
                                thead = '<thead><tr><th>' + tr.season + '</th><th>' + tr.part + '</th><th>' + tr.number + '</th><th>' + tr.title + '</th>',
                                tbody = '<tbody>',
                                lines = data.split(/\r?\n/),
                                line, m, i;
                            for (i = 0; i < lines.length; i++) {
                                line = lines[i];
                                if (line.charAt(0) == '#') {
                                    m = line.match(/EXTRACOL[0-9] (.+)/i);
                                    if (m)
                                        thead += '<th>' + m[1] + '</th>';
                                } else {
                                    m = line.split(/\t/);
                                    if (m.length > 3)
                                        tbody += '<tr><td>' + m.join('</td><td>') + '</td></tr>';
                                }
                            }
                            $pre.html(data).hide().before('<a href="#" onclick="return !!$(\'#cRaw\').toggle()[0].scrollIntoView()">Raw</a>');
                            $pre.before('<table>' + thead + '</thead>' + tbody + '</tbody></table>');
                        } else
                            ui.newPanel.find('#cRaw').html(epgd.tr.error.noData);
                        epgd.utils.loader.close();
                    });
                    ui.newHeader.removeAttr('data-conti');
                },true);
            }               
        }
    });
    this.$rec.toggleClass("hasTimer", !!e.timerid).prop("title", this.detail.doRecord(true));
    this.$play.toggle(this.detail.doPlay(true));
    this.$prev.toggle(this.detail.doPrev(true));
    this.$next.toggle(this.detail.doNext(true));
    this.$con.find('.channel .i-tv').click(function () { epgd.vdrs.current.switchChannel(this.parentNode.id); });
    //this.$win.position({ of: window });
    this.closed = false;

    i = Math.max.apply(null, this.$win.siblings(".ui-front:visible").map(function () {
        return +$(this).css("z-index");
    }).get());   // zIndexMax
    if (i >= +this.$win.css("z-index"))
        this.$win.css("z-index", i + 1);

    $(window).trigger("resize.eventDetail");
    this.$openDialogs = $('.ui-dialog:visible:not(.ui-state-disabled)').addClass("ui-state-disabled");
    $(document).bind("keyup.eventDetail", function (e) {
        if (e.keyCode == 27) {
            $(window).trigger("epgd_close.eventDetail");
        }
    });
    epgd.pages.help.initButtons(this.$con);
}

epgd.recordDetail = epgd.utils.inherits(function (elem) {
    this.elem = elem;
    return epgd.eventDetail.call(this);
}, epgd.eventDetail);
epgd.recordDetail.prototype.load = function () {
    var self = this;
    epgd.ajax({
        url: epgd.login.url + 'data/recording?starttime=' + this.elem.getAttribute('data-start') + '&md5path=' + this.elem.getAttribute('data-md5') + '&owner=' + this.elem.getAttribute('data-owner'), async: false
    }, function (data) {
        self.data = data.recording;
    });
    return this;
}
epgd.recordDetail.prototype.doRecord = function (eData) {
    if (eData === true) return epgd.tr.pages.records.similarTimer; // eData = getTitle
    epgd.eventDetail.prototype.doRecord.call(this, eData);
}
epgd.recordDetail.prototype.doPlay = function (checkAvail) {
    if (checkAvail) return true;
    epgd.ajax({ url: epgd.login.url + 'data/replayrecording?vdruuid=' + ( !epgd.vdrs.list[this.data.vdruuid].usecommonrecfolder ? this.data.vdruuid : epgd.vdrs.current.uuid ) + '&starttime=' + this.data.starttime + '&md5path=' + this.data.md5path + '&owner=' + (this.data.owner || ''), cache: false }, function (data) {
        epgd.utils.popup(data.result.message, { title: 'VDR', autoClose: 5000 });
    });
}
epgd.recordDetail.prototype.doPrev = function (checkAvail) {
    var $elem = $(this.elem).prev('.rec');
    if (!$elem.length)
        return false;
    if (checkAvail) return true;
    $elem.find('B').click();
}
epgd.recordDetail.prototype.doNext = function (checkAvail) {
    var $elem = $(this.elem).next('.rec');
    if (!$elem.length)
        return false;
    if (checkAvail) return true;
    $elem.find('B').click();
}

epgd.doneTimerDetail = epgd.utils.inherits(function (tr) {
    this.tr = tr;
    return epgd.eventDetail.call(this);
}, epgd.eventDetail);
epgd.doneTimerDetail.prototype.load= function () {
    var self = this;
    epgd.ajax({ url: epgd.login.url + 'data/donetimer?id=' + this.tr.tData.id, async: false, cache: false }, function (data) {
        var t = data.donetimer;
        if (t.state)
            t.cntlongdescription = epgd.pages.timerListDone.stateIcons[t.state];
        t.episode = { lang: t.episodelang, season: t.episodeseason, part: t.episodepart };
        self.id = data.id;
        self.expire = epgd.utils.now().getTime() + 900000;
        delete t.timerid;
        delete t.id;
        self.data = t;
    });
    return this;
};
epgd.doneTimerDetail.prototype.doRecord= function (eData) {
    if (eData === true) return epgd.tr.pages.records.similarTimer;
    epgd.eventDetail.prototype.doRecord.call(this, eData);
    //epgd.pages.searchTimerList.dialog.render(eData || this.data);
};
epgd.doneTimerDetail.prototype.doPlay= function (checkAvail) {
    return false;
};
epgd.doneTimerDetail.prototype.doPrev= function (checkAvail) {
    var $elem = $(this.tr).prev('tr');
    if (!$elem.length)
        return false;
    if (checkAvail) return true;
    $elem.find('td').click();
};
epgd.doneTimerDetail.prototype.doNext= function (checkAvail) {
    var $elem = $(this.tr).next('tr');
    if (!$elem.length)
        return false;
    if (checkAvail) return true;
    $elem.find('td').click();
};


$(document).ready(function () {
    epgd.eventDetail.prototype.win = new epgd.eventDetail.win();
});