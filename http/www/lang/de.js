export default {
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
    markNone: "Auswahl aufheben",
    markGroup: "Gruppe auswählen …",
    filterAll: "alle",
    editDone: "fertig",
    confirmDelete: "Willst du wirklich löschen?",
    dataSaved: "Daten wurden gespeichert",
    dataDeleted: "Daten wurden gelöscht",
    dataSend: "Daten wurden gesendet",
    channel: "Kanal",
    date: "Datum",
    entries: " Einträge",
    pager: {
        page: "Seite",
        first: "erste Seite",
        prev: "vorherige Seite",
        next: "nächste Seite",
        last: "letzte Seite"
    },
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
        timeline: "Zeitleiste",
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
            messageList: "Meldungen"
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
                'R': 'Aufnahme fertig',
                'J': 'Timer abgelehnt'
            },
            doneInfoDefault: {
                'J': 'Sendung nicht mehr im EPG'
            },
            conflictHead: 'Konflikt $1 auf VDR $2 am $3',
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
            imageSrc: 'Bild ',
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
                label: "epgd Backend",
                // titles of the epgd parameters, the order here is the display order
                params: {
                    manualTimer2Done: "Manuelle Timer in die Auftragshistorie übernehmen",
                    timerJobFailedHistory: "Fehlgeschlagene Timeraufträge aufbewahren (Tage)",
                    messageHistory: "Meldungen aufbewahren (Tage, 0 = unbegrenzt)",
                    recCompleteMinPct: "Aufnahme gilt als vollständig ab (%)",
                    recCompleteMinPctVps: "Aufnahme mit VPS gilt als vollständig ab (%)",
                    recCheckLateManualTimer: "Länge auch bei verspätet gestarteten manuellen Timern ab Timerbeginn prüfen",
                    logoSuffix: "Dateiendung der Kanallogos",
                    logoById: "Kanallogos über die Kanal-ID statt den Namen suchen",
                    logoUpperCase: "Dateinamen der Kanallogos in Großbuchstaben",
                    logoShowName: "Kanalname neben dem Logo anzeigen",
                    mailScript: "Skript für den Mailversand",
                    liveStreamUrl: "Live-TV im Browser: Stream-URL von streamdev-server (z.B. http://vdr:3000/TS/, leer = aus)",
                    streamEncoder: "Browser-Streams umkodieren mit",
                    streamX264Preset: "x264-Preset (schneller = weniger CPU-Last, höhere Bitrate)",
                    streamMaxHeight: "Browser-Streams verkleinern auf",
                    eloquence: "Log-Ausgaben",
                    minEventTime: "EPG-Daten vorhanden ab",
                    maxEventTime: "EPG-Daten vorhanden bis"
                },
                // labels of the select boxes (values from the backend: data/parameters -> options)
                paramOptions: {
                    streamEncoder: (o, all) => ({
                        auto: 'automatisch (' + (all.includes('vaapi') ? 'GPU per VAAPI' : 'CPU per x264') + ')',
                        vaapi: 'GPU (VAAPI)',
                        x264: 'CPU (x264)'
                    })[o] ?? o,
                    streamX264Preset: {
                        ultrafast: 'ultrafast (am schnellsten)',
                        superfast: 'superfast',
                        veryfast: 'veryfast (Standard)',
                        faster: 'faster',
                        fast: 'fast',
                        medium: 'medium (beste Qualität)'
                    },
                    streamMaxHeight: {
                        0: 'Originalgröße',
                        1080: '1080 Zeilen', 720: '720 Zeilen', 576: '576 Zeilen (SD)',
                        540: '540 Zeilen', 480: '480 Zeilen', 360: '360 Zeilen'
                    }
                }
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
