// Help content (German). Static, trusted HTML.
//   sections: shown on the help page; topics: small help texts used by the '?' buttons (ids as in the old UI)

export const sections = [
   {
      id: 'intro', title: 'Allgemein',
      html: `
         <p><b>EPGd</b> ist die Weboberfläche des <b>E</b>lectronic <b>P</b>rogram <b>G</b>uide <b>d</b>aemon für den
         <b>V</b>ideo <b>D</b>isk <b>R</b>ecorder (VDR). Damit kannst du</p>
         <ul>
            <li>das aktuelle TV-Programm und das Programm der nächsten Tage ansehen,</li>
            <li>Timer und Suchtimer anlegen und verwalten,</li>
            <li>die Aufnahmen aller VDRs durchsuchen, abspielen, umbenennen und löschen.</li>
         </ul>
         <h4>Bedienung</h4>
         <ul>
            <li>Oben rechts wählst du den <b>VDR</b>, auf dem umgeschaltet bzw. abgespielt wird.</li>
            <li>Ein Klick auf eine Sendung öffnet immer die <b>Detailansicht</b>.</li>
            <li>Ein Klick auf das Sender-Logo in der Programm-Ansicht springt ins Magazin zu diesem Sender,
                das <span class="kbd">TV</span>-Symbol daneben schaltet den VDR auf diesen Sender um.</li>
            <li>Jede Seite hat eine eigene Adresse – du kannst sie als Lesezeichen speichern, der Zurück-Knopf des Browsers funktioniert.</li>
            <li>Die Oberfläche passt sich an Handy, Tablet und Desktop an und folgt dem hellen oder dunklen Farbschema des Systems.</li>
         </ul>`
   },
   {
      id: 'now', title: 'Programm',
      html: `
         <p>Zeigt für alle in der Weboberfläche sichtbaren Kanäle die Sendung zu einem Zeitpunkt – standardmäßig <b>jetzt</b>.
         Laufende Sendungen haben einen Fortschrittsbalken.</p>
         <ul>
            <li><b>Jetzt</b> – die aktuell laufenden Sendungen.</li>
            <li><b>nachfolgend</b> – die jeweils nächste Sendung pro Kanal.</li>
            <li><b>Datum/Zeit</b> – beliebigen Zeitpunkt innerhalb der vorhandenen EPG-Daten wählen.</li>
            <li><b>Schnellzeiten</b> – eigene Zeiten (z.B. Primetime=20:15) oder gespeicherte Suchen (z.B. Tipps=@Tipps),
                festgelegt unter <a href="#settings?tab=profile">Einstellungen › Profil</a>. Auf dem Handy erscheinen sie als Auswahlliste.</li>
         </ul>`
   },
   {
      id: 'magazine', title: 'Magazin',
      html: `
         <p>Das Programm als Raster: je Kanal eine Spalte, die Zeit läuft nach unten (2 Pixel pro Minute).
         Die Höhe einer Sendung entspricht ihrer Dauer, deshalb liegen die Sendungen verschiedener Kanäle zeitlich exakt nebeneinander.</p>
         <ul>
            <li>Scrollen in beide Richtungen; Kanalköpfe und Zeitachse bleiben dabei stehen.</li>
            <li>Die rote Linie markiert die aktuelle Uhrzeit, Tageswechsel und Schnellzeiten sind als Linien eingezeichnet.</li>
            <li><b>−1 Tag / Jetzt / +1 Tag</b>, Datum/Zeit und die Kanalauswahl springen direkt an die gewünschte Stelle.</li>
            <li>Sehr kurze Sendungen werden kompakt dargestellt; am Desktop zeigt das Überfahren mit der Maus den ganzen Eintrag.</li>
            <li>Die Daten werden beim Scrollen blockweise nachgeladen.</li>
         </ul>`
   },
   {
      id: 'eventDetail', title: 'Detailansicht',
      html: `
         <p>Alle Informationen zu einer Sendung: Beschreibung, Bewertung, Bild sowie – sofern vom Scraper gefunden –
         Film- oder Serieninformationen mit Schauspielern.</p>
         <h4>Knöpfe</h4>
         <ul>
            <li><b>Aufnehmen</b> – öffnet den Timer-Dialog (rot, wenn bereits ein Timer existiert).</li>
            <li><b>Umschalten</b> – schaltet den gewählten VDR um; bei künftigen Sendungen wird ein Umschalt-Timer angelegt.</li>
            <li><b>Wiederholungen</b> – sucht weitere Ausstrahlungen mit exakt diesem Titel.</li>
            <li><b>« / »</b> – vorherige / nächste Sendung auf diesem Kanal (auch mit den Pfeiltasten).</li>
         </ul>
         <div id="h_constabel">
            <h4>Constabel Episodenliste</h4>
            <p>Bei Serien werden die bei <a href="https://www.eplists.de" target="_blank" rel="noopener">eplists.de (Constabel)</a> gepflegten Episoden angezeigt.
            Über <i>bearbeiten</i> und <i>Link erzeugen</i> kann die Liste direkt dort gepflegt werden – dafür musst du dort angemeldet sein.
            Einen Login-Link kannst du unter <a href="#settings?tab=profile">Einstellungen › Profil</a> hinterlegen.</p>
         </div>`
   },
   {
      id: 'records', title: 'Aufnahmen',
      html: `
         <p>Die Aufnahmen aller registrierten VDRs, aufgebaut wie ein Dateibrowser.</p>
         <ul>
            <li><b>Ordner</b> zeigen die Anzahl der Aufnahmen und das Datum der letzten. Die Pfadleiste oben führt zurück.</li>
            <li><b>Suche</b> – ab zwei Zeichen werden alle Ordner durchsucht (Name, Titel, Untertitel, Ordner).
                Mehrere Wörter müssen alle vorkommen, z.B. <i>tatort borowski</i>.</li>
            <li><b>Sortierung</b> – nach Datum oder Titel; die Auswahl wird im Browser gespeichert.</li>
            <li>Ein Klick auf eine Aufnahme öffnet die Detailansicht mit <b>Abspielen</b>, <b>Umbenennen/Verschieben</b> und <b>Löschen</b>.</li>
            <li><b>Auswählen</b> schaltet in den Auswahlmodus: mehrere Aufnahmen auf einmal verschieben oder löschen.</li>
         </ul>
         <div id="h_recRefresh">
            <h4>neu laden</h4>
            <p>Fordert alle VDRs auf, ihre Aufnahmeverzeichnisse neu einzulesen. Nach 5 Sekunden wird die Liste neu geladen,
            da es keine Rückmeldung gibt, wann die VDRs damit fertig sind.</p>
         </div>
         <div id="h_recMove">
            <h4>Umbenennen / Verschieben</h4>
            <p>Ordner werden mit „/“ getrennt; nicht vorhandene Ordner werden angelegt. Die Umbenennung führt der VDR aus –
            bis sie dort erledigt ist, ist die Aufnahme kurz ausgegraut.</p>
         </div>`
   },
   {
      id: 'timer', title: 'Timer',
      html: `
         <h4>Wie Timer entstehen</h4>
         <p>Legst du einen Timer für eine Sendung an, wird ein Eintrag mit der Event-ID gespeichert – ohne Zeiten.
         Übernimmt ein VDR (Plugin epg2vdr) den Auftrag, legt er den Timer mit seinen eigenen Funktionen an; Zeiten und Titel kommen also vom VDR.
         Danach werden die Daten des VDR-Timers in die Liste übernommen.</p>
         <h4>Die Reiter</h4>
         <ul>
            <li><b>Timer</b> – alle Timer, die auf ihre Ausführung warten oder gerade aufnehmen.</li>
            <li><b>Suchtimer</b> – gespeicherte Suchkriterien, aus deren Treffern regelmäßig automatisch Timer erzeugt werden.
                Unterschieden werden Aufnahme-, Umschalt-Suchtimer und <i>gespeicherte Suchen</i> (nur für die Suche bzw. Schnellzeiten).
                Über ⌄ siehst du die erzeugten Timer bzw. die Treffer.</li>
            <li><b>kürzliche Aufträge</b> – kürzlich ausgeführte Timer, auch gelöschte oder fehlgeschlagene.</li>
            <li><b>Auftragshistorie</b> – alle jemals aufgenommenen Timer. Neue Treffer von Suchtimern werden damit verglichen
                und verworfen, wenn sie schon aufgenommen wurden.</li>
            <li><b>asynchrone Aufträge</b> – neue oder gelöschte Timer, die ein VDR noch nicht abgeholt hat.</li>
            <li><b>Systemmeldungen</b> – Meldungen von epgd und VDRs; als gelesen markieren oder löschen.</li>
         </ul>
         <div id="h_sTimer">
            <h4>Der Suchtimer-Dialog</h4>
            <p>Die Suchkriterien entsprechen denen der <a href="#help?t=search">Suche</a>. Zusätzlich:</p>
         </div>
         <div id="h_sTRepeat">
            <h5>Wiederholungen vermeiden</h5>
            <p>Jeder Treffer wird anhand von Titel und/oder Kurztext mit vorhandenen und bereits geplanten Aufnahmen verglichen.
            Doppelte Treffer werden verworfen.</p>
         </div>
         <div id="h_sTChFormat">
            <h5>bevorzugtes Sendeformat</h5>
            <p>Läuft eine Sendung auf einem SD- und einem HD-Sender, bestimmt die Reihenfolge (z.B. <i>HD,SD</i>), welche aufgenommen wird.</p>
         </div>
         <div id="h_sTNameMode">
            <h5>Ermittlung des Dateinamens</h5>
            <p>Der Dateiname wird – außer im Modus <i>VDR</i> – vom Python-Skript <code>/etc/epgd/recording.py</code> ermittelt und kann bereits Ordner enthalten.</p>
            <ul>
               <li><b>VDR</b> – der VDR vergibt den Namen, nur das Verzeichnis wird vorangestellt.</li>
               <li><b>Auto</b> – automatische Wahl zwischen Constable, Serie und Kategorisiert.</li>
               <li><b>Constable</b> – Titel/Staffel/Teil/Untertitel aus den Constabel-Daten, sofern vorhanden.</li>
               <li><b>Serie</b> – Titel/Untertitel ohne Constabel-Daten.</li>
               <li><b>Kategorisiert</b> – nach Film-Kategorie: Kategorie/Titel.</li>
               <li><b>Usermode</b> – eigene Logik im Python-Skript.</li>
               <li><b>Template</b> – frei definierbar mit Platzhaltern wie <code>%title%</code> oder <code>%season%</code>; die Liste erscheint unter „Platzhalter“.</li>
            </ul>
            <p><b>Verzeichnis</b> wird dem ermittelten Namen vorangestellt – vorhandene Ordner werden vorgeschlagen, neue entstehen automatisch.</p>
            <p><b>VDR</b>: ein bestimmter VDR oder <i>Auto</i> – dann wird ein gerade freier VDR beauftragt.</p>
         </div>`
   },
   {
      id: 'search', title: 'Suche',
      html: `
         <p>Gezielte Suche im EPG. Unter <b>Optionen</b> stehen dieselben Kriterien wie bei Suchtimern zur Verfügung.
         Eine Suche kann gespeichert und über <i>Gespeicherte Suchen</i> wieder aufgerufen oder als Schnellzeit (@Name) verwendet werden.
         <i>Als Suchtimer anlegen</i> macht daraus einen Aufnahme-Suchtimer.</p>
         <div id="h_sExpr">
            <h4>Suchausdruck und Suchmodus</h4>
            <p>Der Begriff wird – je nach Auswahl – im Titel, Kurztext und/oder in der Beschreibung gesucht:</p>
            <ul>
               <li><b>exakte Übereinstimmung</b> – das Feld muss genau dem Begriff entsprechen.</li>
               <li><b>regulärer Ausdruck</b> – regulärer Ausdruck der Datenbank (SQL <code>REGEXP</code>), z.B. <code>^Tatort</code>.</li>
               <li><b>Muster</b> – Platzhalter wie in SQL LIKE: <code>%</code> beliebig viele Zeichen, <code>_</code> genau ein Zeichen.</li>
               <li><b>enthalten in</b> – der Begriff muss nur enthalten sein.</li>
               <li><b>PCRE Ausdruck</b> – regulärer Ausdruck per SQL <code>RLIKE</code> (bei MariaDB Perl-kompatibel).</li>
            </ul>
         </div>
         <div id="h_sTAdv">
            <h4>erweitert</h4>
            <p><b>Folge</b> wird mit dem Namen der Folge verglichen, bei Sendungen ohne Seriendaten mit dem Kurztext.</p>
            <p><b>Staffel, Folgen-Nummer und Jahr</b> akzeptieren eine Zahl oder einen Bereich:
            <i>5</i> = genau 5, <i>2-</i> = ab 2, <i>-2012</i> = bis einschließlich 2012, <i>5-10</i> = 5 bis 10.</p>
            <p><b>Kategorie und Genre</b> bieten alle Werte an, die aktuell in den EPG-Daten vorkommen.</p>
            <p><b>Tipp</b>: Die Sendung muss einer der gewählten Tipp-Kategorien entsprechen.</p>
            <p><b>Ignoriere fehlende EPG Info</b>: Staffel, Folge, Kategorie, Tipp und Jahr gelten als Treffer, wenn die Sendung dazu keine Angabe hat.</p>
         </div>
         <div id="h_sTChannels">
            <h4>Kanal</h4>
            <p>Die Suche auf bestimmte Kanäle einschränken oder Kanäle ausschließen.
            <b>Kanal von/bis</b> berücksichtigt nur Kanäle ab bzw. bis zur angegebenen Nummer (einschließlich).</p>
         </div>
         <div id="h_sTime">
            <h4>Sendungsbeginn</h4>
            <p>Zeitspanne, in der die Sendung beginnen muss, optional eingeschränkt auf Wochentage.
            Bei gespeicherten Suchen kann das Ergebnis zusätzlich auf die nächsten <i>N</i> Tage begrenzt werden –
            z.B. <i>1</i> für eine „Heute Abend“-Favoritensuche.</p>
         </div>`
   },
   {
      id: 'options', title: 'Einstellungen',
      html: `
         <ul>
            <li><b>Profil</b> – persönliche Einstellungen: Startseite, Schnellzeiten, Standardwerte für Timer, E-Mail-Benachrichtigungen u.a.
                Gespeichert werden nur geänderte Werte.</li>
            <li><b>Kanäle</b> – Reihenfolge (am Griff ziehen, auch per Touch), Sichtbarkeit in der Weboberfläche und Namen der Kanäle.
                Über die <i>Referenzliste</i> (channels.conf eines VDR oder eingefügter Text) können Namen und Reihenfolge übernommen werden.</li>
            <li><b>Benutzer</b> – Benutzer der Weboberfläche mit ihren Rechten. Ein Recht schließt seine Unterrechte ein.</li>
            <li><b>System</b> – Login-Pflicht und alle Parameter des epgd-Backends.
                Die Login-Pflicht lässt sich nur einschalten, wenn es einen aktiven Benutzer gibt.</li>
         </ul>`
   },
   {
      id: 'about', title: 'Über',
      html: `
         <h4>Programmierung</h4>
         <p>Backend (epg daemon, http daemon): Jörg Wendel<br>
         SQL/Procedures: Christian Kaiser<br>
         Frontend (Web, ursprüngliche Version): Dirk Hermes<br>
         VDR-Plugin epg2vdr: Jörg Wendel<br>
         VDR-Plugin scraper2vdr: Stefan Braun</p>
         <p>Die Weboberfläche verwendet <a href="https://jquery.com" target="_blank" rel="noopener">jQuery</a> (MIT-Lizenz).</p>
         <details class="help-file" data-src="/HISTORY.h"><summary>Historie</summary><pre></pre></details>
         <details class="help-file" data-src="/TODO"><summary>ToDo's</summary><pre></pre></details>`
   }
];

// '?' button topics -> element id inside the sections

export const topics = ['constabel', 'recRefresh', 'recMove', 'sTRepeat', 'sTChFormat', 'sTNameMode', 'sExpr', 'sTAdv', 'sTChannels', 'sTime'];
