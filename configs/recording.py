#  ------------------------------------------------------------------------------------------# ----------------------------------------------------
# - after importing 'event' the event object is available
#   with the following methods:
#
#      title
#      shorttext
#      starttime
#      year
#      category
#      episodname
#      shortname
#      partname
#      season
#      part
#      number
#      extracol1
#      extracol2
#      extracol3
#
#      namingmode      -> timers naming mode { 1,2,3,4,5 } - see epgservice.h
#      tmplExpression
#
# - implement at least the function 'name()' witch have to return the name of the recording
#   if the result was empty VDRs typical recording name will be used
#  ------------------------------------------------------------------------------------------

import event

def name():

    import locale
    locale.setlocale(locale.LC_ALL, 'de_DE.UTF-8')
    import time

    if event.namingmode() == 1: # Auto

        if event.episodname():
            if event.shortname():
                title = event.shortname()
            else:
                title = event.episodname()

            part = "%02i" % int(event.part())
            number = "%03i" % int(event.number())

            if event.title() == 'Tatort':
                if event.extracol1():
                    ermittler = event.extracol1()[11:]
                else:
                    ermittler = ''

                if event.extracol2():
                    ort = event.extracol2()[5:]
                else:
                    ort = ''

                season = str(int(event.season())+1969)
                return "Tatort~" + ort + "~" + ermittler + "~" + season + "x" + part + " - " + number + ". " + event.shorttext()

            else:
                if event.title() == 'Polizeiruf 110':
                    season = str(int(event.season())+1971)
                else:
                    season = "%02i" % int(event.season())

                return title + "~" + season + "x" + part + " - " + number + ". " + event.shorttext()

        elif event.category() == 'Serie':
            if event.shorttext() and event.title() != event.shorttext():
                return event.title() + "~" + event.shorttext()
            else:
                return event.title() + "~" + time.strftime("%a %d.%m.%Y %H:%M", time.localtime(event.starttime()))
        else:
            return event.title()


    elif event.namingmode() == 2:   # Constable

        if event.episodname():
            if event.shortname():
                title = event.shortname()
            else:
                title = event.episodname()

            part = "%02i" % int(event.part())
            number = "%03i" % int(event.number())

            if event.title() == 'Tatort':
                if event.extracol1:
                    ermittler = event.extracol1()[11:]
                else:
                    ermittler = ''

                if event.extracol2():
                    ort = event.extracol2()[5:]
                else:
                    ort = ''

                season = str(int(event.season())+1969)
                return "Tatort~" + ort + "~" + ermittler + "~" + season + "x" + part + " - " + number + ". " + event.shorttext()

            else:
                if event.title() == 'Polizeiruf 110':
                    season = str(int(event.season())+1971)
                else:
                    season = "%02i" % int(event.season())

                return title + "~" + season + "x" + part + " - " + number + ". " + event.shorttext()

        elif event.shorttext() and event.title() != event.shorttext():
            return event.title() + "~?x? - ?. " + event.shorttext()
        else:
            return event.title() + "~" + time.strftime("%a %d.%m.%Y %H:%M", time.localtime(event.starttime()))

    elif event.namingmode() == 3:  # Serie
        if event.shorttext() and event.title() != event.shorttext():
            return event.title() + "~" + event.shorttext()
        else:
            return event.title()

    elif event.namingmode() == 4:  # Kategorisiert
        if event.category():
            return event.category() + "~" + event.title()
        else:
            return event.title()

    elif event.namingmode() == 5:  # User (has to be defined/configured by User
        return event.title()

    elif event.namingmode() == 6:
        if event.tmplExpression() == "":
            return event.title()

        recording = event.tmplExpression()
        recording = recording.replace("%title%", event.title())
        recording = recording.replace("%shorttext%", event.shorttext())
        recording = recording.replace("%starttime%", time.strftime("%a %d.%m.%Y %H:%M", time.localtime(event.starttime())))
        recording = recording.replace("%year%", event.year())
        recording = recording.replace("%category%", event.category())
        recording = recording.replace("%episodname%", event.episodname())
        recording = recording.replace("%shortname%", event.shortname())
        recording = recording.replace("%partname%", event.partname())
        recording = recording.replace("%season%", "%02i" % int(event.season()))
        recording = recording.replace("%part%", "%02i" % int(event.part()))
        recording = recording.replace("%number%", "%02i" % int(event.number()))
        recording = recording.replace("%extracol1%", event.extracol1())
        recording = recording.replace("%extracol2%", event.extracol2())
        recording = recording.replace("%extracol3%", event.extracol3())

        recording = recording.replace("/", "~")

        return recording

    else:
        return event.title()
