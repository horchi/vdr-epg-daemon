epgd.pages.help = {
	$con: null,
	render: function () {
		$('#menu_help').addClass("menu-active");
		if (!this.$con) this.load();
		epgd.$con.html(this.$con);
		this.init();
	},
	getButton: function(id, useAnchor){
		return (useAnchor ? '<a' : '<button') + ' id="bh_' + id + '" class="help iAsButton i-help" role="button">' + epgd.tr.menu.help + '</' + ( useAnchor ? 'a>' : 'button>');
	},
	getIcon: function (id) {
	    return '<a id="bh_' + id + '" class="help iAsIcon i-help" />';
	},
	initButtons: function ($con) {
		if (!$con)
			$con = epgd.$con;
		$con.tooltip({
		    items: ".help",
		    //position: { at: "left top" },
		    //position: { my: "left top" },
			tooltipClass: 'quickInfo',
			content: function () {
				return epgd.pages.help.getQuickInfo(this.id.slice(3));
			},
			open: function (ev, ui) {
			    $(ui.tooltip).position({
			        of: ev.toElement,
			        my: "left top"
			    });
			    ev.preventDefault();
			}
		});
	},
	getQuickInfo: function (id) {
		var h= epgd.pages.help;
		if (!h.$con) h.load();
		return h.$con.find('#h_' + id).html() || epgd.tr.pages.help.noHelp;
	},
	load: function () {
		var me = this;
		epgd.ajax({
		    url: epgd.tr.pages.help.url, async: false, dataType: "html", contentType: "text/plain; charset=utf-8"
		}, function (data) {
		    me.$con = $($(data).filter('#help')[0]);
		    $(data).filter('#help_js').appendTo(document.body);
		});
	}
};
