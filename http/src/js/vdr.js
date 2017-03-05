epgd.vdr = function (uuid, data) {
    this.uuid = uuid;
    $.extend(this, data);
}
epgd.vdr.prototype.switchChannel = function (channelNo) {
    epgd.ajax({url: epgd.login.url + 'data/channelswitch?uuid=' + this.uuid + '&channel=' + channelNo, cache: false},function (data) {
         epgd.utils.popup(data.result.message, { title: 'VDR', autoClose:5000 });
     });
}
epgd.vdr.prototype.wol = function () {
    epgd.ajax({ url: epgd.login.url + 'data/wakeupvdr?uuid=' + this.uuid, cache: false }, function (data) {
        epgd.utils.popup(data.result.message, { title: 'VDR', autoClose: 5000 });
    });
}
epgd.vdrs = {
    list: null,
    current:null,
    load: function () {
        if (!this.list) {
            this.list = {};
            epgd.ajax({ url: epgd.login.url + "data/vdrs", async: false }, function (data) {
                var uuid;
                for (uuid in data.vdrs) {
                    epgd.vdrs.list[uuid] = new epgd.vdr(uuid, data.vdrs[uuid]);
                }
                if (!epgd.vdrs.current){
                    if (epgd.profile.defaultVDRuuid){
                        epgd.vdrs.current = epgd.vdrs.list[epgd.profile.defaultVDRuuid];
                        if (!epgd.vdrs.current)
                            epgd.utils.log('the default VDR (' + epgd.profile.defaultVDRuuid + ' is invalid! Please change this in Web Interface/options)');
                    }
                    if (!epgd.vdrs.current){
                        for (uuid in epgd.vdrs.list) {
                            epgd.vdrs.current = epgd.vdrs.list[uuid];
                            break;
                        }
                    }
                    if (!epgd.vdrs.current){
                        epgd.utils.log('no VDR found',2);
                        epgd.vdrs.current = new epgd.vdr("000-missing-vdr-000", { name: "no VDR found" });
                    }
                }
                $(window).trigger('vdrs_load');
            });
        }
    },
    get: function (uuid) {
        return this.list[(uuid || this.current)] || {};
    }
};


epgd.pages.vdrs = {
    render: function () {
        epgd.$con.html('<div><button class="iAsButton" onclick="epgd.vdrs.current.wol()">WOL</button>');
    }
};