epgd.channels = {
    list: null,
    autoCompleteData: null,
    isDirty: false,
    selBox: $('<select id="selChannel"></select>')[0],
    load: function () {
        if (!this.list || this.isDirty) {
             epgd.ajax({ url: epgd.login.url + "data/channels", async: false, cache: false},function (data) {
                var logoPath = (epgd.profile.channelLogoPath ? epgd.profile.channelLogoPath + '?maxW=70&maxH=50&id=' : false),
                    channelOpt = '',
                    list = {},
                    ac_data = [];
                data.channels && $.each(data.channels, function (i, channel) {
                    var id = channel.channelid || i;
                    if (channel.name) {
                        channel.html = '<div class="channel" id="' + id + '">' + (logoPath ? '<img src="' + logoPath + id + '" alt="' + channel.name + '" />'
                            + '<i class="i-tv" title="' + epgd.tr.pages.eventDetail.ch_switch + '" />'
                            + (epgd.profile.logoShowName == "1" ? channel.name : '') : channel.name) + '</div>';
                        channel.visible & 1 && (channelOpt += '<option value="' + id + '">' + channel.name + '</option>');
                    }
                    else {
                        channel.html = '<div class="channel" id="' + id + '">'
                            + '<i class="i-tv" title="' + epgd.tr.pages.eventDetail.ch_switch + '" />' + id + '</div>';
                        channel.visible & 1 && (channelOpt += '<option value="' + id + '">' + id + '</option>');
                    }
                    list[id] = channel;
                    ac_data.push({ label: channel.name, value: id });
                });
                epgd.channels.list = list;
                epgd.channels.autoCompleteData= ac_data;
                $(epgd.channels.selBox).html(channelOpt);
                $(window).trigger('channels_load');
                this.dirty = false;
            });
        }
    },
    getHtml: function (id) {
        var ch = this.list[id];
        return ch ? ch.html : '<div class="channel" id="' + id + '">'
            + '<i class="i-tv" title="' + epgd.tr.pages.eventDetail.ch_switch + '" />' + id + '</div>';
    },
    getName: function (id) {
        var ch = this.list[id];
        return ch ? ch.name : id;
    }
};
