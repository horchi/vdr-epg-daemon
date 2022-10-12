<xsl:stylesheet	version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/TR/xhtml1/strict"
                xmlns:exsl="http://exslt.org/common"
                xmlns:date="http://exslt.org/dates-and-times"
                xmlns:str="http://exslt.org/strings">


<xsl:template match="/">

    <events>

	<xsl:for-each select="//data">

	    <event>
	    <xsl:attribute name="id"><xsl:value-of select="d0"/></xsl:attribute>
	    <xsl:attribute name="provid"><xsl:value-of select="d2"/></xsl:attribute>

	    <starttime>
		<xsl:call-template name="date2UTC">
		    <xsl:with-param name="date" select="str:replace(d4,' ','T')"/>
		</xsl:call-template>
	    </starttime>

	    <duration><xsl:value-of select="d7*60"/></duration>

	    <xsl:if test="string-length(d8)">
		<vps>
		    <xsl:call-template name="date2UTC">
			<xsl:with-param name="date" select="concat(substring-before(d4,' '),'T',d8,':00')"/>
		    </xsl:call-template>
		</vps>
	    </xsl:if>

	    <title><xsl:value-of select="d19"/></title>
	    <xsl:if test="string-length(d20)"><shorttext><xsl:value-of select="d20"/></shorttext></xsl:if>

            <xsl:choose>
                <xsl:when test="d19='Tatort'">
                    <category><xsl:text>Serie</xsl:text></category>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:if test="d10 &gt; 0"><category><xsl:call-template name="getCATEGORY"><xsl:with-param name="categoryid" select="d10"/></xsl:call-template></category></xsl:if>
                </xsl:otherwise>
            </xsl:choose>

	    <xsl:if test="string-length(d25)"><genre><xsl:call-template name="getGenre"><xsl:with-param name="genreid" select="d25"/></xsl:call-template></genre></xsl:if>

	    <xsl:if test="string-length(d16)"><parentalrating><xsl:value-of select="d16"/></parentalrating></xsl:if>

	    <xsl:if test="string-length(d21)"><longdescription><xsl:value-of select="d21"/></longdescription></xsl:if>

	    <xsl:if test="string-length(d1)"><movieid><xsl:value-of select="d1"/></movieid></xsl:if>

	    <xsl:variable name="TIPP">
		<xsl:if test="d18 = 1"><xsl:text>TagesTipp</xsl:text></xsl:if>
		<xsl:if test="d18 = 2"><xsl:text>TopTipp</xsl:text></xsl:if>
	    </xsl:variable>
	    <xsl:if test="d18 &gt; 0"><tipp><xsl:value-of select="$TIPP"/></tipp></xsl:if>

            <xsl:if test="string-length(d30) and d30 &gt; 0">
                <xsl:choose>
                    <xsl:when test="d30 &gt; 1"><numrating><xsl:value-of select="d30 -1"/></numrating></xsl:when>
                    <xsl:otherwise><numrating><xsl:value-of select="d30"/></numrating></xsl:otherwise>
                </xsl:choose>
            </xsl:if>

            <xsl:choose>
                <xsl:when test="d30 = 5">
                    <txtrating>Sehr empfehlenswert</txtrating>
                </xsl:when>
                <xsl:when test="d30 = 4">
                    <txtrating>Empfehlenswert</txtrating>
                </xsl:when>
                <xsl:when test="d30 = 3">
                    <txtrating>Eher durchschnittlich</txtrating>
                </xsl:when>
                <xsl:when test="d30 = 2 or d30 = 1">
                    <txtrating>Eher uninteressant</txtrating>
                </xsl:when>
            </xsl:choose>

<!--
	    <xsl:if test="d30 &gt; 0"><rating><xsl:call-template name="getRATING"><xsl:with-param name="ratingid" select="d30"/></xsl:call-template></rating></xsl:if>
-->
	    <xsl:if test="string-length(d32)"><country><xsl:value-of select="str:replace(d32,'|','/')"/></country></xsl:if>
	    <xsl:if test="string-length(d33)"><year><xsl:value-of select="d33"/></year></xsl:if>
	    <xsl:if test="string-length(d34)"><moderator><xsl:value-of select="str:replace(d34,'|',', ')"/></moderator></xsl:if>
	    <xsl:if test="string-length(d35)"><guest><xsl:value-of select="str:replace(d35,' -',',')"/></guest></xsl:if>
	    <xsl:if test="string-length(d36)"><director><xsl:value-of select="str:replace(d36,'|',', ')"/></director></xsl:if>
	    <xsl:if test="string-length(d37)"><actor><xsl:value-of select="str:replace(str:replace(d37,') -','), '),'  ',' ')"/></actor></xsl:if>

	    <xsl:variable name="AUDIO">
		<xsl:if test="d28=1"><xsl:text> DolbyDigital</xsl:text></xsl:if>
		<xsl:if test="d27=1"><xsl:text> Stereo</xsl:text></xsl:if>
		<xsl:if test="d12=1"><xsl:text> Zweikanal</xsl:text></xsl:if>
	    </xsl:variable>

	    <xsl:if test="string-length($AUDIO)">
		<audio><xsl:value-of select="normalize-space($AUDIO)"/></audio>
	    </xsl:if>

	    <xsl:variable name="FLAGS">
		<xsl:if test="d9=1"><xsl:text> [PrimeTime]</xsl:text></xsl:if>
		<xsl:if test="d11=1"><xsl:text> [SchwarzWeiss]</xsl:text></xsl:if>
		<xsl:if test="d13=1"><xsl:text> [Untertitel]</xsl:text></xsl:if>
		<xsl:if test="d14=1"><xsl:text> [PayTV]</xsl:text></xsl:if>
		<xsl:if test="d15=1"><xsl:text> [Hörfilm]</xsl:text></xsl:if>
		<xsl:if test="d29=1"><xsl:text> [16:9]</xsl:text></xsl:if>
	    </xsl:variable>

	    <xsl:if test="string-length($FLAGS)">
		<flags><xsl:value-of select="normalize-space($FLAGS)"/></flags>
	    </xsl:if>

	    <xsl:if test="d26 &gt; 0"><extepnum><xsl:value-of select="d26"/></extepnum></xsl:if>

	    <xsl:if test="string-length(d40)">
		<images><xsl:value-of select="substring-before(d40,'.jpg')"/></images>
		<imagetype><xsl:text>jpg</xsl:text></imagetype>
	    </xsl:if>

<!--
-->

	    </event>
	</xsl:for-each>
    </events>
</xsl:template>



<xsl:template name="getRATING">
    <xsl:param name="ratingid"/>

	<xsl:variable name="RATING">
	    <xsl:choose>
		<xsl:when test="$ratingid=1"><xsl:text> / Allgemein *</xsl:text></xsl:when>
		<xsl:when test="$ratingid=2"><xsl:text> / Allgemein **</xsl:text></xsl:when>
		<xsl:when test="$ratingid=3"><xsl:text> / Allgemein ***</xsl:text></xsl:when>
		<xsl:when test="$ratingid=4"><xsl:text> / Allgemein ****</xsl:text></xsl:when>
		<xsl:when test="$ratingid=5"><xsl:text> / Allgemein *****</xsl:text></xsl:when>
	    </xsl:choose>
	</xsl:variable>

    <xsl:value-of select="$RATING"/>
</xsl:template>


<xsl:template name="getCATEGORY">
    <xsl:param name="categoryid"/>

	<xsl:variable name="CATEGORY">

	    <xsl:for-each select="document('epgdata-category.xml')//data">
		<xsl:choose>
		    <xsl:when test="$categoryid=ca0"><xsl:value-of select="ca1"/></xsl:when>
		</xsl:choose>
	    </xsl:for-each>
	</xsl:variable>

    <xsl:value-of disable-output-escaping="yes" select="$CATEGORY"/>
</xsl:template>


<xsl:template name="getGenre">
    <xsl:param name="genreid"/>

	<xsl:variable name="GENRE">

	    <xsl:for-each select="document('epgdata-genre.xml')//data">
		<xsl:choose>
		    <xsl:when test="$genreid=g0"><xsl:value-of select="g1"/></xsl:when>
		</xsl:choose>
	    </xsl:for-each>
	</xsl:variable>

     <xsl:value-of select="$GENRE"/>
</xsl:template>


<xsl:template name="date2UTC">
  <xsl:param name="date"/>

  <xsl:variable name="dststart">
    <xsl:value-of select="concat(date:year($date),'-03-',32-date:day-in-week(concat(date:year($date),'-03-31')),'T02:00:00')"/>
  </xsl:variable>

  <xsl:variable name="dstend">
    <xsl:value-of select="concat(date:year($date),'-10-',32-date:day-in-week(concat(date:year($date),'-10-31')),'T03:00:00')"/>
  </xsl:variable>

  <xsl:variable name="tz">
  <xsl:choose>
  <xsl:when test="date:seconds(date:difference($dststart,$date)) &gt;= 0">
    <xsl:choose>
    <xsl:when test="date:seconds(date:difference($date,$dstend)) &gt;= 0">+02:00</xsl:when>
    <xsl:otherwise>+01:00</xsl:otherwise>
    </xsl:choose>
  </xsl:when>
  <xsl:otherwise>+01:00</xsl:otherwise>
  </xsl:choose>
  </xsl:variable>

 <xsl:value-of select="date:seconds(concat($date,$tz))"/>
</xsl:template>

</xsl:stylesheet>
