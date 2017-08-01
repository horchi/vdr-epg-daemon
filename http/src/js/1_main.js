
epgd.profile = {
    needLogin: -1,
    channelLogoPath: "data/channellogo",
    eventImgPath: "data/eventimg",
    movieMediaPath: "data/moviemedia",
    serieImgPath: "data/seriesmedia",
    movieActorPath: "http://www.themoviedb.org/person/",
    serieSeasonPath: "http://www.thetvdb.com/?tab=seasonall&id=",
    constabelEditPath: "https://www.eplists.de/eplist.cgi?action=edit&back=&file=",
    constabelLinkPath: "https://www.eplists.de/eplist.cgi?action=show_form_redir&linkname=",
    minEventTime: 0,
    maxEventTime: 0,
    logoShowName: 0
};
epgd.userProfile_defaults = {
    defaultVDRuuid: '',
    constabelLoginPath: false,
    pickerFirstDay: '6',
    quickTimes: '',
    startWithSched: 0,
    startPage: "menu_options",
    namingModeSerie: "0",
    namingModeSearchSerie: "0",
    namingModeMovie: "0",
    namingModeSearchMovie: "0",
    namingModeSerieTemplate: "",
    namingModeSearchSerieTemplate: "",
    namingModeMovieTemplate: "",
    namingModeSearchMovieTemplate: "",
    chFormat: "",
    timerDefaultVDRuuid: '',
    searchAdv: "0",
    mailReceiver: "",
    messageMailTypes: "",
    magazinePan: 10,
    magazinePanDelay: 400,
    maxListEntries: 100,
    ratings: "",
    recordSubFolderSort: 1
};
epgd.profile_load = function (doNotCache) {
    var profile = $.extend(epgd.profile, epgd.userProfile_defaults);
    epgd.ajax({ url: epgd.login.url + "data/parameters", async: false, cache: false, dataType: "json" },function (data) {
        var p,i,k,
            oldVal, now,
            changes = {};
        for (i in data.parameters) {
            p = data.parameters[i];
            oldVal = profile[p.name];
            if (oldVal != undefined && oldVal != p.value) {
                profile[p.name] = p.type === 0 ? parseInt(p.value, 10) : p.value;
                changes[p.name] = oldVal;
                if (p.name.indexOf('logo') == 0)
                    epgd.channels.isDirty = true;
            }
        }
        if (epgd.utils.timeOffset == null) {
            epgd.utils.timeOffset = (data.timezone - new Date().getTimezoneOffset() * 60) * 1000;
            now = epgd.utils.now();
            epgd.$dtPicker.datetimepicker('setDate', new Date(now.setMinutes(parseInt(now.getMinutes() / 15, 10) * 15)));
        }
        if (!profile.minEventTime) {
            now = epgd.utils.now();
            profile.minEventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0).getTime() / 1000;
            changes["minEventTime"] = 0;
        }
        if (!profile.maxEventTime) {
            profile.maxEventTime = profile.minEventTime + 8 * 24 * 60 * 60 - 60;
            changes["maxEventTime"] = 0;
        }
        for (k in changes) {
            $(window).trigger("profile_updated", changes);
            break;
        }
        epgd.channels.isDirty && epgd.channels.load();
    });
}

epgd.pages = {};

epgd.login = {
    user: '',
    session: '',
    rights:-1,
    url: ''
}                       
epgd.rights = { // userMask
    umConfig: 2,
    umConfigEdit: 4 + 2,
    umConfigUsers: 8,
    umTimer: 64,
    umTimerEdit: 128 + 64,
    umSearchTimer: 256 + 64,
    umSearchTimerEdit: 512 + 256 + 128 + 64,
    umFsk: 4096,
    umRecordings: 32768,
    umRecordingsEdit: 65536 + 32768
}
epgd.utils = {
    timeOffset: null,
    now: function () {return new Date(new Date().getTime() - this.timeOffset);},
    date: function (unixTime) { return new Date(unixTime * 1000 - this.timeOffset); },
    unixTime: function (date) { return date ? parseInt((date.getTime() + this.timeOffset) / 1000, 10) : 0; },
    formatTime: function (unixTime) {
        var d = new Date(unixTime * 1000 - this.timeOffset);
        return new String(100 + d.getHours()).slice(1) + ':' + new String(100 + d.getMinutes()).slice(1);
    },
    formatDateTime: function (unixTime, dateFormat) {
        var d = new Date(unixTime * 1000 - this.timeOffset);
        return $.datepicker.formatDate((dateFormat || epgd.tr.dateTimePicker.dateFormat), d) + ' ' + new String(100 + d.getHours()).slice(1) + ':' + new String(100 + d.getMinutes()).slice(1);
    },
    formatDate: function (unixTime, dateFormat) {
        var d = new Date(unixTime * 1000 - this.timeOffset);
        return $.datepicker.formatDate((dateFormat || epgd.tr.dateTimePicker.dateFormat), d);
    },
    popup: function (txt, options) {
        var $w = $(window),
            $dlg;
        options = $.extend({
            autoOpen: true,
            dialogClass: 'popup',
            show: {
                effect: "blind",
                duration: 1000
            },
            hide: {
                effect: "explode",
                duration: 1000
            },
            width: 400,
            height:200,
            maxWidth: $w.width() * 0.8,
            maxHeight: $w.height() * 0.7,
        }, options);
        $dlg = $('<div class="epgPopUp"><p>' + txt + '</p></div>').dialog(options);
        options.autoClose && window.setTimeout(function () { $dlg.dialog('close').dialog('destroy'); }, options.autoClose);
        return $dlg;
    },
    confirm: function (message, callback) {
        var o = {
            modal: true,
            buttons: {}
        };
        o.buttons[epgd.tr.yes]= function () { $(this).dialog('close'); callback(true);};
        o.buttons[epgd.tr.no]= function () { $(this).dialog('close'); callback(false);};
        this.popup(message, o);
    },
    topInfo: function (txt, options) {
        var isError = options && options.isError,
            $info,
            dura;
        options = $.extend({
            autoClose: isError ? 0 : 3000,
            className: "ui-state-" + (isError ? 'error' : 'highlight')
        },options);
        dura = (options.autoClose || 3000) / 2;
        $info = $('<div class="topInfo ui-corner-all ' + options.className + '">' + txt
            + '<button onclick="$(this).parent().remove();" class="iAsButton i-cancel" title="' + epgd.tr.close
            + '"></button></div>')
        .appendTo(epgd.$menu)
        .animate({ 'opacity': 0.4 }, dura, function () { $info.animate({ 'opacity': 1 }, dura); });
        options.autoClose && window.setTimeout(function () { $info.remove() }, options.autoClose);
    },
    sendMail: function (subject, body, mimetype, receiver) {
        epgd.ajax({
            url: epgd.login.url + 'data/sendmail',
            type: 'post',
            data: JSON.stringify({ "receiver": (receiver || epgd.profile.mailReceiver), "subject": subject, "body": body, "mimetype": mimetype })
        }, function (data) {
            data = data.result;
            if (data && data.state == 200)
                epgd.utils.topInfo(epgd.tr.dataSend);
            else
                epgd.utils.topInfo(data.message, { isError: 1 });
            epgd.profile_load();
        });
    },
    loader: {
        $win: $('<div style="position:absolute;z-index:9999;width:100%;height:100%;position:fixed;left:0px;top:0px;background:url(images/loader.png) no-repeat 50% 50%"></div>'),
        cnt: 0,
        process: function (actionFunc, doNotRemove) {
            var loader = this;
            this.cnt++;
            this.$win.appendTo(document.body).stop().animate({ opacity: 0.7}, {
                always: function () {
                    try{
                       actionFunc();
                    } catch (e) {
                        epgd.utils.log((e.message || 'common error') + '\n' + (e.stack || ''),0);
                        loader.close();
                    }
                    !doNotRemove && loader.close();
                }
            }, 200);
        },
        close: function () {
            if (this.cnt > 0) {
                this.cnt--;
                this.cnt == 0 && this.$win.remove();
            }
        }
    },
    addAutoComplete: function (inputSelector, options) {
        var $sel = $(inputSelector),
            cn = $sel[0].className,
            w = $sel[0].style.width || "";
        $(inputSelector).autocomplete($.extend({
            minLength: 0,
            multiselect: false,
            create: function (event, ui) {   // based on http://jsfiddle.net/mekwall/sgxKJ/
                var inst = $(this).autocomplete('instance'),
                    o = inst.options,
                    fontSize, kc;

                inst.selectedItems = {};
                if (o.multiselect) {
                    inst.multiselect = $("<div></div>")
                        .addClass("ui-autocomplete-multiselect ui-state-default ui-widget " + cn)
                        .css("width", w)
                        .insertBefore(inst.element)
                        .append(inst.element)
                        .bind("click.autocomplete", function () {
                            inst.element.focus();
                        });
                    inst.menu.element.css({ "height": "300px", "overflow-y": "auto" });
                    fontSize = parseInt(inst.element.css("fontSize") || 10, 10);
                    function autoSize(e) {
                        // Hackish autosizing
                        var $this = $(this);
                        $this.width(1).width(this.scrollWidth + fontSize - 1);
                    };
                    kc = $.ui.keyCode;
                    inst.element.bind({
                        "keydown.autocomplete": function (e) {
                            if ((this.value === "") && (e.keyCode == kc.BACKSPACE)) {
                                var prev = inst.element.prev();
                                delete inst.selectedItems[prev.text()];
                                prev.remove();
                            }
                        },
                        // TODO: Implement outline of container
                        "focus.autocomplete blur.autocomplete": function () {
                            inst.multiselect.toggleClass("ui-state-active");
                        },
                        "keypress.autocomplete change.autocomplete focus.autocomplete blur.autocomplete": autoSize
                    }).trigger("change");
                    o.select = o.select || function (e, ui) {
                        if (!inst.selectedItems[ui.item.label]) {
                            $("<div></div>")
                                .addClass("ui-autocomplete-multiselect-item")
                                .text(ui.item.label)
                                .append(
                                    $("<span></span>")
                                        .addClass("ui-icon ui-icon-close")
                                        .click(function () {
                                            var item = $(this).parent();
                                            delete inst.selectedItems[item.text()];
                                            item.remove();
                                        })
                                )
                                .insertBefore(inst.element);
                            inst.selectedItems[ui.item.label] = ui.item;
                        }
                        inst._value("");
                        return false;
                    }
                } else {
                    o.select = o.select || function (e, ui) {
                        inst.selectedItems[0] = ui.item;
                        inst._value(ui.item.label);
                        return false;
                    }
                };
            }
        }, options)).focus(function () {
            $(this).autocomplete("search", "");
        });/*.bind("keydown", function (event) {
        if (event.keyCode === $.ui.keyCode.TAB &&
            $(this).autocomplete("instance").menu.active) {
            event.preventDefault();
        }
    });*/
    },
    getAutoCompleteValues: function (inputSelector, quot) {
        quot = quot || '';
        var values = '',
            del= ',' + quot,
            ac,key;
        try {
            ac = $(inputSelector).autocomplete("instance").selectedItems;
            for (key in ac)
                values += del + ac[key].value + quot;
        } catch (e) { }
        return values.slice(1);
    },
    setAutoCompleteValues: function (inputSelector, values ) {
        var ac = $(inputSelector).autocomplete("instance"),
            item,i,
            matcher;
        ac.multiselect && ac.multiselect.find(">div").remove();
        ac.selectedItems = {};
        if (values) {
            for (i = 0; i < values.length; i++) {
                item = null;
                matcher = new RegExp($.ui.autocomplete.escapeRegex(values[i]), "i");
                $.each(ac.options.source, function () {
                    if (matcher.test(this.value || this.label || this))
                        return !(item = this);
                });
                if (item)
                    ac._trigger("select", null, { item: item.label ? item : {label:item,value:item}  });
            }
        }
    },
    addPlaceholders: function (inputSelector, key, placeholders) {
        var input = $(inputSelector)[0],
            html = '<ul class="placeholders ui-menu ui-widget ui-widget-content">',
            p;
        for (p in placeholders)
            html += '<li class="ui-menu-item"><b>' + p + '</b>' + placeholders[p] + '</li>';
        input.$placeholders = $(html + '</ul>').hide().insertAfter(input).click(function (ev) {
            var placeholder = ev.target.nodeName == 'B' ? $(ev.target).text() : ev.target.nodeName == 'LI' ? $(ev.target.firstChild).text() : null,
                cursorPos = $(input).prop('selectionStart'),
                v = $(input).val();
            if (placeholder) {
                $(input).val(v.substring(0, cursorPos) + placeholder + v.substring(cursorPos, v.length)).focus();
                cursorPos += placeholder.length;
                if (input.setSelectionRange) {
                    input.setSelectionRange(cursorPos, cursorPos);
                }
                else if (input.createTextRange) {
                    v = input.createTextRange();
                    v.collapse(true);
                    v.moveEnd('character', cursorPos);
                    v.moveStart('character', cursorPos);
                    v.select();
                }
            }
            $(this).hide();
        });
        $(input).keydown(function (ev) {
            if (ev.key == key) {
                $(document).one("click", function () { input.$placeholders.hide(); })
                input.blur();
                return !input.$placeholders.show().position({
                    my: "left top",
                    at: "left bottom",
                    of: input
                });
            }
        });
    },
    inherits : function (childClass, parentClass) {
        var tempClass = function () { };
        tempClass.prototype = parentClass.prototype;
        childClass.prototype = new tempClass();
        childClass.prototype.constructor = childClass;
        childClass.base = parentClass.prototype;
        return childClass;
    },
    log: function (message, level) {
        console.log("error:" + message);
        try {
            $.ajax({ url: "data/log", type: 'get', async: true, cache: false, data: "level=" + (level || 0) + "&message=" + escape(message) });
        } catch (e) {}                                                        
    }
};

epgd.init = function () {

    epgd.$con = $('<div id="content"></div>').appendTo(document.body);

    $.datepicker.setDefaults(epgd.tr.dateTimePicker);
    $.datepicker.setDefaults({
        showOtherMonths: true,
        selectOtherMonths: true,
    });
    $.timepicker.setDefaults(epgd.tr.dateTimePicker);
    $.timepicker.setDefaults({
        timeInput: true,
        controlType: {
            create: function (tp_inst, obj, unit, val, min, max, step) {
                if (unit == 'hour') {
                    if (!tp_inst.inst.settings.timeOnly)
                        $('#ui-datepicker-div').width(($(window).width() > 500 ? 430 : 230)+ "px");
                    $('<span><u>0</u><u>2</u><u>4</u><u>6</u><u>8</u><u>10</u><br /><u>12</u><u>14</u><u>16</u><u>18</u><u>20</u><u>22</u><span>')
                        .appendTo(obj).bind("click", { tp_inst: tp_inst, obj: obj, unit:unit }, $.timepicker.quicklink);
                } else if (unit == 'minute') {
                    $('<span><u>0</u><u>15</u><u>30</u><u>45</u><span>')
                        .appendTo(obj).bind("click", { tp_inst: tp_inst, obj: obj, unit:unit }, $.timepicker.quicklink);
                } else if (unit == 'second' && epgd.profile.quickTimes) {
                    obj.closest('dl').find('.ui_tpicker_time').removeClass()
                        .bind("click", { tp_inst: tp_inst, obj:obj, unit: 'time' }, $.timepicker.quicklink).html('<i><u title="' + epgd.profile.quickTimes.replace(/[^=~]+=@[a-z]+/gi, '').replace(/~{2,}/g, '~').replace(/=!?/g, '">').replace(/~/g, '</u></i><i><u title="') + '</u></i>');
                    if (tp_inst.inst.settings.alwaysSetTime)
                        epgd.pages.help.initButtons(tp_inst.inst.dpDiv.find('.ui-datepicker-buttonpane').append(epgd.pages.help.getButton('datepicker')));
                    else
                        $('<button class="iAsButton i-cancel" role="button">' + epgd.tr.clear + '</button>').appendTo(tp_inst.inst.dpDiv.find('.ui-datepicker-buttonpane')).click(function () {
                            tp_inst.$input.val('');
                            $.datepicker._hideDatepicker();
                        });
                     return obj;
                } else
                    return obj;

                $('<input class="ui-timepicker-input" value="' + val + '" style="width:20px">')
                    .prependTo(obj)
                    .spinner({
                        min: min,
                        max: max,
                        step: step,
                        change: function (e, ui) { // key events
                            // don't call if api was used and not key press
                            if (e.originalEvent !== undefined)
                                tp_inst._onTimeChange();
                            tp_inst._onSelectHandler();
                        },
                        spin: function (e, ui) { // spin events
                            tp_inst.control.value(tp_inst, obj, unit, ui.value);
                            tp_inst._onTimeChange();
                            tp_inst._onSelectHandler();
                        }
                    });
                return obj;
            },
            options: function (tp_inst, obj, unit, opts, val) {
                if (typeof (opts) == 'string' && val !== undefined)
                    return obj.find('.ui-timepicker-input').spinner(opts, val);
                return obj.find('.ui-timepicker-input').spinner(opts);
            },
            value: function (tp_inst, obj, unit, val) {
                try {
                    if (val !== undefined)
                        return obj.find('.ui-timepicker-input').spinner('value', val);
                    return obj.find('.ui-timepicker-input').spinner('value');
                } catch (e) {
                    return false;
                }
            }
        }
    });


    epgd.$menu = $('<nav id="menu-top"><ul id="ui-menu-top"><li id="menu_login"><a href="#menu_login">' + epgd.tr.pages.login.label + '</a></li></ul></nav>').appendTo(document.body).find('ul').hide();
    epgd.$menu.$maxBut = $('<span class="maxi i-menu" />').insertBefore(epgd.$menu).click(function () {
        epgd.$menu.parent().toggleClass('open');
    });
    epgd.$menu.checkMenuSize = function (ev, callback) {
        if (window.wrm_i) {  // interval aktiv?
            if (window.wrm_w == $(window).width()) { //Breite vom vorherigen Aufruf und aktuelle Breite gleich?
                window.clearInterval(window.wrm_i);
                delete window.wrm_i;
                epgd.$menu.parent().removeClass('mini').width(window.wrm_w).offset({ 'left': $(window).scrollLeft() });
                epgd.$menu.checkMenuSize(null, callback);
            } else
                window.wrm_w = $(window).width();
            return;
        }
        if (ev) {
            window.wrm_w = $(window).width();
            if (!window.wrm_i) // Interval setzen, um sicher zu sein, dass die Breite jetzt stimmt
                window.wrm_i = window.setInterval(epgd.$menu.checkMenuSize, 200,null,callback);
        } else {
            if (epgd.$menu.height() > 40)
                epgd.$menu.parent().addClass('mini');
            window.setTimeout(function () {
                document.body.style.paddingTop = (epgd.$menu.parent().height() + 10) + "px";
                callback && window.setTimeout(callback,200);
            }, 200);
        }
    };
    //epgd.$menu.show().checkMenuSize();
    $(window).bind("resize", epgd.$menu.checkMenuSize);
    epgd.$dtPicker = $('<input type="text" id="selDate" readonly style="z-index:199;position:relative" />').appendTo(document.body).hide().bind("click",function () { $(this).datepicker("show"); return false; });
    epgd.$dtPicker.datetimepicker({
        beforeShow: function () {
            this.$overlay = $("<div />").addClass("ui-widget-overlay ui-front").appendTo(document.body);
        },
        onClose: function () {
            this.$overlay.remove();
            $(window).trigger('datepicker');
        },
        calendarStart: function() {
            var d= new Date(epgd.profile.minEventTime * 1000)
            leadDays = (d.getDay() - parseInt(epgd.profile.pickerFirstDay, 10) + 7) % 7;
            d.setHours(12, 0);
            d.setDate(d.getDate() - leadDays);
            return d;
        }
    });

    epgd.$menu.menu({
        position: { at: "left bottom" },
        select: function (event, ui) {
            var id = ui.item.attr('id');
            if (!id || id.indexOf('menu_') != 0 || (event.originalEvent && event.originalEvent.target.nodeName != 'A' && event.originalEvent.target.nodeName != 'LI'))
                return false;
            $(window).trigger("epgd_close");
            epgd.$menu.parent().removeClass('open');
            $(".menu-active", this).removeClass("menu-active");
            $(document.body).append(epgd.$dtPicker.hide());
            epgd.$menu.checkMenuSize(null,function () {
                try {
                    ui.item.addClass("menu-active").parent().parent('.ui-menu-item').addClass("menu-active");
                    epgd.pages[id.slice(5)].render();
                } catch (e) {
                    epgd.utils.popup(epgd.tr.error.common, { title: epgd.tr.error.error });
                    epgd.utils.log((e.message || 'common error') + '\n' + (e.stack || ''), 2);
                }
            });
        }
    });
    $(window).bind("epgd_close", function () {
        $('.epgPopUp').dialog('destroy');
    }).bind("profile_updated", function (e,changes) {
        if (changes["minEventTime"] != undefined) 
            epgd.$dtPicker.datetimepicker("option", {"minDateTime": new Date((epgd.profile.minEventTime= parseInt(epgd.profile.minEventTime,10)) * 1000), "minDate": new Date(epgd.profile.minEventTime * 1000)});
        if (changes["maxEventTime"] != undefined)
            epgd.$dtPicker.datetimepicker("option", {"maxDateTime": new Date((epgd.profile.maxEventTime= parseInt(epgd.profile.maxEventTime,10)) * 1000), "maxDate": new Date(epgd.profile.maxEventTime * 1000)});
        if (changes["pickerFirstDay"] != undefined)
            epgd.$dtPicker.datetimepicker("option", { "firstDay": epgd.profile.pickerFirstDay });
        if (changes["defaultVDRuuid"] != undefined) {
            $('#menu_vdrs > select').val(epgd.profile.defaultVDRuuid);
        }
        if (changes["quickTimes"] != undefined) {
            epgd.pages.magazine.initQT();
        }
        if (changes["needLogin"] != undefined) {
           epgd.pages.login.doLogin();
        }
    }).bind("login_changed", function (e, oldLogin) {
        epgd.$menu.html('').hide();
        epgd.$con.html('');
        if (epgd.login.rights) {
            epgd.$menu.append('<li id="menu_now"><a href="#menu_now">' + epgd.tr.menu.now + '</a></li>');
            epgd.$menu.append('<li id="menu_magazine"><a href="#menu_magazine">' + epgd.tr.menu.magazine + '</a></li>');
            (epgd.login.rights & epgd.rights.umTimer) == epgd.rights.umTimer && epgd.$menu.append('<li><a>' + epgd.tr.menu.timer + '</a><ul>'
                    + '<li id="menu_timerList"><a href="#menu_timerList">' + epgd.tr.pages.timer.timerList + '</a></li>'
                    + ((epgd.login.rights & epgd.rights.umSearchTimer) == epgd.rights.umSearchTimer ? '<li id="menu_searchTimerList"><a href="#menu_searchTimerList">' + epgd.tr.pages.timer.searchTimerList + '</a></li>' : '')
                    + '<li id="menu_timersDone"><a href="#menu_timersDone">' + epgd.tr.pages.timer.timersDone + '</a></li>'
                    + '<li id="menu_timerListDone"><a href="#menu_timerListDone">' + epgd.tr.pages.timer.timerListDone + '</a></li>'
                    + '<li id="menu_timerJobList"><a href="#menu_timerJobList">' + epgd.tr.pages.timer.timerJobList + '</a></li>'
                    + '<li id="menu_messageList"><a href="#menu_messageList">' + epgd.tr.pages.timer.messageList + '</a></li>'
                + '</ul></li>');
            (epgd.login.rights & epgd.rights.umRecordings) == epgd.rights.umRecordings && epgd.$menu.append('<li id="menu_records"><a href="#menu_records">' + epgd.tr.menu.records + '</a></li>');
            epgd.$menu.append('<li id="menu_search"><a href="#menu_search">' + epgd.tr.menu.search + '</a></li>');
            epgd.$menu.append('<li><a>' + epgd.tr.menu.options + '</a><ul>'
                    + '<li id="menu_profile"><a href="#menu_profile">' + epgd.tr.pages.options.profile + '</a></li>'
                    + ((epgd.login.rights & epgd.rights.umConfigEdit) == epgd.rights.umConfigEdit ? '<li id="menu_editChannels"><a href="#menu_editChannels">' + epgd.tr.pages.options.editChannels + '</a></li>' : '')
                    + ((epgd.login.rights & epgd.rights.umConfigUsers) == epgd.rights.umConfigUsers ? '<li id="menu_editUser"><a href="#menu_editUser">' + epgd.tr.pages.options.editUser + '</a></li>' : '')
                + '</ul></li>');
            epgd.$menu.append('<li id="menu_help"><a href="#menu_help">' + epgd.tr.menu.help + '</a></li>');
            epgd.$menu.append('<li id="menu_vdrs"><a href="#menu_vdrs">VDR</a><select></select><span><a id="osd2web">-&gt;OSD</a></span></li>');
        }
        epgd.profile.needLogin == "1" && epgd.$menu.append('<li id="menu_login"><a href="#menu_login">'
            + (epgd.login.session ? epgd.login.user + ' ' + epgd.tr.pages.login.logout : epgd.tr.pages.login.label )
            + '</a></li>');
        if (epgd.login.user != oldLogin.user) {
            epgd.profile_load();
            epgd.channels.isDirty = true;
            epgd.vdrs.list = null;
        }
        epgd.channels.load();
        epgd.vdrs.load();
        epgd.$menu.show().menu("refresh");
        epgd.$menu.menu("select", { target: $(epgd.login.rights ? (location.hash || '#' + epgd.profile.startPage || '#menu_profile') : '#menu_login') });//.concat('=' + epgd.profile.startPage + '=').match(/(menu_[^=]+)/)[1] });

    }).bind("vdrs_load", function () {
        html = '';
        for (var uuid in epgd.vdrs.list) {
            html += '<option value="' + uuid + '"' + (uuid == epgd.vdrs.current.uuid ? 'selected' : '') + '>' + epgd.vdrs.list[uuid].name + '</option>';
        }
        $('<select>' + html + '</select>').replaceAll('#menu_vdrs > select').show().change(function () {
            var vdr= epgd.vdrs.current = this.selectedIndex >= 0 ? epgd.vdrs.get(this[this.selectedIndex].value) : {};
            if (vdr && vdr.osd2webp)
                $('#osd2web').prop("target", "osd2web_" + vdr.name)
                    .prop("href", "http://" + vdr.ip + ":" + vdr.osd2webp)
                    .click(function(ev){
                        ev.stopPropagation();
                        return true;                   
                    }).show(); 
            else 
                $('#osd2web').hide();
        }).mousedown(function (ev) {
            ev.stopPropagation();
            return true;
        }).click(function (ev) {
            return false;
        }).change();
    }).bind("unload", function () {
        if (epgd.login.session)
            epgd.pages.login.doLogin('logout');
    });

    epgd.pages.now.init();
    epgd.pages.magazine.init();
    epgd.profile_load();
    if (epgd.profile.needLogin == -1) {
        epgd.profile.needLogin = 0;
        epgd.pages.login.doLogin();
    }
    window.setInterval(epgd.profile_load, 3600000);  // ca. jede Stunde neu abfragen
   // window.setTimeout(function () { $(window).trigger('resize'); });
}
window.onerror = function (msg, url, line, col, error) {
    // Note that col & error are new to the HTML 5 spec and may not be 
    // supported in every browser.  It worked for me in Chrome.
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error.stack;
    try{
        epgd.utils.log(msg + "\nline: " + line + extra, 2);
    } catch(e){}
    return true;
};

$.widget("custom.catcomplete", $.ui.autocomplete, {
    _create: function () {
        this._super();
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
    },
    _renderMenu: function (ul, items) {
        var that = this,
        currentCategory = "";
        $.each(items, function (index, item) {
            var li;
            if (item.category != currentCategory) {
                ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                currentCategory = item.category;
            }
            li = that._renderItemData(ul, item);
            if (item.category) {
                li.attr("aria-label", item.category + " : " + item.label);
            }
        });
    }
});
$.datepicker._gotoToday = function (id) {
    var inst = this._getInst($(id)[0]),
        now = epgd.utils.now();
    this._base_gotoToday(id);
    this._setTime(inst, now);
    this._setDate(inst, now);
    this._hideDatepicker();
};
$.timepicker.quicklink = function (ev) {
    var target = ev.target.nodeName == 'I' ? ev.target.firstChild : ev.target,
        tp_inst,
        val = null,
        d = false;
    try {
        tp_inst = ev.data.tp_inst || $.datepicker._getInst(epgd.$dtPicker[0]).settings.timepicker;
    } catch (e) {
        epgd.utils.log((e.message || 'common error') + '\n' + (e.stack || ''), 2);
        return false;
    }
    if (target.nodeName == 'U') {
        if (ev.data.unit == "time")
            val = $.datepicker.parseTime(tp_inst._defaults.timeFormat, target.innerHTML, tp_inst._defaults);
        else if (ev.data.unit == "hour")
            val = { hour: parseInt(target.innerHTML, 10), minute: tp_inst.minute };

        if (val) {
            if (val.hour < tp_inst.hour - 1)
                d = true;
            else {
                tp_inst.control.value(tp_inst, tp_inst.hour_slider, "hour", val.hour);
                tp_inst._onTimeChange();
                if (tp_inst.hour != val.hour)
                    d = true;
            }
            if (d) {
                d = new Date(tp_inst.inst.selectedYear, tp_inst.inst.selectedMonth, tp_inst.inst.selectedDay + 1, val.hour, val.minute);
                $.datepicker._setDate(tp_inst.inst, d);
                $.datepicker._setTime(tp_inst.inst, d);
                $.datepicker._updateDatepicker(tp_inst.inst);
            } else
                tp_inst.control.value(tp_inst, tp_inst.minute_slider, "minute", val.minute);
        } else
            tp_inst.control.value(tp_inst, ev.data.obj, ev.data.unit, parseInt(target.innerHTML, 10));
        tp_inst._onTimeChange();
        tp_inst._onSelectHandler();
        if (ev.target.nodeName == 'I')
            $.datepicker._hideDatepicker();
    }
}

epgd.ajax = function (options, success, error) {
    var settings = $.extend({ dataType: 'json', contentType: "application/json; charset=utf-8" }, options);
    return $.ajax(settings).fail(function (jqxhr, e) {
        epgd.utils.loader.close();
        if (jqxhr.status == 401) {
            epgd.pages.login.doLogin(null,null,function () {
                if (epgd.login.rights) {
                    settings.url = settings.url.replace(/sid[^\/]+\//, epgd.login.url);
                    $.ajax(settings).done(success).fail(function () {
                        epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
                    });
                } else
                    epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
            });
        }
        else if (jqxhr.status == 403) {
            epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
        } else if (jqxhr.status == 501){
            epgd.utils.popup(epgd.tr.error.notImplemented, { title: epgd.tr.error.error });
        } else {
            if (error && error.call(this, jqxhr, e))
                return;
            //if (jqxhr.status == 409) {
            var mess = '';
            try {
                if (jqxhr.responseJSON)
                    mess = jqxhr.responseJSON.result.message;
            } catch (e) {
                mess = '';
                epgd.utils.log((e.message || 'common error') + '\n' + (e.stack || '') + '\n  options:' + JSON.stringify(options) + '\n jqhr:' + JSON.stringify(jqxhr), 3);
            }
            epgd.utils.popup(mess || jqxhr.responseText || epgd.tr.error.serverNotResponse, { title: epgd.tr.error.error });
//            } else
                //epgd.utils.popup(epgd.tr.error.serverNotResponse, { title: epgd.tr.error.error });
        }
    }).done(success);
};
