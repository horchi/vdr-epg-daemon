// Help content (German). Static, trusted HTML.
//   sections: shown on the help page; elements with id 'h_<topic>' are shown by the '?' buttons

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
            <li>Ein Klick auf eine Sendung öffnet die <b>Detailansicht</b> – in der Zeitleiste je nach Einstellung das <b>Infofeld</b>.</li>
            <li>Ein Klick auf das Sender-Logo in der Programm-Ansicht springt ins Magazin zu diesem Sender,
                das <span class="kbd">TV</span>-Symbol daneben schaltet den VDR auf diesen Sender um.</li>
            <li>Jede Seite hat eine eigene Adresse – du kannst sie als Lesezeichen speichern, der Zurück-Knopf des Browsers funktioniert.</li>
            <li>Die Oberfläche passt sich an Handy, Tablet und Desktop an und folgt dem hellen oder dunklen Farbschema des Systems.</li>
         </ul>`
   },
   {
      id: 'overview', title: 'Übersicht',
      html: `
         <p>Der Stand auf einen Blick, wird jede Minute aktualisiert. Die Kacheln oben führen zur jeweiligen Seite.</p>
         <ul>
            <li><b>Kacheln</b> – laufende Aufnahmen, geplante Timer (und wie viele davon in den nächsten 24 Stunden),
                Anzahl und Gesamtlänge der Aufnahmen, freier Platz mit geschätzter Aufnahmezeit, aktive Suchtimer,
                neue Nachrichten und das letzte bzw. nächste EPG-Update des epgd.</li>
            <li><b>Laufende Aufnahmen</b> – mit Fortschritt und Restzeit, nur wenn gerade aufgenommen wird.</li>
            <li><b>Nächste Timer</b> – nach Tagen gruppiert; ein Klick öffnet die Sendung.</li>
            <li><b>Letzte Aufnahmen</b> – die neuesten Aufnahmen, mit Knopf zum Abspielen im Browser.</li>
            <li><b>Hinweise</b> – Timer-Fehler der letzten 7 Tage, Aufträge, die noch auf einen VDR warten,
                knapper Platz (unter 10&nbsp;%) und ungelesene Nachrichten.</li>
            <li><b>VDRs</b> – epgd und bis zu 9 VDRs mit Status (verbundene zuerst, nicht im Web freigegebene sind markiert); ein getrennter VDR mit bekannter
                MAC-Adresse kann per <i>Wecken</i> (Wake on LAN) gestartet werden.</li>
            <li><b>Speicherplatz</b> – je Videoverzeichnis; VDRs mit gemeinsamem Verzeichnis werden einmal gezeigt.</li>
         </ul>
         <p>Unter <a href="#settings?tab=profile">Einstellungen › Profil</a> lässt sich die Übersicht als Startseite wählen.</p>`
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
            <li><b>Kanalgruppe</b> – zeigt nur die Sendungen einer Gruppe (z.B. HD+, ORF), gilt nicht für die Schnellwahl-Suchen. Die Auswahl bleibt im Browser gespeichert. Die Gruppen kommen aus der channels.conf des VDR.</li>
            <li><b>Live</b> – der Knopf auf den Kacheln laufender Sendungen spielt den Sender im Browser ab
                (siehe <a href="#help?t=streaming">Streaming im Browser</a>).</li>
         </ul>
         <h4>Tastatur</h4>
         <table class="help-table">
            <tr><th>Pfeiltasten</th><td>von Karte zu Karte (die erste Taste wählt die erste Karte)</td></tr>
            <tr><th>Pos1 / Ende</th><td>erste / letzte Karte</td></tr>
            <tr><th>Enter</th><td>Detailansicht</td></tr>
            <tr><th>Strg + Pfeiltasten</th><td>Seite scrollen</td></tr>
         </table>`
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
            <li><b>Kanalgruppe</b> – zeigt nur die Kanäle einer Gruppe (z.B. HD+, ORF). Die Auswahl bleibt im Browser gespeichert. Die Gruppen kommen aus der channels.conf des VDR.</li>
            <li>Sehr kurze Sendungen werden kompakt dargestellt; am Desktop zeigt das Überfahren mit der Maus den ganzen Eintrag.</li>
            <li>Die Daten werden beim Scrollen blockweise nachgeladen.</li>
         </ul>`
   },
   {
      id: 'timeline', title: 'Zeitleiste',
      html: `
         <p>Das Programm als Zeitstrahl: je Kanal eine Zeile, die Zeit läuft von links nach rechts (4 Pixel pro Minute).
         Die Breite einer Sendung entspricht ihrer Dauer.</p>
         <ul>
            <li>Scrollen in beide Richtungen; Kanalspalte und Zeitachse bleiben dabei stehen.</li>
            <li>Die rote Linie markiert die aktuelle Uhrzeit, Tageswechsel und Schnellzeiten sind als Linien eingezeichnet.</li>
            <li><b>−1 Tag / Jetzt / +1 Tag</b>, Datum/Zeit, Kanalauswahl und Schnellzeiten springen direkt an die gewünschte Stelle.</li>
            <li><b>Kanalgruppe</b> – zeigt nur die Kanäle einer Gruppe (z.B. HD+, ORF). Die Auswahl bleibt im Browser gespeichert. Die Gruppen kommen aus der channels.conf des VDR. Ohne Filter steht vor jeder Gruppe eine Überschrift,
                jeweils dort, wo die Gruppe in der Kanal-Reihenfolge wechselt.</li>
            <li>Schmale Sendungen zeigen nur den Titel; der Tooltip bzw. das Überfahren mit der Maus zeigt den ganzen Eintrag.</li>
         </ul>
         <h4>Infofeld</h4>
         <p>Ein Klick auf eine Sendung zeigt ihre wichtigsten Daten in einem Feld über dem Raster – Bild, Zeit, Titel,
         Kurztext, Genre und den Anfang der Beschreibung. <b>Details</b> bzw. ein Doppelklick öffnet die Detailansicht,
         <b>Live</b> (bei laufenden Sendungen) spielt den Sender im Browser ab (siehe <a href="#help?t=streaming">Streaming im Browser</a>).
         Der Schalter <span class="kbd"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.01"/></svg> Auto/Ein/Aus</span> in der Werkzeugleiste legt fest, wann das Feld verwendet wird
         (gespeichert je Gerät):</p>
         <table class="help-table">
            <tr><th>Auto</th><td>nur bei großen Fenstern (ab 900×700), sonst die Detailansicht</td></tr>
            <tr><th>Ein</th><td>immer das Infofeld – am Handy in kompakter Form</td></tr>
            <tr><th>Aus</th><td>immer die Detailansicht</td></tr>
         </table>
         <h4>Tastatur</h4>
         <table class="help-table">
            <tr><th>← / →</th><td>vorherige / nächste Sendung des Kanals (die erste Taste wählt die Sendung links im Bild)</td></tr>
            <tr><th>↑ / ↓</th><td>Kanal darüber / darunter, die Zeitspalte bleibt dabei erhalten; Kanäle ohne Daten werden übersprungen</td></tr>
            <tr><th>Bild ↑ / Bild ↓</th><td>eine Bildschirmseite Kanäle</td></tr>
            <tr><th>Pos1</th><td>die laufende Sendung des Kanals</td></tr>
            <tr><th>Enter</th><td>Infofeld bzw. Detailansicht; ein offenes Infofeld folgt der Auswahl</td></tr>
            <tr><th>Esc</th><td>Infofeld schließen</td></tr>
            <tr><th>Strg + Pfeiltasten</th><td>Raster scrollen</td></tr>
         </table>`
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
            <li><b>Live</b> – zeigt den Sender im Browser (bei laufenden Sendungen, siehe unten).</li>
            <li><b>Wiederholungen</b> – sucht weitere Ausstrahlungen mit exakt diesem Titel.</li>
            <li><b>« / »</b> – vorherige / nächste Sendung auf diesem Kanal (auch mit den Pfeiltasten).</li>
         </ul>
         <div id="h_live">
            <h4>Live-TV im Browser</h4>
            <p>Der Knopf <b>Live</b> erscheint bei laufenden Sendungen und spielt den Sender im Browser ab (auch iPhone/iPad) –
            Voraussetzungen und Einstellungen unter <a href="#help?t=streaming">Streaming im Browser</a>.</p>
         </div>
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
            <li>Ein Klick auf eine Aufnahme öffnet die Detailansicht mit <b>Abspielen</b> (auf dem VDR), <b>Im Browser abspielen</b>
                (siehe <a href="#help?t=streaming">Streaming im Browser</a>), <b>Umbenennen/Verschieben</b> und <b>Löschen</b>.</li>
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
      id: 'streaming', title: 'Streaming im Browser',
      html: `
         <p>Aufnahmen und laufende Sendungen lassen sich direkt im Browser ansehen – am PC, Tablet und auf dem Handy,
         auch auf iPhone und iPad. Dafür setzt ffmpeg auf dem epgd-Host das Video in einen HLS-Stream um, den alle
         aktuellen Browser abspielen.</p>
         <ul>
            <li><b>Aufnahmen</b>: Knopf <b>Im Browser abspielen</b> in der Detailansicht einer Aufnahme. Springen mit dem
                Schieberegler und den Knöpfen (±1 / ±10 Minuten).</li>
            <li><b>Live-TV</b>: Knopf <b>Live</b> bei laufenden Sendungen – in der Detailansicht, auf den Kacheln der
                Programm-Ansicht und im Infofeld der Zeitleiste. Bis zu 30 Minuten zurückspulen (Timeshift),
                <b>● Live</b> springt wieder zum aktuellen Bild bzw. startet einen beendeten Stream neu. Das Bild läuft
                etwa 6 bis 15 Sekunden hinter dem Fernseher.</li>
            <li>Beides braucht das Benutzerrecht <i>Aufnahmen</i>.</li>
         </ul>
         <div id="h_streamReq">
            <h4>Voraussetzungen</h4>
            <ul>
               <li><b>ffmpeg</b> (mit ffprobe) auf dem epgd-Host – fehlt es, sagt der Player, welches Paket nötig ist.</li>
               <li>Aufnahmen: das Videoverzeichnis des VDR muss auf dem epgd-Host erreichbar sein (lokal oder per NFS).</li>
               <li>Live-TV: auf einem VDR läuft das Plugin <b>streamdev-server</b> mit eingeschaltetem <b>HTTP-Server</b>
                   (Standard-Port 3000) und der epgd-Host ist in <code>streamdevhosts.conf</code> freigegeben.
                   Das VTP-Protokoll (Port 2004) der streamdev-clients kann ffmpeg nicht lesen.
                   Den HTTP-Server schaltet man im Plugin-Setup am OSD ein (wirkt sofort) oder bei gestopptem VDR in der
                   <code>setup.conf</code> (<code>streamdev-server.StartHTTPServer = 1</code>) – der VDR schreibt die
                   setup.conf beim Beenden zurück.</li>
            </ul>
         </div>
         <div id="h_streamSettings">
            <h4>Einstellungen</h4>
            <p>Unter <a href="#settings?tab=system">Einstellungen › System</a>:</p>
            <table class="help-table">
               <tr id="h_p_liveStreamUrl"><th>Stream-URL von streamdev-server</th><td>wo der VDR für Live-TV erreicht wird, z.B. <code>http://vdr:3000/TS/</code> –
                  die Kanal-ID wird angehängt, alternativ setzt der Platzhalter <code>{channelid}</code> sie an beliebiger Stelle ein.
                  Leer = Live-TV aus (kein Knopf <b>Live</b>).<br>
                  <b>Vorbelegung:</b> solange der Wert nie gespeichert wurde, prüft epghttpd beim Start (und danach alle
                  5 Minuten) die angemeldeten VDRs der Reihe nach auf Port 3000 und trägt den ersten, der antwortet, ein.
                  Ein selbst gespeicherter Wert – auch ein leerer – wird nie überschrieben.</td></tr>
               <tr id="h_p_streamEncoder"><th>Browser-Streams umkodieren mit</th><td><i>automatisch</i> nimmt die GPU per VAAPI, wenn ein kurzer Test klappt,
                  sonst die CPU per x264. Zur Auswahl stehen nur die Verfahren, die auf dem epgd-Host funktionieren.</td></tr>
               <tr id="h_p_streamX264Preset"><th>x264-Preset</th><td>nur für x264: schnellere Presets brauchen weniger CPU, dafür steigt die Bitrate.</td></tr>
               <tr id="h_p_streamMaxHeight"><th>Browser-Streams verkleinern auf</th><td>umkodierte Streams auf diese Höhe verkleinern (spart CPU und Bandbreite,
                  z.B. unterwegs); bei einer kleineren Höhe als die des Senders wird auch sonst nur kopiertes Video umkodiert.</td></tr>
            </table>
         </div>
         <div id="h_streamEncode">
            <h4>Kopieren oder umkodieren</h4>
            <ul>
               <li><b>Kopiert</b> wird progressives H.264 mit IDR-Frames (z.B. ZDF HD, 720p) – das kostet fast keine CPU.</li>
               <li><b>Umkodiert</b> werden 1080i (deinterlaced), SD in MPEG-2 und Sender ohne IDR-Frames (z.B. Das Erste HD,
                   phoenix HD) – deren Segmente kann der Browser sonst nicht dekodieren (<i>bufferAppendError</i>).
                   Das Ergebnis der Prüfung eines Senders merkt sich epghttpd einen Tag lang, dadurch startet der Stream beim
                   nächsten Mal schneller.</li>
               <li>Mit <b>VAAPI</b> (z.B. Intel-Grafik, Treiber <code>i965-va-driver</code> für ältere bzw.
                   <code>intel-media-va-driver</code> für neuere CPUs) dekodiert, deinterlaced und kodiert die GPU – ein 1080i-Stream
                   braucht dann nur wenige Prozent eines CPU-Kerns. Mit <b>x264</b> sind es ein bis zwei Kerne.</li>
               <li>Der Player zeigt unten das Format und das Verfahren an, z.B. <i>H264 720p, umkodiert (GPU)</i>.</li>
               <li>UHD (H.265) wird nicht unterstützt.</li>
            </ul>
         </div>
         <div id="h_streamTuner">
            <h4>Tuner und Sitzungen</h4>
            <ul>
               <li>Jeder Live-Stream belegt einen Tuner des VDR (wie ein streamdev-client). Wird er für eine Aufnahme gebraucht,
                   endet der Stream und der Player meldet das.</li>
               <li>Beim Schließen des Players endet der Stream sofort, nach einem Verbindungsabbruch nach 30 Sekunden
                   (Aufnahmen: 60 Sekunden). Höchstens 4 Streams laufen gleichzeitig, ein weiterer beendet den ältesten.</li>
            </ul>
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
                und verworfen, wenn sie schon aufgenommen wurden. Status <i>Timer abgelehnt</i>: die Sendung eines
                Suchtimer-Timers ist nicht mehr im EPG (entfallen oder vom Anbieter neu angelegt), der Timer wurde daher wieder entfernt.
                Über die Auswahl im Spaltenkopf <i>Status</i> filterst du nach Status. Mit <i>bearbeiten</i> kannst du Einträge
                markieren – auch alle oder eine ganze Status-Gruppe – und gemeinsam löschen.</li>
            <li><b>asynchrone Aufträge</b> – neue oder gelöschte Timer, die ein VDR noch nicht abgeholt hat.</li>
            <li><b>Meldungen</b> – Meldungen von epgd zu Timern (Suchtimer-Aktionen, Timerkonflikte); als gelesen markieren
                oder löschen. Ältere Meldungen löscht epgd nach der unter <i>Einstellungen → System</i> eingestellten Zahl von Tagen.</li>
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
         <div id="h_sTWakeup">
            <h5>Wecken (Std. vorher)</h5>
            <p>Nur bei einem festen VDR (nicht <i>Auto</i>) und Aufnahme: solange der VDR den Timer noch nicht übernommen hat,
            weckt epgd ihn per Wake-on-LAN, sobald der Timer in weniger als dieser Anzahl Stunden beginnt.
            Leer bedeutet 48, <i>0</i> schaltet das Wecken für diesen Timer ab.</p>
            <p>Der VDR wird nur zur Übernahme geweckt; zur Aufnahme selbst muss er sich über seinen eigenen Wakeup-Mechanismus wecken.</p>
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
            <li><b>Kanäle</b> – Reihenfolge und Sichtbarkeit der Kanäle in der Weboberfläche (Details unten).</li>
            <li><b>Benutzer</b> – Benutzer der Weboberfläche mit ihren Rechten. Ein Recht schließt seine Unterrechte ein.</li>
            <li><b>System</b> – Login-Pflicht und alle Parameter des epgd-Backends, darunter die Einstellungen für das
                <a href="#help?t=streaming">Streaming im Browser</a>.
                Die Login-Pflicht lässt sich nur einschalten, wenn es einen aktiven Benutzer gibt.</li>
            <li><b>VDRs</b> – die VDRs mit epg2vdr und der epgd selbst.</li>
         </ul>
         <div id="h_optChannels">
            <h4>Kanäle</h4>
            <ul>
               <li>Reihenfolge per Ziehen am Griff ändern (auch per Touch), jeweils innerhalb einer Gruppe –
                   die Liste ist nach den Kanalgruppen geordnet.</li>
               <li>Der Haken steuert die Anzeige im Web-Interface.</li>
               <li>Name und Gruppe kommen aus der Kanalliste des VDR (epg2vdr mit aktivem EPG-Handler) und passen so
                   zu den Kanallogos des OSD; sie werden hier nur angezeigt.</li>
               <li>Rechts stehen die Quellen des Kanals mit ihrem Merge-Wert aus der channelmap
                   (0 kein Merge, 1 führend, 2 Fallback, 3 Fallback + Bilder, siehe <i>EPG Merge</i>).</li>
               <li>Ein Klick auf das Logo zeigt, wie es gesucht wird (Schlüssel, Verzeichnis, Datei).</li>
               <li>Filter und die Aktionen <i>Alle sichtbar</i> / <i>Alle ausblenden</i> wirken auf die gefilterten Kanäle.</li>
               <li>Über die <i>Referenzliste</i> (channels.conf eines VDR oder eingefügter Text) kann die Reihenfolge
                   übernommen werden.</li>
            </ul>
         </div>
         <div id="h_optVdrs">
            <h4>VDRs</h4>
            <ul>
               <li>Alle Einträge der Tabelle vdrs: die VDRs mit epg2vdr und der epgd selbst.</li>
               <li>Ein gelöschter VDR trägt sich beim nächsten Start bzw. Update von epg2vdr wieder ein.</li>
               <li>Bei nicht verbundenen VDRs prüft epghttpd den SVDRP-Port: <i>Host aus</i> (keine Antwort),
                   <i>Host an, VDR aus</i> (Verbindung abgelehnt) oder <i>VDR läuft, nicht verbunden</i>.</li>
               <li><b>Wecken</b> schickt bei ausgeschaltetem Host ein Wake-on-LAN (nur mit bekannter MAC-Adresse).
                   Läuft der Host und nur VDR nicht (z.B. ein VDR, der nur bei Bedarf gestartet wird), heißt der Knopf
                   <b>VDR starten</b> und ruft das <a href="#help?t=p_vdrStartScript">Start-Skript</a> auf – nur wenn eines eingestellt ist.</li>
               <li><b>Fernbedienung</b> öffnet die Fernbedienung des osd2web-Plugins (<code>http://&lt;IP&gt;:&lt;osd2web-Port&gt;/fb.html</code>)
                   in einem Dialog. Der Knopf ist nur aktiv, wenn
                  <ul>
                     <li>der VDR verbunden ist (Status <i>attached</i>),</li>
                     <li>das osd2web-Plugin ab Version 0.3.7 geladen ist – epg2vdr trägt dann beim Verbinden den
                         osd2web-Port in die Tabelle vdrs ein (Feld <i>osd2web-Port</i>; nach einem Update des Plugins
                         den VDR neu starten),</li>
                     <li>und der Browser den osd2web-Port des VDR direkt erreicht (Antwort innerhalb von 4 Sekunden).
                         Wird das Webinterface per HTTPS aufgerufen, blockiert der Browser den Zugriff auf das per HTTP
                         angebotene osd2web.</li>
                  </ul>
                  Der Tooltip des ausgegrauten Knopfs nennt den Grund.</li>
            </ul>
         </div>
         <h4>Profil im Einzelnen</h4>
         <p>Die <b>?</b>-Knöpfe auf der Einstellungsseite zeigen den jeweiligen Abschnitt.</p>
         <div id="h_p_startPage" class="help-param">
            <h5>Startseite</h5>
            <p>Die Seite, die beim Aufruf der Weboberfläche ohne Seitenadresse (z.B. über ein Lesezeichen auf die
            Startadresse) geöffnet wird. Mit <i>zuletzt besuchte Seite</i> geht es dort weiter, wo du in diesem
            Browser aufgehört hast (inkl. Reiter, z.B. Timer › Suchtimer).</p>
         </div>
         <div id="h_p_defaultVDRuuid" class="help-param">
            <h5>Standard-VDR</h5>
            <p>Der VDR, der beim Öffnen der Weboberfläche oben rechts ausgewählt ist – auf ihm wird umgeschaltet und
            abgespielt. Ohne Angabe ist es der erste VDR der Liste. Die Auswahl oben rechts kann jederzeit geändert werden.</p>
         </div>
         <div id="h_p_quickTimes" class="help-param">
            <h5>Schnellzeiten</h5>
            <p>Eigene Zeitpunkte und Suchen für die Knöpfe in <a href="#help?t=now">Programm</a>, Magazin und Zeitleiste,
            eine pro Zeile im Format <code>Bezeichnung=Wert</code>:</p>
            <ul>
               <li><code>Primetime=20:15</code> – eine Uhrzeit; im Magazin und in der Zeitleiste wird sie als Linie
                   eingezeichnet, mit <code>!</code> davor (<code>Spät=!23:00</code>) ohne Linie.</li>
               <li><code>Jetzt=@Now</code>, <code>Danach=@Next</code> – die laufenden bzw. nachfolgenden Sendungen.</li>
               <li><code>Tipps=@Name</code> – das Ergebnis der gespeicherten Suche <i>Name</i>.</li>
            </ul>
         </div>
         <div id="h_p_maxListEntries" class="help-param">
            <h5>Max. Einträge</h5>
            <p>Wie viele Einträge höchstens auf einmal vom Server geladen werden, z.B. bei der Suche, der Trefferliste eines
            Suchtimers, den Wiederholungen einer Sendung und in den Timerlisten. Standard: 100.</p>
         </div>
         <div id="h_p_constabelLoginPath" class="help-param">
            <h5>Constabel-Login</h5>
            <p>Der persönliche Login-Link von <a href="https://www.eplists.de" target="_blank" rel="noopener">eplists.de</a>
            (zu finden im eigenen Konto dort). Damit kann die Episodenliste einer Serie aus der Detailansicht heraus direkt bei
            eplists.de bearbeitet werden, siehe <a href="#help?t=constabel">Constabel Episodenliste</a>.</p>
         </div>
         <div id="h_p_namingMode" class="help-param">
            <h5>Dateinamen von Timern und Suchtimern</h5>
            <p>Die Vorgabe für die Ermittlung des Dateinamens neuer Timer bzw. Suchtimer, getrennt nach Serien und
            Filmen / sonstigen Sendungen. Beim Anlegen eines Timers kann der Modus geändert werden. Die Modi sind unter
            <a href="#help?t=sTNameMode">Ermittlung des Dateinamens</a> beschrieben; beim Modus <i>Template</i> erscheint
            ein Feld für das Template.</p>
         </div>
         <div id="h_p_chFormat" class="help-param">
            <h5>bevorzugtes Sendeformat</h5>
            <p>Vorgabe für neue Suchtimer: läuft eine Sendung auf einem SD- und einem HD-Sender, bestimmt die Reihenfolge
            (z.B. <i>HD,SD</i>), welche aufgenommen wird.</p>
         </div>
         <div id="h_p_timerDefaultVDRuuid" class="help-param">
            <h5>VDR für neue Timer</h5>
            <p>Der VDR, der neue Timer aufnimmt. Bei <i>Auto</i> beauftragt epgd einen gerade freien VDR.</p>
         </div>
         <div id="h_p_mailReceiver" class="help-param">
            <h5>E-Mail und Benachrichtigungen</h5>
            <p>An diese Adresse schickt epgd Mails zu den Meldungen der gewählten Arten (Information, Warnung, Fehler,
            fataler Fehler) – z.B. zu Suchtimer-Aktionen und Timerkonflikten. Gesendet wird über das unter
            <i>System</i> eingestellte Mail-Skript. <i>Test</i> schickt eine Testmail an die eingegebene Adresse.</p>
         </div>
         <div id="h_p_searchAdv" class="help-param">
            <h5>Suchoptionen standardmäßig anzeigen</h5>
            <p>Die erweiterten Optionen der <a href="#help?t=search">Suche</a> sind beim ersten Aufruf aufgeklappt.
            Danach merkt sich der Browser, ob sie zuletzt auf- oder zugeklappt waren.</p>
         </div>
         <div id="h_p_recordSubFolderSort" class="help-param">
            <h5>Sortierung der Unterordner</h5>
            <p>Vorgabe für die Sortierung der <a href="#help?t=records">Aufnahmen</a>, solange im Browser keine andere
            Sortierung gewählt wurde.</p>
         </div>
         <div id="h_p_startWithSched" class="help-param">
            <h5>EPG Menü startet mit Schedule</h5>
            <p>Das Programm-Menü von epg2vdr am OSD des VDR startet mit dem Programm des aktuellen Kanals statt mit
            der Übersicht <i>Was läuft jetzt</i>.</p>
         </div>
         <div id="h_p_osdTimerNotify" class="help-param">
            <h5>Info bei Timer-Übernahme</h5>
            <p>Der VDR zeigt am OSD eine kurze Meldung, wenn er einen Timer-Auftrag aus der Weboberfläche bzw. von einem
            Suchtimer ausgeführt hat (Timer angelegt, geändert oder gelöscht). Ist der Login eingeschaltet, gilt die
            Einstellung des Benutzers, mit dem epg2vdr angemeldet ist.</p>
         </div>
         <h4>System im Einzelnen</h4>
         <div id="h_p_needLogin" class="help-param">
            <h5>Login erforderlich</h5>
            <p>Die Weboberfläche ist nur nach Anmeldung nutzbar, jeder Benutzer hat dann eigene Profil-Einstellungen und die
            im Tab <i>Benutzer</i> vergebenen Rechte. Einschalten lässt sich der Login nur, wenn es einen aktiven Benutzer
            gibt – sonst würde man sich aussperren. Nach dem Speichern lädt die Seite neu.</p>
         </div>
         <div id="h_p_manualTimer2Done" class="help-param">
            <h5>Manuelle Timer in die Auftragshistorie übernehmen</h5>
            <p>In der Weboberfläche zu einer Sendung angelegte Timer werden in die <i>Auftragshistorie</i> eingetragen.
            Suchtimer, die Wiederholungen vermeiden, erkennen die Sendung damit als bereits aufgenommen.</p>
         </div>
         <div id="h_p_timerJobFailedHistory" class="help-param">
            <h5>Fehlgeschlagene Timeraufträge aufbewahren</h5>
            <p>Nach wie vielen Tagen epgd fehlgeschlagene Timeraufträge (z.B. ein VDR war nicht erreichbar) löscht.</p>
         </div>
         <div id="h_p_messageHistory" class="help-param">
            <h5>Meldungen aufbewahren</h5>
            <p>Nach wie vielen Tagen epgd die Meldungen (Timer › Meldungen) löscht; 0 behält sie unbegrenzt.</p>
         </div>
         <div id="h_p_recCompleteMinPct" class="help-param">
            <h5>Aufnahme gilt als vollständig ab (%)</h5>
            <p>Am Ende einer Aufnahme vergleicht epg2vdr die aufgenommene Länge mit der Länge des Timers. Ist weniger als
            dieser Anteil aufgenommen (z.B. nach einem Empfangsabbruch), gilt die Aufnahme als fehlgeschlagen und wird in der
            Auftragshistorie so markiert – Suchtimer können die Sendung dann erneut aufnehmen. Für Timer mit VPS gilt der
            eigene, meist niedrigere Wert, da VPS-Aufnahmen oft kürzer als der Timer sind. Standard: 98 bzw. 90 %.</p>
         </div>
         <div id="h_p_recCheckLateManualTimer" class="help-param">
            <h5>Länge verspätet gestarteter manueller Timer</h5>
            <p>Eingeschaltet (Standard) wird auch bei einem manuellen Timer, der erst nach seinem Beginn angelegt wurde (die
            Sendung lief schon), die Länge ab Timerbeginn geprüft – die Aufnahme gilt dann meist als unvollständig.
            Ausgeschaltet zählt bei solchen Timern nur die Zeit ab dem Aufnahmestart.</p>
         </div>
         <div id="h_p_logo" class="help-param">
            <h5>Kanallogos</h5>
            <p>Die Logos liegen im Verzeichnis <code>channellogos</code> der Weboberfläche. Der Dateiname ist der
            Kanalname, bzw. mit <i>über die Kanal-ID</i> die Kanal-ID (z.B. <code>s19.2e-1-1019-10301.png</code>), in Klein-
            oder – eingeschaltet – Großbuchstaben, dazu die <i>Dateiendung</i> (Standard <code>png</code>; bei <code>svg</code>
            wird ersatzweise auch <code>png</code> gesucht). <i>Kanalname neben dem Logo</i> zeigt zusätzlich den Namen an.
            Unter <i>Kanäle</i> zeigt ein Klick auf ein Logo, wie es gesucht wird.</p>
         </div>
         <div id="h_p_mailScript" class="help-param">
            <h5>Skript für den Mailversand</h5>
            <p>Das Programm, über das epgd Mails verschickt (Standard: <code>epgd-sendmail</code> im bin-Verzeichnis
            des epgd). Es muss auf dem epgd-Host den Mailversand erledigen können.</p>
         </div>
         <div id="h_p_vdrStartScript" class="help-param">
            <h5>Skript zum Starten eines VDR</h5>
            <p>Für VDRs, deren Rechner immer läuft, VDR selbst aber nur bei Bedarf gestartet wird. Ist der Host erreichbar und
            nur der SVDRP-Port zu, ruft <b>VDR starten</b> (Übersicht und Einstellungen › VDRs) dieses Programm mit Name, IP
            und UUID des VDR auf; die Ausgabe wird angezeigt, ein Exit-Code ungleich 0 gilt als Fehler. Mitgeliefert wird
            <code>epgd-startvdr</code> im bin-Verzeichnis des epgd, es startet per ssh als root <code>systemctl start vdr</code>
            (dafür muss sich der Benutzer von epghttpd per Schlüssel auf dem VDR-Host anmelden können). Leer = aus.</p>
         </div>
         <div id="h_p_eloquence" class="help-param">
            <h5>Log-Ausgaben</h5>
            <p>Welche Arten von Meldungen epgd und epghttpd ins Log (syslog/journal) schreiben. Für die Fehlersuche
            können weitere Stufen zugeschaltet werden, im Normalbetrieb genügen <i>Error</i>, <i>Warning</i> und <i>Info</i>.</p>
         </div>
         <p>Die Einstellungen für Live-TV und Aufnahmen im Browser stehen unter <a href="#help?t=streamSettings">Streaming im Browser › Einstellungen</a>.</p>`
   },
   {
      id: 'merge', title: 'EPG Merge',
      html: `
         <p>Der epgd führt für die <b>nächsten 72 Stunden</b> die Sendungen aus dem DVB-Stream mit denen der externen
         Anbieter (Plugins, z. B. tvm) zusammen. Der <b>DVB-Stream ist die Hauptquelle</b>; er wird durch die externen
         EPG-Daten und die Seriendaten von constabel.net (eplists.de) angereichert.</p>
         <ul>
            <li>Lassen sich zwei Sendungen zusammenführen, werden vom DVB-Stream nur <b>Startzeit, Dauer und VPS-Kennung</b>
                übernommen, alles andere (Texte, Bilder, Bewertungen …) kommt vom externen Anbieter.</li>
            <li>Zusammengeführt werden Sendungen mit bis zu <b>20 Minuten</b> Abweichung der Startzeit, abhängig von Titel
                und Dauer.</li>
            <li>Lassen sich DVB- und externe Sendung nicht zusammenführen (z. B. bei kurzfristigen Programmänderungen),
                wird die <b>DVB-Sendung</b> angezeigt – so erscheinen keine falschen Sendungen.</li>
            <li>Durch das Zusammenführen stehen auch die vom DVB-Stream gelieferten Komponenten (Bildformat, Tonspuren …)
                zur Verfügung – allerdings nur für DVB- und zusammengeführte Sendungen, nicht für Sendungen, die nur vom
                externen Anbieter kommen (z. B. weiter als 72 Stunden in der Zukunft).</li>
         </ul>
         <h4>Rolle eines Anbieters je Kanal (channelmap.conf)</h4>
         <p>Das Verhalten wird in der <i>channelmap.conf</i> über den <b>merge</b>-Wert jeder Zeile festgelegt. Er bestimmt
         die Rolle des Anbieters auf diesem Kanal – er ist kein Kürzel für einen Anbieter, jeder Anbieter kann auf jedem
         Kanal jede Rolle haben.</p>
         <table class="help-table">
            <tr><th>merge</th><th>Rolle</th></tr>
            <tr><td>0</td><td>kein Abgleich mit dem DVB-Stream für diesen Kanal</td></tr>
            <tr><td>1</td><td>führender Anbieter (Standard) – seine Sendungen werden mit dem DVB-Stream zusammengeführt</td></tr>
            <tr><td>2</td><td>Rückfall – wird im Hintergrund gehalten und verwendet, wenn der führende Anbieter schlechtere
                              Daten liefert (keine passende Sendung, kein Bild …)</td></tr>
            <tr><td>3</td><td>wie 2, zusätzlich ersetzen die <b>Bilder</b> dieses Anbieters die Bilder der passenden Sendung des
                              führenden Anbieters (gleicher Kanal, Start ±60 Sekunden, ähnliche Dauer) – die Texte bleiben
                              vom führenden Anbieter</td></tr>
         </table>
         <p>Beispiel – Texte von tvm, Bilder von einem zweiten Anbieter:</p>
         <pre>tvm:1     = S19.2E-1-1019-10301   // merge 1 (Standard)
xyz:373:3 = S19.2E-1-1019-10301   // Rückfall + Bilder</pre>
         <p>Eine Änderung des merge-Werts lädt die Sendungen dieses Anbieters für den Kanal neu.</p>
         <h4>Anzeige in der Detailansicht</h4>
         <ul>
            <li><b>Quelle DVB/TVM</b> – zusammengeführte Sendung: Zeiten vom DVB-Stream, Texte vom Anbieter TVM
                (nur <b>DVB</b> bzw. nur <b>TVM</b>, wenn die Sendung aus einer einzigen Quelle stammt).</li>
            <li><b>Bild …</b> – von welchem Anbieter das Bild stammt; bei merge 3 kann das ein anderer sein als der der Texte.</li>
         </ul>`
   },
   {
      id: 'about', title: 'Über',
      html: `
         <h4>Programmierung</h4>
         <p>Backend (epg daemon, http daemon): Jörg Wendel<br>
         SQL/Procedures: Christian Kaiser<br>
         Frontend (Web): Jörg Wendel, ursprüngliche Version: Dirk Hermes<br>
         VDR-Plugin epg2vdr: Jörg Wendel<br>
         VDR-Plugin scraper2vdr: Stefan Braun</p>
         <p>Die Weboberfläche verwendet <a href="https://jquery.com" target="_blank" rel="noopener">jQuery</a> (MIT-Lizenz).</p>
         <details class="help-file" data-src="/HISTORY.h"><summary>Historie</summary><pre></pre></details>
         <details class="help-file" data-src="/TODO"><summary>ToDo's</summary><pre></pre></details>`
   }
];
