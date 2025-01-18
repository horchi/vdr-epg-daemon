var epgd={};epgd.tr={oClock:"Uhr",minutes:"min",save:"speichern",copy:"kopieren",apply:"übernehmen",close:"schließen",clear:"löschen",yes:"ja",no:"nein",edit:"bearbeiten",cancel:"abbrechen",del:"löschen",test:"testen",reload:"neu laden",advanced:"erweitert",markAll:"alle markieren",markNone:"keinen markieren",markToggle:"Markierung umdrehen",confirmDelete:"Willst du wirklich löschen?",dataSaved:"Daten wurden gespeichert",dataDeleted:"Daten wurden gelöscht",dataSend:"Daten wurden gesendet",channel:"Kanal",date:"Datum",entries:" Einträge",error:{error:"Fehler",common:"Es ist ein allgemeiner Fehler aufgetreten",serverNotResponse:"Der Server konnte nicht erreicht werden!",notImplemented:"Dieses Feature ist zur Zeit noch nicht implementiert",forbidden:"Zugriff verweigert!",noData:"Für diese Anfrage konnten keine Daten ermittelt werden!",emptyField:"Bitte fülle das Feld $field$ aus!",invalid:"Der eingegebene Wert ist ungültig!"},menu:{now:"Programm",magazine:"Magazin",timer:"Timer",records:"Aufnahmen",search:"Suche",options:"Einstellungen",help:"Hilfe"},pages:{now:{at:"am"},timer:{timerList:"Timer",searchTimerList:"Suchtimer",timersDone:"kürzliche Aufträge",timerListDone:"Auftragshistorie",timerJobList:"asynchrone Aufträge",messageList:"Systemmeldungen"},timerList:{empty:"Keine Timer vorhanden!",startTime:"Anfang",endTime:"Ende",folder:"Verzeichnis",file:"Dateiname",recordTime:"Aufnahmezeit",lifetime:"Lebenszeit",prio:"Priorität",inactive:"Inaktiv",newTimer:"Neuen Timer anlegen",namingMode:"Ermittlung des Dateinamens",namingModes:["VDR","Auto","Constable","Serie","Kategorisiert","Usermode","Template"],template:"Template",templateFields:{"%title%":": Titel (EPG)","%shorttext%":": Untertitel (EPG)","%starttime%":": Startzeit (EPG)","%year%":": Jahr (EPG)","%category%":": Kategorie (EPG)","%episodname%":": Titel der Serie (constabel)","%shortname%":": Kurz-Titel der Serie (constabel, optional)","%partname%":": Name der Folge (constabel)","%season%":": Staffel (constabel)","%part%":": Teil der Staffel (constabel)","%number%":": Nummer über alle Staffeln (constabel)","%extracol1%":": Zusätzliche Angaben z.B. bei Tatort die Ermittler (constabel, optional)","%extracol2%":": ... z.B. bei Tatort der Ort (constabel, optional)","%extracol3%":": ... z.B. bei Tatort der Sender (constabel, optional)"},episode:"Serientitel",episodepartname:"Folge",noEpgMatch:"Ignoriere fehlende EPG Info (außer Folge)",noRepeat:"Wiederholungen vermeiden",searchTimerReload:"Suchtimer updaten",chInclude:"Auf Kanäle einschränken",chExclude:"Kanäle ausschließen",chRange:"Kanal von/bis",nextDays:"innerhalb der nächsten $field$ Tage",confirmSaveBigResult:"Die Suche ergibt $cnt$ Treffer, trotzdem speichern?",timerStates:{D:"gelöscht",E:"Fehler",F:"Aufnahme erfolgreich",P:"wartet auf Start",R:"nimmt gerade auf...",U:"unbekannt"},timerActions:{C:"Timer wurde erstellt und muss noch von einem VDR übernommen werden",D:"Timer wurde gelöscht und muss noch im VDR gelöscht werden",F:"Zuweisung Timer an VDR fehlgeschlagen",M:"Timer wurde verändert und muss noch vom VDR verarbeitet werden"},doneStates:{f:"Timer konnte nicht erstellt werden",C:"Timer bereits erstellt",D:"Timer gelöscht",F:"Aufnahme fehlgeschlagen",Q:"Timer in Vorbereitung",R:"Aufnahme fertig"},messageStates:{N:"Neu",R:"gelesen"},messageTypes:{I:"Information",W:"Warnung",E:"Fehler",F:"Fataler Fehler"},chFormat:"bevorzugtes Sendeformat"},eventDetail:{record:"Aufnehmen",repeat:"Wiederholungen",ch_switch:"umschalten",play:"abspielen",eventNext:"nachfolgend",eventPrev:"vorher",parentalrating:"ab ",mergeSrc:"Quelle ",genre:"Genre",category:"Kategorie",country:"Land",year:"Jahr",season:"Staffel",part:"Folgen Nummer",number:"Folge Insgesamt",extentedInfo:"weitere Informationen",scrapperMovieInfo:"Filminformation",scrapperSerieInfo:"Serieninformation",constabelInfo:"Constabel Episodenliste",addConstableLink:"Link erzeugen",loginConstable:"Login",title:"Titel",original_title:"Originaltitel",runtime:"Laufzeit",lang:"Sprache",release_date:"Erscheinungsdatum",actors:"Schauspieler",network:"Netzwerk",seriesstatus:"Status",gueststars:"Gäste",homepage:"Webseite",popularity:"Beliebtheit",vote_average:"&oslash; Bewertung",extInfo:{director:"Regie",camera:"Kamera",screenplay:"Drehbuch",producer:"Produktion",music:"Musik",moderator:"Moderator",commentator:"Kommentator",guest:"Gäste",info:"Info",other:"Sonstige"}},options:{profile:"allgemein",editChannels:"Kanäle bearbeiten",editUser:"Benutzer bearbeiten"},editChannels:{menu:{channelList:"Kanalliste",referenceList:"Referenzliste",insertAsText:"als Text einfügen",extentEmptyChannelNames:"leere Kanalnamen ergänzen",applyAllChannelNames:"Alle Kanalnamen übernehmen",applyChannelSort:"Kanalsortierung übernehmen"},headline:"Sortierung der Kanäle durch drag und drop, Blockmarkierung durch zus. gedrückter shift-Taste",checkWeb:"Kanal in Webansicht anzeigen",checkVDR:"Kanal zum VDR übertragen",desc_insertList:"Kopiere den Inhalt einer channels.conf in das Textfeld unten. Eine vollständige Liste gibt es beispielsweise hier:"},editUser:{user:"Benutzer",sel:"auswählen",add:"neu anlegen",active:"Aktiv",inActive:"Inaktiv",rights:{label:"Rechte",umConfig:"Konfiguration lesen",umConfigEdit:"Konfiguration ändern",umConfigUsers:"Benutzer konfigurieren",umTimer:"Timer lesen",umTimerEdit:"Timer bearbeiten",umSearchTimer:"Suchtimer lesen",umSearchTimerEdit:"Suchtimer bearbeiten",umFsk:"FSK",umRecordings:"Aufnahmen lesen",umRecordingsEdit:"Aufnahmen editieren"}},help:{url:"lang/hilfe.html",noHelp:"Hierzu konnte kein Hilfstext gefunden werden"},search:{search:"suchen",searchName:"Name",searchExpression:"Suchausdruck",caseSensitive:"Klein-/Großschreibung",searchModes:["exakte Übereinstimmung","regulärer Ausdruck","Muster","enthalten in","PCRE Ausdruck"],searchFields:["Titel","Kurztext","Beschreibung"],repeatFields:["Titel","Kurztext"],empty:"Leider nichts gefunden.",matchdensity:"Treffergenauigkeit"},login:{label:"Login",userName:"Benutzername",password:"Passwort",loggedAlwaysIn:"angemeldet bleiben",logout:"Abmelden",error:"Fehler beim Anmelden!",logoutMessage:"Du wurdest abgemeldet!",needLogin:"Login erforderlich"},records:{ddLabel:"Drag und Drop",refreshMessage:"Aufnahmelisten werden neu geladen, Seite lädt in $sec$ Sekunden neu",moveMessage:"Aufnahme verschieben von \n$src$\nnach",notFoundMessage:"Aufnahme nicht gefunden, ggf einmal aktualisieren",deleteMessage:"Soll die Aufnahme $src$ wirklich gelöscht werden?",available:"Verfügbar",commonRecFolder:"gemeinsame Aufnahmen",similarTimer:"ähnliche Sendung aufnehmen"},profile:{mailReceiver:"eMail",sendTCC:"sende Mail bei Timerkonflikten",sendMessages:"sende Mail bei Systemmeldungen",magazinePan:"Scrollgeschwindigkeit in Minuten<br />(0 = aus)",magazinePanDelay:"Auslöseverzögerung",maxListEntries:"maximal Anzahl Einträge, die auf einmal vom Server geladen werden sollen, z.B. bei Suchen, Suchtimern usw.",system:{label:"epgd Backend"},vdr:{startWithSched:"EPG Menü startet mit Schedule",osdTimerNotify:"Info anzeigen, wenn der VDR einen Timer übernommen hat"},record:{subFolderSort:"Sortierung der Unterordner"}}},dateTimePicker:{monthNames:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],monthNamesShort:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],dayNames:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],dayNamesShort:["So","Mo","Di","Mi","Do","Fr","Sa"],dayNamesMin:["So","Mo","Di","Mi","Do","Fr","Sa"],weekHeader:"KW",timeOnlyTitle:"Zeit wählen",timeText:"Sendungsbeginn",timeTextBetween:"zwischen",prevText:"&#x3C;Zurück",nextText:"Vor&#x3E;",currentText:"Jetzt",closeText:"Fertig",hourText:"Stunde",minuteText:"Minute",secondText:"Sekunde",millisecText:"Millisekunde",microsecText:"Mikrosekunde",timezoneText:"Zeitzone",timeFormat:"HH:mm",dateFormat:"D, dd.mm.yy",amNames:["vorm.","AM","A"],pmNames:["nachm.","PM","P"],isRTL:false,showMonthAfterYear:false,yearSuffix:""}};epgd.profile={needLogin:-1,channelLogoPath:"data/channellogo",eventImgPath:"data/eventimg",movieMediaPath:"data/moviemedia",serieImgPath:"data/seriesmedia",movieActorPath:"http://www.themoviedb.org/person/",serieSeasonPath:"http://www.thetvdb.com/?tab=seasonall&id=",constabelEditPath:"https://www.eplists.de/eplist.cgi?action=edit&back=&file=",constabelLinkPath:"https://www.eplists.de/eplist.cgi?action=show_form_redir&linkname=",minEventTime:0,maxEventTime:0,logoShowName:0};epgd.userProfile_defaults={defaultVDRuuid:"",constabelLoginPath:false,pickerFirstDay:"6",quickTimes:"",startWithSched:0,osdTimerNotify:0,startPage:"menu_options",namingModeSerie:"0",namingModeSearchSerie:"0",namingModeMovie:"0",namingModeSearchMovie:"0",namingModeSerieTemplate:"",namingModeSearchSerieTemplate:"",namingModeMovieTemplate:"",namingModeSearchMovieTemplate:"",chFormat:"",timerDefaultVDRuuid:"",searchAdv:"0",mailReceiver:"",messageMailTypes:"",magazinePan:10,magazinePanDelay:400,maxListEntries:100,ratings:"",recordSubFolderSort:1};epgd.profile_load=function(b){var a=$.extend(epgd.profile,epgd.userProfile_defaults);epgd.ajax({url:epgd.login.url+"data/parameters",async:false,cache:false,dataType:"json"},function(l){var m,g,d,c,e,h={};for(g in l.parameters){m=l.parameters[g];c=a[m.name];if(c!=undefined&&c!=m.value){a[m.name]=m.type===0?parseInt(m.value,10):m.value;h[m.name]=c;if(m.name.indexOf("logo")==0){epgd.channels.isDirty=true}}}if(epgd.utils.timeOffset==null){epgd.utils.timeOffset=(l.timezone-new Date().getTimezoneOffset()*60)*1000;e=epgd.utils.now();epgd.$dtPicker.datetimepicker("setDate",new Date(e.setMinutes(parseInt(e.getMinutes()/15,10)*15)))}if(!a.minEventTime){e=epgd.utils.now();a.minEventTime=new Date(e.getFullYear(),e.getMonth(),e.getDate(),0,0).getTime()/1000;h.minEventTime=0}if(!a.maxEventTime){a.maxEventTime=a.minEventTime+8*24*60*60-60;h.maxEventTime=0}for(d in h){$(window).trigger("profile_updated",h);break}epgd.channels.isDirty&&epgd.channels.load()})};epgd.pages={};epgd.login={user:"",session:"",rights:-1,url:""};epgd.rights={umConfig:2,umConfigEdit:4+2,umConfigUsers:8,umTimer:64,umTimerEdit:128+64,umSearchTimer:256+64,umSearchTimerEdit:512+256+128+64,umFsk:4096,umRecordings:32768,umRecordingsEdit:65536+32768};epgd.utils={timeOffset:null,now:function(){return new Date(new Date().getTime()-this.timeOffset)},date:function(a){return new Date(a*1000-this.timeOffset)},unixTime:function(a){return a?parseInt((a.getTime()+this.timeOffset)/1000,10):0},formatTime:function(a){var b=new Date(a*1000-this.timeOffset);return new String(100+b.getHours()).slice(1)+":"+new String(100+b.getMinutes()).slice(1)},formatDateTime:function(b,a){var c=new Date(b*1000-this.timeOffset);return $.datepicker.formatDate((a||epgd.tr.dateTimePicker.dateFormat),c)+" "+new String(100+c.getHours()).slice(1)+":"+new String(100+c.getMinutes()).slice(1)},formatDate:function(b,a){var c=new Date(b*1000-this.timeOffset);return $.datepicker.formatDate((a||epgd.tr.dateTimePicker.dateFormat),c)},popup:function(b,c){var d=$(window),a;c=$.extend({autoOpen:true,dialogClass:"popup",show:{effect:"blind",duration:1000},hide:{effect:"explode",duration:1000},width:400,height:200,maxWidth:d.width()*0.8,maxHeight:d.height()*0.7},c);a=$('<div class="epgPopUp"><p>'+b+"</p></div>").dialog(c);c.autoClose&&window.setTimeout(function(){a.dialog("close").dialog("destroy")},c.autoClose);return a},confirm:function(a,c){var b={modal:true,buttons:{}};b.buttons[epgd.tr.yes]=function(){$(this).dialog("close");c(true)};b.buttons[epgd.tr.no]=function(){$(this).dialog("close");c(false)};this.popup(a,b)},topInfo:function(b,c){var e=c&&c.isError,d,a;c=$.extend({autoClose:e?0:3000,className:"ui-state-"+(e?"error":"highlight")},c);a=(c.autoClose||3000)/2;d=$('<div class="topInfo ui-corner-all '+c.className+'">'+b+'<button onclick="$(this).parent().remove();" class="iAsButton i-cancel" title="'+epgd.tr.close+'"></button></div>').appendTo(epgd.$menu).animate({opacity:0.4},a,function(){d.animate({opacity:1},a)});c.autoClose&&window.setTimeout(function(){d.remove()},c.autoClose)},sendMail:function(c,a,b,d){epgd.ajax({url:epgd.login.url+"data/sendmail",type:"post",data:JSON.stringify({receiver:(d||epgd.profile.mailReceiver),subject:c,body:a,mimetype:b})},function(e){e=e.result;if(e&&e.state==200){epgd.utils.topInfo(epgd.tr.dataSend)}else{epgd.utils.topInfo(e.message,{isError:1})}epgd.profile_load()})},loader:{$win:$('<div style="position:absolute;z-index:9999;width:100%;height:100%;position:fixed;left:0px;top:0px;background:url(images/loader.png) no-repeat 50% 50%"></div>'),cnt:0,process:function(b,c){var a=this;this.cnt++;this.$win.appendTo(document.body).stop().animate({opacity:0.7},{always:function(){try{b()}catch(d){epgd.utils.log((d.message||"common error")+"\n"+(d.stack||""),0);a.close()}!c&&a.close()}},200)},close:function(){if(this.cnt>0){this.cnt--;this.cnt==0&&this.$win.remove()}}},addAutoComplete:function(d,b){var c=$(d),e=c[0].className,a=c[0].style.width||"";$(d).autocomplete($.extend({minLength:0,multiselect:false,create:function(k,p){var m=$(this).autocomplete("instance"),q=m.options,l,h;m.selectedItems={};if(q.multiselect){m.multiselect=$("<div></div>").addClass("ui-autocomplete-multiselect ui-state-default ui-widget "+e).css("width",a).insertBefore(m.element).append(m.element).bind("click.autocomplete",function(){m.element.focus()});m.menu.element.css({height:"300px","overflow-y":"auto"});l=parseInt(m.element.css("fontSize")||10,10);function g(s){var r=$(this);r.width(1).width(this.scrollWidth+l-1)}h=$.ui.keyCode;m.element.bind({"keydown.autocomplete":function(s){if((this.value==="")&&(s.keyCode==h.BACKSPACE)){var r=m.element.prev();delete m.selectedItems[r.text()];r.remove()}},"focus.autocomplete blur.autocomplete":function(){m.multiselect.toggleClass("ui-state-active")},"keypress.autocomplete change.autocomplete focus.autocomplete blur.autocomplete":g}).trigger("change");q.select=q.select||function(s,r){if(!m.selectedItems[r.item.label]){$("<div></div>").addClass("ui-autocomplete-multiselect-item").text(r.item.label).append($("<span></span>").addClass("ui-icon ui-icon-close").click(function(){var t=$(this).parent();delete m.selectedItems[t.text()];t.remove()})).insertBefore(m.element);m.selectedItems[r.item.label]=r.item}m._value("");return false}}else{q.select=q.select||function(s,r){m.selectedItems[0]=r.item;m._value(r.item.label);return false}}}},b)).focus(function(){$(this).autocomplete("search","")})},getAutoCompleteValues:function(k,c){c=c||"";var b="",a=","+c,g,d;try{g=$(k).autocomplete("instance").selectedItems;for(d in g){b+=a+g[d].value+c}}catch(h){}return b.slice(1)},setAutoCompleteValues:function(g,a){var d=$(g).autocomplete("instance"),c,b,e;d.multiselect&&d.multiselect.find(">div").remove();d.selectedItems={};if(a){for(b=0;b<a.length;b++){c=null;e=new RegExp($.ui.autocomplete.escapeRegex(a[b]),"i");$.each(d.options.source,function(){if(e.test(this.value||this.label||this)){return !(c=this)}});if(c){d._trigger("select",null,{item:c.label?c:{label:c,value:c}})}}}},addPlaceholders:function(g,d,a){var b=$(g)[0],c='<ul class="placeholders ui-menu ui-widget ui-widget-content">',e;for(e in a){c+='<li class="ui-menu-item"><b>'+e+"</b>"+a[e]+"</li>"}b.$placeholders=$(c+"</ul>").hide().insertAfter(b).click(function(k){var l=k.target.nodeName=="B"?$(k.target).text():k.target.nodeName=="LI"?$(k.target.firstChild).text():null,m=$(b).prop("selectionStart"),h=$(b).val();if(l){$(b).val(h.substring(0,m)+l+h.substring(m,h.length)).focus();m+=l.length;if(b.setSelectionRange){b.setSelectionRange(m,m)}else{if(b.createTextRange){h=b.createTextRange();h.collapse(true);h.moveEnd("character",m);h.moveStart("character",m);h.select()}}}$(this).hide()});$(b).keydown(function(h){if(h.key==d){$(document).one("click",function(){b.$placeholders.hide()});b.blur();return !b.$placeholders.show().position({my:"left top",at:"left bottom",of:b})}})},inherits:function(a,c){var b=function(){};b.prototype=c.prototype;a.prototype=new b();a.prototype.constructor=a;a.base=c.prototype;return a},log:function(a,c){console.log("error:"+a);try{$.ajax({url:"data/log",type:"get",async:true,cache:false,data:"level="+(c||0)+"&message="+escape(a)})}catch(b){}}};epgd.init=function(){epgd.$con=$('<div id="content" class="content"></div>').appendTo(document.body);$.datepicker.setDefaults(epgd.tr.dateTimePicker);$.datepicker.setDefaults({showOtherMonths:true,selectOtherMonths:true});$.timepicker.setDefaults(epgd.tr.dateTimePicker);$.timepicker.setDefaults({timeInput:true,controlType:{create:function(b,g,e,h,c,a,d){if(e=="hour"){if(!b.inst.settings.timeOnly){$("#ui-datepicker-div").width(($(window).width()>500?430:230)+"px")}$("<span><u>0</u><u>2</u><u>4</u><u>6</u><u>8</u><u>10</u><br /><u>12</u><u>14</u><u>16</u><u>18</u><u>20</u><u>22</u><span>").appendTo(g).bind("click",{tp_inst:b,obj:g,unit:e},$.timepicker.quicklink)}else{if(e=="minute"){$("<span><u>0</u><u>15</u><u>30</u><u>45</u><span>").appendTo(g).bind("click",{tp_inst:b,obj:g,unit:e},$.timepicker.quicklink)}else{if(e=="second"&&epgd.profile.quickTimes){g.closest("dl").find(".ui_tpicker_time").removeClass().bind("click",{tp_inst:b,obj:g,unit:"time"},$.timepicker.quicklink).html('<i><u title="'+epgd.profile.quickTimes.replace(/[^=~]+=@[a-z]+/gi,"").replace(/~{2,}/g,"~").replace(/=!?/g,'">').replace(/~/g,'</u></i><i><u title="')+"</u></i>");if(b.inst.settings.alwaysSetTime){epgd.pages.help.initButtons(b.inst.dpDiv.find(".ui-datepicker-buttonpane").append(epgd.pages.help.getButton("datepicker")))}else{$('<button class="iAsButton i-cancel" role="button">'+epgd.tr.clear+"</button>").appendTo(b.inst.dpDiv.find(".ui-datepicker-buttonpane")).click(function(){b.$input.val("");$.datepicker._hideDatepicker()})}return g}else{return g}}}$('<input class="ui-timepicker-input" value="'+h+'" style="width:20px">').prependTo(g).spinner({min:c,max:a,step:d,change:function(l,k){if(l.originalEvent!==undefined){b._onTimeChange()}b._onSelectHandler()},spin:function(l,k){b.control.value(b,g,e,k.value);b._onTimeChange();b._onSelectHandler()}});return g},options:function(a,d,c,b,e){if(typeof(b)=="string"&&e!==undefined){return d.find(".ui-timepicker-input").spinner(b,e)}return d.find(".ui-timepicker-input").spinner(b)},value:function(a,d,b,g){try{if(g!==undefined){return d.find(".ui-timepicker-input").spinner("value",g)}return d.find(".ui-timepicker-input").spinner("value")}catch(c){return false}}}});epgd.$menu=$('<nav id="menu-top"><ul id="ui-menu-top"><li id="menu_login"><a href="#menu_login">'+epgd.tr.pages.login.label+"</a></li></ul></nav>").appendTo(document.body).find("ul").hide();epgd.$menu.$maxBut=$('<span class="maxi i-menu" />').insertBefore(epgd.$menu).click(function(){epgd.$menu.parent().toggleClass("open")});epgd.$menu.checkMenuSize=function(a,b){if(window.wrm_i){if(window.wrm_w==$(window).width()){window.clearInterval(window.wrm_i);delete window.wrm_i;epgd.$menu.parent().removeClass("mini").width(window.wrm_w).offset({left:$(window).scrollLeft()});epgd.$menu.checkMenuSize(null,b)}else{window.wrm_w=$(window).width()}return}if(a){window.wrm_w=$(window).width();if(!window.wrm_i){window.wrm_i=window.setInterval(epgd.$menu.checkMenuSize,200,null,b)}}else{if(epgd.$menu.height()>40){epgd.$menu.parent().addClass("mini")}window.setTimeout(function(){document.body.style.paddingTop=(epgd.$menu.parent().height()+10)+"px";b&&window.setTimeout(b,200)},200)}};$(window).bind("resize",epgd.$menu.checkMenuSize);epgd.$dtPicker=$('<input type="text" id="selDate" readonly style="z-index:199;position:relative" />').appendTo(document.body).hide().bind("click",function(){$(this).datepicker("show");return false});epgd.$dtPicker.datetimepicker({beforeShow:function(){this.$overlay=$("<div />").addClass("ui-widget-overlay ui-front").appendTo(document.body)},onClose:function(){this.$overlay.remove();$(window).trigger("datepicker")},calendarStart:function(){var a=new Date(epgd.profile.minEventTime*1000);leadDays=(a.getDay()-parseInt(epgd.profile.pickerFirstDay,10)+7)%7;a.setHours(12,0);a.setDate(a.getDate()-leadDays);return a}});epgd.$menu.menu({position:{at:"left bottom"},select:function(a,b){var c=b.item.attr("id");if(!c||c.indexOf("menu_")!=0||(a.originalEvent&&a.originalEvent.target.nodeName!="A"&&a.originalEvent.target.nodeName!="LI")){return false}$(window).trigger("epgd_close");epgd.$menu.parent().removeClass("open");$(".menu-active",this).removeClass("menu-active");$(document.body).append(epgd.$dtPicker.hide());epgd.$menu.checkMenuSize(null,function(){try{b.item.addClass("menu-active").parent().parent(".ui-menu-item").addClass("menu-active");epgd.pages[c.slice(5)].render()}catch(d){epgd.utils.popup(epgd.tr.error.common,{title:epgd.tr.error.error});epgd.utils.log((d.message||"common error")+"\n"+(d.stack||""),2)}})}});$(window).bind("epgd_close",function(){$(".epgPopUp").dialog("destroy")}).bind("profile_updated",function(b,a){if(a.minEventTime!=undefined){epgd.$dtPicker.datetimepicker("option",{minDateTime:new Date((epgd.profile.minEventTime=parseInt(epgd.profile.minEventTime,10))*1000),minDate:new Date(epgd.profile.minEventTime*1000)})}if(a.maxEventTime!=undefined){epgd.$dtPicker.datetimepicker("option",{maxDateTime:new Date((epgd.profile.maxEventTime=parseInt(epgd.profile.maxEventTime,10))*1000),maxDate:new Date(epgd.profile.maxEventTime*1000)})}if(a.pickerFirstDay!=undefined){epgd.$dtPicker.datetimepicker("option",{firstDay:epgd.profile.pickerFirstDay})}if(a.defaultVDRuuid!=undefined){$("#menu_vdrs > select").val(epgd.profile.defaultVDRuuid)}if(a.quickTimes!=undefined){epgd.pages.magazine.initQT()}if(a.needLogin!=undefined){epgd.pages.login.doLogin()}}).bind("login_changed",function(a,b){epgd.$menu.html("").hide();epgd.$con.html("");if(epgd.login.rights){epgd.$menu.append('<li id="menu_now"><a href="#menu_now">'+epgd.tr.menu.now+"</a></li>");epgd.$menu.append('<li id="menu_magazine"><a href="#menu_magazine">'+epgd.tr.menu.magazine+"</a></li>");(epgd.login.rights&epgd.rights.umTimer)==epgd.rights.umTimer&&epgd.$menu.append("<li><a>"+epgd.tr.menu.timer+'</a><ul><li id="menu_timerList"><a href="#menu_timerList">'+epgd.tr.pages.timer.timerList+"</a></li>"+((epgd.login.rights&epgd.rights.umSearchTimer)==epgd.rights.umSearchTimer?'<li id="menu_searchTimerList"><a href="#menu_searchTimerList">'+epgd.tr.pages.timer.searchTimerList+"</a></li>":"")+'<li id="menu_timersDone"><a href="#menu_timersDone">'+epgd.tr.pages.timer.timersDone+'</a></li><li id="menu_timerListDone"><a href="#menu_timerListDone">'+epgd.tr.pages.timer.timerListDone+'</a></li><li id="menu_timerJobList"><a href="#menu_timerJobList">'+epgd.tr.pages.timer.timerJobList+'</a></li><li id="menu_messageList"><a href="#menu_messageList">'+epgd.tr.pages.timer.messageList+"</a></li></ul></li>");(epgd.login.rights&epgd.rights.umRecordings)==epgd.rights.umRecordings&&epgd.$menu.append('<li id="menu_records"><a href="#menu_records">'+epgd.tr.menu.records+"</a></li>");epgd.$menu.append('<li id="menu_search"><a href="#menu_search">'+epgd.tr.menu.search+"</a></li>");epgd.$menu.append("<li><a>"+epgd.tr.menu.options+'</a><ul><li id="menu_profile"><a href="#menu_profile">'+epgd.tr.pages.options.profile+"</a></li>"+((epgd.login.rights&epgd.rights.umConfigEdit)==epgd.rights.umConfigEdit?'<li id="menu_editChannels"><a href="#menu_editChannels">'+epgd.tr.pages.options.editChannels+"</a></li>":"")+((epgd.login.rights&epgd.rights.umConfigUsers)==epgd.rights.umConfigUsers?'<li id="menu_editUser"><a href="#menu_editUser">'+epgd.tr.pages.options.editUser+"</a></li>":"")+"</ul></li>");epgd.$menu.append('<li id="menu_help"><a href="#menu_help">'+epgd.tr.menu.help+"</a></li>");epgd.$menu.append('<li id="menu_vdrs"><a href="#menu_vdrs">VDR</a><select></select><span><a id="osd2web">-&gt;OSD</a></span></li>')}epgd.profile.needLogin=="1"&&epgd.$menu.append('<li id="menu_login"><a href="#menu_login">'+(epgd.login.session?epgd.login.user+" "+epgd.tr.pages.login.logout:epgd.tr.pages.login.label)+"</a></li>");if(epgd.login.user!=b.user){epgd.profile_load();epgd.channels.isDirty=true;epgd.vdrs.list=null}epgd.channels.load();epgd.vdrs.load();epgd.$menu.show().menu("refresh");epgd.$menu.menu("select",{target:$(epgd.login.rights?(location.hash||"#"+epgd.profile.startPage||"#menu_profile"):"#menu_login")})}).bind("vdrs_load",function(){html="";for(var a in epgd.vdrs.list){html+='<option value="'+a+'"'+(a==epgd.vdrs.current.uuid?"selected":"")+">"+epgd.vdrs.list[a].name+"</option>"}$("<select>"+html+"</select>").replaceAll("#menu_vdrs > select").show().change(function(){var b=epgd.vdrs.current=this.selectedIndex>=0?epgd.vdrs.get(this[this.selectedIndex].value):{};if(b&&b.osd2webp){$("#osd2web").prop("target","osd2web_"+b.name).prop("href","http://"+b.ip+":"+b.osd2webp).click(function(c){c.stopPropagation();return true}).show()}else{$("#osd2web").hide()}}).mousedown(function(b){b.stopPropagation();return true}).click(function(b){return false}).change()}).bind("unload",function(){if(epgd.login.session){epgd.pages.login.doLogin("logout")}});epgd.pages.now.init();epgd.pages.magazine.init();epgd.profile_load();if(epgd.profile.needLogin==-1){epgd.profile.needLogin=0;epgd.pages.login.doLogin()}window.setInterval(epgd.profile_load,3600000)};window.onerror=function(k,g,b,d,c){var a=!d?"":"\ncolumn: "+d;a+=!c?"":"\nerror: "+c.stack;try{epgd.utils.log(k+"\nline: "+b+a,2)}catch(h){}return true};$.widget("custom.catcomplete",$.ui.autocomplete,{_create:function(){this._super();this.widget().menu("option","items","> :not(.ui-autocomplete-category)")},_renderMenu:function(c,b){var d=this,a="";$.each(b,function(g,h){var e;if(h.category!=a){c.append("<li class='ui-autocomplete-category'>"+h.category+"</li>");a=h.category}e=d._renderItemData(c,h);if(h.category){e.attr("aria-label",h.category+" : "+h.label)}})}});$.datepicker._gotoToday=function(c){var b=this._getInst($(c)[0]),a=epgd.utils.now();this._base_gotoToday(c);this._setTime(b,a);this._setDate(b,a);this._hideDatepicker()};$.timepicker.quicklink=function(b){var g=b.target.nodeName=="I"?b.target.firstChild:b.target,a,k=null,h=false;try{a=b.data.tp_inst||$.datepicker._getInst(epgd.$dtPicker[0]).settings.timepicker}catch(c){epgd.utils.log((c.message||"common error")+"\n"+(c.stack||""),2);return false}if(g.nodeName=="U"){if(b.data.unit=="time"){k=$.datepicker.parseTime(a._defaults.timeFormat,g.innerHTML,a._defaults)}else{if(b.data.unit=="hour"){k={hour:parseInt(g.innerHTML,10),minute:a.minute}}}if(k){if(k.hour<a.hour-1){h=true}else{a.control.value(a,a.hour_slider,"hour",k.hour);a._onTimeChange();if(a.hour!=k.hour){h=true}}if(h){h=new Date(a.inst.selectedYear,a.inst.selectedMonth,a.inst.selectedDay+1,k.hour,k.minute);$.datepicker._setDate(a.inst,h);$.datepicker._setTime(a.inst,h);$.datepicker._updateDatepicker(a.inst)}else{a.control.value(a,a.minute_slider,"minute",k.minute)}}else{a.control.value(a,b.data.obj,b.data.unit,parseInt(g.innerHTML,10))}a._onTimeChange();a._onSelectHandler();if(b.target.nodeName=="I"){$.datepicker._hideDatepicker()}}};epgd.ajax=function(b,d,a){var c=$.extend({dataType:"json",contentType:"application/json; charset=utf-8"},b);return $.ajax(c).fail(function(h,g){epgd.utils.loader.close();if(h.status==401){epgd.pages.login.doLogin(null,null,function(){if(epgd.login.rights){c.url=c.url.replace(/sid[^\/]+\//,epgd.login.url);$.ajax(c).done(d).fail(function(){epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})})}else{epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})}})}else{if(h.status==403){epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})}else{if(h.status==501){epgd.utils.popup(epgd.tr.error.notImplemented,{title:epgd.tr.error.error})}else{if(a&&a.call(this,h,g)){return}var k="";try{if(h.responseJSON){k=h.responseJSON.result.message}}catch(g){k="";epgd.utils.log((g.message||"common error")+"\n"+(g.stack||"")+"\n  options:"+JSON.stringify(b)+"\n jqhr:"+JSON.stringify(h),3)}epgd.utils.popup(k||h.responseText||epgd.tr.error.serverNotResponse,{title:epgd.tr.error.error})}}}}).done(d)};epgd.timerDialogBase=function(a){this.$win=null;this.list=null;if(a){this.options=$.extend({},this.options,a)}};epgd.timerDialogBase.prototype={options:{id:"baseDialog",modal:true,draggable:true,resizable:true,autoOpen:false,position:{my:"center",at:"top"},width:"auto",maxHeight:$(window).height(),close:function(){this.list.dialog.form.reset();$(this.list.dialog.form).next().remove()},open:function(){},buttons:[{text:epgd.tr.del,icons:{primary:"ui-icon-trash"},id:"tBDel",click:function(){$(this).dialog("close");this.list.del(this.list.dialog.form.tID.value)}},{text:epgd.tr.cancel,icons:{primary:"ui-icon-close"},click:function(){$(this).dialog("close")}},{text:epgd.tr.save,icons:{primary:"ui-icon-disk"},click:function(){this.list.dialog.save()}}]},save:function(d,b,a,c){this.list.save(d||this.getData(),b,a,c)&&!this.options.embed&&this.$win.dialog("close")},showError:function(b,a){epgd.utils.popup((a&&a.id?"<b>"+$('label[for="'+a.id+'"]').text()+"</b>":"")+"<div>"+b+"</div>",{autoClose:3000});a&&a.focus();return false},loadFolder:function(){var a=this;epgd.ajax({url:epgd.login.url+"data/recordingdirs"},function(d){if(d.recordingdirs.length){var b=[],c=epgd.vdrs.list,e;$.each(d.recordingdirs,function(h,g){e=c[g.vdruuid];b.push({value:g.directory,category:e?e.name:"-"})});$(a.form.tFolder).catcomplete("option","source",b)}})},close:function(){if(this.$win){this.$win.dialog("close")}},create:function(){var d=this.options,c=epgd.tr.pages.timerList,b="",a;for(a=1;a<epgd.tr.dateTimePicker.dayNamesShort.length;a++){b+='<input name="tWeek" type="checkbox" />'+epgd.tr.dateTimePicker.dayNamesShort[a]}b+='<input name="tWeek" type="checkbox" />'+epgd.tr.dateTimePicker.dayNamesShort[0];this.$win=$('<div id="'+d.id+'" class="searchDialog"><form class="searchForm"><div class="colBlock"><div><label>&nbsp;</label><select id="tType"><option value="R">'+epgd.tr.pages.eventDetail.record+'</option><option value="V">'+epgd.tr.pages.eventDetail.ch_switch+'</option></select></div><div><label for="tSName">'+epgd.tr.pages.search.searchName+'</label><input type="text" id="tSName" /></div><div><label for="tInactive">'+c.inactive+'</label><input type="checkbox" id="tInactive" /></div></div><div class="ui-corner-all week">'+b+'</div><div class="onlyTypeR"><label for="tNameMode">'+c.namingMode+epgd.pages.help.getIcon("sTNameMode")+'</label><br /><select id="tNameMode"><option>'+c.namingModes.join("</option><option>")+'</option></select></div><div class="onlyTypeR"><label for="tTemplate">'+c.template+'</label><input class="full" id="tTemplate" type="text" value="" /></div><div class="onlyTypeR"><label for="tFolder">'+c.folder+'</label><input class="full" type="text" id="tFolder" /></div><div class="colBlock"><div class="noTypeS"><label for="tVdr">VDR</label><select id="tVdr"><option value="">Auto</option>'+$("#menu_vdrs").find("select").html()+'</select></div><div class="onlyTypeR"><label for="tPrio">'+c.prio+'</label><input  type="number" placeholder="..." min="0" max="99" id="tPrio" style="width:40px" /></div><div class="onlyTypeR"><label for="tLife">'+c.lifetime+'</label><input type="number" placeholder="..." min="0" max="99" style="width:40px" id="tLife"/></div><div class="onlyTypeR"><label for="tVPS">VPS</label><input type="checkbox" id="tVPS" /></div></div><input type="hidden" id="tID" /><br clear="all" /></form></div>');!d.embed&&this.$win.appendTo(document.body).dialog(d);this.$win[0].list=this.list;this.form=this.$win.find("form")[0];$(this.form.tFolder).catcomplete({minLength:0,maxHeight:300}).focus(function(){$(this).catcomplete("search","")});$(this.form.tType).change(function(){if(this.selectedIndex<0){this.selectedIndex=0}this.form.className=this.form.className.replace(/ ?type./,"")+" type"+this[this.selectedIndex].value});$(this.form.tNameMode).change(function(){this.form.tTemplate.parentNode.style.display=(this.selectedIndex==6)?"block":"none"});epgd.utils.addPlaceholders(this.form.tTemplate,"%",c.templateFields);this.loadFolder()},render:function(b){b=b||{};if(!this.$win){this.create()}!this.options.embed&&this.$win.dialog("open").dialog("moveToTop");var c=this.form,e,a;c.tSName.focus();if(b.id){c.tID.value=b.id;this.$win.parent().find("#tBDel").show();this.$win.parent().find("#tBToggle").hide()}else{c.tID.value="";this.$win.parent().find("#tBDel").hide();this.$win.parent().find("#tBToggle").show()}$(c.tType).val(b.type||"R").change();$(c.tVdr).val(b.vdruuid||epgd.profile.timerDefaultVDRuuid);e=b.weekdays||0;for(a=0,f=1;a<c.tWeek.length;a++,f*=2){c.tWeek[a].checked=(e&f)}c.tPrio.value=b.priority||"";c.tLife.value=b.lifetime||"";c.tVPS.checked=b.vps==1;c.tInactive.checked=b.active===0;c.tFolder.value=b.directory||"";c.tSName.value=b.name||"";epgd.pages.help.initButtons(this.$win);this.resize()},resize:function(){this.$win.dialog("option","maxHeight",$(window).height())}};epgd.timerDialog=epgd.utils.inherits(function(){epgd.timerDialogBase.call(this,{id:"timerDialog",title:epgd.tr.pages.timer.timerList+" "+epgd.tr.edit,buttons:[{text:epgd.tr.pages.timer.searchTimerList,icons:{primary:"ui-icon-transferthick-e-w"},id:"tBToggle",click:function(){var a=this.list.dialog.getData(true);if(a){$(this).dialog("close");if(a.title){a.expression=a.title;a.searchfields=1}epgd.pages.searchTimerList.dialog.render(a)}}}].concat(epgd.timerDialog.base.options.buttons)})},epgd.timerDialogBase);epgd.timerDialog.prototype.create=function(){epgd.timerDialog.base.create.call(this);var b=epgd.tr.pages.timerList,a=this.form;$(a).prepend('<input type="hidden" id="tEvID" /><div id="tTitle"></div>');$(a.tWeek[0]).parent().before('<div><label for="tStart">'+b.recordTime+'</label><br /><span id="tEvTime"></span>&nbsp;<input type="text" id="tStart" style="width:165px" /> - <input type="text" id="tEnd" style="width:40px" /></div>');$(a.tNameMode).after('&nbsp;<span id="tFile"></span>');$(a.tFolder).parent().after('<div><label for="tChannels">'+epgd.tr.channel+'</label><input id="tChannel" type="text" class="full"/></div>');$(this.form.tStart).datetimepicker({minDateTime:epgd.utils.now()});$(this.form.tEnd).timepicker({});epgd.utils.addAutoComplete(a.tChannel,{source:epgd.channels.autoCompleteData});a.tFile=$(a).find("#tFile")[0];a.tEvTime=$(a).find("#tEvTime")[0];a.tTitle=$(a).find("#tTitle").click(function(){if(a.tEvID.value){epgd.utils.loader.process(function(){new epgd.eventDetail(a.tEvID.value).render()})}})[0]};epgd.timerDialog.prototype.render=function(a){a=a||{};epgd.timerDialog.base.render.call(this,a);var b=this.form,c;b.tFile.innerHTML=a.file||"...";b.tEvID.value=a.eventid||"";epgd.utils.setAutoCompleteValues(b.tChannel,a.channelid?[a.channelid]:null);b.tTitle.innerHTML=a.title||"";b.tEvTime.innerHTML=a.evStartTime?epgd.utils.formatDateTime(a.evStartTime)+" - "+epgd.utils.formatTime(a.evStartTime+a.evDuration):"";$([b.tStart,b.tEnd]).datetimepicker("option","disabled",!!a.eventid);if(a.day||!a.evStartTime){if(a.starttime){c=epgd.utils.date((a.day+parseInt(a.starttime/100,10)*60*60+(a.starttime%100)*60))}else{if(a.day){c=epgd.utils.date(a.day)}else{c=epgd.utils.now()}}$(b.tStart).datetimepicker("setDate",c);$(b.tStart).datetimepicker("setTime",c);if(a.endtime){c=epgd.utils.date((a.day+parseInt(a.endtime/100,10)*60*60+(a.endtime%100)*60))}else{c=new Date(c.getTime()+2*60*60000)}$(b.tEnd).datetimepicker("setTime",c)}else{$([b.tStart,b.tEnd]).val("...")}b.tNameMode.selectedIndex=typeof a.namingmode=="undefined"?parseInt(a.category=="Serie"?epgd.profile.namingModeSerie:epgd.profile.namingModeMovie,10):a.namingmode;b.tTemplate.value=a.template||(a.category=="Serie"?epgd.profile.namingModeSerieTemplate:epgd.profile.namingModeMovieTemplate);$(b.tNameMode).change()};epgd.timerDialog.prototype.getData=function(g){var b=this.form,e,a,c={};if(b.tEvID.value){c.eventid=parseInt(b.tEvID.value,10)}c.active=b.tInactive.checked?0:1;if(b.tID.value){c.id=parseInt(b.tID.value,10)}if(b.tStart.value&&b.tStart.value!="..."){e=$(b.tStart).datepicker("getDate");c.starttime=e.getHours()*100+e.getMinutes();e.setHours(0);e.setMinutes(0);c.day=parseInt(e.getTime()/1000,10);c.endtime=parseInt(b.tEnd.value.replace(":",""),10)}else{if(!c.eventid&&!g){return this.showError(epgd.tr.error.emptyField.replace("$field$",epgd.tr.pages.timerList.recordTime),b.tStart)}}c.weekdays=0;for(a=0,f=1;a<b.tWeek.length;a++,f*=2){if(b.tWeek[a].checked){c.weekdays+=f}}c.vps=b.tVPS.checked?1:0;if(b.tPrio.value){c.priority=parseInt(b.tPrio.value,10)}if(b.tLife.value){c.lifetime=parseInt(b.tLife.value,10)}c.channelid=epgd.utils.getAutoCompleteValues(b.tChannel);if(!c.channelid&&!g){return this.showError(epgd.tr.error.emptyField.replace("$field$",epgd.tr.channel),b.tChannel)}c.type=$(b.tType).val();e=$(b.tVdr).val();if(!e&&c.type=="V"){e=epgd.vdrs.current.uuid||""}if(e){c.vdruuid=e}c.namingmode=b.tNameMode.selectedIndex;c.template=b.tTemplate.value;if(c.type=="V"&&!e&&!g){return this.showError(epgd.tr.error.emptyField.replace("$field$","VDR"),b.tVdr)}c.directory=b.tFolder.value;c.title=b.tTitle.innerHTML||"";c.name=b.tSName.value;return c};epgd.searchTimerDialog=epgd.utils.inherits(function(a){this.searchResultList=null;epgd.timerDialogBase.call(this,$.extend({},{id:"searchTimerDialog",width:530,title:epgd.tr.pages.timer.searchTimerList+" "+epgd.tr.edit,buttons:[{text:epgd.tr.pages.timer.timerList,icons:{primary:"ui-icon-transferthick-e-w"},id:"tBToggle",click:function(){var b=this.list.dialog.getData(true);if(b){$(this).dialog("close");b.channelids&&(b.channelid=b.channelids.split(",")[0]);b.expression&&(b.title=b.expression);epgd.pages.timerList.dialog.render(b)}}},{text:epgd.tr.test,click:function(){this.list.dialog.search()}}].concat(epgd.searchTimerDialog.base.options.buttons,{text:epgd.tr.copy,icons:{primary:"ui-icon-copy"},id:"tBCopy",click:function(b){$(b.currentTarget).hide();this.list.dialog.form.tID.value="";this.list.dialog.form.tSName.value+=" copy";this.list.dialog.form.tSName.select()}})},a))},epgd.timerDialogBase);epgd.searchTimerDialog.prototype.search=function(a,b){if(!this.searchResultList){this.searchResultList=new epgd.searchResultList(null)}if(!this.searchResultList.$con||(a&&a[0]!=this.searchResultList.$con[0])){this.searchResultList.render(a||($('<div style="border-top:1px solid #ccc;overflow-x:hidden;overflow-y:scroll;max-height:25vh;"></div>').insertAfter(this.form)))}else{this.searchResultList.$con.find("tbody").empty()}if(!this.searchResultList.$con.parent().length){this.searchResultList.$con.insertAfter(this.form);this.searchResultList.init()}this.searchResultList.update(b||this.getData());this.searchResultList.$con[0].scrollIntoView(true)};epgd.searchTimerDialog.prototype.create=function(){epgd.searchTimerDialog.base.create.call(this);var c=epgd.tr.pages.timerList,e=epgd.tr.pages.search,d="",b=this.form,a;for(a in e.searchModes){d+='<option value="'+(parseInt(a,10)+1)+'">'+e.searchModes[a]+"</option>"}if(!epgd.categories){epgd.categories=[];epgd.ajax({url:"data/categories",async:false},function(g){epgd.categories=g.categories})}if(!epgd.genres){epgd.genres=[];epgd.ajax({url:"data/genres",async:false},function(g){epgd.genres=g.genres})}$(b.tSName).parent().parent().after('<div><label for="tExpr">'+e.searchExpression+epgd.pages.help.getIcon("sExpr")+'</label> <input type="text" id="tExpr" style="width:300px" /></div><div class="full"><select id="tSMode" style="width:auto">'+d+'</select>&nbsp;&nbsp;<input type="checkbox" id="tCaseSens" />&nbsp;<label for="tCaseSens">'+e.caseSensitive+'</label></div><div class="ui-corner-all week">'+[" "].concat(e.searchFields).join('<input type="checkbox" name="tSFields" />')+'</div><div><label for="tAdv"><input type="checkbox" id="tAdv" />&nbsp;'+epgd.tr.advanced+epgd.pages.help.getIcon("sTAdv")+'</label><div class="ui-corner-all week"><span>'+c.episodepartname+'</span><input type="text" id="tSFEpisode" style="width:200px" /> <span>'+epgd.tr.pages.eventDetail.season+'</span><input type="text" id="tSFSeason" style="width:40px" /> <span>'+epgd.tr.pages.eventDetail.part+'</span><input type="text" id="tSFSPart" style="width:40px" /> <br /><span>'+epgd.tr.pages.eventDetail.category+'</span><input type="text" id="tSFCat"  style="width:300px" /> <br /><span>'+epgd.tr.pages.eventDetail.genre+'</span><input type="text" id="tSFGenre" style="width:300px" /> <br /><input type="checkbox" name="tSFTip" value="GoldTipp" />GoldTipp<input type="checkbox" name="tSFTip" value="TagesTipp" />TagesTipp<input type="checkbox" name="tSFTip" value="TopTipp" />TopTipp<br /><span>'+epgd.tr.pages.eventDetail.year+'</span><input type="text" id="tSFYear" style="width:70px" /><br /><input type="checkbox" id="tSFNoEpgMatch" />'+c.noEpgMatch+'</div></div><div class="noTypeS"><div><label for="tRepeat"><input type="checkbox" id="tRepeat" />&nbsp;'+c.noRepeat+epgd.pages.help.getIcon("sTRepeat")+'</label><div class="ui-corner-all week">'+[""].concat(e.repeatFields).join('<input type="checkbox" name="tRFields" />')+'</div></div></div><div><input type="radio" name="tChExclude" value="1" id="tChExclude0" /><label for="tChInclude">'+c.chInclude+"</label>"+epgd.pages.help.getIcon("sTChannels")+'<input type="radio" name="tChExclude" value="0" id="tChExclude1" /><label for="tChExclude">'+c.chExclude+'</label></div><input type="text" id="tChannels" class="full"/><div><label for="tChRange">'+c.chRange+epgd.pages.help.getIcon("sTChannels")+'</label><input id="tChRangeMin" style="width:40px" /> - <input id="tChRangeMax" style="width:40px" /></div><div class="noTypeS"><label for="tChFormat">'+c.chFormat+epgd.pages.help.getIcon("sTChFormat")+'</label><input id="tChFormat" readonly onclick="epgd.timerEditChFormat(this)" /></div><div><label for="tTime"><input type="checkbox" id="tTime" />&nbsp;'+epgd.tr.dateTimePicker.timeText+epgd.pages.help.getIcon("sTime")+"</label></div>");$(b.tWeek[0]).before("<span>"+epgd.tr.dateTimePicker.timeTextBetween+' <input type="text" id="tStart" style="width:40px" /> - <input type="text" id="tEnd" style="width:40px" /></span>').parent().append('<br /><span class="onlyTypeS">'+c.nextDays.replace("$field$",'<input style="width:40px" type="text" id="tNextDays" />')+"</span>").insertAfter(b.tTime.parentNode);$([b.tStart,b.tEnd]).timepicker({alwaysSetTime:false});$([b.tTime,b.tRepeat,b.tAdv]).change(function(){$(this).parent().next().toggle(this.checked)});$(b.tRFields).change(function(){if(this.checked){$(this).prev().prop("disabled",true).prop("checked",true).change()}else{$(this).prev().prop("disabled",false)}});$([b.tSFSeason,b.tSFSPart,b.tSFYear]).change(function(){this.value=this.value.replace(/[^0-9-]/g,"");if(this.value.length==1&&this.value=="-"){this.value=""}});$(b.tType).append('<option value="S">'+epgd.tr.menu.search+"</option>");epgd.utils.addAutoComplete(b.tChannels,{source:epgd.channels.autoCompleteData,multiselect:true});epgd.utils.addAutoComplete(b.tSFCat,{source:epgd.categories,multiselect:true});epgd.utils.addAutoComplete(b.tSFGenre,{source:epgd.genres,multiselect:true})};epgd.searchTimerDialog.prototype.render=function(b){b=b||{searchfields:1};epgd.searchTimerDialog.base.render.call(this,b);var c=this.form,e,a;c.tExpr.value=b.expression||"";$(c.tSMode).val(b.searchmode||4);c.tCaseSens.checked=b.casesensitiv==1;e=b.searchfields||0;for(a=0,f=1;a<c.tSFields.length;a++,f*=2){c.tSFields[a].checked=(e&f)}if(b.starttime||b.endtime||b.weekdays||b.nextdays){c.tTime.checked=true;b.starttime?$(c.tStart).datetimepicker("setTime",new Date(0,0,0,parseInt(b.starttime/100,10),(b.starttime%100))):c.tStart.value="";b.endtime?$(c.tEnd).datetimepicker("setTime",new Date(0,0,0,parseInt(b.endtime/100,10),(b.endtime%100))):c.tEnd.value;c.tNextDays.value=b.nextdays||""}else{c.tTime.checked=false}$(c.tTime).change();e=b.repeatfields||0;for(a=0,f=1;a<c.tRFields.length;a++,f*=2){c.tRFields[a].checked=(e&f)}c.tRepeat.checked=e>0;$(c.tRepeat).change();$(c.tRFields).change();c.tSFEpisode.value=b.episodename||"";c.tSFSeason.value=b.season||"";c.tSFSPart.value=b.seasonpart||"";c.tSFYear.value=b.year||"";epgd.utils.setAutoCompleteValues(c.tSFCat,new String(b.category).replace(/'/g,"").split(","));epgd.utils.setAutoCompleteValues(c.tSFGenre,new String(b.genre).replace(/'/g,"").split(","));e=b.tipp||"";for(a=0;a<c.tSFTip.length;a++){c.tSFTip[a].checked=e.indexOf("'"+c.tSFTip[a].value+"'")>=0}c.tSFNoEpgMatch.checked=b.noepgmatch==1;c.tAdv.checked=b.episodename||b.season||b.seasonpart||b.year||b.category||b.genre||b.tipp||b.noepgmatch;$(c.tAdv).change();epgd.utils.setAutoCompleteValues(c.tChannels,new String(b.channelids).split(","));if(b.chexclude){c.tChExclude1.checked=1}else{c.tChExclude0.checked=1}tChRangeMin.value=b.chnummin||"";tChRangeMax.value=b.chnummax||"";c.tChFormat.value=b.chformat||(b.id?"":epgd.profile.chFormat);c.tNameMode.defaultIndex=parseInt(b.category=="Serie"?epgd.profile.namingModeSearchSerie:epgd.profile.namingModeSearchMovie,10);c.tNameMode.selectedIndex=typeof b.namingmode=="undefined"?c.tNameMode.defaultIndex:b.namingmode;c.tTemplate.value=typeof b.template=="undefined"?(b.category=="Serie"?epgd.profile.namingModeSearchSerieTemplate:epgd.profile.namingModeSearchMovieTemplate):b.template;$(c.tNameMode).change();this.$win.parent().find("#tBCopy").toggle(!!b.id)};epgd.searchTimerDialog.prototype.getData=function(g){var b=this.form,e,a,c={expression:b.tExpr.value};if(b.tSFSeason.value){c.season=b.tSFSeason.value}if(b.tSFSPart.value){c.seasonpart=b.tSFSPart.value}if(b.tSFYear.value){c.year=b.tSFYear.value}if(!g){if(!c.expression){return this.showError(epgd.tr.error.emptyField.replace("$field$",epgd.tr.pages.search.searchExpression),b.tExpr)}if(c.season&&!/^[0-9]{0,3}-?[0-9]{0,3}$/.test(c.season)){return this.showError(epgd.tr.error.invalid,b.tSFSeason)}if(c.seasonpart&&!/^[0-9]{0,3}-?[0-9]{0,3}$/.test(c.seasonpart)){return this.showError(epgd.tr.error.invalid,b.tSFSPart)}if(c.year&&!/^((19|20)[0-9]{2})?(-|-(19|20)[0-9]{2})?$/.test(c.year)){return this.showError(epgd.tr.error.invalid,b.tSFYear)}}if(b.tID.value){c.id=parseInt(b.tID.value,10)}if(b.tSFEpisode.value){c.episodename=b.tSFEpisode.value}c.category=epgd.utils.getAutoCompleteValues(b.tSFCat,"'");c.genre=epgd.utils.getAutoCompleteValues(b.tSFGenre,"'");e="";for(a=0;a<b.tSFTip.length;a++){if(b.tSFTip[a].checked){e+=",'"+b.tSFTip[a].value+"'"}}c.tipp=e.slice(1);c.noepgmatch=b.tSFNoEpgMatch.checked?1:0;c.searchmode=parseInt($(b.tSMode).val(),10);c.searchfields=0;for(a=0,f=1;a<b.tSFields.length;a++,f*=2){if(b.tSFields[a].checked){c.searchfields+=f}}c.casesensitiv=b.tCaseSens.checked?1:0;c.repeatfields=0;if(b.tRepeat.checked){for(a=0,f=1;a<b.tRFields.length;a++,f*=2){if(b.tRFields[a].checked){c.repeatfields+=f}}}c.active=b.tInactive.checked?0:1;c.channelids=epgd.utils.getAutoCompleteValues(b.tChannels);c.chformat=b.tChFormat.value;c.chexclude=b.tChExclude1.checked?1:0;c.chnummin=parseInt(b.tChRangeMin.value,10);if(isNaN(c.chnummin)){c.chnummin=0}c.chnummax=parseInt(b.tChRangeMax.value,10);if(isNaN(c.chnummax)){c.chnummax=0}if(b.tTime.checked){c.starttime=parseInt(b.tStart.value.replace(":",""),10);c.endtime=parseInt(b.tEnd.value.replace(":",""),10);c.weekdays=0;for(a=0,f=1;a<b.tWeek.length;a++,f*=2){if(b.tWeek[a].checked){c.weekdays+=f}}}c.vps=b.tVPS.checked?1:0;if(b.tPrio.value){c.priority=parseInt(b.tPrio.value,10)}if(b.tLife.value){c.lifetime=parseInt(b.tLife.value,10)}c.directory=b.tFolder.value;e=$(b.tVdr).val();if(e){c.vdruuid=e}c.namingmode=b.tNameMode.selectedIndex;c.template=b.tTemplate.value;c.type=$(b.tType).val();if(c.type=="V"&&!e&&!g){return this.showError(epgd.tr.error.emptyField.replace("$field$","VDR"),b.tVdr)}c.name=b.tSName.value;if(b.tNextDays.value){c.nextdays=parseInt(b.tNextDays.value,10)}return c};epgd.searchTimerDialog.prototype.save=function(h,e,c,g){h=h||this.getData();var a=this,k=h.id,b=h.name;h.max=0;h.id&&delete h.id;h.name&&delete h.name;epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+"data/search",type:"post",data:JSON.stringify(h)},function(d){h.id=k;h.name=b;if(d.count>50){epgd.utils.confirm(epgd.tr.pages.timerList.confirmSaveBigResult.replace("$cnt$",d.count),function(l){l&&epgd.searchTimerDialog.base.save.call(a,h)})}else{epgd.searchTimerDialog.base.save.call(a,h,e,c,g)}epgd.utils.loader.close()})},true)};epgd.searchDialog=epgd.utils.inherits(function(){epgd.searchTimerDialog.call(this,{id:"search",embed:true,buttons:null});this.searchResultList=new epgd.searchResultList({empty:epgd.tr.pages.search.empty},this)},epgd.searchTimerDialog);epgd.searchDialog.prototype.create=function(){epgd.searchDialog.base.create.call(this);var c=this.form,b=this,a=$('<div id="searchResult"></div>').appendTo(this.$win);$('<button type="submit" id="sSearch" class="iAsButton i-search">'+epgd.tr.pages.search.search+"</button>").insertAfter(c.tExpr).after(' <input type="checkbox" id="sAdv" />&nbsp;<label for="sAdv">'+epgd.tr.advanced+"</label>");$(c.tType).parent().hide().parent().css("border-top","1px solid #ccc").insertAfter($(c.tVdr.parentNode.parentNode).hide());$('<input type="button" class="iAsButton" id="tCopy" value="'+epgd.tr.copy+'" />').insertAfter(c.tSName).click(function(){b.form.tID.value="";b.form.tSName.value+=" copy";b.form.tSName.select()}).prop("disabled",true);$('<input type="button" class="iAsButton" id="tDel" value="'+epgd.tr.del+'" />').insertAfter(c.tSName).click(function(){b.list.del(this.form.tID.value,function(){b.form.tID.value="";b.loadSavedSearch()})}).prop("disabled",true);$('<input type="button" class="iAsButton" value="'+epgd.tr.save+'" />').insertAfter(c.tSName).click(function(){var e=b.getData();if(!e.name){return this.showError(epgd.tr.error.invalid,c.tSName)}b.save(e,null,null,function(){b.loadSavedSearch()})});$(c).submit(function(){b.search(a);return false});this.$win.find("#sExpr").keyup(function(d){if(d.keyCode==13){this.form.sSearch.click();$(this).blur()}}).focus();this.$win.find("#sAdv").change(function(){$(c).toggleClass("noAdv",!this.checked);b.resize()}).prop("checked",epgd.profile.searchAdv=="1").change();$(c.tSName).autocomplete({minLength:0,maxHeight:300,source:function(){return false},select:function(e,g){var h=g.item.data||{id:""};if(h.id){b.render(h);b.form.sSearch.click();$([c.tDel,c.tCopy,c.tInactive]).prop("disabled",false);return false}else{c.tID.value="";$([c.tDel,c.tCopy,c.tInactive]).prop("disabled",true)}}}).focus(function(){$(this).autocomplete("search","")});this.loadSavedSearch()};epgd.searchDialog.prototype.loadSavedSearch=function(){var a=this.form;epgd.ajax({url:epgd.login.url+"data/searchtimers?type=S"},function(c){var b=[];$.each(c.searchtimers,function(e,d){b.push({value:d.name||d.expression,label:d.name||d.expression,data:d})});$(a.tSName).autocomplete("option","source",b)})};epgd.searchDialog.prototype.resize=function(){var a=this.$win.find("#searchResult"),b=$(window).height()-a.offset().top-20;if(b<100){a.css({height:"auto","overflow-y":"visible"})}else{a.css({height:b+"px","overflow-y":"auto"})}};epgd.searchDialog.prototype.render=function(a){if(!epgd.$con.find("#search").length){$("#menu_search").addClass("menu-active");this.create();epgd.$con.html("");this.$win.appendTo(epgd.$con)}a=a||{searchfields:1};a.type="S";epgd.searchDialog.base.render.call(this,a)};epgd.searchDialog.prototype.close=function(){};epgd.channels={list:null,autoCompleteData:null,isDirty:false,selBox:$('<select id="selChannel"></select>')[0],load:function(){if(!this.list||this.isDirty){epgd.ajax({url:epgd.login.url+"data/channels",async:false,cache:false},function(d){var b=(epgd.profile.channelLogoPath?epgd.profile.channelLogoPath+"?maxW=70&maxH=50&id=":false),e="",c={},a=[];d.channels&&$.each(d.channels,function(g,h){var k=h.channelid||g;if(h.name){h.html='<div class="channel" id="'+k+'">'+(b?'<img src="'+b+k+'" alt="'+h.name+'" /><i class="i-tv" title="'+epgd.tr.pages.eventDetail.ch_switch+'" />'+(epgd.profile.logoShowName=="1"?h.name:""):h.name)+"</div>";h.visible&1&&(e+='<option value="'+k+'">'+h.name+"</option>")}else{h.html='<div class="channel" id="'+k+'"><i class="i-tv" title="'+epgd.tr.pages.eventDetail.ch_switch+'" />'+k+"</div>";h.visible&1&&(e+='<option value="'+k+'">'+k+"</option>")}c[k]=h;a.push({label:h.name,value:k})});epgd.channels.list=c;epgd.channels.autoCompleteData=a;$(epgd.channels.selBox).html(e);$(window).trigger("channels_load");this.dirty=false})}},getHtml:function(b){var a=this.list[b];return a?a.html:'<div class="channel" id="'+b+'"><i class="i-tv" title="'+epgd.tr.pages.eventDetail.ch_switch+'" />'+b+"</div>"},getName:function(b){var a=this.list[b];return a?a.name:b}};epgd.eventDetail=function(a){this.id=a;this.data=null;this.expire=0};epgd.eventDetail.prototype.imgPath=false;epgd.eventDetail.prototype.load=function(b,c){var a=this;epgd.ajax({url:epgd.login.url+"data/event?"+(b&&c?"channelid="+b+"&time="+c:"id="+this.id),async:false,cache:false},function(d){a.data=d.event;a.id=d.id;a.expire=epgd.utils.now().getTime()+900000});return this};epgd.eventDetail.prototype.render=function(){if(this.expire<epgd.utils.now().getTime()){this.load()}if(!this.data){return""}this.win.render(this)};epgd.eventDetail.prototype.doRecord=function(a){if(a===true){return epgd.tr.pages.eventDetail.record}a=a||this.data;var b={id:a.timerid,eventid:a.id,channelid:a.channelid,title:a.title,evStartTime:a.starttime,evDuration:a.duration,category:a.category,shorttext:a.shorttext,expression:a.title};if(b.eventid){epgd.pages.timerList.dialog.render(b)}else{epgd.pages.searchTimerList.dialog.render(b)}};epgd.eventDetail.prototype.doRepeat=function(c){if(c){return true}var d=this.win,a=d.$con.find(".repeat"),b;if(!a.length){if(!this.searchResultList){this.searchResultList=new epgd.searchResultList(null,{resize:function(){d.$con.last().find('td[data-evId="'+d.detail.data.id+'"]').parent().remove();d.$con.accordion("refresh");a.click()}})}a=$('<h3 class="repeat">'+epgd.tr.pages.eventDetail.repeat+"</h3>").appendTo(d.$con);b={searchfields:1,expression:this.data.title,searchmode:1,casesensitiv:1,fromEventDetail:true};if(this.data.shorttext){b.searchfields1=2;b.expression1=this.data.shorttext}epgd.pages.search.search.call(this,$('<div class="desc"></div>').appendTo(d.$con),b)}else{a.click()}};epgd.eventDetail.prototype.doPlay=function(b){var a=parseInt(epgd.utils.now().getTime()/1000,10)-this.data.starttime;if(a>this.data.duration){return false}if(b){return !epgd.vdrs.current.uuid?false:(a<0?epgd.tr.pages.timerList.newTimer+": ":"")+epgd.tr.pages.eventDetail.ch_switch}if(a<0){a=this.win.$rec;epgd.pages.timerList.save({type:"V",active:1,vdruuid:epgd.vdrs.current.uuid,eventid:this.data.id,channelid:this.data.channelid,title:this.data.title},null,null,function(){a.addClass("hasTimer")})}else{epgd.vdrs.current.switchChannel(this.data.channelid)}};epgd.eventDetail.prototype.doPrev=function(c){var b=this.data.starttime-500,a=this;if(b<epgd.profile.minEventTime){return false}if(c){return true}epgd.utils.loader.process(function(){new epgd.eventDetail().load(a.data.channelid,b).render()})};epgd.eventDetail.prototype.doNext=function(c){var b=this.data.starttime+this.data.duration+500,a=this;if(b>epgd.profile.maxEventTime){return false}if(c){return true}epgd.utils.loader.process(function(){new epgd.eventDetail().load(a.data.channelid,b).render()})};epgd.eventDetail.win=function(){this._create();this.closed=true;this.detail=null;var a=this;$(window).bind("epgd_close.eventDetail",function(){if(!a.closed){a.$win.css("z-Index","");a.$win.hide();$(document).unbind("keyup.eventDetail");a.closed=true;a.$openDialogs&&a.$openDialogs.removeClass("ui-state-disabled")}});$(window).bind("resize.eventDetail",function(b){if(!a.closed){try{a.$win.css("max-width",$(window).width());a.$win.show().position({of:window});a.$con.accordion("refresh")}catch(c){}if(parseInt(a.$win.css("top"),10)<69){a.$win.css("top","69px")}}})};epgd.eventDetail.win.prototype._create=function(){this.imgPath=epgd.profile.eventImgPath?epgd.profile.eventImgPath+"?no=0&maxW=270&maxH=146&id=":false;this.movieImgPath=epgd.profile.movieMediaPath?epgd.profile.movieMediaPath+"?actor_id=0&movie_id=":false;this.movieActorImgPath=epgd.profile.movieMediaPath?epgd.profile.movieMediaPath+"?maxW=60&maxH=90&media_type=4&actor_id=":false;this.serieImgPath=epgd.profile.serieImgPath?epgd.profile.serieImgPath+"?actor_id=0&series_id=":false;this.serieActorImgPath=epgd.profile.serieImgPath?epgd.profile.serieImgPath+"?maxW=60&maxH=90&season_number=0&episode_id=0&media_type=13&actor_id=":false;this.$win=$('<div id="eventDetail" class="ui-front"><div class="ui-front ui-widget ui-widget-content ui-corner-all" style="position:absolute;width:100%;height:100%"><div class="toolbar ui-widget-header ui-corner-all"></div><div></div></div><div class="ui-widget ui-widget-shadow ui-corner-all" style="position:absolute;width:100%;height:100%"></div></div>').appendTo(document.body);this.$con=this.$win.find(":first :last");var c=this,b=epgd.tr.pages.eventDetail,a=this.$win.find(".toolbar")[0];this.$rec=$('<button class="iAsButton i-record"/>').css("float","left").appendTo(a).click(function(){c.detail.doRecord()});$('<button class="iAsButton i-buffer" title="'+b.repeat+'" />').css("float","left").appendTo(a).click(function(){c.detail.doRepeat()});this.$play=$('<button class="iAsButton i-tv" />').css("float","left").appendTo(a).click(function(){c.detail.doPlay()});this.$prev=$('<button class="iAsButton i-rewind" title="'+b.eventPrev+'" />').appendTo(a).click(function(){c.detail.doPrev()});this.$next=$('<button class="iAsButton i-forward" title="'+b.eventNext+'" />').appendTo(a).click(function(){c.detail.doNext()});$('<button class="iAsButton i-cancel" title="'+epgd.tr.close+'" />').css("float","right").appendTo(a).click(function(){$(window).trigger("epgd_close.eventDetail")})};epgd.eventDetail.win.prototype.render=function(x){this.detail=x;var v=x.data,b=epgd.tr.pages.eventDetail,g=((parseInt(epgd.utils.now().getTime()/1000,10)-v.starttime)/v.duration*100),d="",z=v.episode||{},u=v.longdescription?'<div title="longdescription">'+v.longdescription+"</div>":"",w="",y=null,r=(this.imgPath&&v.imagecount?this.imgPath+v.id:""),q=null,m=z.episodename||v.title,p=$(window).width()<500,l,s,a,c,k,h,t="";if(v.cntlongdescription){u+='<hr><div title="cntlongdescription">'+v.cntlongdescription+"</div>"}if(v.rating){l=v.rating.slice(v.rating.indexOf("/")).split(" ");for(s=1;s<l.length;s+=3){d+=l[s]+'<div class="stars'+l[s+1].length+'"> </div>'}}w="";for(s in b.extInfo){if(v[s]){w+="<tr><th>"+b.extInfo[s]+"</th><td>"+v[s]+"</td></tr>"}}if(v.scraper&&(a=v.scraper.movie||v.scraper.serie)){a.media=a.media||[];if(a.actors){y="";for(s in a.actors){c=a.actors[s];y+="<div>"+(this.movieActorImgPath&&c.actorid?'<img src="'+this.movieActorImgPath+c.actorid+'" />':"")+'<a href="'+epgd.profile.movieActorPath+c.actorid+'" target="_blank">'+c.actorname+"</a>"+(c.actorrole||"")+"</div>"}}if(v.scraper.movie){a.isMovie=true;if(a.media&&this.movieImgPath){if(!r&&a.media["1"]){r=this.movieImgPath+a.movieid+"&media_type=1&maxW=270&maxH=146"}if(a.media["3"]){q=this.movieImgPath+a.movieid+"&media_type=3&maxW=400&maxH=999"}else{if(a.media["1"]){q=this.movieImgPath+a.movieid+"&media_type=1&maxW=400&maxH=999"}}}if(a.actors){y="";for(s in a.actors){c=a.actors[s];y+="<div>"+(this.movieActorImgPath?'<img src="'+this.movieActorImgPath+s+'" />':"")+'<a href="'+epgd.profile.movieActorPath+s+'" target="_blank">'+c.actorname+"</a>"+(c.actorrole||"")+"</div>"}}if(a.overview){u='<div title="overview">'+a.overview+"</div><hr />"+u}w="<h3><span>"+b.scrapperMovieInfo+'</span></h3><div><table class="colFull">'+(a.media["1"]&&this.movieImgPath?'<tr><th colspan="2"><img src="'+this.movieImgPath+a.movieid+'&media_type=1&maxW=397&maxH=400" /></th></tr>':"")+(a.title?"<tr><th>"+b.title+"</th><td>"+a.title+"</td></tr>":"")+(a.originaltitle?"<tr><th>"+b.original_title+"</th><td>"+a.originaltitle+"</td></tr>":"")+(a.runtime?"<tr><th>"+b.runtime+"</th><td>"+a.runtime+" "+epgd.tr.minutes+"</td></tr>":"")+(a.movie_release_date?"<tr><th>"+b.release_date+"</th><td>"+a.movie_release_date+"</td></tr>":"")+(a.genres?"<tr><th>"+b.genre+"</th><td>"+a.genres.replace(/^\||\|$/g,"").replace(/ ?\| ?/g,", ")+"</td></tr>":"")+(a.voteaverage?"<tr><th>"+b.vote_average+'</th><td class="stars"><div class="stars5" style="width:'+parseInt(a.voteaverage*8,10)+'px"></div> ('+a.voteaverage.toFixed(1)+" / 10)</td></tr>":"")+(a.popularity?"<tr><th>"+b.popularity+"</th><td>"+a.popularity.toFixed(1)+"</td></tr>":"")+w+(a.budget?"<tr><th>Budget</th><td>$"+a.budget+"</td></tr>":"")+(a.revenue?"<tr><th>Einnahmen</th><td>$"+a.revenue+"</td></tr>":"")+(a.homepage?"<tr><th>"+b.homepage+'</th><td><a href="'+a.homepage+'">'+a.homepage+"</a></td></tr>":"")+"</table>"+(a.media["0"]&&this.movieImgPath?'<img class="poster" src="'+this.movieImgPath+a.movieid+'&media_type=0&maxW=390&maxh=999" />':"")}else{a.isSerie=true;if(a.actors){y="";for(s in a.actors){c=a.actors[s];y+="<div>"+(this.serieActorImgPath?'<img src="'+this.serieActorImgPath+s+"&series_id="+a.seriesid+'" />':"")+"<a>"+c.actorname+"</a>"+(c.actorrole?c.actorrole.replace(/\|/g,"<br />"):"")+"</div>"}}l=a.episode;if(l){if(l.episodeoverview){if(v.longdescription&&l.episodeoverview.length>v.longdescription.length){u=u.replace(/^<div.+<\/div>/i,"")}u='<div title="episodeoverview">'+l.episodeoverview+"</div>"+u}u="<h5>"+l.episodename+"</h5>"+u;if(l.episodegueststars){y+='</div><div class="colFull actors"><h5>'+b.gueststars+"</h5><br />"+l.episodegueststars.replace(/^\||\|$/g,"").replace(/\|/g,"<br />")}if(!r&&a.media["12"]&&this.serieImgPath){r=this.serieImgPath+a.seriesid+"&season_number="+l.seasonnumber+"&episode_id="+l.episodeid+"&media_type=12&maxW=270&maxH=146"}}if(a.media["3"]){q=this.serieImgPath+a.seriesid+"&season_number=0&episode_id=0&media_type=3&lfn=0&maxW=400&maxh=999"}if(a.seriesoverview){u+=u?'<hr /><a href="#" onclick="return !$(this).next().toggle()">Serienbeschreibung</a><div style="display:none" title="seriesoverview">'+a.seriesoverview+"</div>":"<div>"+a.seriesoverview+"</div>"}w="<h3><span>"+b.scrapperSerieInfo+'</span></h3><div><table class="colFull">'+(a.media["1"]&&this.serieImgPath?'<tr><th colspan="2"><img src="'+this.serieImgPath+a.seriesid+'&season_number=0&episode_id=0&media_type=1&lfn=1&maxW=397&maxH=250" /></th></tr>':"");if(l){w+=(a.media["12"]&&this.serieImgPath?'<tr><th colspan="2"><img src="'+this.serieImgPath+a.seriesid+"&season_number="+l.seasonnumber+"&episode_id="+l.episodeid+'&media_type=12&maxW=397&maxH=400" /></th></tr>':"")}w+=(a.seriesname?"<tr><th>"+b.title+"</th><td>"+a.seriesname+"</td></tr>":"")+(a.seriesnetwork?"<tr><th>"+b.network+"</th><td>"+a.seriesnetwork+"</td></tr>":"")+(a.seriesstatus?"<tr><th>"+b.seriesstatus+"</th><td>"+a.seriesstatus+"</td></tr>":"")+(a.seriesfirstaired?"<tr><th>"+b.release_date+"</th><td>"+a.seriesfirstaired+"</td></tr>":"")+(a.seriesgenre?"<tr><th>"+b.genre+"</th><td>"+a.seriesgenre.replace(/^\||\|$/g,"").replace(/ ?\| ?/g,", ")+"</td></tr>":"")+(a.seriesrating?"<tr><th>"+b.vote_average+'</th><td class="stars"><div class="stars5" style="width:'+parseInt(a.seriesrating*8,10)+'px"></div> ('+a.seriesrating.toFixed(1)+" / 10)</td></tr>":"")+w+(epgd.profile.serieSeasonPath?'<tr><td colspan="2"><a href="'+epgd.profile.serieSeasonPath+a.seriesid+'" target="_blank">'+b.homepage+"</a></td></tr>":"")+"</table>";if(l){w+=(a.media["7"]&&this.serieImgPath?'<img class="poster" src="'+this.serieImgPath+a.seriesid+"&season_number="+l.seasonnumber+'&episode_id=0&media_type=7&maxW=390&maxh=999" />':"")}w+=(a.media["2"]&&this.serieImgPath?'<img class="poster" src="'+this.serieImgPath+a.seriesid+'&season_number=0&episode_id=0&media_type=2&lfn=0&maxW=390&maxh=999" />':"")}}else{a={};w="<h3><span>"+b.extentedInfo+'</span></h3><div><table class="colFull"><tr><th>'+b.title+"</th><td>"+v.title+"</td></tr>"+(z.partname?"<tr><th>"+b.part+"</th><td>"+z.partname+"</td></tr>":"")+(v.year?"<tr><th>"+b.release_date+"</th><td>"+v.year+"</td></tr>":"")+(z.lang?"<tr><th>"+b.lang+"</th><td>"+z.lang+"</td></tr>":"")+w+"</table>"}if(!y&&v.actor){y=v.actor.replace(/, /g,"<br />")}y&&(w+='<div class="colFull actors"><h5>'+b.actors+"</h5>"+y+"</div>");w&&(w+="</div>");k=(v.path?epgd.tr.pages.timerList.folder+"<br />"+v.path.replace(/\//g," / ")+"<br />":"")+(v.genre?(b.genre+"<b>"+v.genre+"</b><br />"):"")+(v.category?b.category+"<b>"+v.category+"</b><br />":"")+(v.country?b.country+"<b>"+v.country+"</b><br />":"")+(v.year?b.year+"<b>"+v.year+"</b><br />":"");h=(z.part?b.part+"<b>"+z.part+(z.parts?" / "+z.parts+"":"")+"</b><br />":"")+(z.season?b.season+"<b>"+z.season+"</b><br />":"")+(z.number?b.number+"<b>"+z.number+"</b><br />":"")+(z.extracol1?z.extracol1+"<br />":"")+(z.extracol2?z.extracol2+"<br />":"")+(z.extracol3?z.extracol3+"<br />":"");if(v.recordings){for(s in v.recordings){l=v.recordings[s];t+='<div class="rec" data-start="'+l.starttime+'" data-owner="'+(l.owner||"")+'" data-md5="'+l.md5path+'" data-path="'+l.path+'"><em>'+epgd.utils.formatDateTime(l.starttime)+"</em><u>"+parseInt(l.duration/60,10)+" "+epgd.tr.minutes+'</u><b onclick="new epgd.recordDetail(this.parentNode).render()"><div class="progress" title="'+l.matchdensitytitle+"% "+epgd.tr.pages.search.matchdensity+'"><div style="width:'+l.matchdensitytitle+'%" ></div></div>'+l.title+(l.shorttext?'<i><div class="progress" title="'+l.matchdensityshorttext+"% "+epgd.tr.pages.search.matchdensity+'"><div style="width:'+l.matchdensityshorttext+'%" ></div></div>'+l.shorttext+"</i>":"")+"</b></div>"}}this.$con=$('<div><h3><div class="date">'+$.datepicker.formatDate(p?"d. M y":"d. MM yy",epgd.utils.date(v.starttime))+"</div>"+(p?"":v.title)+'<div class="time"><b>'+epgd.utils.formatTime(v.starttime)+"</b>&nbsp;&ndash;&nbsp;"+epgd.utils.formatTime(v.starttime+v.duration)+" "+epgd.tr.oClock+"&nbsp;|&nbsp;"+parseInt(v.duration/60,10)+" "+epgd.tr.minutes+'</div></h3><div><div class="colFull"><div class="imgBox">'+(r?'<img src="'+r+'" />':"")+'</div><div class="chPrFl">'+epgd.channels.getHtml(v.channelid)+(g>0&&g<=100?'<div class="progress"><div style="width: '+g+'%"></div></div>':"")+'<div class="audio">'+(v.flags&&v.flags.indexOf("16:9")>0?'<span class="a-169"></span>':"")+(v.audio&&v.audio.indexOf("DolbyDigital")>=0?'<span class="a-dd" title="DolbyDigital"></span>':"")+(v.flags&&v.flags.indexOf("Live")>0?"Live":"")+(v.parentalrating?'<div class="parRate'+v.parentalrating+'">'+b.parentalrating+v.parentalrating+"</div>":"")+"</div>"+(v.merge?"<div>"+b.mergeSrc+v.merge+"</div>":"")+"</div>"+(d?'<div class="stars">'+d+"</div>":"")+'<div class="col2">'+v.title+(z.partname?"<br /><i>"+z.partname+"</i>":(v.shorttext?"<br /><i>"+v.shorttext+"</i>":""))+'</div><div class="col2 rate rate'+(v.numrating||"0")+'">'+(v.tipp?'<b class="tipp">'+v.tipp+"</b>":"")+(v.txtrating?"<span>"+v.txtrating+"</span>":"")+(v.shortreview||"")+"</div>"+(k?'<div class="info">'+k+"</div>":"")+(h?'<div class="info">'+h+"</div>":"")+(q?'<img src="'+q+'" />':"")+'</div><div class="colFull desc">'+(u?u.replace(/\n/g,"<br />"):"")+"</div></div>"+w+(v.category=="Serie"||a.isSerie||z.episodename?'<h3 data-conti="'+m+'"><span>'+b.constabelInfo+'</span></h3><div class="desc"><a class="iAsButton i-edit" href="'+epgd.profile.constabelEditPath+encodeURIComponent(m)+'.episodes" target="constabel">'+epgd.tr.edit+'</a><a class="iAsButton i-link-ext" href="'+epgd.profile.constabelLinkPath+encodeURIComponent(m)+'" target="constabel">'+epgd.tr.pages.eventDetail.addConstableLink+"</a>"+epgd.pages.help.getButton("constabel",true)+(epgd.profile.constabelLoginPath?'<a class="iAsButton i-login" href="'+epgd.profile.constabelLoginPath+'" target="constabel">'+epgd.tr.pages.eventDetail.loginConstable+"</a>":"")+'<pre id="cRaw"></pre></div>':"")+(t?"<h3><span>"+epgd.tr.menu.records+'</span></h3><div class="recordings">'+t+"</div>":"")+"</div>").replaceAll(this.$con);this.$con.accordion({heightStyle:"fill",header:"h3",active:0,beforeActivate:function(e,A){if(A.newHeader.attr("data-conti")){epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+"data/proxy?id=constabel&title="+encodeURIComponent(encodeURIComponent(A.newHeader.attr("data-conti")))+"&_"+new Date().getTime(),dataType:"html",contentType:"text/plain; charset=utf-8"},function(H){if(H.indexOf("Error:")==-1){var I=A.newPanel.find("#cRaw"),G="<thead><tr><th>"+b.season+"</th><th>"+b.part+"</th><th>"+b.number+"</th><th>"+b.title+"</th>",E="<tbody>",D=H.split(/\r?\n/),C,B,F;for(F=0;F<D.length;F++){C=D[F];if(C.charAt(0)=="#"){B=C.match(/EXTRACOL[0-9] (.+)/i);if(B){G+="<th>"+B[1]+"</th>"}}else{B=C.split(/\t/);if(B.length>3){E+="<tr><td>"+B.join("</td><td>")+"</td></tr>"}}}I.html(H).hide().before('<a href="#" onclick="return !!$(\'#cRaw\').toggle()[0].scrollIntoView()">Raw</a>');I.before("<table>"+G+"</thead>"+E+"</tbody></table>")}else{A.newPanel.find("#cRaw").html(epgd.tr.error.noData)}epgd.utils.loader.close()});A.newHeader.removeAttr("data-conti")},true)}}});this.$rec.toggleClass("hasTimer",!!v.timerid).prop("title",this.detail.doRecord(true));s=this.detail.doPlay(true);this.$play.toggle(!!s).prop("title",s);this.$prev.toggle(this.detail.doPrev(true));this.$next.toggle(this.detail.doNext(true));this.$con.find(".channel .i-tv").click(function(){epgd.vdrs.current.switchChannel(this.parentNode.id)});this.closed=false;s=Math.max.apply(null,this.$win.siblings(".ui-front:visible").map(function(){return +$(this).css("z-index")}).get());if(s>=+this.$win.css("z-index")){this.$win.css("z-index",s+1)}$(window).trigger("resize.eventDetail");this.$openDialogs=$(".ui-dialog:visible:not(.ui-state-disabled)").addClass("ui-state-disabled");$(document).bind("keyup.eventDetail",function(A){if(A.keyCode==27){$(window).trigger("epgd_close.eventDetail")}});epgd.pages.help.initButtons(this.$con)};epgd.recordDetail=epgd.utils.inherits(function(a){this.elem=a;return epgd.eventDetail.call(this)},epgd.eventDetail);epgd.recordDetail.prototype.load=function(){var a=this;epgd.ajax({url:epgd.login.url+"data/recording?starttime="+this.elem.getAttribute("data-start")+"&md5path="+this.elem.getAttribute("data-md5")+"&owner="+this.elem.getAttribute("data-owner"),async:false},function(b){a.data=b.recording});return this};epgd.recordDetail.prototype.doRecord=function(a){if(a===true){return epgd.tr.pages.records.similarTimer}epgd.eventDetail.prototype.doRecord.call(this,a)};epgd.recordDetail.prototype.doPlay=function(a){if(a){return epgd.tr.pages.eventDetail.play}epgd.ajax({url:epgd.login.url+"data/replayrecording?vdruuid="+(!epgd.vdrs.list[this.data.vdruuid].usecommonrecfolder?this.data.vdruuid:epgd.vdrs.current.uuid)+"&starttime="+this.data.starttime+"&md5path="+this.data.md5path+"&owner="+(this.data.owner||""),cache:false},function(b){epgd.utils.popup(b.result.message,{title:"VDR",autoClose:5000})})};epgd.recordDetail.prototype.doPrev=function(b){var a=$(this.elem).prev(".rec");if(!a.length){return false}if(b){return true}a.find("B").click()};epgd.recordDetail.prototype.doNext=function(b){var a=$(this.elem).next(".rec");if(!a.length){return false}if(b){return true}a.find("B").click()};epgd.doneTimerDetail=epgd.utils.inherits(function(a){this.tr=a;return epgd.eventDetail.call(this)},epgd.eventDetail);epgd.doneTimerDetail.prototype.load=function(){var a=this;epgd.ajax({url:epgd.login.url+"data/donetimer?id="+this.tr.tData.id,async:false,cache:false},function(c){var b=c.donetimer;if(b.state){b.cntlongdescription=epgd.pages.timerListDone.stateIcons[b.state]}b.episode={lang:b.episodelang,season:b.episodeseason,part:b.episodepart};a.id=c.id;a.expire=epgd.utils.now().getTime()+900000;delete b.timerid;delete b.id;a.data=b});return this};epgd.doneTimerDetail.prototype.doRecord=function(a){if(a===true){return epgd.tr.pages.records.similarTimer}epgd.eventDetail.prototype.doRecord.call(this,a)};epgd.doneTimerDetail.prototype.doPlay=function(a){return false};epgd.doneTimerDetail.prototype.doPrev=function(b){var a=$(this.tr).prev("tr");if(!a.length){return false}if(b){return true}a.find("td").click()};epgd.doneTimerDetail.prototype.doNext=function(b){var a=$(this.tr).next("tr");if(!a.length){return false}if(b){return true}a.find("td").click()};$(document).ready(function(){epgd.eventDetail.prototype.win=new epgd.eventDetail.win()});epgd.pages.editChannels={render:function(){if(!(epgd.login.rights&epgd.rights.umConfigEdit)==epgd.rights.umConfigEdit){return epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})}var k=epgd.tr.pages.editChannels,p=epgd.$con,e,m="",h="",l,c,d,g,b,a;for(d in epgd.channels.list){a=epgd.channels.list[d];l=[];for(g in a.sources){c=a.sources[g];l[c.merge]="<li><u>"+g+'</u> <input type="text" readonly value="'+c.extid+'" /></li>'}m+='<li><em class="i-check'+(a.visible&1?"":"-empty")+'"></em><em style="display:none" class="i-check'+(a.visible&2?"":"-empty")+'"></em><span>'+d+'</span><input type="text" value="'+(a.name||"")+'" /></li>'}for(b in epgd.vdrs.list){h+='<li data-url="vdr&uuid='+b+'">'+epgd.vdrs.list[b].name+"</li>"}e=p.html('<div class="ui-widget"><div class="ui-state-highlight ui-corner-all" style="padding: 0.3em 0.7em; font-size:0.9em"><button class="iAsButton i-down-dir">'+k.menu.channelList+'</button> <span class="i-info-circled" style="display:inline-block"></span>'+epgd.tr.pages.editChannels.headline+'</div></div><div class="pageEditChannels" id="pageEditChannelsHead"><div class="selMarkBlock"><b title="'+epgd.tr.markAll+'" class="selected" data-t="1"></b><b title="'+epgd.tr.markNone+'" data-t="0"></b><b title="'+epgd.tr.markToggle+'"><b class="selected"></b></b></div><div class="selMarkBlock" data-index="0" title="'+epgd.tr.pages.editChannels.checkWeb+'">Web<em title="'+epgd.tr.markAll+'" class="iAsButton i-check"></em><em title="'+epgd.tr.markNone+'" class="iAsButton i-check-empty"></em></div><span><input type="text"/>channel-id</span><span><input type="text"/>channel-name</span></div>').find("button");e.click(function(){var q=this.$menu.show();$(document).bind("click.ui_menu",function(r){if(!$(r.target).closest(".ui-menu").length){q.hide();$(this).unbind("click.ui_menu")}});return false})[0].$menu=$('<ul style="font-size:0.8em; width:200px;position:absolute"><li data-id="loadList"><a>'+k.menu.referenceList+'</a><ul style="width:100px"><li data-id="channelpedia"><a>channelpedia</a></li>'+(h?"<li><a>VDR</a><ul>"+h+"</ul></li>":"")+'<li data-id="insertList"><a>'+k.menu.insertAsText+'</a></li></ul></li><li data-id="getChannelNames"><a>'+k.menu.extentEmptyChannelNames+'</a></li><li data-id="getAllChannelNames"><a>'+k.menu.applyAllChannelNames+'</a></li><li data-id="getOrder"><a>'+k.menu.applyChannelSort+"</a></li></ul>").hide().insertAfter(e).menu({select:function(s,t){var v=t.item,q,u,r="";if(!v.attr("data-id")){v=v.parents("li[data-id]:first")}switch(v.attr("data-id")){case"getChannelNames":r='[value=""]';case"getAllChannelNames":epgd.utils.loader.process(function(){var w=[];$("#pageEditChannelsSource li").each(function(){w[this.lastChild.innerHTML]=this.firstChild.innerHTML});$("#pageEditChannels > li > input"+r).each(function(){this.value=w[this.previousSibling.innerHTML]||this.value})});break;case"getOrder":epgd.utils.loader.process(function(){var x=$("#pageEditChannels"),w;$($("#pageEditChannelsSource span").get().reverse()).each(function(){w=x.find("> li > span:contains("+this.innerHTML+")");if(w.length){w.parent().prependTo(x)}})});break;case"insertList":$('<div title="channel.conf"><p>'+k.desc_insertList+' <a href="http://channelpedia.yavdr.com/gen/DVB-S/S19.2E/S19.2E_complete_sorted_by_groups.channels.conf" target="forList">channelpedia.yavdr.com</p><textarea style="width:100%; height:60%"></textarea><button>ok</button></div>').dialog({modal:true,width:500,height:400}).find("textarea").change(function(){epgd.pages.editChannels.insertReferenceList(this.value);$(this).parent().dialog("destroy")});break;case"loadList":if(t.item.attr("data-url")){epgd.ajax({url:epgd.login.url+"data/proxy?id="+t.item.attr("data-url"),dataType:"html",contentType:"text/plain; charset=utf-8"},epgd.pages.editChannels.insertReferenceList);break}case"channelpedia":q=$('<ul style="width:100px" />').appendTo(t.item)[0];epgd.ajax({url:epgd.login.url+"data/proxy?id=channelpedia",dataType:"html",contentType:"text/plain; charset=utf-8"},function(x){v.attr("data-id","");var w=$(x.replace(/<img [^>]+>/g,"")).find(".entryMenu > ul:first");w.find("br").remove();w.find("a").each(function(){this.parentNode.setAttribute("data-url",this.getAttribute("href"));this.removeAttribute("href")});w.find(">li").each(function(){$('<li data-id="channelpediaList"><a>'+this.firstChild.innerHTML+"</a></li>").append($(this).next("ul").width(400)).appendTo(q)});$(s.target).menu("refresh").menu("expand")});return true;case"channelpediaList":u=t.item.attr("data-url");v.attr("data-id","loadList");t.item.removeAttr("data-url");epgd.ajax({url:epgd.login.url+"data/proxy?id=channelpedia&path="+u,dataType:"html",contentType:"text/plain; charset=utf-8"},function(x){var w=$("<ul />");$(x).find('.singleSourceMainMenu li:contains("channels.conf")').each(function(){var y=$(this);$('<li title="'+y.find(".description").text()+'" data-url="channelpedia&path='+u+y.find(".button a").attr("href")+'"><a>'+y.find(".caption").text()+"</a></li>").appendTo(w)});w.appendTo(t.item);$(s.target).menu("refresh").menu("expand")});return true;default:return false}$(document).trigger("click.ui_menu")}}).position({my:"left top",at:"left bottom",of:e[0]});$('<button class="iAsButton i-save">'+epgd.tr.save+"</button>").insertAfter(e).click(function(){var q={};$("#pageEditChannels > li").each(function(s){var t=$(this),r={};l={};t.find(">ol>li").each(function(v){var w=$(this),u=w.find("input").val();r[w.find("u").text()]=l={merge:v};if(u){l.extid=u}});q[t.find("span").text()]={name:t.find("input").val(),visible:t.find("em:eq(0)").hasClass("i-check")*1+t.find("em:eq(1)").hasClass("i-check")*2,order:s+1,sources:r}});epgd.ajax({url:epgd.login.url+"data/save-channels",type:"post",data:JSON.stringify({channels:q})},function(r){r=r.result;if(r.state==200){epgd.utils.popup(epgd.tr.dataSaved);epgd.channels.isDirty=true}else{epgd.utils.popup(r.message)}})});$('<ol id="pageEditChannels" class="pageEditChannels">'+m+"</ol>").appendTo(p).sortable({revert:"invalid",handle:":not(em)"}).click(function(r){if(r.target.nodeName=="EM"){$(r.target).toggleClass("i-check i-check-empty")}else{$li=$(r.target).closest("li");if($li.parent("#pageEditChannels").length){$li.toggleClass("selected");if(r.shiftKey&&this.lastSel){var q=$(this.lastSel),s=$li.index()-q.index();if(s>0){q.nextAll(":lt("+s+"):not(.filterHide)").toggleClass("selected",q.hasClass("selected"))}else{q.prevAll(":lt("+-s+"):not(.filterHide)").toggleClass("selected",q.hasClass("selected"))}}else{this.lastSel=$li[0]}}}});$('<ol id="pageEditChannelsSource" class="pageEditChannels"></ol>').appendTo(p).sortable({connectWith:"#pageEditChannels",revert:"invalid",remove:function(r,q){$('<li><em class="i-check"></em><span>'+q.item.find("span").text()+'</span><input type="text" value="'+q.item.find("i").text()+'" /></li>').insertAfter(q.item);return false}}).hide();p.append('<br clear="all" />');$(window).bind("resize.editChannels",function(){var q=$(window).height()-$("#pageEditChannels").offset().top-20;if($("#pageEditChannelsSource:visible").length==0||(p.width()-$("#pageEditChannels").width()-$("#pageEditChannelsSource").width()-80)>0){$("#pageEditChannels,#pageEditChannelsSource").css({height:q})}else{$("#pageEditChannels").height(q*0.66);$("#pageEditChannelsSource").height(q*0.33)}}).trigger("resize");$(window).bind("epgd_close.editChannels",function(){$(window).unbind(".editChannels");epgd.channels.load()});$("#pageEditChannelsHead em").click(function(){var s=null,q;try{s=$(window.getSelection().getRangeAt(0).cloneContents()).children()}catch(r){s=null}if(!s||!s.length){q=$("#pageEditChannels > li");s=q.filter(".selected");if(!s.length){s=q}}s.find("> em:eq("+this.parentNode.getAttribute("data-index")+").i-check"+(this.className.indexOf("i-check-empty")>0?"":"-empty")).toggleClass("i-check i-check-empty")});$("#pageEditChannelsHead b").click(function(){var q=this.getAttribute("data-t");$("#pageEditChannels > li").toggleClass("selected",q==1?true:q==0?false:undefined);return false});this.inp_ChID=$("#pageEditChannelsHead input:eq(0)").keyup(this.filter)[0];this.inp_ChName=$("#pageEditChannelsHead input:eq(1)").keyup(this.filter)[0]},filter:function(){var b=epgd.pages.editChannels.inp_ChID.value.toLowerCase(),a=epgd.pages.editChannels.inp_ChName.value.toLowerCase();$("#pageEditChannels > li").each(function(){var c=$(this);if((!b||c.find("span").text().toLowerCase().indexOf(b)>=0)&&(!a||c.find("input").val().toLowerCase().indexOf(a)>=0)){c.removeClass("filterHide")}else{c.addClass("filterHide")}})},insertReferenceList:function(c){var a="",b;$(c.split("\n")).each(function(){b=this.split(":");if(b[0]){a+="<li><i>"+b[0].split(/,|;/)[0]+"</i><span>"+b[3]+"-"+b[10]+"-"+b[11]+"-"+b[9]+"</span></li>"}});$("#pageEditChannelsSource").show().html(a);$(window).trigger("resize.editChannels")}};epgd.pages.editUser={cur:null,render:function(){if(!(epgd.login.rights&epgd.rights.umConfigUsers)==epgd.rights.umConfigUsers){return epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})}var b=epgd.tr.pages.editUser,a=$("<form></form>"),c=$('<select size="10"></select>').change(function(){epgd.pages.editUser.showUser(this[this.selectedIndex].data,a,epgd.pages.editUser.render)});$("<option>"+b.add+"</option>").appendTo(c)[0];epgd.$con.html('<div id="page_editUser"><div><h2>'+b.user+"</h2></div></div>");epgd.ajax({url:epgd.login.url+"data/users",cache:false},function(d){for(var e in d.users){$("<option>"+e+"</option>").appendTo(c)[0].data=d.users[e]}});epgd.$con.find("#page_editUser").append(a).children().first().append(c)},showUser:function(a,d,k){epgd.pages.editUser.cur=a||{user:"",active:1,rights:epgd.login.rights};var h=epgd.tr.pages.editUser,g=epgd.pages.editUser.cur,c="",e;for(e in epgd.rights){c+='<div><input type="checkbox"'+((g.rights&epgd.rights[e])==epgd.rights[e]?' checked="checked"':"")+' name="uRights" id="uR'+e+'" value="'+epgd.rights[e]+'"/><label for="uR'+e+'">'+(h.rights[e]||e)+"</label></div>"}d.html((!g.user?"<h2>"+epgd.tr.pages.login.userName+'</h2><div><input type="text" id="uName" value="" /></div><br />':"")+'<div><input type="radio"'+(g.active=="1"?' checked="checked"':"")+' name="uActive" value="1" id="uActive"/><label for="uActive">'+h.active+'</label> <input type="radio"'+(g.active=="0"?' checked="checked"':"")+' name="uActive" value="0" id="uInactive" /><label for="uInActive">'+h.inActive+"</label>"+(g.user&&' <input type="radio" name="uActive" value="-1" id="uDel"/><label for="uDel">'+epgd.tr.del+"</label>")+"</div><h2>"+epgd.tr.pages.login.password+'</h2><div><input type="password" id="uPass" /></div><h2>'+h.rights.label+"</h2><div>"+c+'</div><div><br /><button class="iAsButton i-save">'+epgd.tr.save+"</button></div>");d.find("button").click(function(){return epgd.pages.editUser.save(this.form,k)});$uRights=$(d[0].uRights).each(function(){this.r=parseInt(this.value,10)});function b(){var l=this.r;if(this.checked){$uRights.each(function(){if(this.r<l&&(l&this.r)==this.r){this.checked=this.disabled=true}})}else{$uRights.each(function(){if(this.r<l&&(l&this.r)==this.r){this.disabled=false;var m=this;$uRights.each(function(){if(this.checked&&this.r>m.r&&(this.r&m.r)==m.r){m.checked=m.disabled=true}})}})}}$uRights.each(b).click(b)},save:function(b,d){var a={rights:1},c=epgd.pages.editUser.cur;$(b.uRights).each(function(){if(this.checked){a.rights|=this.r}});a.active=parseInt(b.uActive.value,10);if(c.user){a.user=c.user;if(a.active==-1){delete a.active;a.state="D"}else{a.state="M";if(a.active==c.active){delete a.active}if(a.rights==c.rights){delete a.rights}if(b.uPass.value){a.passwd=YaMD5.hashStr(a.user+b.uPass.value)}}}else{a.state="C";a.user=b.uName.value;if(!a.user){return !epgd.utils.topInfo(epgd.tr.error.emptyField.replace("$field$",epgd.tr.pages.login.userName),{isError:1})}a.passwd=YaMD5.hashStr(a.user+b.uPass.value)}epgd.ajax({url:epgd.login.url+"data/save-users",type:"post",data:JSON.stringify({users:[a]})},function(e){if(e.Error||e.result.state!=200){return epgd.utils.topInfo(e.Error||e.result.message,{isError:1})}(a.user==epgd.login.user)&&$(window).trigger("login_changed",a);if($.isFunction(d)){d(e)}});return false}};epgd.pages.help={$con:null,render:function(){$("#menu_help").addClass("menu-active");if(!this.$con){this.load()}epgd.$con.html(this.$con);this.init()},getButton:function(b,a){return(a?"<a":"<button")+' id="bh_'+b+'" class="help iAsButton i-help" role="button">'+epgd.tr.menu.help+"</"+(a?"a>":"button>")},getIcon:function(a){return'<a id="bh_'+a+'" class="help iAsIcon i-help" />'},initButtons:function(a){if(!a){a=epgd.$con}a.tooltip({items:".help",tooltipClass:"quickInfo",content:function(){return epgd.pages.help.getQuickInfo(this.id.slice(3))},open:function(b,c){$(c.tooltip).position({of:b.toElement,my:"left top"});b.preventDefault()}})},getQuickInfo:function(b){var a=epgd.pages.help;if(!a.$con){a.load()}return a.$con.find("#h_"+b).html()||epgd.tr.pages.help.noHelp},load:function(){var a=this;epgd.ajax({url:epgd.tr.pages.help.url,async:false,dataType:"html",contentType:"text/plain; charset=utf-8"},function(b){a.$con=$($(b).filter("#help")[0]);$(b).filter("#help_js").appendTo(document.body)})}};epgd.pages.login={useCookie:document.cookie.match(/login=([^;]+)/),render:function(){if(epgd.login.session){this.doLogin("logout")}this.showForm()},showForm:function(c){var b=epgd.tr.pages.login,a=$("#login");if(!a.length){a=$('<div id="login" title="'+b.label+'" class="searchDialog ui-dialog" style="margin:5% auto"><form class="ui-dialog-content ui-widget-content"><table cellpadding="5"><tr><td>'+b.userName+'</td><td><input type="text" id="lUser" /></td></tr><tr><td>'+b.password+'</td><td><input type="password" id="lPass" /></td></tr><tr><td colspan="2"><input type="checkbox" id="lAlways" /> <label for="lAlways">'+b.loggedAlwaysIn+"</label></td></tr></table></form></div>");a.dialog({modal:true,width:"auto",closeOnEscape:false,buttons:[{text:b.label,icons:{primary:"ui-icon-unlocked"},click:function(){var d=a.find("form")[0];if(!d.lUser.value){return !!epgd.utils.topInfo(epgd.tr.error.emptyField.replace("$field$",b.userName),{isError:1})}$(this).dialog("close");epgd.pages.login.useCookie=d.lAlways.checked?[]:null;epgd.pages.login.doLogin(d.lUser.value,d.lPass.value,c)}}]}).keypress(function(d){if(d.keyCode==13){$(this).parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click")}}).parent().find(".ui-dialog-titlebar-close").remove()}else{a.dialog("open")}},doLogin:function(c,g,k){var d=epgd.login,b="",h=sessionStorage;try{h.setItem("_storagetest_",1);h.removeItem("_storagetest_")}catch(e){h={removeItem:function(){},setItem:function(){},getItem:function(){return null}}}function a(){if(epgd.login.user!=d.user||epgd.login.rights!=d.rights){if(!epgd.login.session){if(epgd.pages.login.useCookie){epgd.pages.login.useCookie[1]=null;document.cookie="login=; expires=Thu, 01 Jan 1970 00:00:00 UTC"}h.removeItem("login");epgd.login.url=""}else{if(epgd.pages.login.useCookie){epgd.pages.login.useCookie[1]=b;var l=new Date();l.setTime(l.getTime()+365*24*60*60*1000);document.cookie="login="+b+"; expires="+l.toUTCString()}h.setItem("login",b);epgd.login.url="sid"+epgd.login.session+"/"}$(window).trigger("login_changed",d)}epgd.login.url=epgd.login.session?"sid"+epgd.login.session+"/":"";if($.isFunction(k)){k()}}if(c!="logout"){if(d.session){$.ajax({url:d.url+"data/login",data:JSON.stringify({key:""}),type:"post",contentType:"application/json; charset=utf-8",dataType:"json"});epgd.login.url=""}if(epgd.profile.needLogin=="0"){epgd.login={user:"",session:"",rights:4294967295,url:""};return a()}if(c){b=YaMD5.hashStr(c+g)}else{b=h.getItem("login");if(!b&&epgd.pages.login.useCookie){b=epgd.pages.login.useCookie[1]}if(!b){return this.showForm(k)}}}$.ajax({url:epgd.login.url+"data/login",data:JSON.stringify({key:b}),type:"post",contentType:"application/json; charset=utf-8",dataType:"json"}).done(function(m){var l=epgd.tr.pages.login;epgd.login=m.login||{user:"",session:"",rights:0,url:""};if(!epgd.login.session){if(c=="logout"){epgd.utils.topInfo(l.logoutMessage)}else{epgd.utils.topInfo(l.error,{isError:1})}$("#menu_login a").text(l.label)}else{$("#menu_login a").text(epgd.login.user+" "+l.logout);if(location.hash=="#menu_login"||location.hash=="#"){location.hash=""}}return a()})}};epgd.pages.magazine={startTime:null,endTime:null,$head:null,$con:null,list:[],viewCnt:0,scrollStart:0,timeLineL:null,timeLineR:null,qt:{},imgPath:epgd.profile.eventImgPath?epgd.profile.eventImgPath+"?no=0&maxW=100&maxH=70&id=":false,init:function(){this.select=epgd.channels.selBox;$(window).bind("channels_load",function(){var a=epgd.pages.magazine,b;if(!a.$head){return}a.$head.empty();for(b in a.list){a.list[b].index=-1}a._initChannels();for(b in a.list){if(a.list[b].index==-1){a.preTime.removeChild(a.list[b].col);delete a.list[b]}}})},initQT:function(){var a={};epgd.profile.quickTimes.replace(/=([0-9]{1,2}):([0-9]{1,2})/g,function(c,d,b){a[parseInt(d,10)]="<p"+(b?' style="margin-top:'+(b*2)+'px"':"")+"> </p>"});this.qt=a},_initChannels:function(){var b,a;for(a=0;a<this.select.length;a++){b=this.list[this.select[a].value];if(!b){b=new epgd.pages.magazine.channel(this.select[a].value,a,$('<div class="ui-widget-content"/>')[0]);this.list[b.id]=b}else{b.index=a}this.preTime.appendChild(b.col);this.select[a].ch=b;this.$head.append('<div class="ui-widget-content ui-corner-top">'+epgd.channels.getHtml(b.id)+"</div>")}this.$head.css("width",(208*this.select.length+55)+"px")},_initWinBindings:function(){$(window).bind("epgd_close.pages_magazine",function(){epgd.$dtPicker.hide();$(window).unbind(".pages_magazine");clearInterval(this.pages_magazine.timeInterval);delete this.pages_magazine}).bind("resize.pages_magazine",function(){var b=$(window).width(),a=$(this).scrollLeft();this.pages_magazine.$nav.width(b+"px");this.pages_magazine.$con.css("height",($(window).height()-10-$("#magazine").offset().top)+"px");this.pages_magazine.viewCnt=parseInt((b-110)/208,10);if(this.pages_magazine.viewCnt<5){this.pages_magazine.timeLineR.style.left="-50px";this.pages_magazine.$con.css("width",(208*this.pages_magazine.select.length+25)+"px")}else{if(this.pages_magazine.viewCnt>=this.pages_magazine.select.length){this.pages_magazine.viewCnt=this.pages_magazine.select.length;this.pages_magazine.timeLineR.style.left="-50px";b=this.pages_magazine.viewCnt*208+55;this.pages_magazine.$con.css("width",(b-30)+"px")}else{this.pages_magazine.timeLineR.style.left=(a+b-52)+"px";this.pages_magazine.$con.css("width",(208*this.pages_magazine.select.length+150)+"px")}}this.pages_magazine.lineNow.style.width=(b-10)+"px";epgd.$menu.parent().offset({left:a});this.pages_magazine.$nav.offset({left:a});this.pages_magazine.update()}).bind("scroll.pages_magazine",function(){this.pages_magazine.timeLineL.style.left="-50px";this.pages_magazine.timeLineR.style.left="-50px"}).bind("scrollstop.pages_magazine",function(){var a=$(this).scrollLeft();this.pages_magazine.timeLineL.style.left=this.pages_magazine.lineNow.style.left=a+"px";if(this.pages_magazine.viewCnt>=5&&this.pages_magazine.viewCnt<this.pages_magazine.select.length){this.pages_magazine.timeLineR.style.left=(a+$(window).width()-52)+"px"}this.pages_magazine.nextMain=parseInt((a+104)/208,10);if(this.pages_magazine.select.selectedIndex!=this.pages_magazine.nextMain){this.pages_magazine.setMain(0,this.pages_magazine.nextMain,true)}epgd.$menu.parent().offset({left:a});this.pages_magazine.$nav.offset({left:a});return false}).bind("datepicker.pages_magazine",function(){this.pages_magazine.setTime(epgd.utils.unixTime(epgd.$dtPicker.datetimepicker("getDate")||epgd.utils.now()),true)})[0].pages_magazine=this;this.$con.bind("scrollstop.pages_magazine",function(){var a=$(this).scrollTop();if(a>this.pages_magazine.scrollEnd){this.pages_magazine.setTime(a*30+epgd.profile.minEventTime)}else{if(a<this.pages_magazine.scrollStart){this.pages_magazine.setTime(Math.max(this.pages_magazine.startTime-43200,epgd.profile.minEventTime))}}});this._setLineNow();this.timeInterval=setInterval(this._setLineNow,60000)},_setLineNow:function(){var a=window.pages_magazine,b=new Date().getTime()/1000;if(b>a.endTime||(a.startTime-epgd.profile.minEventTime)<-3600){$(window).trigger("epgd_close");$('<div class="ui-widget-overlay ui-front"></div>').click(function(){epgd.profile.minEventTime=epgd.utils.now().getTime()/1000-10800;$(window).trigger("profile_updated",{minEventTime:true});epgd.$dtPicker.datetimepicker("setDate",epgd.utils.now());a.$con.empty();a.render();$(this).remove()}).appendTo(document.body);return}a.lineNow.style.top=((b-a.startTime)/30+a.scrollStart)+"px";a.lineNow.innerHTML=epgd.utils.formatTime(b)},render:function(b){$("#menu_magazine").addClass("menu-active").append(epgd.$dtPicker.show());var a=epgd.utils.unixTime(epgd.utils.now()),c;if(this.startTime&&(this.startTime-epgd.profile.minEventTime)<-3600){this.startTime=null;this.list=[]}if(!this.startTime){$(window).trigger("epgd_close");$(this.select).appendTo(epgd.$menu.find("#menu_magazine")).mousedown(function(d){d.stopPropagation();return true}).click(function(d){return false}).change(function(){epgd.pages.magazine.render($(this).val())});if(this.select.selectedIndex<0){this.select.selectedIndex=0}this.$nav=$('<div id="magazine-nav"><div class="ui-widget-content ui-corner-top left"><div class="ui-widget-content ui-corner-top"><span class="iAsButton i-left-dir"></span><span class="iAsButton i-rewind"></span></div></div><div class="ui-widget-content ui-corner-top right"><div class="ui-widget-content ui-corner-top"><span class="iAsButton i-right-dir"></span><span class="iAsButton i-forward"></span></div></div></div>');this.$head=$('<div id="magazine-head"></div>');this.$con=$('<div id="magazine"></div>');this.$con[0].pages_magazine=this;this.preTime=$('<div style="height:'+parseInt((epgd.profile.maxEventTime-epgd.profile.minEventTime)/30,10)+'px"></div>').appendTo(this.$con)[0];this.timeLineL=$('<div class="ui-widget-content timeLine"></div>').appendTo(this.preTime)[0];this.timeLineR=$('<div class="ui-widget-content timeLine tlr"></div>').appendTo(this.preTime)[0];this.lineNow=$('<p class="timeNow"></p>').appendTo(this.preTime)[0];this._initChannels();this.startTime=a+3600;c=new Date(this.startTime*1000);if(c.getMinutes()>0){c.setMinutes(0);this.startTime=c.getTime()/1000}this.endTime=this.startTime;this.setTime(this.startTime-7200)}if(!window.pages_magazine){this._initWinBindings();epgd.$con.empty();this.$nav.appendTo(epgd.$con).bind("click",this.actionHead);this.$head.appendTo(epgd.$con).bind("click",function(d){if(d.target.className=="i-tv"){epgd.vdrs.current.switchChannel(d.target.parentNode.id)}});this.$con.appendTo(epgd.$con).bind("click",this.actionCon).bind("touchend",this.actionConOpen);if(!$.support.touch&&epgd.profile.magazinePan>0){this._pan()}}$(window).trigger("resize.pages_magazine");if(b){this.setChannel(b)}if(a<this.startTime||a>this.endTime){this.setTime(a)}this.$con.scrollTop((a-epgd.profile.minEventTime)/30-15);$(window).trigger("resize.pages_magazine")},_pan:function(){var b=false,a=$('<div style="width:90%; height:35px; margin-top:15px; position:fixed;z-index:99;left:5%"></div>').prependTo(epgd.$con)[0],c=$('<div style="width:90%; height:35px; position:fixed;z-index:99;bottom:0;left:5%"></div>').appendTo(epgd.$con)[0];this.timeLineL.pan=-1;this.timeLineR.pan=1;a.pan=epgd.profile.magazinePan*-30;c.pan=epgd.profile.magazinePan*30;window.tp=a;window.bp=c;window.p=b;$([this.timeLineL,this.timeLineR,a,c]).mouseover(function(d){if(b){return}b=this.pan;window.setTimeout(function(){if(b){var e=window.setInterval(function(){if(!b||!window.pages_magazine){return window.clearInterval(e)}if(b<-1||b>1){window.pages_magazine.setTime((window.pages_magazine.$con.scrollTop()+15)*30+epgd.profile.minEventTime+b,true)}else{window.pages_magazine.setMain(b)}},(b<-1||b>1?100:1200))}},epgd.profile.magazinePanDelay)}).mouseout(function(){b=false})},setChannel:function(b){if(this.list.lengt>0){this.setMain(0,this.list[b].index)}else{var a=this;$(window).one("resize.pages_magazine",function(){a.setMain(0,a.list[b].index)})}},setMain:function(e,a,d){var b=this.select,c=isNaN(a)?b.selectedIndex:a;c+=e;if(c<0){c=0}else{if(c>=b.length-this.viewCnt){c=b.length-this.viewCnt}}b.selectedIndex=c;this.update();!d&&$(window).scrollLeft(c*208)},setTime:function(g,a){var b,e="",c,d=g+43200;if(g<this.startTime){do{this.startTime-=3600;b=epgd.utils.formatTime(this.startTime);c=parseInt(b,10);if(c%4==0){b+=$.datepicker.formatDate("<br />D,<br />dd<br />MM<br />yy",new Date(this.startTime*1000))}e=(this.qt[c]||"")+"<dfn>"+b+"</dfn>"+e}while(this.startTime>g);$(this.timeLineL).prepend(e);$(this.timeLineR).prepend(e);this.scrollStart=(this.startTime-epgd.profile.minEventTime)/30;if(this.scrollStart<0){this.scrollStart=0;this._setLineNow()}this.preTime.style.paddingTop=this.scrollStart+"px"}if(this.endTime<d){e="";d=Math.max(d,this.endTime+43200);for(;this.endTime<d;this.endTime+=3600){b=epgd.utils.formatTime(this.endTime);c=parseInt(b,10);if(c%4==0){b+=$.datepicker.formatDate("<br />D,<br />dd<br />M<br />yy",new Date(this.endTime*1000))}e+=(this.qt[c]||"")+"<dfn>"+b+"</dfn>"}$(this.timeLineL).append(e);$(this.timeLineR).append(e);this.scrollEnd=(this.endTime-epgd.profile.minEventTime-43200)/30}e&&this.update();a&&this.$con.scrollTop((g-epgd.profile.minEventTime)/30-15)},actionHead:function(b){var a=epgd.pages.magazine,d;if(b.target.nodeName=="SPAN"){d=b.target.className;if(d.indexOf("i-left-dir")>-1){a.setMain(-1)}else{if(d.indexOf("i-rewind")>-1){a.setMain(-a.viewCnt)}else{if(d.indexOf("i-right-dir")>-1){a.setMain(1)}else{if(d.indexOf("i-forward")>-1){a.setMain(a.viewCnt)}}}}}},actionConOpen:function(b){var a=$(b.target).closest("dt")[0];if(a){a.firstOpen=(a.clientHeight!=a.scrollHeight)}},actionCon:function(b){var a=$(b.target).closest("dt")[0];if(a){if(a.firstOpen){return false}if(!a.eventDetail){a.eventDetail=new epgd.eventDetail(a.title)}epgd.utils.loader.process(function(){a.eventDetail.render()})}},update:function(){var a=this,b;for(b=0,j=this.select.selectedIndex;b<this.viewCnt&&j<this.select.length;b++){this.select[j++].ch.updateTime()}window.setTimeout(function(){for(var d=0,c=a.select.selectedIndex+a.viewCnt;d<a.viewCnt&&c<a.select.length;d++){a.select[c++].ch.updateTime()}},500)}};epgd.pages.magazine.channel=function(c,b,a){this.id=c;this.index=b;this.col=a;this.startTime;this.endTime};epgd.pages.magazine.channel.prototype={updateTime:function(){if(!this.startTime){this.startTime=epgd.pages.magazine.startTime;this.endTime=epgd.pages.magazine.endTime;this.loadData(epgd.pages.magazine.startTime,epgd.pages.magazine.endTime)}else{if(epgd.pages.magazine.startTime<this.startTime){this.loadData(epgd.pages.magazine.startTime,this.startTime)}if(epgd.pages.magazine.endTime>this.endTime){this.loadData(this.endTime,epgd.pages.magazine.endTime)}}},loadData:function(c,b){var a=this,d=(a.endTime<b);if(d){a.endTime=b}else{a.startTime=c}epgd.ajax({url:epgd.login.url+"data/events?time="+c+"&endtime="+b+"&channelid="+this.id},function(k){var g="",p=k.events[0],l,e,u=null,t=$(a.col),q,m,r,s;if(p){if(d){u=t.find("dt:last");s=u[0].eTime;if(u.attr("title")==p.id){delete k.events[0]}}else{s=p.starttime;u=t.find("dt:first");if(u.attr("title")==k.events[k.events.length-1].id){delete k.events[k.events.length-1]}}for(l=0;l<k.events.length;l++){e=k.events[l];q=e.shortdescription||e.shorttext;m=e.duration;r=parseInt(m/60,10);m+=(e.starttime-s);m=m<600?20:parseInt(m/30,10);s+=m*30;g+='<dt title="'+e.id+'" style="height:'+m+"px;min-height:"+m+'px"><div class="title">'+e.title+"</div>"+(epgd.pages.magazine.imgPath&&e.imagecount?'<img src="'+epgd.pages.magazine.imgPath+e.id+'" />':"")+'<div class="time'+(e.timerid?" hasTimer":"")+'"><u>'+epgd.utils.formatTime(e.starttime)+"</u><i>"+r+"&nbsp;"+epgd.tr.minutes+"</i></div>"+(e.numrating?'<span class="rate rate'+e.numrating+'"> </span>':"")+(e.tipp?'<b class="tipp">'+e.tipp+"</b>":"")+'<div class="desc">'+(e.genre?"<span>"+e.genre+"</span> ":"")+(q?q.replace(/\n/g,"<br />"):"")+"</div></dt>"}}else{m=(b-c)/30;g='<div style="height:'+m+"px;min-height:"+m+'px"></div>';p={starttime:c};s=c}if(d){t.append(g);t.find("dt:last")[0].eTime=s}else{t.prepend(g);if(u&&u.length){u.css("margin-top","");m=u[0].starttime-s;if(m){m=parseInt(m/30,10)+parseInt(u.css("min-height"),10);u.css({height:m+"px","min-height":m+"px"})}}else{t.find("dt:last")[0].eTime=s}t.find("dt:first").css("margin-top",parseInt((p.starttime-c)/30,10))[0].starttime=p}})}};epgd.pages.now={$ul:null,timestamp_min:-1,timestamp_max:0,timestamp_cur:0,init:function(){$(window).bind("channels_load",function(){epgd.pages.timestamp_max=0})},render:function(){if(!window.pages_now){this.$search=$('<div style="float:left;margin-left:5px"></div>').appendTo($("#menu_now")).click(function(){if(this.curType=="@Now"){window.pages_now.setTime(null,"@Now")}});var a=this.$searchMenu=$('<ul class="ui-menu ui-widget ui-widget-content"></ul>').appendTo($("#menu_now")).hide();epgd.profile.quickTimes&&epgd.profile.quickTimes.replace(/([^=]+)=!?([^~]+)~?/g,function(c,b,d){a.append('<li data-type="'+d+'" class="ui-menu-item '+(d.indexOf("@")==0&&d!="@Next"&&d!="@Now"?"i-search":"i-clock")+'">'+b+"</li>")});if(!a.find('li[data-type="@Next"]').length){a.prepend('<li data-type="@Next" class="ui-menu-item">'+epgd.tr.pages.eventDetail.eventNext+"</li>")}if(!a.find('li[data-type="@Now"]').length){a.prepend('<li data-type="@Now" class="ui-menu-item">'+epgd.tr.pages.dateTimePicker.currentText+"</li>")}this.$searchMenu.click(function(b){if(b.target.getAttribute("data-type")){window.pages_now.setTime(null,b.target.getAttribute("data-type"));a.hide()}});$(window).bind("epgd_close.pages_now",function(){if(window.pages_now){epgd.$dtPicker.hide();window.pages_now.$searchMenu.remove();window.pages_now.$search.remove();delete window.pages_now}$(window).unbind(".pages_now");$("#menu_now").unbind(".pages_now")}).bind("datepicker.pages_now",function(){this.pages_now.setTime(epgd.utils.unixTime(epgd.$dtPicker.datetimepicker("getDate")))})[0].pages_now=this;this.$ul=epgd.$con.html('<div id="pageNow"><ul class="teaserList"></ul></div>').find("ul").click(function(c){if($(c.target).closest(".channel").length){$(window).trigger("epgd_close.eventDetail");if(c.target.className=="i-tv"){epgd.vdrs.current.switchChannel(c.target.parentNode.id)}else{epgd.$menu.menu("select",{target:"#menu_magazine"});epgd.pages.magazine.setChannel($(c.target).closest(".channel").attr("id"))}return}var b=$(c.target).closest("li")[0];if(!b){return}if(!b.eventDetail){b.eventDetail=new epgd.eventDetail(b.title)}epgd.utils.loader.process(function(){b.eventDetail.render()})});this.setTime(null,"@Now")}$("#menu_now").addClass("menu-active").bind("click.pages_now",function(b){if((b.target==this||b.target.nodeName=="A")&&window.pages_now){window.pages_now.$searchMenu.show();b.preventDefault()}return false}).append(epgd.$dtPicker.show())},setTime:function(c,b){b=b||"@time";var a=" "+epgd.tr.pages.now.at;if(b=="@Now"||b=="@time"){this.timestamp_cur=c||epgd.utils.unixTime(epgd.utils.now());this.load("data/events?time="+this.timestamp_cur);epgd.$dtPicker.datetimepicker("setDate",epgd.utils.date(this.timestamp_cur))}else{if(b=="@Next"){this.load("data/events?next=1&time="+this.timestamp_cur)}else{if(b[0]=="@"){a=" "+epgd.tr.menu.search;this.load("data/search","post",JSON.stringify({autotimername:b.slice(1)}))}else{$.timepicker.quicklink({target:{nodeName:"U",innerHTML:b},data:{unit:"time"}});$(window).trigger("datepicker")}}}this.$search[0].curType=b;this.$search.text(this.$searchMenu.find('li[data-type="'+b+'"]').text()+a)},load:function(a,b,c){epgd.utils.loader.process(function(){pages_now.$ul.empty();epgd.ajax({url:epgd.login.url+a,async:false,cache:false,type:b,data:c},function(h){if(!h.events||!h.events.length){epgd.utils.loader.close();return epgd.utils.popup(epgd.tr.error.noData)}var k=epgd.profile.eventImgPath?epgd.profile.eventImgPath+"?no=0&maxW=100&maxH=70&id=":false,g=0,d=2000000000,e=epgd.tr.dateTimePicker.dateFormat.replace(/\.?y+/,"");now=parseInt(epgd.utils.now().getTime()/1000,10);$.each(h.events,function(r,p){var l=p.starttime+p.duration,m=((now-p.starttime)/p.duration*100),q=p.shortdescription||p.shorttext;if(p.starttime>g){g=p.starttime}if(l<d){d=l}$('<li title="'+p.id+'" class="ui-widget-content ui-corner-all">'+epgd.channels.getHtml(p.channelid)+'<div class="time'+(p.timerid?" hasTimer":"")+'"><b>'+epgd.utils.formatTime(p.starttime)+"</b>&nbsp;&ndash;&nbsp;"+epgd.utils.formatTime(l)+" "+epgd.tr.oClock+(p.tipp?'<b class="tipp">'+p.tipp+"</b>":"")+"</div>"+(m>0&&m<=100?'<div class="progress"><div style="width: '+m+'%"></div></div>':'<div class="date">'+epgd.utils.formatDate(p.starttime,e)+"</div>")+'<div class="desc">'+(k&&p.imagecount?'<img src="'+k+p.id+'" />':"")+'<div class="title">'+p.title+(p.numrating?'<span class="rate rate'+p.numrating+'"> </span>':"")+"</div>"+(p.genre?"<span>"+p.genre+"</span> ":"")+(q?q.replace(/\n/g,"<br />"):"")+"</div></li>").appendTo(pages_now.$ul)});epgd.pages.now.timestamp_min=g;epgd.pages.now.timestamp_max=d;epgd.utils.loader.close()})},true)}};epgd.pages.profile={render:function(){var b=epgd.profile.startPage.slice(5),c="<option>"+epgd.tr.pages.timerList.namingModes.join("</option><option>")+"</option>",a='<form id="page_profile"><h3>Interface</h3><div><table><tr><td>startpage</td><td><select id="startPage">'+jQuery.map(epgd.tr.menu,function(e,d){return'<option value="menu_'+d+(b==d?'" selected="selected">':'">')+e+"</option>"}).join("")+'</select></td></tr><tr><td>default VDR</td><td><select id="defaultVDRuuid">'+$("#menu_vdrs").find("select").html()+'</select></td></tr><tr><td>datepicker first day</td><td><select id="pickerFirstDay"><option>'+epgd.tr.dateTimePicker.dayNames.join("</option><option>")+'</option></select></td></tr><tr><td>quicklinks</td><td><textarea rows="5" style="float:left;width:50%; margin-right:10px" id="quickTimes" onchange="epgd.pages.profile.validate.quickTimes(this)">'+epgd.profile.quickTimes.replace(/~/g,"\n")+'</textarea><span>enter in each line label=hh:mm(24h), eg:<br />prime time=20:15 or prime time=!20:15 (this time will not be highlighted in magazine)<br />now=@Now or next=@Next<br />tip=@searchtimerName</span></td></tr><tr><td>constabel-login</td><td><input type="text" class="full" id="constabelLoginPath" value="'+(epgd.profile.constabelLoginPath||"")+'" /><br />e.g.https://www.eplists.de/eplist.cgi?action=login&login=[username]&secret=[password]</td></tr><tr><td>'+epgd.tr.pages.profile.maxListEntries+'</td><td><input type="text" id="maxListEntries" value="'+epgd.profile.maxListEntries+'" data-valexp="^[1-9]{0,3}$" /></td></tr><tr><th colspan="2">'+epgd.tr.menu.magazine+"</th><tr><tr><td>"+epgd.tr.pages.profile.magazinePan+'</td><td><input type="text" id="magazinePan" value="'+epgd.profile.magazinePan+'" data-valexp="^[0-9]{1,2}$" /></td></tr><tr><td>'+epgd.tr.pages.profile.magazinePanDelay+'</td><td><input type="text" id="magazinePanDelay" value="'+epgd.profile.magazinePanDelay+'" data-valexp="^[1-9][0-9]{2,3}$" /></td></tr><tr><th colspan="2">'+epgd.tr.pages.timer.timerList+"</th><tr><tr><td>"+epgd.tr.pages.timerList.namingMode+"</td><td><b>"+epgd.tr.pages.eventDetail.scrapperSerieInfo+"</b><div>"+epgd.tr.pages.timer.timerList+': <select id="namingModeSerie">'+c+'</select><input id="namingModeSerieTemplate" value="'+epgd.profile.namingModeSearchSerieTemplate+'" type="text" style="width:90%" /></div><div>'+epgd.tr.pages.timer.searchTimerList+': <select id="namingModeSearchSerie">'+c+'</select><input id="namingModeSearchSerieTemplate" value="'+epgd.profile.namingModeSearchSerieTemplate+'" type="text" style="width:90%" /></div><b style="text-decoration:line-through">'+epgd.tr.pages.eventDetail.scrapperSerieInfo+"</b><div>"+epgd.tr.pages.timer.timerList+': <select id="namingModeMovie">'+c+'</select><input id="namingModeMovieTemplate" value="'+epgd.profile.namingModeMovieTemplate+'" type="text" style="width:90%" /></div><div>'+epgd.tr.pages.timer.searchTimerList+': <select id="namingModeSearchMovie">'+c+'</select><input id="namingModeSearchMovieTemplate" value="'+epgd.profile.namingModeSearchMovieTemplate+'" type="text" style="width:90%" /></div></td></tr><tr><td>'+epgd.tr.pages.timerList.chFormat+'</td><td><input id="chFormat" readonly onclick="epgd.timerEditChFormat(this)" value="'+epgd.profile.chFormat+'" /></td></tr><tr><td>VDR</td><td><select id="timerDefaultVDRuuid"><option value="">Auto</option>'+$("#menu_vdrs").find("select").html()+"</select></td></tr><tr><td>"+epgd.tr.pages.profile.mailReceiver+'</td><td><input type="mail" value="'+(epgd.profile.mailReceiver||"")+"\" id=\"mailReceiver\" /><button onclick=\"epgd.utils.sendMail('checkMailAddress','it works','',$(form.mailReceiver).val())\">"+epgd.tr.test+"</button></td></tr><tr><td>"+epgd.tr.pages.profile.sendMessages+"</td><td>"+jQuery.map(epgd.tr.pages.timerList.messageTypes,function(e,d){return'<input type="checkbox" value="'+d+'" name="messageMailTypes"'+(epgd.profile.messageMailTypes.indexOf(d)>=0?' checked="checked"':"")+" />"+e}).join("&nbsp;&nbsp;")+'</td></tr><tr><th colspan="2">'+epgd.tr.menu.search+"</th><tr><tr><td>"+epgd.tr.advanced+'</td><td><input type="checkbox" id="searchAdv" /></td></tr><tr><th colspan="2">VDR OSD</th><tr><tr><td>'+epgd.tr.pages.profile.vdr.startWithSched+'</td><td><input type="checkbox" id="startWithSched"'+(epgd.profile.startWithSched=="1"?' checked="checked"':"")+" /></td></tr><tr><td>"+epgd.tr.pages.profile.vdr.osdTimerNotify+'</td><td><input type="checkbox" id="osdTimerNotify"'+(epgd.profile.osdTimerNotify=="1"?' checked="checked"':"")+' /></td></tr><tr><th colspan="2">'+epgd.tr.menu.records+"</th><tr><tr><td>"+epgd.tr.pages.profile.record.subFolderSort+'</td><td><select id="recordSubFolderSort"><option value="1">'+epgd.tr.pages.eventDetail.title+' up</option><option value="2">'+epgd.tr.pages.eventDetail.title+' down</option><option value="3">'+epgd.tr.pages.timerList.folder+' up</option><option value="4">'+epgd.tr.pages.timerList.folder+' down</option><option value="5">'+epgd.tr.pages.timerList.recordTime+' up</option><option value="6">'+epgd.tr.pages.timerList.recordTime+" down</option></select></td></tr></table></div>";if((epgd.login.rights&epgd.rights.umConfigEdit)==epgd.rights.umConfigEdit){a+="<h3>System</h3><div></div>"}epgd.$con.html(a+'</form><br /><input type="button" value="'+epgd.tr.save+'" onclick="epgd.pages.profile.save()" class="ui-button ui-widget ui-state-default ui-corner-all">');this.form=$("#page_profile").tooltip().accordion({headers:"<h3>",collapsible:true,heightStyle:"content",activate:function(e,g){var d=g.newPanel[0];if(d&&!d.hasLoaded){d.hasLoaded=true;if(g.newHeader.text()=="System"){$(d).html('<table><tr><th colspan="2">'+epgd.tr.pages.login.label+"</th></tr><tr><td>"+epgd.tr.pages.login.needLogin+'</td><td><input type="checkbox" id="needLogin" /></td></tr></table>').find("#needLogin").click(function(){if(this.checked&&!this.hasUsers){this.checked=false;var h=this;epgd.ajax({url:epgd.login.url+"data/users",cache:false},function(m){var k=null,l,p;for(p in m.users){k=m.users[p];if(k.active){return(h.hasUsers=h.checked=true)}}l=$('<form title="'+epgd.tr.pages.editUser.user+" "+(k?k.user:epgd.tr.pages.editUser.add)+'"></form>');epgd.pages.editUser.showUser(k,l,function(){l.dialog("close");if(!k){h.hasUsers=h.checked=true}else{$(h).click()}});l.dialog({modal:true,width:"auto"})})}}).prop("checked",epgd.profile.needLogin=="1");epgd.ajax({url:epgd.login.url+"data/parameters",async:true,cache:false,dataType:"json"},function(l){var q="",m,h,k,r=epgd.tr.pages.profile.system,t=1,u=2,s=4;for(m in l.parameters){h=l.parameters[m];if(h.owner=="epgd"){q+="<tr><td>"+(r[h.name]||h.name)+"</td><td>";k=typeof h.value=="undefined"?h["default"]:h.value;if(h.type==t){k=epgd.utils.formatDateTime(k)}else{if(h.type==s){q+='<span id="bmaskgroup_'+h.name+'" style="width:75%;">';let array=k.split(",");for(let o=0;o<h.options.length;o++){let checked=false;for(let n=0;n<array.length;n++){if(array[n]==h.options[o]){checked=true}}q+='<input id="bmask'+h.name+"_"+h.options[o]+'" type="checkbox" '+(checked?"checked":"")+'/><label for="bmask'+h.name+"_"+h.options[o]+'">'+h.options[o]+"</label>"}q+="</span>"}else{if(h.readonly){q+=k}else{q+='<input data-value="'+k+'" data-valexp="'+(h.valexp||"")+'" id="'+h.name+'"';if(h.type==u){q+=' type="checkbox"'+(k=="1"?" checked":"")}else{q+=' type="text" class="full" value="'+k+'"'}q+=" /></td></tr>"}}}}}q&&$(d).find("table").append('<tbody id="pSystem"><tr><th>'+r.label+'</th><th style="min-width:300px"></th></tr>'+q+"</tbody>")})}}}})[0];this.form.namingModeSerie.selectedIndex=epgd.profile.namingModeSerie;this.form.namingModeSearchSerie.selectedIndex=epgd.profile.namingModeSearchSerie;this.form.namingModeMovie.selectedIndex=epgd.profile.namingModeMovie;this.form.namingModeSearchMovie.selectedIndex=epgd.profile.namingModeSearchMovie;$([this.form.namingModeSerie,this.form.namingModeSearchSerie,this.form.namingModeMovie,this.form.namingModeSearchMovie]).change(function(){this.nextSibling.style.display=(this.selectedIndex==6)?"block":"none"}).change();epgd.utils.addPlaceholders(this.form.namingModeSerieTemplate,"%",epgd.tr.pages.timerList.templateFields);epgd.utils.addPlaceholders(this.form.namingModeSearchSerieTemplate,"%",epgd.tr.pages.timerList.templateFields);epgd.utils.addPlaceholders(this.form.namingModeMovieTemplate,"%",epgd.tr.pages.timerList.templateFields);epgd.utils.addPlaceholders(this.form.namingModeSearchMovieTemplate,"%",epgd.tr.pages.timerList.templateFields);$(this.form.quickTimes).one("focus",function(){var d=this;epgd.ajax({url:epgd.login.url+"data/searchtimers?type=S"},function(g){var e={"@Now":": current time","@Next":": next event"};$.each(g.searchtimers,function(k,h){e["@"+h.name||h.expression]=": saved timer"});epgd.utils.addPlaceholders(d,"@",e)})});this.form.searchAdv.checked=epgd.profile.searchAdv=="1";epgd.profile.defaultVDRuuid&&$(this.form.defaultVDRuuid).val(epgd.profile.defaultVDRuuid);$(this.form.timerDefaultVDRuuid).val(epgd.profile.timerDefaultVDRuuid);$(this.form.recordSubFolderSort).val(epgd.profile.recordSubFolderSort);this.form.pickerFirstDay.selectedIndex=(epgd.profile.pickerFirstDay||epgd.tr.dateTimePicker.firstDay)},save:function(){var d=epgd.profile,g=[],e=this.form,a="@"+epgd.login.user,b;function c(h){if(d[h.name]!=h.value){g.push(h)}}if(!this.validate.quickTimes(e.quickTimes)||!this.validate.checkRegex(e.magazinePan)||!this.validate.checkRegex(e.magazinePanDelay)){return false}c({name:"defaultVDRuuid",value:$(e.defaultVDRuuid).val()||"",owner:a});c({name:"quickTimes",value:e.quickTimes.value.replace(/\n/g,"~"),owner:a});c({name:"startWithSched",value:$(e.startWithSched).prop("checked")?"1":"0",owner:a});c({name:"osdTimerNotify",value:$(e.osdTimerNotify).prop("checked")?"1":"0",owner:a});c({name:"pickerFirstDay",value:new String(e.pickerFirstDay.selectedIndex),owner:a});c({name:"startPage",value:$(e.startPage).val()||"",owner:a});c({name:"namingModeSerie",value:new String(this.form.namingModeSerie.selectedIndex),owner:a});c({name:"namingModeSearchSerie",value:new String(this.form.namingModeSearchSerie.selectedIndex),owner:a});c({name:"namingModeMovie",value:new String(this.form.namingModeMovie.selectedIndex),owner:a});c({name:"namingModeSearchMovie",value:new String(this.form.namingModeSearchMovie.selectedIndex),owner:a});c({name:"namingModeSerieTemplate",value:new String(this.form.namingModeSerieTemplate.value),owner:a});c({name:"namingModeSearchSerieTemplate",value:new String(this.form.namingModeSearchSerieTemplate.value),owner:a});c({name:"namingModeMovieTemplate",value:new String(this.form.namingModeMovieTemplate.value),owner:a});c({name:"namingModeSearchMovieTemplate",value:new String(this.form.namingModeSearchMovieTemplate.value),owner:a});c({name:"timerDefaultVDRuuid",value:$(e.timerDefaultVDRuuid).val()||"",owner:a});c({name:"constabelLoginPath",value:$(e.constabelLoginPath).val()||"",owner:a});c({name:"chFormat",value:$(e.chFormat).val()||"",owner:a});c({name:"searchAdv",value:$(e.searchAdv).prop("checked")?"1":"0",owner:a});c({name:"messageMailTypes",value:$(e.messageMailTypes).map(function(){return this.checked?this.value:""}).toArray().join(""),owner:a});c({name:"mailReceiver",value:$(e.mailReceiver).val()||"",owner:a});c({name:"magazinePan",value:$(e.magazinePan).val()||"",owner:a});c({name:"magazinePanDelay",value:$(e.magazinePanDelay).val()||"",owner:a});c({name:"maxListEntries",value:$(e.maxListEntries).val()||"",owner:a});c({name:"recordSubFolderSort",value:$(e.recordSubFolderSort).val()||"1",owner:a});b=$("#pSystem").parent().parent()[0];if(b&&b.hasLoaded){c({name:"needLogin",value:$(e.needLogin).prop("checked")?"1":"0",owner:"webif"});$("#pSystem input").each(function(){if(this.type=="checkbox"){if(!this.id.startsWith("bmask")){if(this.checked!=(this.getAttribute("data-value")=="1")){g.push({name:this.id,value:(this.checked?"1":"0"),owner:"epgd",valexp:this.getAttribute("data-valexp")})}}}else{if(this.getAttribute("data-value")!=this.value){if(epgd.pages.profile.validate.checkRegex(this)){g.push({name:this.id,value:this.value,owner:"epgd"})}else{g=[];return false}}}});let rootConfig=document.getElementById("pSystem");let elements=rootConfig.querySelectorAll("[id^='bmaskgroup_']");for(let i=0;i<elements.length;i++){let name=elements[i].id.substring(elements[i].id.indexOf("_")+1);let bits=rootConfig.querySelectorAll("[id^='bmask"+name+"_']");let value="";for(let i=0;i<bits.length;i++){let o=bits[i].id.substring(bits[i].id.indexOf("_")+1);if(bits[i].checked){value+=o+","}}g.push({name:name,value:value,owner:"epgd"})}}if(g.length){if(b){b.hasLoaded=false}b=$("#page_profile").accordion("option","active");$("#page_profile").accordion("option","active",false).accordion("option","active",b);epgd.ajax({url:epgd.login.url+"data/save-parameters",type:"post",data:JSON.stringify({parameters:g})},function(h){h=h.result;if(h&&h.state==200){epgd.utils.topInfo(epgd.tr.dataSaved)}else{epgd.utils.topInfo(h.message,{isError:1})}epgd.profile_load()},function(l){try{var k="";$(l.responseJSON.result.failed).each(function(){k+="<li>"+e[g[this].name].parentNode.previousSibling.innerHTML+"</li>"});if(k){epgd.utils.popup("<ol>"+k+"</ol>",{title:epgd.tr.error.invalid});return true}}catch(h){}return false})}},validate:{quickTimes:function(a){a.value=a.value.replace(/\n{2,}/g,"\n").replace(/^\n+|\n+$/g,"");if(!/^(\n?[^=]+=!?(([0-1]?[0-9]|2[0-4]):[0-5]?[0-9]|@Now|@Next|@[A-Za-z0-9]*))*$/.test(a.value)){a.focus();epgd.utils.popup(epgd.tr.error.invalid);return false}return true},checkRegex:function(a){if(a.getAttribute("data-valexp")&&!new RegExp(a.getAttribute("data-valexp")).test(a.value)){a.focus();epgd.utils.popup(epgd.tr.error.invalid);return false}return true}}};epgd.pages.records={render:function(){if(!(epgd.login.rights&epgd.rights.umRecordings)==epgd.rights.umRecordings){return epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})}if(!epgd.profile.recordSubFolderSort){epgd.profile.recordSubFolderSort=1}$("#menu_records").addClass("menu-active");var a=epgd.tr.pages.records;if(!this.$bar){this.$bar=$('<div class="ui-widget ui-state-highlight ui-corner-all" style="padding:3px 10px"><button class="iAsButton i-trash" title="'+epgd.tr.del+'"/><div id="recBar"><button class="iAsButton i-refresh" onclick="epgd.pages.records.update()">'+epgd.tr.reload+"</button>"+epgd.pages.help.getIcon("recRefresh")+"&nbsp;&nbsp; "+epgd.tr.pages.search.search+epgd.pages.help.getIcon("recSearch")+'<button class="iAsButton" onclick="this.checked = !this.checked; $(this).toggleClass(\'ui-state-highlight\', this.checked); epgd.pages.records.search();">&nbsp;&#8727;</button><input id="rSVal" type="text" onkeyup="epgd.pages.records.search(this.value)" /><button class="iAsButton" onclick="this.checked = !this.checked;$(this).toggleClass(\'ui-state-highlight\', this.checked); epgd.pages.records.search();">&#8727;&nbsp;</button><span style="display:none"><button class="iAsButton i-rewind" onclick="epgd.pages.records.searchMove(1)"></button><span id="rSCnt">0</span><button class="iAsButton i-forward" onclick="epgd.pages.records.searchMove(-1)"></button></span>&nbsp;&nbsp; <input type="checkbox" id="dragdrop"'+($.support.touch?"":' checked="checked"')+' onchange="epgd.pages.records.dd(this.checked)" />'+a.ddLabel+epgd.pages.help.getIcon("recDD")+"</div></div>");this.$trash=this.$bar.find(".i-trash");this.curSearch={pattern:"",searchValue:"",hits:$(),cur:0,$count:this.$bar.find("#rSCnt"),fromStart:this.$bar.find("#rSVal").prev("button")[0],toEnd:this.$bar.find("#rSVal").next("button")[0]}}this.$bar.insertAfter(epgd.$menu);this.$trash.droppable({accept:".rec",hoverClass:"ui-state-hover",tolerance:"pointer",drop:function(c,d){var b=d.helper.context;epgd.utils.confirm(epgd.tr.pages.records.deleteMessage.replace("$src$",b.getAttribute("data-path")),function(e){e&&epgd.pages.records.del(b)});return false}}).click(function(){var b=$("#records").find(".rec.selected");b.length&&epgd.utils.confirm(epgd.tr.confirmDelete+(b.length>1?"<br />"+b.length+epgd.tr.entries:""),function(c){c&&b.each(function(){epgd.pages.records.del(this)})})});epgd.pages.help.initButtons(this.$bar);epgd.$menu.checkMenuSize();$(window).bind("epgd_close.records",function(){epgd.pages.records.$bar.remove();epgd.$menu.checkMenuSize();$(window).unbind(".records")});epgd.$con.html('<div id="records"></div>');epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+"data/recordings",cache:false},function(z){var b=z.recordings,g,A,r,l,q,u,m={f:{},r:[]},d={},w,k,h="",s=" "+epgd.tr.minutes,x,e=epgd.profile.recordSubFolderSort==6?function(t,p){return t.starttime>p.starttime?-1:1}:epgd.profile.recordSubFolderSort==5?function(t,p){return t.starttime>p.starttime?1:-1}:epgd.profile.recordSubFolderSort==4?function(t,p){return t.path>p.path?-1:1}:epgd.profile.recordSubFolderSort==3?function(t,p){return t.path>p.path?1:-1}:epgd.profile.recordSubFolderSort==2?function(t,p){return t.tit>p.tit?-1:1}:function(t,p){return t.tit>p.tit?1:-1};for(w in epgd.vdrs.list){k=epgd.vdrs.list[w];if(!k.usecommonrecfolder){d[w]={f:{},r:[]}}h+="<div>VDR - "+k.name+": "+k.videodir+" - "+parseInt(k.videofree/1000,10)+" GB "+a.available+" / "+parseInt(k.videototal/1000,10)+" GB</div>"}if(!$("#dragdrop").parent().length){return false}epgd.$con.find("#records").before(h);h="";for(u in b){g=b[u];l=d[g.vdruuid]||m;r=g.path.split("/");r.pop();for(q=0;q<r.length;q++){A=r[q].replace(/_/g," ");l=l.f[A]||(l.f[A]={f:{},r:[]})}l.r.push(g)}function y(C){var p=false,B,v;C.cnt=0;for(B in C.f){v=C.f[B];if(v.r.length==1){C.r.push(v.r.pop())}y(v);if(y(v)){p=true;C.cnt+=v.cnt}else{delete C.f[B]}}if(!p){delete C.f}C.cnt+=C.r.length;return p||C.r.length>0}function c(p){Object.keys(p.f).sort().forEach(function(B){var v=p.f[B],t;h+=B?'<div class="folder"><h4><span class="i-folder-closed">('+(v.cnt)+')</span><m class="i-"/>'+B+"</h4>":"<div>";v.f&&c(v);if(v.r.length){for(t in v.r){g=v.r[t];let imgPath=g.imgid?"data/eventimg?no=0&maxW=100&maxH=70&imgid="+g.imgid:false;g.tit=((g.name!=B?g.name:"")+(B!=g.title&&(g.title!=g.name)?"<br/>"+g.title:"")+(g.shorttext&&(g.shorttext!=g.name)?"<i>"+g.shorttext+"</i>":""))||B;g.html='<div class="rec"><em>'+epgd.utils.formatDateTime(g.starttime)+"</em><u>"+parseInt(g.duration/60,10)+s+'</u><b class="ui-widget-content ui-corner-all" data-start="'+g.starttime+'" data-owner="'+(g.owner||"")+'" data-md5="'+g.md5path+'" data-path="'+g.path+'">  <b>'+g.tit+"  </b>"+(imgPath?'   <img src="'+imgPath+'" />':"")+"</b></div>"}v.r.sort(e);for(t in v.r){h+=v.r[t].html}}h+="</div>"})}q={};if(y(m)){q[a.commonRecFolder]=m}for(w in d){l=d[w];if(y(l)){q["VDR - "+epgd.vdrs.list[w].name]=l}}c({f:q});x=epgd.$con.find("#records").html(h);if(!x.length){return false}x=x.click(epgd.pages.records.action).find(">div");if(x.length==1){x.first().toggleClass("open")}epgd.pages.records.$menu=$('<ul class="ui-menu ui-widget ui-widget-content" style="position:absolute"><li class="ui-menu-item" data-type="title"><a class="iAsButton i-sort-name-up" data-sort="1"></a>&nbsp;<a class="iAsButton i-sort-name-down" data-sort="2"></a>&nbsp;'+epgd.tr.pages.eventDetail.title+'</li><li class="ui-menu-item" data-type="path"><a class="iAsButton i-sort-name-up" data-sort="3"></a>&nbsp;<a class="iAsButton i-sort-name-down" data-sort="4"></a>&nbsp;'+epgd.tr.pages.timerList.folder+'</li><li class="ui-menu-item" data-type="start"><a class="iAsButton i-sort-name-up" data-sort="5"></a>&nbsp;<a class="iAsButton i-sort-name-down" data-sort="6"></a>&nbsp;'+epgd.tr.pages.timerList.recordTime+"</li></ul>").hide().appendTo(epgd.$con);$("#dragdrop").change();epgd.pages.records.curSearch.$recs=null;epgd.utils.loader.close()})},true)},search:function(e){var c=this.curSearch,h,b,d,a=c.fromStart.checked,g=c.toEnd.checked;if(!c.$recs){c.$recs=epgd.$con.find("#records .rec,h4")}if(typeof e=="string"){c.searchValue=e.replace(/</g,"&lt;").replace(/>/g,"&gt;")}d=(a?">"+c.searchValue:c.searchValue).toLowerCase()+(g?"<":"");if(d==c.pattern){return}h=c.searchValue.length;b=c.$recs;if(c.hits.length){$(c.hits).each(function(){this.innerHTML=this.innerHTML.replace(/<mark>([^<]+)<\/mark>/gi,"$1")}).parents(".tmp-open").removeClass("tmp-open");if(d.indexOf(c.pattern)==0){b=$(c.hits)}else{c.cur=0}c.hits=[]}else{c.cur=0}c.pattern=d;if(h>2){b.each(function(){var k=this.innerHTML.toLowerCase().indexOf(d);if(k>0){c.hits.push(this);$(this).parents(".folder").addClass("tmp-open");do{if(a){k++}this.innerHTML=this.innerHTML.slice(0,k)+"<mark>"+c.searchValue+"</mark>"+this.innerHTML.slice(k+h)}while((k=this.innerHTML.toLowerCase().indexOf(d,k+13))>0)}});c.$count.text(c.hits.length).parent().show();this.searchMove(0)}else{c.$count.parent().hide()}},searchMove:function(a){this.curSearch.cur+=a;var b=this.curSearch.hits[this.curSearch.cur];if(!b){this.curSearch.cur=a<0?this.curSearch.hits.length-1:0;b=this.curSearch.hits[this.curSearch.cur]}if(b){b.scrollIntoView(false);$(b).css({"background-color":"green"});window.setTimeout(function(){$(b).css({"background-color":""})},1500)}},action:function(b){var a=b.target;if(a.nodeName=="MARK"){a=a.parentNode}if(a.nodeName=="M"){epgd.pages.records.$menu.show().position({my:"left top",at:"left bottom",of:a}).find("a").removeClass("ui-state-highlight");epgd.pages.records.$menu.find("a[data-sort="+(a.curSort||epgd.profile.recordSubFolderSort)+"]").addClass("ui-state-highlight");$(document).one("click.recmenu",function(d){if(d.target.nodeName=="A"){var c=d.target.parentNode.getAttribute("data-type");if(c){a.curSort=d.target.getAttribute("data-sort");epgd.pages.records.sort(a.parentNode.parentNode,a.curSort)}}epgd.pages.records.$menu.hide();$(document).unbind(".recmenu")}).bind("keyup.recmenu",function(c){if(c.keyCode==27){$(document).trigger("click.recmenu")}});return false}if(a.nodeName=="I"||a.nodeName=="SPAN"){a=a.parentNode}if(a.nodeName=="B"){a=a.parentNode;if(!a.recDetail){a.recDetail=new epgd.recordDetail(a)}epgd.utils.loader.process(function(){a.recDetail.render()})}else{if(a.nodeName=="H4"){a=a.parentNode;if(a.nodeName=="DIV"&&a.className.indexOf("folder")>=0){if(a.className.indexOf("open")==-1){if($(window).width()<500){$(a).siblings(".open").removeClass("open");document.body.scrollTop=$(a).offset().top-35}$(a).addClass("open")}else{$(a).removeClass("open")}}}else{$(a).closest(".rec").toggleClass("selected")}}},dd:function(b){var c=$("#records"),a=c.find(".rec").has(".ui-draggable");if(b&&a.length==0){c.find("h4").droppable(this.__dropSettings);a.end().draggable({cancle:"b",revert:"invalid",distance:15,helper:function(){return $(this).clone().css("display","block")},appendTo:"body",cursor:"pointer",cursorAt:{left:-15,top:5},start:function(d,e){$(document).trigger("click.recmenu");$(document.body).addClass("dd-open");document.body.style.paddingTop=epgd.pages.records.$bar.height()+"px";document.body.scrollTop-=d.pageY-$(d.delegateTarget).closest(".folder").offset().top},stop:function(d,e){$(document.body).removeClass("dd-open");epgd.$menu.checkMenuSize()}})}else{if(a.length){a.draggable(b?"enable":"disable")}}},__dropSettings:{accept:".rec",hoverClass:"ui-state-hover",tolerance:"pointer",drop:function(b,c){console.log("Dropped!",b,c);var a=$(b.target),d="";do{d=a.text().replace(/^\(.*\)/,"")+"/"+d;a=a.parent()}while((a=a.prevAll("h4")).length);epgd.pages.records.move(c.draggable.context,d.slice(d.indexOf("/",2)+1).replace(/ /g,"_"),b.target.parentNode);return false}},update:function(){epgd.ajax({url:epgd.login.url+"data/updaterecordings"},function(a){epgd.utils.topInfo(epgd.tr.pages.records.refreshMessage.replace("$sec$",5),{autoClose:5000});$(window).trigger("epgd_close.records");window.setTimeout(function(){epgd.pages.records.render()},5000)})},move:function(e,h,d){var g=e.getAttribute("data-path").split("/"),b=g.pop(),c,a=0;g=g.join("/")+"/";for(c=0;c<Math.min(h.length,g.length)&&h[c]==g[c];c++){if(h[c]=="/"){a=c}}g=window.prompt(epgd.tr.pages.records.moveMessage.replace("$src$",g),h.concat(g.slice(a)).replace(/\/{2,}/g,"/").replace(/\/$/,""));if(g){epgd.ajax({url:epgd.login.url+"data/renamerecording?starttime="+e.getAttribute("data-start")+"&md5path="+e.getAttribute("data-md5")+"&owner="+e.getAttribute("data-owner")+"&name="+g.replace(/\//g,"~"),async:true},function(p){p=p.result;if(p&&p.state==200){var k=$(e),r=k.prevAll("h4").find("span"),q=$(d),m=g.split("/"),l;k.attr("data-path",g+"/"+b);k.attr("data-md5","").draggable("disable").addClass("ui-state-disabled");m.shift();k.parents(".folder:not(:last)").find(">h4>span").each(function(){this.innerHTML="("+(parseInt(this.innerHTML.slice(1,-1),10)-1)+")"});r=q.find("span");r.text("("+(parseInt(r.text().slice(1,-1),10)+1)+")");for(l=0;l<m.length;l++){if(q.find(">.folder>h4").each(function(){if(this.lastChild.nodeValue==m[l]){q=$(this.parentNode);r=q.find("span");r.text("("+(parseInt(r.text().slice(1,-1),10)+1)+")");return true}else{return false}}).length==0){for(;l<m.length;l++){q=$('<h4><span class="i-folder-closed">(1)</span><m class="i-"/>'+m[l]+"</h4></div>").droppable(epgd.pages.records.__dropSettings).wrap('<div class="folder open"></div>').parent().appendTo(q)}}}k.appendTo(q);epgd.pages.records.sort(d);epgd.utils.topInfo(epgd.tr.dataSaved);epgd.pages.records.__updateRec(e)}else{epgd.utils.topInfo(p.message,{isError:1});return false}})}return !!g},__updateRec:function(b,a){epgd.ajax({url:epgd.login.url+"data/recording?starttime="+b.getAttribute("data-start")+"&path="+b.getAttribute("data-path")+"&owner="+b.getAttribute("data-owner")+"&"+a,async:true},function(c){$(b).attr("data-md5",c.recording.md5path).draggable("enable").removeClass("ui-state-disabled")},function(d,c){if(!a){a=0}else{if(a>=5){return epgd.utils.popup(epgd.tr.pages.records.notFoundMessage,{title:epgd.tr.error.error})}}window.setTimeout(epgd.pages.records.__updateRec,3000,b,++a);return true})},del:function(a){epgd.ajax({url:epgd.login.url+"data/deleterecording?starttime="+a.getAttribute("data-start")+"&md5path="+a.getAttribute("data-md5")+"&owner="+a.getAttribute("data-owner"),async:true},function(b){b=b.result;if(b&&b.state==200){epgd.utils.topInfo(a.getAttribute("data-path")+"<br />"+epgd.tr.dataSaved);$(a).parents(".folder:not(:last)").find(">h4>span").each(function(){this.innerHTML="("+(parseInt(this.innerHTML.slice(1,-1),10)-1)+")"});$(a).remove()}else{epgd.utils.topInfo(a.getAttribute("data-path")+"<br />"+b.message,{isError:1})}})},sort:function(a,d){var e=$(a).find(">div.rec"),b=d%2?1:-1,c;if(!d){d=$(">h4>m",a)[0].curSort||epgd.profile.recordSubFolderSort}if(d<3){e.sort(function(h,g){return h.lastChild.innerHTML>g.lastChild.innerHTML?b:-b}).appendTo(a)}else{c=d<5?"data-path":"data-start";e.sort(function(h,g){return h.getAttribute(c)>g.getAttribute(c)?b:-b}).appendTo(a)}$(a).find(">div.folder").each(function(){epgd.pages.records.sort(this,d)})}};epgd.sortTable=function(a){this.o=$.extend({conSel:epgd.$con,empty:"",right:1},a)};epgd.sortTable.prototype={sortIcons:'<span class="iAsButton i-sort-name-down sort"></span><span class="iAsButton i-sort-name-up sort"></span>',update:function(){},hideHead:function(){var a=this.$con.find("thead:first").hide().find(">tr>th");this.$con.find("tbody:first").html('<tr><td colspan="'+a.length+'">'+this.o.empty+(a.last().find(".i-doc-new").wrapAll("<div />").parent().html()||"")+"</td></tr>")},showHead:function(){this.$con.find(">table>thead").show();this.filter();this.sort()},getTable:function(){},action:function(a,c,b){switch(c){case"refresh":this.update();break;case"detail":if(!a[0].eventDetail){a[0].eventDetail=new epgd.eventDetail(b)}epgd.utils.loader.process(function(){a[0].eventDetail.render()});break}},render:function(a,b){this.trs=[];this.$con=a||$(this.o.conSel);this.$con.empty();if(!(epgd.login.rights&this.o.right)==this.o.right){return epgd.utils.popup(epgd.tr.error.forbidden,{title:epgd.tr.error.error})}this.$con.html(this.getTable());this.init();this.update(b)},init:function(){var b=this,a=0;this.$con.find(">table").click(function(h){var e=$(h.target),g=e[0],k=g.getAttribute("data-evId"),l,c;if(k){b.action(e,"detail",k)}else{if(h.target.className=="i-tv"){epgd.vdrs.current.switchChannel(h.target.parentNode.id)}else{e=e.closest("span.sort");if(e.length){e.parent().parent().find(".ui-state-highlight").removeClass("ui-state-highlight");e.addClass("ui-state-highlight");b.sort(e)}else{e=$(g).closest("span.edit");if(e.length){b.action(e,e[0].className.match(/i-([a-z0-9-]+)/)[1])}if(b.o.selectable){if(g.nodeName=="TD"){e=$(g).parent().toggleClass("selected");if(h.shiftKey&&this.lastSel){c=$(this.lastSel);l=e.index()-c.index();if(l>0){c.nextAll(":lt("+l+"):visible").toggleClass("selected",c.hasClass("selected"))}else{c.prevAll(":lt("+-l+"):visible").toggleClass("selected",c.hasClass("selected"))}}else{this.lastSel=e[0]}}else{if(g.nodeName=="B"){l=g.getAttribute("data-t");$(b.trs).filter(":visible").toggleClass("selected",l==1?true:l==0?false:undefined);return false}}}}return false}}}).find(">thead>tr").find(">th").each(function(){this.cIndex=a;a+=this.colSpan}).end().find('[data-defaultSort="1"]>span.sort:last,[data-defaultSort="-1"]>span.sort:first').addClass("ui-state-highlight");this.$con.find(">table>thead input.filter").keyup(function(){b.filter()}).each(function(){if(!this.result){this.result=$('<i style="padding-left:5px;font-weight:normal"></i>').insertAfter(this)[0]}})},sort:function(e){e=e||this.$con.find(">table>thead .ui-state-highlight");if(!e.length){return}var c=e.parent()[0],g=(e.hasClass("i-sort-name-down")?-1:1),a=this.trs,b,h;if(!c.sortInfo){c=c.cIndex;for(b=0;b<a.length;b++){h=a[b].cells[c];h.sort=h.getAttribute("data-sort")||$(h).text().toLowerCase()}}else{c=c.cIndex}a.sort(function(k,d){var m=k.cells[c].sort,l=d.cells[c].sort;return(m>l?1*g:m==l?0:-1*g)});this.$con.find(">table>tbody").append(a.slice())},filter:function(){var b={},a,d,e,c;this.$con.find(">table>thead input.filter").each(function(){if(this.value){b[this.parentNode.cIndex]=[this.value.toLowerCase(),0,this.result||{}]}else{if(this.result){this.result.innerHTML=""}}});for(a=0;a<this.trs.length;a++){e=this.trs[a];c="";for(d in b){if(e.cells[d].innerHTML.toLowerCase().indexOf(b[d][0])==-1){c="none"}else{b[d][1]++}}e.style.display=c}for(d in b){if(b[d][2].innerHTML=b[d][1]){}}}};epgd.timerEditChFormat=function(c){var a=",SD,HD,3D",b=c.value,d;if(b){b=b.split(",");for(d=0;d<b.length;d++){a=a.replace(","+b[d]+",",",")}}$('<div title="'+epgd.tr.pages.timerList.chFormat+'"><ol style="float:left; border:2px inset #ddd; min-height:50px; margin-right:20px;">'+(b.length?"<li>"+b.join("</li><li>")+"</li>":"")+'</ol><ul style="float:left; border:2px inset #ddd; min-height:50px;list-style-type:none">'+(a.length>1?"<li>"+a.slice(1).replace(/,/g,"</li><li>")+"</li>":"")+"</div>").dialog({modal:true,buttons:[{text:epgd.tr.apply,click:function(){var e="";$(this).find("ol > li").each(function(){e+=","+this.innerHTML});c.value=e.slice(1);$(this).dialog("close")}},{text:epgd.tr.cancel,click:function(){$(this).dialog("close")}}]}).find("ul,ol").sortable({connectWith:"ul,ol"}).disableSelection()};epgd.timerListBase=epgd.utils.inherits(function(a,b){this.dialog=b;if(this.dialog){this.dialog.list=this}if(!a.conSel){a.conSel="#content"}if(!a.empty){a.empty=epgd.tr.pages.timerList.empty}epgd.sortTable.call(this,a)},epgd.sortTable);epgd.timerListBase.prototype.getTable=function(){var a=epgd.tr.pages.timerList;return'<table id="timerList" class="timerTable"><thead><tr><th style="min-width:120px">'+epgd.tr.channel+this.sortIcons+'</th><th></th><th data-defaultSort="1" colspan="2">'+a.startTime+this.sortIcons+' <input type="text" class="filter" style="width:50px" /></th><th>'+a.endTime+'</th><th style="min-width:120px">'+epgd.tr.pages.eventDetail.title+this.sortIcons+' <input type="text" class="filter" style="width:100px" /></th><th style="min-width:120px">VDR'+this.sortIcons+' <input type="text" class="filter" style="width:50px" /></th><th style="min-width:130px">'+this.sortIcons+(this.o.addNew?'<span class="iAsButton i-doc-new edit" title="'+a.newTimer+'"></span><span class="iAsButton i-refresh edit" title="'+epgd.tr.reload+'"></span>':"")+(this.o.selectable?'<br clear="all" /><span style="margin-top:3px" class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span><div class="selMarkBlock" style="width:auto"><b title="'+epgd.tr.markAll+'" class="selected" data-t="1"></b><b title="'+epgd.tr.markNone+'" data-t="0"></b><b title="'+epgd.tr.markToggle+'"><b class="selected"></b></b></div>':"")+"</th></tr></thead><tbody></tbody></table>"};epgd.timerListBase.prototype.update=function(){var a=this;epgd.utils.loader.process(function(){a.$con.find("tbody").empty();epgd.ajax({url:epgd.login.url+a.o.updateUrl,async:false,cache:false},function(h){if(!h.timers.length){a.hideHead()}else{var b=[],l=a.editIcons,k="DF",g={D:'<div class="i-trash">'+epgd.tr.pages.timerList.timerStates.D+"</div>",E:'<div class="i-warning">'+epgd.tr.pages.timerList.timerStates.E+"</div>",F:'<div class="i-ok">'+epgd.tr.pages.timerList.timerStates.F+"</div>",R:'<div class="i-progress">'+epgd.tr.pages.timerList.timerStates.R+"</div>",P:'<div class="i-clock">'+epgd.tr.pages.timerList.timerStates.P+"</div>",U:'<div class="i-help">'+epgd.tr.pages.timerList.timerStates.U+"</div>"},d={V:"i-tv",R:"i-record",S:"i-search"},e=epgd.tr.pages.timerList.timerActions,c='<span class="iAsButton i-flashlight edit" title="'+epgd.tr.pages.timer.searchTimerList+" "+epgd.tr.edit+'" data-id="$id$">$title$</span>';$.each(h.timers,function(r,m){m.action=m.action?m.action.toUpperCase():"A";m.state=m.state?m.state.toUpperCase():"U";var q=epgd.vdrs.list[m.vdruuid]||{name:"--"},p=$("<tr"+(m.active?"":' class="ui-state-disabled"')+"><td>"+epgd.channels.getHtml(m.channelid)+"</td><td>"+(m.action!="A"?'<div class="i-wait">'+e[m.action]+"</div>":g[m.state])+(m.info||"")+'</td><td data-sort="'+new String(m.day)+new String(10000+m.starttime).slice(1)+'">'+(m.day?epgd.utils.formatDate(m.day):"-")+"</td><td>"+new String(100+parseInt(m.starttime/100,10)).slice(1)+":"+new String(100+parseInt(m.starttime%100,10)).slice(1)+"</td><td>"+new String(100+parseInt(m.endtime/100,10)).slice(1)+":"+new String(100+parseInt(m.endtime%100,10)).slice(1)+"</td><td"+(m.eventid?' data-evId="'+m.eventid+'" class="'+d[m.type]+'">'+(m.title||"")+"<br />"+(m.shorttext||""):">")+"</td><td>"+q.name+"<br />"+(m.directory?m.directory+"~":"")+(m.file||"")+"</td><td>"+(m.autotimerid?c.replace("$id$",m.autotimerid).replace("$title$",m.autotimername||m.expression||epgd.tr.pages.timer.searchTimerList):"")+(k.indexOf(m.state)==-1?l:"")+"</td></tr>")[0];p.tData=m;b.push(p)});a.trs=b;a.showHead()}epgd.utils.loader.close();$(window).trigger("timerlist_updated",a)})},true)};epgd.timerListBase.prototype.action=function(a,d,b){var c;switch(d){case"edit":case"doc-new":this.dialog.render(a.closest("tr")[0].tData);break;case"trash":this.del(this.getSelectedIds(a));break;case"flashlight":c=a.attr("data-id"),list=this;$(window).one("searchTimerList_updated",function(){list.$con.find("tbody>tr").each(function(){if(this.tData.id==c){epgd.pages.searchTimerList.dialog.render(this.tData);return false}})});epgd.$menu.menu("select",{target:"#menu_searchTimerList"});break;default:epgd.sortTable.prototype.action.call(this,a,d,b)}};epgd.timerListBase.prototype.editIcons='<span class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span><span class="iAsButton i-edit edit" title="'+epgd.tr.edit+'"></span>';epgd.timerListBase.prototype.getSelectedIds=function(a){var b=[];if(a[0].parentNode.nodeName=="TH"){$(this.trs).filter(".selected:visible").each(function(){b.push(this.tData.id)})}else{b.push(a.closest("tr")[0].tData.id)}return b};epgd.timerListBase.prototype.del=function(c,d,e){var b=this,a=$.isArray(c)?c:[parseInt(c,10)];c&&a.length&&epgd.utils.confirm(epgd.tr.confirmDelete+(a.length>1?"<br />"+a.length+epgd.tr.entries:""),function(g){g&&b.saveArray(a,e||"delete",d)})};epgd.timerListBase.prototype.saveArray=function(c,g,e){var b=this,a=$.isArray(c)?c:[parseInt(c,10)],d={};d[g]=a;c&&a.length&&this.save(d,null,function(l){try{var h=",";$(l.responseJSON.result.failed).each(function(){h+=a[this]+","});if(h.length>1){$(b.trs).each(function(){if(h.indexOf(","+this.tData.id+",")>=0){this.style.backgroundColor="red"}})}}catch(k){}return false},e)};epgd.timerListBase.prototype.save=function(d,b,a,c){if(!d){return false}var e=this;epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+(b||e.o.saveUrl),type:"post",data:JSON.stringify(d)},function(g){g=g.result;if(g.state==200){epgd.utils.topInfo(epgd.tr.dataSaved)}else{epgd.utils.topInfo(g.message,{isError:1})}epgd.utils.loader.close();e.$con&&e.$con.parent().length&&e.update();c&&c.call(e)},a)},true);return true};epgd.searchResultList=epgd.utils.inherits(function(a,b){epgd.timerListBase.call(this,$.extend({saveUrl:"data/save-searchtimer"},a),b)},epgd.timerListBase);epgd.searchResultList.prototype.getTable=function(){var a=epgd.tr.pages.timerList;return'<table id="searchResultList" class="timerTable"><thead><tr><th style="min-width:120px">'+epgd.tr.channel+this.sortIcons+'</th><th data-defaultSort="1" colspan="2">'+a.startTime+this.sortIcons+"</th><th>"+a.endTime+"</th><th>"+epgd.tr.pages.eventDetail.title+this.sortIcons+"</th><th></th></tr></thead><tbody></tbody></table>"};epgd.searchResultList.prototype.update=function(b){if(!b){return false}var a=this;b.id&&delete b.id;b.name&&delete b.name;b.max=epgd.profile.maxListEntries;epgd.utils.loader.process(function(){a.$con.find("tbody").empty();epgd.ajax({url:epgd.login.url+"data/search",type:"post",data:JSON.stringify(b)},function(e){var c=[],d;if(!e.events||!e.events.length){a.hideHead()}else{e.count>b.max&&epgd.utils.popup("Achtung! Es wurden "+e.count+" Ergebnisse gefunden. Angezeigt werden aber nur "+b.max+".<br /> Das Nachladen ist noch nicht implementiert! Der Wert kann in den Einstellungen angepasst werden");$.each(e.events,function(m,h){var l="",g="",k;if(h.dones){for(d in h.dones){k=h.dones[d];g+='<span class="iAsButton" title="'+epgd.tr.pages.timerList.doneStates[k.state]+" data-id="+k.id+'">'+k.state+"</span>";if(k.state=="R"){l=' class="ui-state-disabled"'}}}c.push($("<tr"+l+"><td>"+epgd.channels.getHtml(h.channelid)+'</td><td data-sort="'+h.starttime+'">'+epgd.utils.formatDate(h.starttime)+"</td><td>"+epgd.utils.formatTime(h.starttime)+"</td><td>"+epgd.utils.formatTime(h.starttime+h.duration)+'</td><td data-evId="'+h.id+'">'+h.title+"<br />"+(h.shorttext||"")+"</td><td>"+g+"</td></tr>").tooltip()[0])});a.trs=c;a.showHead()}epgd.utils.loader.close();a.dialog&&a.dialog.resize&&window.setTimeout(function(){a.dialog.resize()},100)})},true)};epgd.searchTimerTimerList=epgd.utils.inherits(function(a,b){epgd.timerListBase.call(this,$.extend({saveUrl:"data/save-timer",updateUrl:"data/timers?state=P,R"},a),b)},epgd.timerListBase);epgd.searchTimerTimerList.prototype.getTable=function(){var a=epgd.tr.pages.timerList;return'<table class="timerTable"><thead><tr><th>'+epgd.tr.channel+this.sortIcons+'</th><th data-defaultSort="1" colspan="2">'+a.startTime+this.sortIcons+"</th><th>"+a.endTime+"</th><th>"+epgd.tr.pages.eventDetail.title+this.sortIcons+"</th><th>VDR"+this.sortIcons+"</th><th></th></tr></thead><tbody></tbody></table>"};epgd.searchTimerTimerList.prototype.update=function(b){if(!b){return false}var a=this;epgd.utils.loader.process(function(){a.$con.find("tbody").empty();epgd.ajax({url:epgd.login.url+a.o.updateUrl+"&autotimerid="+b.id,async:true,cache:false},function(d){var c=[],e='<span class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span>';if(!d.timers.length){a.hideHead()}else{$.each(d.timers,function(l,g){var k=epgd.vdrs.list[g.vdruuid]||{name:"--"},h=$("<tr"+(g.active?"":' class="ui-state-disabled"')+"><td>"+epgd.channels.getHtml(g.channelid)+'</td><td data-sort="'+new String(g.day)+new String(10000+g.starttime).slice(1)+'">'+(g.day?$.datepicker.formatDate(epgd.tr.dateTimePicker.dateFormat,epgd.utils.date(g.day)):"-")+"</td><td>"+new String(100+parseInt(g.starttime/100,10)).slice(1)+":"+new String(100+parseInt(g.starttime%100,10)).slice(1)+"</td><td>"+new String(100+parseInt(g.endtime/100,10)).slice(1)+":"+new String(100+parseInt(g.endtime%100,10)).slice(1)+"</td><td"+(g.eventid?' data-evId="'+g.eventid+'">'+g.title+"<br />"+(g.shorttext||""):">")+"</td><td>"+k.name+"<br />"+g.file+"</td><td>"+e+"</td></tr>")[0];h.tData=g;c.push(h)});a.trs=c;a.showHead()}a.dialog&&a.dialog.resize&&window.setTimeout(function(){a.dialog.resize()},100);epgd.utils.loader.close()})})};epgd.pages.timerList=new epgd.timerListBase({updateUrl:"data/timers?state=P,R",saveUrl:"data/save-timer",selectable:true,addNew:true,right:epgd.rights.umTimer},new epgd.timerDialog());epgd.pages.timersDone=new epgd.timerListBase({updateUrl:"data/timers?state=D,F,E&action=A",saveUrl:"data/delete-timerjobs",right:epgd.rights.umTimer});epgd.pages.timersDone.editIcons='<span class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span>';epgd.pages.timersDone.getTable=function(){return epgd.timerListBase.prototype.getTable.call(this).replace('data-defaultSort="1"','data-defaultSort="-1"')};epgd.pages.timerListDone=new epgd.timerListBase({updateUrl:"data/donetimers",saveUrl:"data/store-donetimers",selectable:true,right:epgd.rights.umTimer});epgd.pages.timerListDone.getTable=function(){return'<table id="timerListDone" class="timerTable"><thead><tr><th style="min-width:120px"><input type="text" class="filter" style="width:40px" />'+this.sortIcons+'</th><th data-defaultSort="-1" style="min-width:180px">'+epgd.tr.pages.timerList.recordTime+this.sortIcons+"</th><th>"+epgd.tr.pages.eventDetail.title+' <input type="text" class="filter" />'+this.sortIcons+'</th><th style="min-width:120px">'+epgd.tr.channel+this.sortIcons+'</th><th style="min-width:100px">'+this.sortIcons+'<span style="margin-top:3px" class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span><div class="selMarkBlock" style="width:auto"><b title="'+epgd.tr.markAll+'" class="selected" data-t="1"></b><b title="'+epgd.tr.markNone+'" data-t="0"></b><b title="'+epgd.tr.markToggle+'"><b class="selected"></b></b></div></th></tr></thead><tbody></tbody></table>'};epgd.pages.timerListDone.action=function(a,c,b){if(c=="detail"&&!a[0].eventDetail){a[0].eventDetail=new epgd.doneTimerDetail(a.parent()[0])}epgd.timerListBase.prototype.action.call(this,a,c,b)};epgd.pages.timerListDone.stateIcons={D:'<div class="i-trash">'+epgd.tr.pages.timerList.doneStates.D+"</div>",F:'<div class="i-warning">'+epgd.tr.pages.timerList.doneStates.F+"</div>",f:'<div class="i-warning">'+epgd.tr.pages.timerList.doneStates.f+"</div>",R:'<div class="i-ok">'+epgd.tr.pages.timerList.doneStates.R+"</div>",C:'<div class="i-buffer">'+epgd.tr.pages.timerList.doneStates.C+"</div>",Q:'<div class="i-clock">'+epgd.tr.pages.timerList.doneStates.Q+"</div>"};epgd.pages.timerListDone.update=function(){var a=this;epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+a.o.updateUrl,async:false,cache:false},function(h){a.$con.find("tbody").empty();if(!h.donetimers.length){a.hideHead()}else{var b=[],g,e,d,c='<span class="iAsButton i-flashlight edit" title="'+epgd.tr.pages.timer.searchTimerList+" "+epgd.tr.edit+'" data-id="$id$">$title$</span>';for(e in h.donetimers){d=h.donetimers[e];g=$("<tr><td>"+(d.state&&a.stateIcons[d.state]||"")+'</td><td data-sort="'+d.starttime+'">'+epgd.utils.formatDateTime(d.starttime)+"<br />"+parseInt(d.duration/60,10)+" "+epgd.tr.minutes+'</td><td data-evId="'+d.id+'">'+(d.title||"")+"<br />"+(d.shorttext||"")+'</td><td data-sort="'+d.channelid+'">'+epgd.channels.getHtml(d.channelid)+'</td><td><span class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span>'+(d.autotimerid?c.replace("$id$",d.autotimerid).replace("$title$",d.autotimername||d.expression||epgd.tr.pages.timer.searchTimerList):"")+"</td></tr>")[0];g.tData=d;b.push(g)}a.trs=b;a.showHead()}epgd.utils.loader.close();$(window).trigger("timerlist_updated",a)})},true)};epgd.pages.timerJobList=new epgd.timerListBase({updateUrl:"data/timers?notaction=A",saveUrl:"data/delete-timerjobs",selectable:true,right:epgd.rights.umTimer},new epgd.timerDialog());epgd.pages.searchTimerList=new epgd.timerListBase({saveUrl:"data/save-searchtimer",right:epgd.rights.umSearchTimer},new epgd.searchTimerDialog());epgd.pages.searchTimerList.getTable=function(){var a=epgd.tr.pages.timerList;return'<table id="timerSearchList" class="timerTable"><thead><tr><th data-defaultSort="1">'+epgd.tr.pages.search.searchName+"/"+epgd.tr.pages.search.searchExpression+' <input type="text" class="filter" />'+this.sortIcons+"</th><th>hits"+this.sortIcons+'</th><th style="min-width:120px">VDR'+this.sortIcons+'</th><th><span class="iAsButton i-doc-new edit" title="'+a.newTimer+'"></span><span class="iAsButton i-refresh edit" title="'+epgd.tr.reload+'"></span><span class="iAsButton i-link-ext edit" title="'+a.searchTimerReload+'"></span></th></tr></thead><tbody></tbody></table>'};epgd.pages.searchTimerList.action=function(c,e,d){epgd.timerListBase.prototype.action.call(this,c,e,d);switch(e){case"link-ext":this.triggerUpdate();break;case"down-dir":if(!c[0].tList){var b={$td:c.parent().css("position","relative"),tdHeight:c.parent().outerHeight()+10,data:c.parent().parent()[0].tData,resize:function(){var g=this.list.$con.find(">table").addClass("sub");g.width(this.$td.parent().outerWidth());this.$td.height(this.tdHeight+g.outerHeight(true)+10)},toggle:function(g){this.list.$con.toggle(g);if(g){this.$td.css("height","100px");this.list.update(this.data)}else{this.$td.css("height","auto")}}},a={conSel:$('<div style="position:absolute;z-index:5;top:'+b.tdHeight+'px" />').appendTo(document.body)};c[0].tList=b.data.type=="S"?new epgd.searchResultList(a,b):new epgd.searchTimerTimerList(a,b);c[0].tList.render();b.$td.append(b.list.$con)}c[0].tList.dialog.toggle(true);c.removeClass("i-down-dir").addClass("i-right-dir");break;case"right-dir":c.removeClass("i-right-dir").addClass("i-down-dir");if(c[0].tList){c[0].tList.dialog.toggle(false)}break}};epgd.pages.searchTimerList.update=function(){var a=this;this.$con.find("tbody").empty();epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+"data/searchtimers",async:false,cache:false},function(d){var b=[],e=a.editIcons,c={V:"i-tv",R:"i-record",S:"i-search"};if(!d.searchtimers.length){a.hideHead()}else{$.each(d.searchtimers,function(l,g){var k=epgd.vdrs.list[g.vdruuid]||{name:"--"},h=$("<tr"+(g.active?"":' class="ui-state-disabled"')+'><td><span class="iAsButton i-down-dir edit" title="'+epgd.tr.pages.timer.timerList+'"></span><div class="'+c[g.type]+'">'+(g.name||g.expression)+"</div></td><td"+(g.type=="S"?">--":' data-sort="'+new String("00000"+g.hits).slice(-5)+'">'+g.hits)+"</td><td>"+k.name+"</td><td>"+e+"</td></tr>")[0];h.tData=g;b.push(h)});a.trs=b;a.showHead()}epgd.utils.loader.close();$(window).trigger("searchTimerList_updated",a)})})};epgd.pages.searchTimerList.triggerUpdate=function(){var a=this;epgd.ajax({url:epgd.login.url+"data/updatesearchtimer"},function(b){if(b.result.state==200){epgd.utils.topInfo(epgd.tr.dataSaved)}else{epgd.utils.topInfo(b.message,{isError:1})}a.update()})};epgd.pages.search=new epgd.searchDialog();epgd.pages.messageList=new epgd.timerListBase({saveUrl:"data/markmessages",selectable:true});epgd.pages.messageList.getTable=function(){return'<table id="messageList" class="timerTable"><thead><tr><th style="width:70px">id'+this.sortIcons+'</th><th style="width:120px">Typ <input type="text" class="filter" style="width:18px" />'+this.sortIcons+'</th><th style="width:140px">Zeit'+this.sortIcons+'</th><th style="width:100px">Titel <input type="text" class="filter" style="width:50px" />'+this.sortIcons+'</th><th style="min-width:140px">infotext <input type="text" class="filter" />'+this.sortIcons+'</th><th style="min-width:190px"><div class="selMarkBlock" style="width:auto;float: right;"><b title="'+epgd.tr.markAll+'" class="selected" data-t="1"></b><b title="'+epgd.tr.markNone+'" data-t="0"></b><b title="'+epgd.tr.markToggle+'"><b class="selected"></b></b></div>Status <input type="text" class="filter" style="width:20px" /><br />'+this.sortIcons+'<span class="iAsButton i-refresh edit" title="'+epgd.tr.reload+'"></span><span style="margin-top:3px" class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span><span style="margin-top:3px" class="iAsButton i-check edit" title="'+epgd.tr.pages.timerList.messageStates.R+'"></span><span style="margin-top:3px" class="iAsButton i-check-empty edit" title="'+epgd.tr.pages.timerList.messageStates.N+'"></span></th></tr></thead><tbody></tbody></table>'};epgd.pages.messageList.update=function(b){var a=this;epgd.utils.loader.process(function(){epgd.ajax({url:epgd.login.url+"data/messages",async:false,cache:false},function(l){a.$con.find("tbody").empty();if(!l.messages.length){a.hideHead()}else{var c=[],k,h,g,e={N:'<span class="iAsButton i-check-empty edit">'+epgd.tr.pages.timerList.messageStates.N+"</span>",R:'<span class="iAsButton i-check edit">'+epgd.tr.pages.timerList.messageStates.R+"</span>"},d={E:'<div class="i-error">'+epgd.tr.pages.timerList.timerStates.E+"</div>",F:'<div class="i-flash-outline">'+epgd.tr.pages.timerList.timerStates.F+"</div>",I:'<div class="i-info">'+epgd.tr.pages.timerList.messageTypes.I+"</div>",W:'<div class="i-warning">'+epgd.tr.pages.timerList.messageTypes.W+"</div>"};for(h in l.messages){g=l.messages[h];k=$('<tr><td data-sort="'+new String("0000000"+g.id).slice(-7)+'">'+g.id+"</td><td>"+(d[g.type]||"")+'</td><td data-sort="'+g.updsp+'">'+epgd.utils.formatDateTime(g.updsp)+"</td><td>"+g.title+"</td><td>"+g.text+'</td><td data-sort="'+g.state+g.updsp+'"><span class="iAsButton i-trash edit" title="'+epgd.tr.del+'"></span>'+(e[g.state]||"")+"</td></tr>")[0];k.tData=g;c.push(k)}a.trs=c;a.$con.find(">table>tbody").append(c.sort(function(p,m){return p.tData.state==m.tData.state?p.tData.state.updsp>m.tData.state.updsp?-1:1:p.tData.state>m.tData.state}).slice());a.showHead()}epgd.utils.loader.close();$(window).trigger("messagelist_updated",a)})},true)};epgd.pages.messageList.action=function(b,g,e){var c=this.getSelectedIds(b),d=null,a;if(c){switch(g){case"check":d=b[0].parentNode.nodeName=="TH"?"R":"N";break;case"check-empty":d=b[0].parentNode.nodeName=="TH"?"N":"R";break;case"trash":d="D";break}if(d){for(a in c){c[a]={id:c[a],state:d}}d=="D"?this.del(c,null,"messages"):this.saveArray(c,"messages");return true}}return epgd.timerListBase.prototype.action.call(this,b,g,e)};epgd.vdr=function(a,b){this.uuid=a;$.extend(this,b)};epgd.vdr.prototype.switchChannel=function(a){epgd.ajax({url:epgd.login.url+"data/channelswitch?uuid="+this.uuid+"&channel="+a,cache:false},function(b){epgd.utils.popup(b.result.message,{title:"VDR",autoClose:5000})})};epgd.vdr.prototype.wol=function(){epgd.ajax({url:epgd.login.url+"data/wakeupvdr?uuid="+this.uuid,cache:false},function(a){epgd.utils.popup(a.result.message,{title:"VDR",autoClose:5000})})};epgd.vdrs={list:null,current:null,load:function(){if(!this.list){this.list={};epgd.ajax({url:epgd.login.url+"data/vdrs",async:false},function(b){var a;for(a in b.vdrs){epgd.vdrs.list[a]=new epgd.vdr(a,b.vdrs[a])}if(!epgd.vdrs.current){if(epgd.profile.defaultVDRuuid){epgd.vdrs.current=epgd.vdrs.list[epgd.profile.defaultVDRuuid];if(!epgd.vdrs.current){epgd.utils.log("the default VDR ("+epgd.profile.defaultVDRuuid+" is invalid! Please change this in Web Interface/options)")}}if(!epgd.vdrs.current){for(a in epgd.vdrs.list){epgd.vdrs.current=epgd.vdrs.list[a];break}}if(!epgd.vdrs.current){epgd.utils.log("no VDR found",2);epgd.vdrs.current=new epgd.vdr("000-missing-vdr-000",{name:"no VDR found"})}}$(window).trigger("vdrs_load")})}},get:function(a){return this.list[(a||this.current)]||{}}};epgd.pages.vdrs={render:function(){epgd.$con.html('<div><button class="iAsButton" onclick="epgd.vdrs.current.wol()">WOL</button>')}};var epgd = {};
epgd.tr = {
    oClock: "Uhr",
    minutes: "min",
    save: "speichern",
    copy: "kopieren",
    apply: "übernehmen",
    close: "schließen",
    clear: "löschen",
    yes: "ja",
    no: "nein",
    //open: 'öffnen',
    edit: "bearbeiten",
    cancel: "abbrechen",
    del: "löschen",
    test: "testen",
    reload: "neu laden",
    advanced: "erweitert",
    markAll: "alle markieren",
    markNone: "keinen markieren",
    markToggle: "Markierung umdrehen",
    confirmDelete: "Willst du wirklich löschen?",
    dataSaved: "Daten wurden gespeichert",
    dataDeleted: "Daten wurden gelöscht",
    dataSend: "Daten wurden gesendet",
    channel: "Kanal",
    date: "Datum",
    entries: " Einträge",
    error: {
        error: "Fehler",
        common: "Es ist ein allgemeiner Fehler aufgetreten",
        serverNotResponse: "Der Server konnte nicht erreicht werden!",
        notImplemented: "Dieses Feature ist zur Zeit noch nicht implementiert",
        forbidden: "Zugriff verweigert!",
        noData: "Für diese Anfrage konnten keine Daten ermittelt werden!",
        emptyField: "Bitte fülle das Feld $field$ aus!",
        invalid: "Der eingegebene Wert ist ungültig!"
    },
    menu: {
        now: "Programm",
        magazine: "Magazin",
        timer: "Timer",
        records: "Aufnahmen",
        search: "Suche",
        options: "Einstellungen",
        help: "Hilfe"
    },
    pages: {
        now: {
            at:'am'
        },
        timer: {
            timerList: "Timer",
            searchTimerList: "Suchtimer",
            timersDone: "kürzliche Aufträge",
            timerListDone: "Auftragshistorie",
            timerJobList: "asynchrone Aufträge",
            messageList: "Systemmeldungen"
        },
        timerList: {
            empty: "Keine Timer vorhanden!",
            startTime: "Anfang",
            endTime: "Ende",
            folder: "Verzeichnis",
            file: "Dateiname",
            recordTime: "Aufnahmezeit",
            lifetime: "Lebenszeit",
            prio: "Priorität",
            inactive: "Inaktiv",
            newTimer: "Neuen Timer anlegen",
            namingMode: "Ermittlung des Dateinamens",
            namingModes: ["VDR", "Auto", "Constable", "Serie", "Kategorisiert", "Usermode", "Template"],
            template: 'Template',
            templateFields: {
                "%title%": ": Titel (EPG)",
                "%shorttext%": ": Untertitel (EPG)",
                "%starttime%": ": Startzeit (EPG)",
                "%year%": ": Jahr (EPG)",
                "%category%": ": Kategorie (EPG)",
                "%episodname%": ": Titel der Serie (constabel)",
                "%shortname%": ": Kurz-Titel der Serie (constabel, optional)",
                "%partname%": ": Name der Folge (constabel)",
                "%season%": ": Staffel (constabel)",
                "%part%": ": Teil der Staffel (constabel)",
                "%number%": ": Nummer über alle Staffeln (constabel)",
                "%extracol1%": ": Zusätzliche Angaben z.B. bei Tatort die Ermittler (constabel, optional)",
                "%extracol2%": ": ... z.B. bei Tatort der Ort (constabel, optional)",
                "%extracol3%": ": ... z.B. bei Tatort der Sender (constabel, optional)"
            },
            episode: "Serientitel",
            episodepartname: "Folge",
            noEpgMatch: 'Ignoriere fehlende EPG Info (außer Folge)',
            noRepeat: "Wiederholungen vermeiden",
            searchTimerReload: "Suchtimer updaten",
            chInclude: "Auf Kanäle einschränken",
            chExclude: "Kanäle ausschließen",
            chRange: "Kanal von/bis",
            nextDays: "innerhalb der nächsten $field$ Tage",
            confirmSaveBigResult: "Die Suche ergibt $cnt$ Treffer, trotzdem speichern?",
            timerStates: {
                'D': 'gelöscht',
                'E': 'Fehler',
                'F': 'Aufnahme erfolgreich',
                'P': 'wartet auf Start',
                'R': 'nimmt gerade auf...',
                'U': 'unbekannt'
            },
            timerActions: {
                // 'A': 'VDR und EPGD sind synchron',
                'C': 'Timer wurde erstellt und muss noch von einem VDR übernommen werden',
                'D': 'Timer wurde gelöscht und muss noch im VDR gelöscht werden',
                'F': 'Zuweisung Timer an VDR fehlgeschlagen',
                'M': 'Timer wurde verändert und muss noch vom VDR verarbeitet werden'
            },
            doneStates: {
                'f': 'Timer konnte nicht erstellt werden',
                'C': 'Timer bereits erstellt',
                'D': 'Timer gelöscht',
                'F': 'Aufnahme fehlgeschlagen',
                'Q': 'Timer in Vorbereitung',
                'R': 'Aufnahme fertig'
            },
            messageStates: {
                'N': 'Neu',
                'R': 'gelesen'
            },
            messageTypes: {
                'I': 'Information',
                'W': 'Warnung',
                'E': 'Fehler',
                'F': 'Fataler Fehler'
            },
            chFormat: "bevorzugtes Sendeformat"
            //channelModes: ["SD", "HD", "3D", "HD,SD", "SD,HD", "3D,HD,SD", "SD,HD,3D"]
        },
        eventDetail: {
            record: "Aufnehmen",
            repeat: "Wiederholungen",
            ch_switch: "umschalten",
            play: "abspielen",
            eventNext: "nachfolgend",
            eventPrev: "vorher",
            parentalrating: 'ab ',
            mergeSrc: 'Quelle ',
            genre: 'Genre',
            category: 'Kategorie',
            country: 'Land',
            year: 'Jahr',
            season: 'Staffel',
            part: 'Folgen Nummer',
            number: 'Folge Insgesamt',
            extentedInfo: 'weitere Informationen',
            scrapperMovieInfo: 'Filminformation',
            scrapperSerieInfo: 'Serieninformation',
            constabelInfo: 'Constabel Episodenliste',
            addConstableLink: 'Link erzeugen',
            loginConstable: 'Login',
            title: 'Titel',
            original_title: 'Originaltitel',
            runtime: 'Laufzeit',
            lang: 'Sprache',
            release_date: 'Erscheinungsdatum',
            actors: 'Schauspieler',
            network: 'Netzwerk',
            seriesstatus: 'Status',
            gueststars: 'Gäste',
            homepage: 'Webseite',
            popularity: 'Beliebtheit',
            vote_average: '&oslash; Bewertung',
            extInfo: {
                director: "Regie",
                camera: "Kamera",
                screenplay: "Drehbuch",
                producer: "Produktion",
                music: "Musik",
                moderator: "Moderator",
                commentator: "Kommentator",
                guest: "Gäste",
                info: "Info",
                other: "Sonstige"
            }
        },
        options:{
            profile: "allgemein",
            editChannels: "Kanäle bearbeiten",
            editUser: "Benutzer bearbeiten"
        },
        editChannels: {
            menu: {
                channelList: "Kanalliste",
                referenceList: "Referenzliste",
                insertAsText: "als Text einfügen",
                extentEmptyChannelNames: "leere Kanalnamen ergänzen",
                applyAllChannelNames: "Alle Kanalnamen übernehmen",
                applyChannelSort: "Kanalsortierung übernehmen"
            },
            headline: "Sortierung der Kanäle durch drag und drop, Blockmarkierung durch zus. gedrückter shift-Taste",     // und der Merge-prioritäten
            checkWeb: "Kanal in Webansicht anzeigen",
            checkVDR: "Kanal zum VDR übertragen",
            desc_insertList: "Kopiere den Inhalt einer channels.conf in das Textfeld unten. Eine vollständige Liste gibt es beispielsweise hier:"
        },
        editUser: {
            user: "Benutzer",
            sel: "auswählen",
            add: "neu anlegen",
            active: "Aktiv",
            inActive: "Inaktiv",
            rights: {
                label: "Rechte",
                umConfig: "Konfiguration lesen",
                umConfigEdit: "Konfiguration ändern",
                umConfigUsers: "Benutzer konfigurieren",
                umTimer: "Timer lesen",
                umTimerEdit: "Timer bearbeiten",
                umSearchTimer: "Suchtimer lesen",
                umSearchTimerEdit: "Suchtimer bearbeiten",
                umFsk: "FSK",
                umRecordings: "Aufnahmen lesen",
                umRecordingsEdit: "Aufnahmen editieren"
            }
        },
        help: {
            url: "lang/hilfe.html",
            noHelp: "Hierzu konnte kein Hilfstext gefunden werden"
        },
        search: {
            search: 'suchen',
            searchName: 'Name',
            searchExpression: "Suchausdruck",
            caseSensitive: "Klein-/Großschreibung",
            searchModes: ["exakte Übereinstimmung", "regulärer Ausdruck", "Muster", "enthalten in", "PCRE Ausdruck"],
            searchFields: ["Titel", "Kurztext", "Beschreibung"],
            repeatFields: ["Titel", "Kurztext"],
            empty: "Leider nichts gefunden.",
            matchdensity: "Treffergenauigkeit"
        },
        login: {
            label: 'Login',
            userName: 'Benutzername',
            password: 'Passwort',
            loggedAlwaysIn: 'angemeldet bleiben',
            logout: 'Abmelden',
            error: 'Fehler beim Anmelden!',
            logoutMessage: 'Du wurdest abgemeldet!',
            needLogin: 'Login erforderlich'
        },
        records: {
            ddLabel: "Drag und Drop",
            refreshMessage: "Aufnahmelisten werden neu geladen, Seite lädt in $sec$ Sekunden neu",
            moveMessage: "Aufnahme verschieben von \n$src$\nnach",
            notFoundMessage: "Aufnahme nicht gefunden, ggf einmal aktualisieren",
            deleteMessage: "Soll die Aufnahme $src$ wirklich gelöscht werden?",
            available: "Verfügbar",
            commonRecFolder: "gemeinsame Aufnahmen",
            similarTimer: "ähnliche Sendung aufnehmen"
        },
        profile: {
            mailReceiver: "eMail",
            sendTCC: "sende Mail bei Timerkonflikten",
            sendMessages: "sende Mail bei Systemmeldungen",
            magazinePan: 'Scrollgeschwindigkeit in Minuten<br />(0 = aus)',
            magazinePanDelay: 'Auslöseverzögerung',
            maxListEntries: 'maximal Anzahl Einträge, die auf einmal vom Server geladen werden sollen, z.B. bei Suchen, Suchtimern usw.',
            system: {
                label: "epgd Backend"
            },
            vdr: {
                startWithSched:'EPG Menü startet mit Schedule',
                osdTimerNotify:'Info anzeigen, wenn der VDR einen Timer übernommen hat'
            },
            record: {
                subFolderSort: 'Sortierung der Unterordner'
            }
        }
    },
    dateTimePicker: {
        monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
        'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        weekHeader: 'KW',
        timeOnlyTitle: 'Zeit wählen',
        timeText: 'Sendungsbeginn',
        timeTextBetween: 'zwischen',
        prevText: '&#x3C;Zurück',
        nextText: 'Vor&#x3E;',
        currentText: 'Jetzt',
        closeText: 'Fertig',
        hourText: 'Stunde',
        minuteText: 'Minute',
        secondText: 'Sekunde',
        millisecText: 'Millisekunde',
        microsecText: 'Mikrosekunde',
        timezoneText: 'Zeitzone',
        timeFormat: 'HH:mm',
        dateFormat: 'D, dd.mm.yy',
        amNames: ['vorm.', 'AM', 'A'],
        pmNames: ['nachm.', 'PM', 'P'],
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    }
};

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
    osdTimerNotify: 0,
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

    epgd.$con = $('<div id="content" class="content"></div>').appendTo(document.body);

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
// Timer Dialoge - Basis Klasse
epgd.timerDialogBase = function (options) {
    this.$win = null;
    this.list = null;
    if ( options )
        this.options= $.extend({}, this.options, options);
}
epgd.timerDialogBase.prototype = {
    options: {
       id: "baseDialog",
       modal: true,
       draggable: true,
       resizable: true,
       autoOpen: false,
       position: { my: "center", at: "top" },
       width: 'auto',
       maxHeight: $(window).height(),
       close: function () {
          this.list.dialog.form.reset();
          $(this.list.dialog.form).next().remove();
          //allFields.removeClass("ui-state-error");
       },
       open: function() {
          //console.log("set top to ", window.pageYOffset+20);
          //$(this).css('top', window.pageYOffset+20);
       },
       buttons: [{
          text: epgd.tr.del,
          icons: { primary: "ui-icon-trash" },
          id: 'tBDel',
          click: function () {
             $(this).dialog("close");
             this.list.del(this.list.dialog.form.tID.value);
          }
       }, {
          text: epgd.tr.cancel,
          icons: { primary: "ui-icon-close" },
            click: function () { $(this).dialog("close"); }
       }, {
          text: epgd.tr.save,
          icons: { primary: "ui-icon-disk" },
          click: function () { this.list.dialog.save() }
       }]
    },
    save: function (data, url, failFunc, succFunc) {
        this.list.save(data || this.getData(), url, failFunc, succFunc) && !this.options.embed && this.$win.dialog("close");
    },
    showError: function (msg, field) {
        epgd.utils.popup((field && field.id ? '<b>' + $('label[for="' + field.id + '"]').text() + '</b>' : '') + '<div>' + msg + '</div>', { autoClose: 3000 });
        field && field.focus();
        return false;
    },
    loadFolder: function () {
        var dialog = this;
        epgd.ajax({ url: epgd.login.url + "data/recordingdirs" }, function (data) {
            if (data.recordingdirs.length) {
                var folder = [],
                    vdrs = epgd.vdrs.list,
                    vdr;
                $.each(data.recordingdirs, function (id, f) {
                    vdr = vdrs[f.vdruuid];
                    folder.push({ value: f.directory, category: vdr ? vdr.name : '-' });
                });
                $(dialog.form.tFolder).catcomplete("option", "source", folder);
            }
        });
    },
    close: function () {
        if (this.$win)
            this.$win.dialog("close");
    },
    create: function () {
        var o = this.options,
            tr = epgd.tr.pages.timerList,
            week = '',
            i;
        for (i = 1; i < epgd.tr.dateTimePicker.dayNamesShort.length; i++)
            week += '<input name="tWeek" type="checkbox" />' + epgd.tr.dateTimePicker.dayNamesShort[i];
        week += '<input name="tWeek" type="checkbox" />' + epgd.tr.dateTimePicker.dayNamesShort[0];
        this.$win = $('<div id="' + o.id + '" class="searchDialog"><form class="searchForm">'
         + '<div class="colBlock">'
            + '<div><label>&nbsp;</label><select id="tType"><option value="R">' + epgd.tr.pages.eventDetail.record + '</option><option value="V">' + epgd.tr.pages.eventDetail.ch_switch + '</option></select></div>'
            + '<div><label for="tSName">' + epgd.tr.pages.search.searchName + '</label><input type="text" id="tSName" /></div>'
            +'<div><label for="tInactive">' + tr.inactive + '</label><input type="checkbox" id="tInactive" /></div>'
         + '</div><div class="ui-corner-all week">' + week + '</div>'
         + '<div class="onlyTypeR"><label for="tNameMode">' + tr.namingMode + epgd.pages.help.getIcon('sTNameMode') + '</label><br /><select id="tNameMode"><option>' + tr.namingModes.join('</option><option>') + '</option></select></div>'
         + '<div class="onlyTypeR"><label for="tTemplate">' + tr.template + '</label><input class="full" id="tTemplate" type="text" value="" /></div>'
         + '<div class="onlyTypeR"><label for="tFolder">' + tr.folder + '</label><input class="full" type="text" id="tFolder" /></div>'
         + '<div class="colBlock">'
             + '<div class="noTypeS"><label for="tVdr">VDR</label><select id="tVdr"><option value="">Auto</option>' + $('#menu_vdrs').find('select').html() + '</select></div>'
             + '<div class="onlyTypeR"><label for="tPrio">' + tr.prio + '</label><input  type="number" placeholder="..." min="0" max="99" id="tPrio" style="width:40px" /></div>'
             + '<div class="onlyTypeR"><label for="tLife">' + tr.lifetime + '</label><input type="number" placeholder="..." min="0" max="99" style="width:40px" id="tLife"/></div>'
             + '<div class="onlyTypeR"><label for="tVPS">' + 'VPS' + '</label><input type="checkbox" id="tVPS" /></div>'
         + '</div>'
         + '<input type="hidden" id="tID" /><br clear="all" />'
         + '</form></div>');//.dialog(o);//.dialog("option", "buttons", o.buttons);
        !o.embed && this.$win.appendTo(document.body).dialog(o);
        this.$win[0].list = this.list;
        this.form = this.$win.find('form')[0];
        $(this.form.tFolder).catcomplete({
            minLength: 0,
            maxHeight: 300
        }).focus(function () {
            $(this).catcomplete("search", "");
        });
        $(this.form.tType).change(function () {
            if (this.selectedIndex < 0)
                this.selectedIndex = 0;
            this.form.className = this.form.className.replace(/ ?type./, '') + ' type' + this[this.selectedIndex].value;
            //        $('.onlyTypeR', this.form).toggle(this[this.selectedIndex].value == 'R');
            //        $('#tSName').parent().toggle(this[this.selectedIndex].value == 'S');
            //        $('#tRepeat,#tChFormat').parent().toggle(this[this.selectedIndex].value != 'S');
        });
        $(this.form.tNameMode).change(function () {
            this.form.tTemplate.parentNode.style.display = (this.selectedIndex == 6) ? 'block': 'none';
        });
        epgd.utils.addPlaceholders(this.form.tTemplate, '%', tr.templateFields);
        this.loadFolder();
    },
    render: function (t) {
        t = t || {};
        if (!this.$win)
            this.create();
        !this.options.embed && this.$win.dialog('open').dialog('moveToTop');
        var form = this.form,
            d, i;
        form.tSName.focus();
        if (t.id) {
            form.tID.value = t.id;
            this.$win.parent().find('#tBDel').show();
            this.$win.parent().find('#tBToggle').hide();
        } else {
            form.tID.value = '';
            this.$win.parent().find('#tBDel').hide();
            this.$win.parent().find('#tBToggle').show();
        }
        $(form.tType).val(t.type || 'R').change();
        $(form.tVdr).val(t.vdruuid || epgd.profile.timerDefaultVDRuuid);
        d = t.weekdays || 0;
        for (i = 0, f = 1; i < form.tWeek.length; i++, f *= 2)
            form.tWeek[i].checked = (d & f);
        form.tPrio.value = t.priority || '';
        form.tLife.value = t.lifetime || '';
        form.tVPS.checked = t.vps == 1;
        form.tInactive.checked = t.active === 0;
        form.tFolder.value = t.directory || '';
        form.tSName.value = t.name || '';
        epgd.pages.help.initButtons(this.$win);
        this.resize();
    },
    resize: function () {
        /*var dlgOpt = this.$win.dialog("instance").options;
        dlgOpt.position.my = "center top";
        dlgOpt.position.at = "center top"; */
        this.$win.dialog("option", "maxHeight", $(window).height());
    }
 };

// Timerdialog - Klasse
epgd.timerDialog = epgd.utils.inherits(function () {
    epgd.timerDialogBase.call(this,{
        id: 'timerDialog',
        title: epgd.tr.pages.timer.timerList + ' ' + epgd.tr.edit,
        buttons: [{
            text: epgd.tr.pages.timer.searchTimerList,
            icons: { primary: "ui-icon-transferthick-e-w" },
            id: "tBToggle",
            click: function () {
                var t = this.list.dialog.getData(true);
                if (t) {
                    $(this).dialog("close");
                    //t.channelid && (t.channelids = t.channelid);
                    if (t.title) {
                        t.expression = t.title;
                        t.searchfields = 1;
                    }
                    epgd.pages.searchTimerList.dialog.render(t);
                }
            }
        }].concat(epgd.timerDialog.base.options.buttons)
    });
}, epgd.timerDialogBase);
epgd.timerDialog.prototype.create = function () {
    epgd.timerDialog.base.create.call(this);

    var tr = epgd.tr.pages.timerList,
        form = this.form;

    $(form).prepend('<input type="hidden" id="tEvID" /><div id="tTitle"></div>');
    $(form.tWeek[0]).parent().before('<div><label for="tStart">' + tr.recordTime + '</label>'
        + '<br /><span id="tEvTime"></span>&nbsp;<input type="text" id="tStart" style="width:165px" /> - <input type="text" id="tEnd" style="width:40px" /></div>');
    $(form.tNameMode).after('&nbsp;<span id="tFile"></span>');
    $(form.tFolder).parent().after('<div><label for="tChannels">' + epgd.tr.channel
        + '</label><input id="tChannel" type="text" class="full"/></div>');
    $(this.form.tStart).datetimepicker({
        minDateTime: epgd.utils.now(),
    });
    $(this.form.tEnd).timepicker({
        //        minDateTime: epgd.utils.now()
    });
    epgd.utils.addAutoComplete(form.tChannel, { source: epgd.channels.autoCompleteData });
    form.tFile = $(form).find('#tFile')[0];
    form.tEvTime = $(form).find('#tEvTime')[0];
    form.tTitle = $(form).find('#tTitle').click(function () {
        if (form.tEvID.value) {
            epgd.utils.loader.process(function () {
                new epgd.eventDetail(form.tEvID.value).render();
            });
        }
    })[0];
};
epgd.timerDialog.prototype.render = function (t) {
    t = t || {};
    epgd.timerDialog.base.render.call(this, t);
    var form = this.form,
        d;

    form.tFile.innerHTML = t.file || '...';
    form.tEvID.value = t.eventid || '';
    epgd.utils.setAutoCompleteValues(form.tChannel, t.channelid ? [t.channelid] : null);
    form.tTitle.innerHTML = t.title || '';
    form.tEvTime.innerHTML = t.evStartTime ? epgd.utils.formatDateTime(t.evStartTime) + ' - ' + epgd.utils.formatTime(t.evStartTime + t.evDuration) : '';

    $([form.tStart, form.tEnd]).datetimepicker("option", "disabled", !!t.eventid);
    if (t.day || !t.evStartTime) {
        if (t.starttime)
            d = epgd.utils.date((t.day + parseInt(t.starttime / 100, 10) * 60 * 60 + (t.starttime % 100) * 60));
        else if (t.day)
            d = epgd.utils.date(t.day);
        else
            d = epgd.utils.now();
        $(form.tStart).datetimepicker('setDate', d);
        $(form.tStart).datetimepicker('setTime', d);
        if (t.endtime)
            d = epgd.utils.date((t.day + parseInt(t.endtime / 100, 10) * 60 * 60 + (t.endtime % 100) * 60));
        else
            d = new Date(d.getTime() + 2 * 60 * 60000);
        $(form.tEnd).datetimepicker('setTime', d);
    } else {
        $([form.tStart, form.tEnd]).val('...');
    }
    //form.tNameMode.defaultIndex = parseInt(t.category == 'Serie' ? epgd.profile.namingModeSerie : epgd.profile.namingModeMovie, 10);
    form.tNameMode.selectedIndex = typeof t.namingmode == "undefined" ? parseInt(t.category == 'Serie' ? epgd.profile.namingModeSerie : epgd.profile.namingModeMovie, 10) : t.namingmode;
    form.tTemplate.value = t.template || (t.category == 'Serie' ? epgd.profile.namingModeSerieTemplate : epgd.profile.namingModeMovieTemplate);
    $(form.tNameMode).change();
};
epgd.timerDialog.prototype.getData = function (dontValid) {
    var form = this.form,
        d, i,
        data = {};
    if (form.tEvID.value) data.eventid = parseInt(form.tEvID.value, 10);
    data.active = form.tInactive.checked ? 0 : 1;
    if (form.tID.value) data.id = parseInt(form.tID.value, 10);
    if (form.tStart.value && form.tStart.value != '...') {
        d = $(form.tStart).datepicker('getDate');
        data.starttime = d.getHours() * 100 + d.getMinutes();
        d.setHours(0);
        d.setMinutes(0);
        data.day = parseInt(d.getTime() / 1000, 10);
        data.endtime = parseInt(form.tEnd.value.replace(':', ''), 10);
    } else if (!data.eventid && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", epgd.tr.pages.timerList.recordTime), form.tStart);
    data.weekdays = 0;
    for (i = 0, f = 1; i < form.tWeek.length; i++, f *= 2)
        if (form.tWeek[i].checked)
            data.weekdays += f;
    data.vps = form.tVPS.checked ? 1 : 0;
    if (form.tPrio.value) data.priority = parseInt(form.tPrio.value, 10);
    if (form.tLife.value) data.lifetime = parseInt(form.tLife.value, 10);
    //if (form.t) data.childlock = form.t;
    data.channelid = epgd.utils.getAutoCompleteValues(form.tChannel);
    if (!data.channelid && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", epgd.tr.channel), form.tChannel);
    /*data.file = form.tFile.value;
    if (form.tFolder.value)
        data.file = form.tFolder.value + '~' + data.file;
        */
    data.type = $(form.tType).val();
    d = $(form.tVdr).val();
    if (!d && data.type == 'V')
        d= epgd.vdrs.current.uuid || '';
    if (d)
        data.vdruuid = d;
    //if (!dontValid || form.tNameMode.defaultIndex != form.tNameMode.selectedIndex)
    data.namingmode = form.tNameMode.selectedIndex;
    data.template = form.tTemplate.value;
    if (data.type == 'V' && !d && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", "VDR"), form.tVdr);
    data.directory = form.tFolder.value;
    data.title = form.tTitle.innerHTML || '';
    data.name = form.tSName.value;
    return data;
}
// Suchtimerdialog - Klasse
epgd.searchTimerDialog = epgd.utils.inherits(function (options) {
    this.searchResultList = null;
    epgd.timerDialogBase.call(this,$.extend({},{
        id: 'searchTimerDialog',
        width: 530,
        title: epgd.tr.pages.timer.searchTimerList + ' ' + epgd.tr.edit,
        buttons: [{
            text: epgd.tr.pages.timer.timerList,
            icons: { primary: "ui-icon-transferthick-e-w" },
            id: "tBToggle",
            click: function () {
                var t = this.list.dialog.getData(true);
                if (t) {
                    $(this).dialog("close");
                    t.channelids && (t.channelid = t.channelids.split(',')[0]);
                    t.expression && (t.title = t.expression);
                    epgd.pages.timerList.dialog.render(t);
                }
            }
        }, {
            text: epgd.tr.test,
            click: function () {
                this.list.dialog.search();
            }
        }].concat(epgd.searchTimerDialog.base.options.buttons, {
            text: epgd.tr.copy,
            icons: { primary: "ui-icon-copy" },
            id: "tBCopy",
            click: function (ev) {
                $(ev.currentTarget).hide();
                this.list.dialog.form.tID.value = '';
                this.list.dialog.form.tSName.value += ' copy';
                this.list.dialog.form.tSName.select();
            }
        })
    },options));
}, epgd.timerDialogBase);
epgd.searchTimerDialog.prototype.search = function ($con, searchData) {
    if (!this.searchResultList)
        this.searchResultList = new epgd.searchResultList(null);//,this);
    if (!this.searchResultList.$con || ($con && $con[0] != this.searchResultList.$con[0]))
        this.searchResultList.render($con || ($('<div style="border-top:1px solid #ccc;overflow-x:hidden;overflow-y:scroll;max-height:25vh;"></div>').insertAfter(this.form)));
    else
        this.searchResultList.$con.find('tbody').empty();
    if (!this.searchResultList.$con.parent().length) {
        this.searchResultList.$con.insertAfter(this.form);
        this.searchResultList.init();
    }
    this.searchResultList.update(searchData || this.getData());
    this.searchResultList.$con[0].scrollIntoView(true);
}
epgd.searchTimerDialog.prototype.create = function () {
    epgd.searchTimerDialog.base.create.call(this);

    var tr = epgd.tr.pages.timerList,
        trS = epgd.tr.pages.search,
        sModes = '',
        form = this.form,
        key;

    for (key in trS.searchModes)
        sModes += '<option value="' + (parseInt(key, 10) + 1) + '">' + trS.searchModes[key] + '</option>';
    if (!epgd.categories) {
        epgd.categories = [];
        epgd.ajax({ url: 'data/categories', async: false }, function (data) { epgd.categories = data.categories; });
    }
    if (!epgd.genres) {
        epgd.genres = [];
        epgd.ajax({ url: 'data/genres', async: false }, function (data) { epgd.genres = data.genres; });
    }

    $(form.tSName).parent().parent().after('<div><label for="tExpr">' + trS.searchExpression + epgd.pages.help.getIcon('sExpr') + '</label> <input type="text" id="tExpr" style="width:300px" /></div>'
        + '<div class="full"><select id="tSMode" style="width:auto">' + sModes + '</select>'
        + '&nbsp;&nbsp;<input type="checkbox" id="tCaseSens" />&nbsp;<label for="tCaseSens">'
        + trS.caseSensitive + '</label></div>'
        + '<div class="ui-corner-all week">' + [" "].concat(trS.searchFields).join('<input type="checkbox" name="tSFields" />') + '</div>'
        + '<div><label for="tAdv"><input type="checkbox" id="tAdv" />&nbsp;' + epgd.tr.advanced + epgd.pages.help.getIcon('sTAdv') + '</label><div class="ui-corner-all week">'
            + '<span>' + tr.episodepartname + '</span><input type="text" id="tSFEpisode" style="width:200px" /> '
            + '<span>' + epgd.tr.pages.eventDetail.season + '</span><input type="text" id="tSFSeason" style="width:40px" /> '
            + '<span>' + epgd.tr.pages.eventDetail.part + '</span><input type="text" id="tSFSPart" style="width:40px" /> '
            + '<br /><span>' + epgd.tr.pages.eventDetail.category + '</span><input type="text" id="tSFCat"  style="width:300px" /> '
            + '<br /><span>' + epgd.tr.pages.eventDetail.genre + '</span><input type="text" id="tSFGenre" style="width:300px" /> '
            + '<br /><input type="checkbox" name="tSFTip" value="GoldTipp" />GoldTipp<input type="checkbox" name="tSFTip" value="TagesTipp" />TagesTipp<input type="checkbox" name="tSFTip" value="TopTipp" />TopTipp'
            + '<br /><span>' + epgd.tr.pages.eventDetail.year + '</span><input type="text" id="tSFYear" style="width:70px" />'
            + '<br /><input type="checkbox" id="tSFNoEpgMatch" />' + tr.noEpgMatch
        + '</div></div>'
        + '<div class="noTypeS"><div><label for="tRepeat"><input type="checkbox" id="tRepeat" />&nbsp;'
            + tr.noRepeat + epgd.pages.help.getIcon('sTRepeat') + '</label><div class="ui-corner-all week">' + [""].concat(trS.repeatFields).join('<input type="checkbox" name="tRFields" />') + '</div></div></div>'
        + '<div><input type="radio" name="tChExclude" value="1" id="tChExclude0" /><label for="tChInclude">' + tr.chInclude
            + '</label>' + epgd.pages.help.getIcon('sTChannels') + '<input type="radio" name="tChExclude" value="0" id="tChExclude1" /><label for="tChExclude">' + tr.chExclude
            + '</label></div><input type="text" id="tChannels" class="full"/>'
        + '<div><label for="tChRange">' + tr.chRange + epgd.pages.help.getIcon('sTChannels') + '</label><input id="tChRangeMin" style="width:40px" /> - <input id="tChRangeMax" style="width:40px" /></div>'
        + '<div class="noTypeS"><label for="tChFormat">' + tr.chFormat + epgd.pages.help.getIcon('sTChFormat') + '</label><input id="tChFormat" readonly onclick="epgd.timerEditChFormat(this)" /></div>'
        + '<div><label for="tTime"><input type="checkbox" id="tTime" />&nbsp;' + epgd.tr.dateTimePicker.timeText + epgd.pages.help.getIcon('sTime') + '</label></div>');
    $(form.tWeek[0]).before('<span>' + epgd.tr.dateTimePicker.timeTextBetween + ' <input type="text" id="tStart" style="width:40px" /> - <input type="text" id="tEnd" style="width:40px" /></span>')
        .parent().append('<br /><span class="onlyTypeS">' + tr.nextDays.replace('$field$','<input style="width:40px" type="text" id="tNextDays" />') + '</span>').insertAfter(form.tTime.parentNode);
    $([form.tStart,form.tEnd]).timepicker({
        alwaysSetTime: false
    });
    $([form.tTime, form.tRepeat, form.tAdv]).change(function () {
        $(this).parent().next().toggle(this.checked);
    });
    $(form.tRFields).change(function () {
        if (this.checked)
            $(this).prev().prop("disabled", true).prop("checked", true).change();
        else
            $(this).prev().prop("disabled", false)
    });
    $([form.tSFSeason, form.tSFSPart, form.tSFYear]).change(function () {
        this.value = this.value.replace(/[^0-9-]/g, '');
        if (this.value.length == 1 && this.value == '-')
            this.value = '';
    });
    $(form.tType).append('<option value="S">' + epgd.tr.menu.search + '</option>');
    epgd.utils.addAutoComplete(form.tChannels, { source: epgd.channels.autoCompleteData, multiselect: true });
    epgd.utils.addAutoComplete(form.tSFCat, { source: epgd.categories, multiselect: true });
    epgd.utils.addAutoComplete(form.tSFGenre, { source: epgd.genres, multiselect: true });
};
epgd.searchTimerDialog.prototype.render = function (t) {
    t = t || { searchfields: 1 };
    epgd.searchTimerDialog.base.render.call(this, t);
    var form = this.form,
        d, i;
    form.tExpr.value = t.expression || '';
    $(form.tSMode).val(t.searchmode || 4);
    form.tCaseSens.checked = t.casesensitiv == 1;
    d = t.searchfields || 0;
    for (i = 0, f = 1; i < form.tSFields.length; i++, f *= 2)
        form.tSFields[i].checked = (d & f);
    if (t.starttime || t.endtime || t.weekdays || t.nextdays) {
        form.tTime.checked = true;
        t.starttime ? $(form.tStart).datetimepicker('setTime', new Date(0, 0, 0, parseInt(t.starttime / 100, 10), (t.starttime % 100))) : form.tStart.value = '';
        t.endtime ? $(form.tEnd).datetimepicker('setTime', new Date(0, 0, 0, parseInt(t.endtime / 100, 10), (t.endtime % 100))) : form.tEnd.value;
        form.tNextDays.value = t.nextdays || '';
    } else
        form.tTime.checked = false;
    $(form.tTime).change();
    d = t.repeatfields || 0;
    for (i = 0, f = 1; i < form.tRFields.length; i++, f *= 2)
        form.tRFields[i].checked = (d & f);
    form.tRepeat.checked = d > 0;
    $(form.tRepeat).change();
    $(form.tRFields).change();
    form.tSFEpisode.value = t.episodename || '';
    form.tSFSeason.value = t.season || '';
    form.tSFSPart.value = t.seasonpart || '';
    form.tSFYear.value = t.year || '';

    epgd.utils.setAutoCompleteValues(form.tSFCat, new String(t.category).replace(/'/g, '').split(','));
    epgd.utils.setAutoCompleteValues(form.tSFGenre, new String(t.genre).replace(/'/g, '').split(','));
    d = t.tipp || '';
    for (i = 0; i < form.tSFTip.length; i++)
        form.tSFTip[i].checked = d.indexOf("'" + form.tSFTip[i].value + "'") >= 0;
    form.tSFNoEpgMatch.checked = t.noepgmatch == 1;

    form.tAdv.checked = t.episodename || t.season || t.seasonpart || t.year || t.category || t.genre || t.tipp || t.noepgmatch;
    $(form.tAdv).change();
    epgd.utils.setAutoCompleteValues(form.tChannels, new String(t.channelids).split(','));

    if (t.chexclude)
        form.tChExclude1.checked = 1;
    else
        form.tChExclude0.checked = 1;
    tChRangeMin.value= t.chnummin || '';
    tChRangeMax.value= t.chnummax || '';

    form.tChFormat.value = t.chformat || (t.id ? '' : epgd.profile.chFormat);
    form.tNameMode.defaultIndex = parseInt(t.category == 'Serie' ? epgd.profile.namingModeSearchSerie : epgd.profile.namingModeSearchMovie, 10);
    form.tNameMode.selectedIndex =  typeof t.namingmode == "undefined" ? form.tNameMode.defaultIndex : t.namingmode;
    form.tTemplate.value = typeof t.template == "undefined" ? (t.category == 'Serie' ? epgd.profile.namingModeSearchSerieTemplate : epgd.profile.namingModeSearchMovieTemplate) : t.template;
    $(form.tNameMode).change();
    this.$win.parent().find('#tBCopy').toggle(!!t.id);
};
epgd.searchTimerDialog.prototype.getData = function (dontValid) {
    var form = this.form,
        d, i,
        data = { expression: form.tExpr.value };
    if (form.tSFSeason.value) data.season = form.tSFSeason.value;
    if (form.tSFSPart.value) data.seasonpart = form.tSFSPart.value;
    if (form.tSFYear.value) data.year = form.tSFYear.value;
    if (!dontValid) {
        if (!data.expression)
            return this.showError(epgd.tr.error.emptyField.replace("$field$", epgd.tr.pages.search.searchExpression), form.tExpr);
        if (data.season && !/^[0-9]{0,3}-?[0-9]{0,3}$/.test(data.season))
            return this.showError(epgd.tr.error.invalid, form.tSFSeason);
        if (data.seasonpart && !/^[0-9]{0,3}-?[0-9]{0,3}$/.test(data.seasonpart))
            return this.showError(epgd.tr.error.invalid, form.tSFSPart);
        if (data.year && !/^((19|20)[0-9]{2})?(-|-(19|20)[0-9]{2})?$/.test(data.year))
            return this.showError(epgd.tr.error.invalid, form.tSFYear);
    }
    if (form.tID.value) data.id = parseInt(form.tID.value, 10);
    if (form.tSFEpisode.value) data.episodename = form.tSFEpisode.value;
    data.category = epgd.utils.getAutoCompleteValues(form.tSFCat, "'");
    data.genre = epgd.utils.getAutoCompleteValues(form.tSFGenre, "'");
    d = '';
    for (i = 0; i < form.tSFTip.length; i++)
        if (form.tSFTip[i].checked) d += ",'" + form.tSFTip[i].value + "'";
    data.tipp = d.slice(1);
    data.noepgmatch = form.tSFNoEpgMatch.checked ? 1 : 0;

    data.searchmode = parseInt($(form.tSMode).val(), 10);
    data.searchfields = 0;
    for (i = 0, f = 1; i < form.tSFields.length; i++, f *= 2)
        if (form.tSFields[i].checked)
            data.searchfields += f;
    data.casesensitiv = form.tCaseSens.checked ? 1 : 0;
    data.repeatfields = 0;
    if (form.tRepeat.checked) {
        for (i = 0, f = 1; i < form.tRFields.length; i++, f *= 2)
            if (form.tRFields[i].checked)
                data.repeatfields += f;
    }
    data.active = form.tInactive.checked ? 0 : 1;

    data.channelids = epgd.utils.getAutoCompleteValues(form.tChannels);
    data.chformat = form.tChFormat.value;
    data.chexclude = form.tChExclude1.checked ? 1 : 0;
    data.chnummin = parseInt(form.tChRangeMin.value,10);
    if (isNaN(data.chnummin))
        data.chnummin= 0;
    data.chnummax = parseInt(form.tChRangeMax.value, 10);
    if (isNaN(data.chnummax))
        data.chnummax= 0;

    if (form.tTime.checked) {
        data.starttime = parseInt(form.tStart.value.replace(':', ''), 10);
        data.endtime = parseInt(form.tEnd.value.replace(':', ''), 10);
        data.weekdays = 0;
        for (i = 0, f = 1; i < form.tWeek.length; i++, f *= 2)
            if (form.tWeek[i].checked)
                data.weekdays += f;
    }
    data.vps = form.tVPS.checked ? 1 : 0;
    if (form.tPrio.value) data.priority = parseInt(form.tPrio.value, 10);
    if (form.tLife.value) data.lifetime = parseInt(form.tLife.value, 10);
    //if (form.t) data.childlock = form.t;
    data.directory = form.tFolder.value;
    d = $(form.tVdr).val();
    if (d) data.vdruuid = d;
    //if (!dontValid || form.tNameMode.defaultIndex != form.tNameMode.selectedIndex)
    data.namingmode = form.tNameMode.selectedIndex;
    data.template = form.tTemplate.value;
    data.type = $(form.tType).val();
    if (data.type == 'V' && !d && !dontValid)
        return this.showError(epgd.tr.error.emptyField.replace("$field$", "VDR"), form.tVdr);
    data.name = form.tSName.value;
    if (form.tNextDays.value) data.nextdays = parseInt(form.tNextDays.value,10);
    return data;
}
epgd.searchTimerDialog.prototype.save = function (d, url, failFunc, succFunc) {
    d = d || this.getData();
    var self = this,
        id= d.id,
        name= d.name;
    d.max = 0;
    d.id && delete d.id;
    d.name && delete d.name;
    epgd.utils.loader.process(function () {
        epgd.ajax({
            url: epgd.login.url + "data/search",
            type: 'post',
            data: JSON.stringify(d)
        }, function (data) {
            d.id = id;
            d.name = name;
            if (data.count > 50) {
                epgd.utils.confirm(epgd.tr.pages.timerList.confirmSaveBigResult.replace('$cnt$', data.count), function (ok) {
                    ok && epgd.searchTimerDialog.base.save.call(self, d);
                });
            } else
                epgd.searchTimerDialog.base.save.call(self, d, url, failFunc, succFunc);
            epgd.utils.loader.close();
        });
    },true);
}
// Suche - Klasse
epgd.searchDialog = epgd.utils.inherits(function () {
    epgd.searchTimerDialog.call(this, {
        id: 'search',
        embed: true,
        buttons: null
    });
    this.searchResultList = new epgd.searchResultList({
        empty: epgd.tr.pages.search.empty
    }, this);
}, epgd.searchTimerDialog);
epgd.searchDialog.prototype.create = function () {
    epgd.searchDialog.base.create.call(this);
    var form = this.form,
        search= this,
        $result = $('<div id="searchResult"></div>').appendTo(this.$win);
    $('<button type="submit" id="sSearch" class="iAsButton i-search">' + epgd.tr.pages.search.search + '</button>')
        .insertAfter(form.tExpr)
        .after(' <input type="checkbox" id="sAdv" />&nbsp;<label for="sAdv">' + epgd.tr.advanced + '</label>');
    $(form.tType).parent().hide().parent().css('border-top','1px solid #ccc').insertAfter($(form.tVdr.parentNode.parentNode).hide());
    $('<input type="button" class="iAsButton" id="tCopy" value="' + epgd.tr.copy + '" />').insertAfter(form.tSName).click(function () {
        search.form.tID.value = '';
        search.form.tSName.value += ' copy';
        search.form.tSName.select();
    }).prop("disabled", true);
    $('<input type="button" class="iAsButton" id="tDel" value="' + epgd.tr.del + '" />').insertAfter(form.tSName).click(function () {
        search.list.del(this.form.tID.value, function () { search.form.tID.value = '';search.loadSavedSearch() });
    }).prop("disabled", true); $('<input type="button" class="iAsButton" value="' + epgd.tr.save + '" />').insertAfter(form.tSName).click(function () {
        var d = search.getData();
        if (!d.name)
            return this.showError(epgd.tr.error.invalid, form.tSName);
        search.save(d, null, null, function () { search.loadSavedSearch() });
    });
    $(form).submit(function () {
        search.search($result);
        return false;
    });
    this.$win.find('#sExpr').keyup(function (ev) { if (ev.keyCode == 13) { this.form.sSearch.click(); $(this).blur(); } }).focus();
    //$(form.tExpr).parent().next().nextAll().wrapAll('<div id="sAdvView"/>');
    this.$win.find('#sAdv').change(function () {
        $(form).toggleClass("noAdv", !this.checked);
        search.resize();
    }).prop('checked', epgd.profile.searchAdv == "1").change();
    $(form.tSName).autocomplete({
        minLength: 0,
        maxHeight: 300,
        source:function(){return false}, // damit bei einem focus kein error ausgel�st wird
        select: function (ev, ui) {
            var d = ui.item.data || { id: '' };
            if (d.id) {
                search.render(d);
                search.form.sSearch.click();
                $([form.tDel, form.tCopy, form.tInactive]).prop("disabled", false);
                return false;
            } else {
                form.tID.value = '';
                $([form.tDel, form.tCopy, form.tInactive]).prop("disabled", true);
            }
        }
    }).focus(function () {
        $(this).autocomplete("search", "");
    });
    this.loadSavedSearch();
}
epgd.searchDialog.prototype.loadSavedSearch = function () {
    var form = this.form;
    epgd.ajax({ url: epgd.login.url + "data/searchtimers?type=S" }, function (data) {
        var list = [];
        $.each(data.searchtimers, function (id, t) {
           list.push({ value: t.name || t.expression, label: t.name || t.expression, data: t });
        });
        $(form.tSName).autocomplete("option", "source", list);
    });
}
epgd.searchDialog.prototype.resize = function () {
    var $result = this.$win.find('#searchResult'),
        h = $(window).height() - $result.offset().top - 20;
    if (h < 100)
        $result.css({ 'height': 'auto', 'overflow-y': 'visible' });
    else
        $result.css({ 'height': h + 'px', 'overflow-y': 'auto' });
}
epgd.searchDialog.prototype.render = function (t) {
    if (!epgd.$con.find('#search').length) {
        $('#menu_search').addClass("menu-active");
        this.create();
        epgd.$con.html('');
        this.$win.appendTo(epgd.$con);
    }
    t = t || { searchfields: 1 };
    t.type = 'S';
    epgd.searchDialog.base.render.call(this, t);
}
epgd.searchDialog.prototype.close = function () { }
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
    if (t > this.data.duration)
        return false;
    if (checkAvail) return !epgd.vdrs.current.uuid ? false : (t < 0 ? epgd.tr.pages.timerList.newTimer + ': ' : '') + epgd.tr.pages.eventDetail.ch_switch;
    if (t < 0 ){ // Umschalttimer
        t= this.win.$rec;
        epgd.pages.timerList.save({
            type: 'V',
            active: 1,
            vdruuid: epgd.vdrs.current.uuid,
            eventid: this.data.id,
            channelid: this.data.channelid,
            title: this.data.title
        },null,null,function(){
            t.addClass("hasTimer")
        });
    } else
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
    this.serieActorImgPath = epgd.profile.serieImgPath ? epgd.profile.serieImgPath + '?maxW=60&maxH=90&season_number=0&episode_id=0&media_type=13&actor_id=' : false;

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
    this.$play = $('<button class="iAsButton i-tv" />').css('float', 'left').appendTo(toolbar).click(function () { win.detail.doPlay() });
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

               if (!mainImg && sc.media["12"] && this.serieImgPath)
                  mainImg = this.serieImgPath + sc.seriesid + '&season_number=' + terms.seasonnumber + '&episode_id=' + terms.episodeid + '&media_type=12&maxW=270&maxH=146';
            }
           if (sc.media["3"])
              firstImg = this.serieImgPath + sc.seriesid + '&season_number=0&episode_id=0&media_type=3&lfn=0&maxW=400&maxh=999';
           if (sc.seriesoverview)
              desc += desc ? '<hr /><a href="#" onclick="return !$(this).next().toggle()">Serienbeschreibung</a><div style="display:none" title="seriesoverview">' + sc.seriesoverview + "</div>" : '<div>' + sc.seriesoverview + '</div>';
           extInfo = '<h3><span>' + tr.scrapperSerieInfo + '</span></h3><div>'
              + '<table class="colFull">'
              + (sc.media["1"] && this.serieImgPath ? '<tr><th colspan="2"><img src="' + this.serieImgPath + sc.seriesid + '&season_number=0&episode_id=0&media_type=1&lfn=1&maxW=397&maxH=250" /></th></tr>' : '');
           if (terms)
              extInfo += (sc.media["12"] && this.serieImgPath ? '<tr><th colspan="2"><img src="' + this.serieImgPath + sc.seriesid + '&season_number=' + terms.seasonnumber + '&episode_id=' + terms.episodeid + '&media_type=12&maxW=397&maxH=400" /></th></tr>' : '');
           extInfo += (sc.seriesname ? '<tr><th>' + tr.title + '</th><td>' + sc.seriesname + '</td></tr>' : '')
              + (sc.seriesnetwork ? '<tr><th>' + tr.network + '</th><td>' + sc.seriesnetwork + '</td></tr>' : '')
              + (sc.seriesstatus ? '<tr><th>' + tr.seriesstatus + '</th><td>' + sc.seriesstatus + '</td></tr>' : '')
              + (sc.seriesfirstaired ? '<tr><th>' + tr.release_date + '</th><td>' + sc.seriesfirstaired + '</td></tr>' : '')
              + (sc.seriesgenre ? '<tr><th>' + tr.genre + '</th><td>' + sc.seriesgenre.replace(/^\||\|$/g, '').replace(/ ?\| ?/g, ', ') + '</td></tr>' : '')
              + (sc.seriesrating ? '<tr><th>' + tr.vote_average + '</th><td class="stars"><div class="stars5" style="width:' + parseInt(sc.seriesrating * 8, 10) + 'px"></div> (' + sc.seriesrating.toFixed(1) + ' / 10)</td></tr>' : '')
              + extInfo
              + (epgd.profile.serieSeasonPath ? '<tr><td colspan="2"><a href="' + epgd.profile.serieSeasonPath + sc.seriesid + '" target="_blank">' + tr.homepage + '</a></td></tr>' : '')
              + '</table>';
           if (terms)
              extInfo += (sc.media["7"] && this.serieImgPath ? '<img class="poster" src="' + this.serieImgPath + sc.seriesid + '&season_number=' + terms.seasonnumber + '&episode_id=0&media_type=7&maxW=390&maxh=999" />' : '');
           extInfo += (sc.media["2"] && this.serieImgPath ? '<img class="poster" src="' + this.serieImgPath + sc.seriesid + '&season_number=0&episode_id=0&media_type=2&lfn=0&maxW=390&maxh=999" />' : '');
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
    i= this.detail.doPlay(true);
    this.$play.toggle(!!i).prop("title", i);
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
    if (checkAvail) return epgd.tr.pages.eventDetail.play;
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
epgd.pages.editUser = {
    cur: null,
    render: function () {
        if (!(epgd.login.rights & epgd.rights.umConfigUsers) == epgd.rights.umConfigUsers) return epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
        var tr = epgd.tr.pages.editUser,
            $form= $('<form></form>'),
            $sel = $('<select size="10"></select>').change(function () {
                epgd.pages.editUser.showUser(this[this.selectedIndex].data, $form, epgd.pages.editUser.render);
            });
        $('<option>' + tr.add + '</option>').appendTo($sel)[0];
        epgd.$con.html('<div id="page_editUser"><div><h2>' + tr.user + '</h2></div></div>');
        epgd.ajax({ url: epgd.login.url + "data/users", cache: false }, function (data) {
            for (var uName in data.users) {
                $('<option>' + uName + '</option>').appendTo($sel)[0].data = data.users[uName];
            }
        });
        epgd.$con.find('#page_editUser').append($form).children().first().append($sel);
    },
    showUser: function (userData, $form, callback) {
        epgd.pages.editUser.cur = userData || {"user": "", "active": 1, "rights": epgd.login.rights};
        var tr = epgd.tr.pages.editUser,
            u = epgd.pages.editUser.cur,
            rightForm = '',
            um;
        //epgd.rights = {}; for (var i = 1; i < 1025; i = i * 2) epgd.rights['um' + i] = i;// zum Test
        for (um in epgd.rights)
            rightForm += '<div><input type="checkbox"' + ((u.rights & epgd.rights[um]) == epgd.rights[um] ? ' checked="checked"' : '') + ' name="uRights" id="uR' + um + '" value="' + epgd.rights[um] + '"/><label for="uR' + um + '">' + (tr.rights[um] || um) + '</label></div>';
        $form.html((!u.user ? '<h2>' + epgd.tr.pages.login.userName + '</h2><div><input type="text" id="uName" value="" /></div><br />' : '')
                + '<div><input type="radio"' + (u.active == "1" ? ' checked="checked"' : '') + ' name="uActive" value="1" id="uActive"/><label for="uActive">' + tr.active + '</label>'
                    + ' <input type="radio"' + (u.active == "0" ? ' checked="checked"' : '') + ' name="uActive" value="0" id="uInactive" /><label for="uInActive">' + tr.inActive + '</label>'
                    + (u.user && ' <input type="radio" name="uActive" value="-1" id="uDel"/><label for="uDel">' + epgd.tr.del + '</label>')
                + '</div>'
                + '<h2>' + epgd.tr.pages.login.password + '</h2><div><input type="password" id="uPass" /></div>'
                + '<h2>' + tr.rights.label + '</h2><div>' + rightForm + '</div>'
                + '<div><br /><button class="iAsButton i-save">' + epgd.tr.save + '</button></div>');
        $form.find('button').click(function () {
            return epgd.pages.editUser.save(this.form, callback);
        });
        $uRights = $($form[0].uRights).each(function () {
            this.r = parseInt(this.value, 10);
        });
        function check() {
            var flag = this.r;
            if (this.checked)
                $uRights.each(function () { // Alle unterrechte automatisch setzen und fixieren 
                    if (this.r < flag && (flag & this.r) == this.r) this.checked = this.disabled = true;
                });
            else
                $uRights.each(function () {
                    if (this.r < flag && (flag & this.r) == this.r) {
                        this.disabled = false; // Es ist ein Unterrecht, also erst mal wieder erlauben
                        var sub = this; // Suchen, ob dieses recht noch ein von einem weiteren Recht ein Unterrecht ist und dann ggf. wieder setzen und fixieren
                        $uRights.each(function () {
                            if (this.checked && this.r > sub.r && (this.r & sub.r) == sub.r) sub.checked = sub.disabled = true;
                        });
                    }
                });
        }
        $uRights.each(check).click(check);
    },
    save: function (form, callback) {
        var u = {rights:1},
            cur = epgd.pages.editUser.cur;
        $(form.uRights).each(function () { if (this.checked) u.rights |= this.r; });
        u.active = parseInt(form.uActive.value,10);
        if (cur.user) {
            u.user = cur.user;
            if (u.active == -1) {
                delete u.active;
                u.state = 'D';
            } else {
                u.state = 'M';
                if (u.active == cur.active)
                    delete u.active;
                if (u.rights == cur.rights)
                    delete u.rights;
                if (form.uPass.value)
                    u.passwd = YaMD5.hashStr(u.user + form.uPass.value);
            }
        } else{
            u.state = 'C';
            u.user = form.uName.value;
            if (!u.user)
                return !epgd.utils.topInfo(epgd.tr.error.emptyField.replace('$field$', epgd.tr.pages.login.userName), { isError: 1 });
            u.passwd = YaMD5.hashStr(u.user + form.uPass.value);
        }
        epgd.ajax({url: epgd.login.url + "data/save-users",type: 'post',data: JSON.stringify({ users: [u] })},function (data) {
                if (data.Error || data.result.state != 200)
                    return epgd.utils.topInfo(data.Error || data.result.message, { isError: 1 });
                (u.user == epgd.login.user) && $(window).trigger("login_changed",u);
                if ( $.isFunction(callback))
                    callback(data);
            });
        return false;
    }
};
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
epgd.pages.login = {
    useCookie: document.cookie.match(/login=([^;]+)/),
    render: function () {
        if (epgd.login.session)
            this.doLogin('logout');
        this.showForm();
    },
    showForm: function(callback){
        var tr = epgd.tr.pages.login,
            $con = $('#login');
        if (!$con.length) {
            $con = $('<div id="login" title="' + tr.label + '" class="searchDialog ui-dialog" style="margin:5% auto"><form class="ui-dialog-content ui-widget-content"><table cellpadding="5">'
            + '<tr><td>' + tr.userName + '</td><td><input type="text" id="lUser" /></td></tr>'
            + '<tr><td>' + tr.password + '</td><td><input type="password" id="lPass" /></td></tr>'
            + '<tr><td colspan="2"><input type="checkbox" id="lAlways" /> <label for="lAlways">' + tr.loggedAlwaysIn + '</label></td></tr>'
          + '</table></form></div>');
            $con.dialog({
                modal: true, width: "auto",
                closeOnEscape: false,
                buttons: [{
                    text: tr.label,
                    icons: {primary: "ui-icon-unlocked"},
                    click: function () {
                        var form = $con.find('form')[0];
                        if (!form.lUser.value)
                            return !!epgd.utils.topInfo(epgd.tr.error.emptyField.replace('$field$', tr.userName), { isError: 1 });
                        $(this).dialog("close");
                        epgd.pages.login.useCookie = form.lAlways.checked ? [] : null;
                        epgd.pages.login.doLogin(form.lUser.value, form.lPass.value, callback);
                    }
                }]
            }).keypress(function (e) {
                if (e.keyCode == 13) {
                    $(this).parent().find(".ui-dialog-buttonpane button:eq(0)").trigger("click");
                }
            }).parent().find('.ui-dialog-titlebar-close').remove();
        } else
            $con.dialog('open');
    },
    doLogin: function (user, pass, callback) {
        var curLogin = epgd.login,
            uKey = '',
            storage = sessionStorage;

        try {
            storage.setItem('_storagetest_', 1);
            storage.removeItem('_storagetest_');
        } catch (ex) {
            storage = { removeItem: function () { }, setItem: function () { }, getItem: function () { return null; } }
        }

        function trigger_changed() {
            if (epgd.login.user != curLogin.user || epgd.login.rights != curLogin.rights) {
                if (!epgd.login.session) {
                    if (epgd.pages.login.useCookie) {
                        epgd.pages.login.useCookie[1] = null;
                        document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    }
                    storage.removeItem('login');
                    epgd.login.url = '';
                } else {
                    if (epgd.pages.login.useCookie) {
                        epgd.pages.login.useCookie[1] = uKey;
                        var d = new Date();
                        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
                        document.cookie = "login=" + uKey + "; expires=" + d.toUTCString();
                    }
                    storage.setItem('login', uKey);
                    epgd.login.url = 'sid' + epgd.login.session + '/';
                }
                $(window).trigger("login_changed", curLogin);
            }
            epgd.login.url = epgd.login.session ? 'sid' + epgd.login.session + '/' : '';
            if ($.isFunction(callback))
                callback();
        }

        if (user != 'logout') {
            if (curLogin.session) {
                $.ajax({ url: curLogin.url + "data/login", data: JSON.stringify({ key: '' }), type: 'post', contentType: "application/json; charset=utf-8", dataType: 'json' });
                epgd.login.url = '';
            }
            if (epgd.profile.needLogin == "0") {
                epgd.login = { user: '', session: '', rights: 4294967295, url: '' };
                return trigger_changed();
            }
            if (user)
                uKey = YaMD5.hashStr(user + pass);
            else {
                uKey = storage.getItem('login');
                if (!uKey && epgd.pages.login.useCookie)
                    uKey = epgd.pages.login.useCookie[1];
                if (!uKey)
                    return this.showForm(callback);
            }
        }
        $.ajax({ url: epgd.login.url + "data/login", data: JSON.stringify({ key: uKey }), type: 'post', contentType: "application/json; charset=utf-8", dataType: 'json' }).done(function (data) {
	        var tr = epgd.tr.pages.login;
	        epgd.login = data.login || { user: '', session: '', rights: 0, url: '' };
	        if (!epgd.login.session) {
	            if (user == 'logout') {
	                epgd.utils.topInfo(tr.logoutMessage);
	            } else
	                epgd.utils.topInfo(tr.error, { isError: 1 });
	            $('#menu_login a').text(tr.label);
	        } else {
	            $('#menu_login a').text(epgd.login.user + ' ' + tr.logout);
	            if (location.hash == "#menu_login" || location.hash == "#")
	                location.hash = "";
	        }
	        return trigger_changed();
	    });
    }
};
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
epgd.pages.profile = {
    render: function () {
        var /*fav = '',
            rules= epgd.profile.favCond.split('\n');
        for (var i = 0; i < rules.length; i++) {
            var terms = rules[i].match(/if \((.+)\) return '([^']+)';$/);
            if (terms)
                fav += '<li style="border:2px solid ' + terms[2] + '"></li>';
        },*/
            startPage = epgd.profile.startPage.slice(5),
            namingmodeOptions = '<option>' + epgd.tr.pages.timerList.namingModes.join('</option><option>') + '</option>',
            html = '<form id="page_profile"><h3>Interface</h3><div><table>'
                + '<tr><td>startpage</td><td><select id="startPage">'
                    + jQuery.map(epgd.tr.menu, function (value, key) {
                        return '<option value="menu_' + key + (startPage == key ? '" selected="selected">' : '">') + value + '</option>';
                    }).join('') + '</select></td></tr>'
                + '<tr><td>default VDR</td><td><select id="defaultVDRuuid">' + $('#menu_vdrs').find('select').html() + '</select></td></tr>'
                + '<tr><td>datepicker first day</td><td><select id="pickerFirstDay"><option>' + epgd.tr.dateTimePicker.dayNames.join('</option><option>') + '</option></select></td></tr>'
                + '<tr><td>quicklinks</td><td><textarea rows="5" style="float:left;width:50%; margin-right:10px" id="quickTimes" onchange="epgd.pages.profile.validate.quickTimes(this)">' + epgd.profile.quickTimes.replace(/~/g, '\n') + '</textarea><span>enter in each line label=hh:mm(24h), eg:<br />prime time=20:15 or prime time=!20:15 (this time will not be highlighted in magazine)<br />now=@Now or next=@Next<br />tip=@searchtimerName</span></td></tr>'
                + '<tr><td>constabel-login</td><td><input type="text" class="full" id="constabelLoginPath" value="' + (epgd.profile.constabelLoginPath || '') + '" />'
                  + '<br />e.g.https://www.eplists.de/eplist.cgi?action=login&login=[username]&secret=[password]</td></tr>'
                + '<tr><td>' + epgd.tr.pages.profile.maxListEntries + '</td><td><input type="text" id="maxListEntries" value="' + epgd.profile.maxListEntries + '" data-valexp="^[1-9]{0,3}$" /></td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.menu.magazine + '</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.magazinePan + '</td><td><input type="text" id="magazinePan" value="' + epgd.profile.magazinePan + '" data-valexp="^[0-9]{1,2}$" /></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.magazinePanDelay + '</td><td><input type="text" id="magazinePanDelay" value="' + epgd.profile.magazinePanDelay + '" data-valexp="^[1-9][0-9]{2,3}$" /></td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.pages.timer.timerList + '</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.timerList.namingMode + '</td><td><b>' + epgd.tr.pages.eventDetail.scrapperSerieInfo + '</b><div>'
                        + epgd.tr.pages.timer.timerList + ': <select id="namingModeSerie">' + namingmodeOptions + '</select><input id="namingModeSerieTemplate" value="' + epgd.profile.namingModeSearchSerieTemplate + '" type="text" style="width:90%" /></div><div>'
                        + epgd.tr.pages.timer.searchTimerList + ': <select id="namingModeSearchSerie">' + namingmodeOptions + '</select><input id="namingModeSearchSerieTemplate" value="' + epgd.profile.namingModeSearchSerieTemplate + '" type="text" style="width:90%" /></div><b style="text-decoration:line-through">'
                       + epgd.tr.pages.eventDetail.scrapperSerieInfo + '</b><div>'
                        + epgd.tr.pages.timer.timerList + ': <select id="namingModeMovie">' + namingmodeOptions + '</select><input id="namingModeMovieTemplate" value="' + epgd.profile.namingModeMovieTemplate + '" type="text" style="width:90%" /></div><div>'
                        + epgd.tr.pages.timer.searchTimerList + ': <select id="namingModeSearchMovie">' + namingmodeOptions + '</select><input id="namingModeSearchMovieTemplate" value="' + epgd.profile.namingModeSearchMovieTemplate + '" type="text" style="width:90%" /></div></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.timerList.chFormat + '</td><td><input id="chFormat" readonly onclick="epgd.timerEditChFormat(this)" value="' + epgd.profile.chFormat + '" /></td></tr>'
                    + '<tr><td>VDR</td><td><select id="timerDefaultVDRuuid"><option value="">Auto</option>' + $('#menu_vdrs').find('select').html() + '</select></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.mailReceiver + '</td><td><input type="mail" value="' + (epgd.profile.mailReceiver || '') + '" id="mailReceiver" /><button onclick="epgd.utils.sendMail(\'checkMailAddress\',\'it works\',\'\',$(form.mailReceiver).val())">' + epgd.tr.test + '</button></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.sendMessages + '</td><td>'
                        + jQuery.map(epgd.tr.pages.timerList.messageTypes, function (value, key) {
                            return '<input type="checkbox" value="' + key + '" name="messageMailTypes"' + (epgd.profile.messageMailTypes.indexOf(key) >= 0 ? ' checked="checked"' : '') + ' />' + value;
                        }).join('&nbsp;&nbsp;')
                    + '</td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.menu.search + '</th><tr>'
                    + '<tr><td>' + epgd.tr.advanced + '</td><td><input type="checkbox" id="searchAdv" /></td></tr>'
                + '<tr><th colspan="2">VDR OSD</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.vdr.startWithSched + '</td><td><input type="checkbox" id="startWithSched"' + (epgd.profile.startWithSched == "1" ? ' checked="checked"' : '') + ' /></td></tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.vdr.osdTimerNotify + '</td><td><input type="checkbox" id="osdTimerNotify"' + (epgd.profile.osdTimerNotify == "1" ? ' checked="checked"' : '') + ' /></td></tr>'
                + '<tr><th colspan="2">' + epgd.tr.menu.records + '</th><tr>'
                    + '<tr><td>' + epgd.tr.pages.profile.record.subFolderSort + '</td><td><select id="recordSubFolderSort"><option value="1">' + epgd.tr.pages.eventDetail.title + ' up</option><option value="2">' + epgd.tr.pages.eventDetail.title + ' down</option><option value="3">' + epgd.tr.pages.timerList.folder + ' up</option><option value="4">' + epgd.tr.pages.timerList.folder + ' down</option><option value="5">' + epgd.tr.pages.timerList.recordTime + ' up</option><option value="6">' + epgd.tr.pages.timerList.recordTime + ' down</option></select></td></tr>'
             + '</table></div>';
        if ((epgd.login.rights & epgd.rights.umConfigEdit) == epgd.rights.umConfigEdit)
            html += '<h3>System</h3><div></div>';
        epgd.$con.html(html + '</form>'
            + '<br /><input type="button" value="' + epgd.tr.save + '" onclick="epgd.pages.profile.save()" class="ui-button ui-widget ui-state-default ui-corner-all">');
        this.form= $( "#page_profile" ).tooltip().accordion({
            headers: "<h3>",
            collapsible: true,
            heightStyle: "content",
            activate: function (event, ui) {
                var panel = ui.newPanel[0];
                if (panel && !panel.hasLoaded) {
                    panel.hasLoaded = true;
                    if (ui.newHeader.text() == "System") {
                        $(panel).html('<table>'
                            + '<tr><th colspan="2">' + epgd.tr.pages.login.label + '</th></tr>'
                            + '<tr><td>' + epgd.tr.pages.login.needLogin + '</td><td><input type="checkbox" id="needLogin" /></td></tr>'
                          + '</table>')
                        .find("#needLogin").click(function () {
                            if (this.checked && !this.hasUsers) {
                                this.checked = false;
                                var elem = this;
                                epgd.ajax({ url: epgd.login.url + "data/users", cache:false }, function (data) {
                                    var u = null,
                                        $dialog,
                                        uName;
                                    for (uName in data.users) { u = data.users[uName]; if (u.active) return (elem.hasUsers = elem.checked = true) };
                                    $dialog = $('<form title="' + epgd.tr.pages.editUser.user + ' ' + (u ? u.user : epgd.tr.pages.editUser.add) + '"></form>');
                                    epgd.pages.editUser.showUser(u, $dialog, function () {
                                        $dialog.dialog("close");
                                        if (!u)
                                            elem.hasUsers = elem.checked = true;
                                        else
                                            $(elem).click();
                                    });
                                    $dialog.dialog({ modal: true, width: "auto" });
                                });
                            }
                        }).prop('checked', epgd.profile.needLogin == "1");
                        epgd.ajax({ url: epgd.login.url + "data/parameters", async: true, cache: false, dataType: "json" }, function (data) {
                            var html = '', i, p, val,
                                tr = epgd.tr.pages.profile.system,
                                ptTime = 1, ptBool = 2, ptBitMask = 4; // ptNum = 0, , ptAscii = 3
                            for (i in data.parameters) {
                                p = data.parameters[i];
                                if (p.owner == 'epgd') {
                                   html += '<tr><td>' + (tr[p.name] || p.name) + '</td><td>';
                                   val = typeof p.value == "undefined" ? p["default"] : p.value;
                                   if (p.type == ptTime)
                                      val= epgd.utils.formatDateTime(val);
                                   else if (p.type == ptBitMask) {
                                      html += '<span id="bmaskgroup_' + p.name + '" style="width:75%;">';
                                      let array = val.split(',');
                                      for (let o = 0; o < p.options.length; o++) {
                                         let checked = false;
                                         for (let n = 0; n < array.length; n++) {
                                            if (array[n] == p.options[o])
                                               checked = true;
                                         }
                                         html += '<input id="bmask' + p.name + '_' + p.options[o] + '"' +
                                            ' type="checkbox" ' + (checked ? 'checked' : '') + '/>' +
                                            '<label for="bmask' + p.name + '_' + p.options[o] + '">' + p.options[o] + '</label>';
                                      }
                                      html += '</span>';
                                   }
                                   else if (p.readonly)
                                      html += val;
                                   else {
                                      html += '<input data-value="' + val + '" data-valexp="' + (p.valexp || '') + '" id="' + p.name + '"';
                                      if (p.type == ptBool)
                                         html += ' type="checkbox"' + (val == "1" ? ' checked' : '');
                                      else
                                         html += ' type="text" class="full" value="' + val + '"';
                                      html += ' /></td></tr>';
                                   }
                                }
                            }
                            html && $(panel).find('table').append('<tbody id="pSystem"><tr><th>' + tr.label + '</th><th style="min-width:300px"></th></tr>' + html + '</tbody>') //&& $( "#page_profile" ).accordion('refresh');
                        });
                    }
                }
            }
        })[0];
        this.form.namingModeSerie.selectedIndex = epgd.profile.namingModeSerie;
        this.form.namingModeSearchSerie.selectedIndex = epgd.profile.namingModeSearchSerie;
        this.form.namingModeMovie.selectedIndex = epgd.profile.namingModeMovie;
        this.form.namingModeSearchMovie.selectedIndex = epgd.profile.namingModeSearchMovie;

        $([this.form.namingModeSerie,this.form.namingModeSearchSerie,this.form.namingModeMovie,this.form.namingModeSearchMovie] ).change(function () {
            this.nextSibling.style.display = (this.selectedIndex == 6) ? 'block' : 'none';
        }).change();
        epgd.utils.addPlaceholders(this.form.namingModeSerieTemplate, '%', epgd.tr.pages.timerList.templateFields);
        epgd.utils.addPlaceholders(this.form.namingModeSearchSerieTemplate, '%', epgd.tr.pages.timerList.templateFields);
        epgd.utils.addPlaceholders(this.form.namingModeMovieTemplate, '%', epgd.tr.pages.timerList.templateFields);
        epgd.utils.addPlaceholders(this.form.namingModeSearchMovieTemplate, '%', epgd.tr.pages.timerList.templateFields);

        $(this.form.quickTimes).one("focus", function () {
            var quickTimes = this;
            epgd.ajax({ url: epgd.login.url + "data/searchtimers?type=S" }, function (data) {
                var placeholders = { "@Now": ": current time", "@Next": ": next event" };
                $.each(data.searchtimers, function (id, t) {
                    placeholders['@' + t.name || t.expression] = ': saved timer';
                });
                epgd.utils.addPlaceholders(quickTimes, '@', placeholders);
            });
        });

        this.form.searchAdv.checked = epgd.profile.searchAdv == "1";
        epgd.profile.defaultVDRuuid && $(this.form.defaultVDRuuid).val(epgd.profile.defaultVDRuuid);
        $(this.form.timerDefaultVDRuuid).val(epgd.profile.timerDefaultVDRuuid);
        $(this.form.recordSubFolderSort).val(epgd.profile.recordSubFolderSort);
       this.form.pickerFirstDay.selectedIndex= (epgd.profile.pickerFirstDay || epgd.tr.dateTimePicker.firstDay);
    },
    save: function () {
        var profile = epgd.profile,
            data = [],
            form = this.form,
            owner= "@" + epgd.login.user,
            panel;
        function checkData(p) {
            if (profile[p.name] != p.value)
                data.push(p);
        }

        if (!this.validate.quickTimes(form.quickTimes)
            || !this.validate.checkRegex(form.magazinePan)
            || !this.validate.checkRegex(form.magazinePanDelay))
            return false;

        checkData({ name: "defaultVDRuuid", value: $(form.defaultVDRuuid).val() || '', owner: owner });
        checkData({ name: "quickTimes", value: form.quickTimes.value.replace(/\n/g, '~'), owner: owner });
        checkData({ name: "startWithSched", value: $(form.startWithSched).prop('checked') ? "1" : "0", owner: owner });
        checkData({ name: "osdTimerNotify", value: $(form.osdTimerNotify).prop('checked') ? "1" : "0", owner: owner });
        checkData({ name: "pickerFirstDay", value: new String(form.pickerFirstDay.selectedIndex), owner: owner });
        checkData({ name: "startPage", value: $(form.startPage).val() || '', owner: owner });
        checkData({ name: "namingModeSerie", value: new String(this.form.namingModeSerie.selectedIndex), owner: owner });
        checkData({ name: "namingModeSearchSerie", value: new String(this.form.namingModeSearchSerie.selectedIndex), owner: owner });
        checkData({ name: "namingModeMovie", value: new String(this.form.namingModeMovie.selectedIndex), owner: owner });
        checkData({ name: "namingModeSearchMovie", value: new String(this.form.namingModeSearchMovie.selectedIndex), owner: owner });
        checkData({ name: "namingModeSerieTemplate", value: new String(this.form.namingModeSerieTemplate.value), owner: owner });
        checkData({ name: "namingModeSearchSerieTemplate", value: new String(this.form.namingModeSearchSerieTemplate.value), owner: owner });
        checkData({ name: "namingModeMovieTemplate", value: new String(this.form.namingModeMovieTemplate.value), owner: owner });
        checkData({ name: "namingModeSearchMovieTemplate", value: new String(this.form.namingModeSearchMovieTemplate.value), owner: owner });
        checkData({ name: "timerDefaultVDRuuid", value: $(form.timerDefaultVDRuuid).val() || '', owner: owner });
        checkData({ name: "constabelLoginPath", value: $(form.constabelLoginPath).val() || '', owner: owner });
        checkData({ name: "chFormat", value: $(form.chFormat).val() || '', owner: owner });
        checkData({ name: "searchAdv", value: $(form.searchAdv).prop('checked') ? "1" : "0", owner: owner });
        checkData({ name: "messageMailTypes", value: $(form.messageMailTypes).map(function () { return this.checked ? this.value : "" }).toArray().join(''), owner: owner });
        checkData({ name: "mailReceiver", value: $(form.mailReceiver).val() || '', owner: owner });
        checkData({ name: "magazinePan", value: $(form.magazinePan).val() || '', owner: owner });
        checkData({ name: "magazinePanDelay", value: $(form.magazinePanDelay).val() || '', owner: owner });
        checkData({ name: "maxListEntries", value: $(form.maxListEntries).val() || '', owner: owner });
        checkData({ name: "recordSubFolderSort", value: $(form.recordSubFolderSort).val() || '1', owner: owner });

       panel = $('#pSystem').parent().parent()[0];
       if (panel && panel.hasLoaded) {
          checkData({ name: "needLogin", value: $(form.needLogin).prop('checked') ? "1" : "0", owner: "webif" });
          $('#pSystem input').each(function () {
             if (this.type == 'checkbox') {
                if (!this.id.startsWith('bmask')) {
                   if (this.checked != (this.getAttribute('data-value') == "1"))
                      data.push({ name: this.id, value: (this.checked ? "1" : "0"), owner: "epgd", valexp: this.getAttribute('data-valexp')});
                }
             }
             else if (this.getAttribute('data-value') != this.value) {
                if (epgd.pages.profile.validate.checkRegex(this))
                   data.push({ name: this.id, value: this.value, owner: "epgd" });
                else{
                   data = [];
                   return false;
                }
             }
          });
          let rootConfig = document.getElementById("pSystem");
          let elements = rootConfig.querySelectorAll("[id^='bmaskgroup_']");
          for (let i = 0; i < elements.length; i++) {
             let name = elements[i].id.substring(elements[i].id.indexOf("_") + 1);
             let bits = rootConfig.querySelectorAll("[id^='bmask" + name + "_']");
             let value = '';
             for (let i = 0; i < bits.length; i++) {
                let o = bits[i].id.substring(bits[i].id.indexOf("_") + 1);
                if (bits[i].checked)
                   value += o + ','
             }
             data.push({ 'name': name, 'value': value, 'owner': "epgd" });
          }
       }
       if (data.length) {
          if (panel) panel.hasLoaded = false;
          panel = $("#page_profile").accordion("option", "active");
          $("#page_profile").accordion("option", "active", false).accordion("option", "active", panel);
          epgd.ajax({
             url: epgd.login.url + 'data/save-parameters',
             type: 'post',
             data: JSON.stringify({ "parameters": data })
          }, function (res) {
             res = res.result;
             if (res && res.state == 200)
                epgd.utils.topInfo(epgd.tr.dataSaved);
             else
                epgd.utils.topInfo(res.message, { isError: 1 });
             epgd.profile_load();
          }, function (jqxhr) {
             try {
                var msg = '';
                $(jqxhr.responseJSON.result.failed).each(function () {
                   msg += '<li>' + form[data[this].name].parentNode.previousSibling.innerHTML + '</li>';
                });
                if (msg) {
                   epgd.utils.popup('<ol>' + msg + '</ol>', { title: epgd.tr.error.invalid });
                   return true;
                }
             } catch (e) { }
             return false;
          });
       }
    },
   validate: {
      quickTimes: function (input) {
         input.value = input.value.replace(/\n{2,}/g, '\n').replace(/^\n+|\n+$/g, '');
         if (!/^(\n?[^=]+=!?(([0-1]?[0-9]|2[0-4]):[0-5]?[0-9]|@Now|@Next|@[A-Za-z0-9]*))*$/.test(input.value)) {
            input.focus();
            epgd.utils.popup(epgd.tr.error.invalid);
            return false;
         }
         return true;
      },
      checkRegex: function (input) {
         if (input.getAttribute('data-valexp') && !new RegExp(input.getAttribute('data-valexp')).test(input.value)) {
            input.focus();
            epgd.utils.popup(epgd.tr.error.invalid);
            return false;
         }
         return true;
      }
    }
};
epgd.pages.records = {
    render: function () {
       if (!(epgd.login.rights & epgd.rights.umRecordings) == epgd.rights.umRecordings)
          return epgd.utils.popup(epgd.tr.error.forbidden, { title: epgd.tr.error.error });
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
                            let imgPath = rec.imgid ? 'data/eventimg' + '?no=0&maxW=100&maxH=70&imgid=' + rec.imgid : false;
                            //if (rec.imgid && rec.imgid != '')
                            //   console.log("recording:", rec);
                            rec.tit = ((rec.name != subFolder ? rec.name : '')
                                       + (subFolder != rec.title && (rec.title != rec.name) ? '<br/>' + rec.title : '')
                                       + (rec.shorttext && (rec.shorttext != rec.name) ? '<i>' + rec.shorttext + '</i>' : '')) || subFolder;
                            rec.html = '<div class="rec">'
                               + '<em>' + epgd.utils.formatDateTime(rec.starttime) + '</em><u>' + parseInt(rec.duration / 60, 10) + min + '</u>'
                               + '<b class="ui-widget-content ui-corner-all" data-start="' + rec.starttime + '" data-owner="' + (rec.owner || '')
                               + '" data-md5="' + rec.md5path + '" data-path="' + rec.path + '">'
                               + '  <b>'
                               + rec.tit
                               + '  </b>'
                               + (imgPath ? '   <img src="' + imgPath + '" />' : '')
                               + '</b>'
                               + '</div>';
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
                    typeIcons = { 'V': 'i-tv', 'R': 'i-record', 'S': 'i-search' },
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
                        + '</td><td' + (t.eventid ? ' data-evId="' + t.eventid + '" class="' + typeIcons[t.type] + '">' + (t.title || '') + '<br />' + (t.shorttext || '') : '>') + '</td><td>'
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
    saveUrl: 'data/delete-timerjobs',
    right: epgd.rights.umTimer
});
epgd.pages.timersDone.editIcons= '<span class="iAsButton i-trash edit" title="' + epgd.tr.del + '"></span>';

// Küzlich erledigte Timer
//epgd.pages.timersDone = new epgd.timerListBase({
//    updateUrl: 'data/timers?state=D,F,E&action=A',
//    right: epgd.rights.umTimer
//});

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