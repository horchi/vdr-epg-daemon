#!/usr/bin/perl -w

if (not defined $ARGV[0] or not defined $ARGV[1]) {die "No parameter given!\n"};

use DBI;

$db_user		= "epg2vdr";
$db_password            = "epg";

my $database_name	= "epg2vdr";
my $location		= "localhost";
my $port_num		= "3306";
my $database		= "DBI:mysql:$database_name:$location:$port_num";

# Einloggen:
$dbh = DBI->connect($database,$db_user,$db_password, { mysql_enable_utf8 => 1 });

if ( $ARGV[1] eq 'loaddone') {

$sql = "INSERT INTO timersdone (inssp,updsp,source,state,channelid,starttime,duration,title,comptitle,shorttext,compshorttext,longdescription,complongdescription,channelname,expression,aux) VALUES (UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 'epgsearch', 'R', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$sth = $dbh->prepare($sql);
die "Error: $DBI::errstr\n" if $DBI::err;

$channelid = undef;
$starttime = undef;
$duration = undef;
$title = undef;
$comptitle = undef;
$shorttext = undef;
$compshorttext = undef;
$complongdescription = undef;
$longdescription = undef;
$channelname = undef;
$expression = undef;
$aux = undef;

open (FILE, "<$ARGV[0]") or die "Can't open file\n";
while (<FILE>) {
    $line = $_;
    $line =~ s/\n//;

    if ($line =~ /^R/ ) {
	@fields = split(' ', $line);
	$starttime = $fields[1];
	$duration = $fields[2];
    }

    if ($line =~ /^C/ ) { $channelid = substr($line,2); }
    if ($line =~ /^T/ ) { $title = substr($line,2);  $comptitle = uc($title); $comptitle =~ tr/äöü/ÄÖÜ/; $comptitle =~ s/[^0-9A-ZÄÖÜß]//ug; }
    if ($line =~ /^S/ ) { $shorttext = substr($line,2); $compshorttext = uc($shorttext) ; $compshorttext =~ tr/äöüéá/ÄÖÜÉÁ/; $compshorttext =~ s/[^0-9A-ZÄÖÜß]//ug; }
    if ($line =~ /^D/ ) { $longdescription = substr($line,2); $complongdescription = uc($longdescription); $complongdescription =~ tr/äöü/ÄÖÜ/; $complongdescription =~ s/[^0-9A-ZÄÖÜß]//ug; }
    if ($line =~ /^@/ ) {
	$aux = substr($line,2);
	$aux =~ /<[C|c]hannel>[0-9]* - (.*)<\/[C|c]hannel>.*timer>(.*)<\/[S|s]earch/;
	$channelname = $1;
	$expression = $2;
    }

    if ($line =~ /^r/ ) {

	$sth->execute($channelid,$starttime,$duration,$title,$comptitle,$shorttext,$compshorttext,$longdescription,$complongdescription,$channelname,$expression,$aux);

	$channelid = undef;
	$starttime = undef;
	$duration = undef;
	$title = undef;
	$comptitle = undef;
	$shorttext = undef;
	$compshorttext = undef;
	$longdescription = undef;
	$complongdescription = undef;
	$channelname = undef;
	$expression = undef;
	$aux = undef;
    }

}
close(FILE) or die "Can't close file\n";

}

elsif ( $ARGV[1] eq 'loaddump') {

$sql = "INSERT INTO timersdone (id, inssp, updsp, source, state ,timerid, autotimerid, title, comptitle, shorttext, compshorttext, longdescription, complongdescription, episodecompname, episodecompshortname, episodecomppartname, episodelang, episodeseason, episodepart, channelid, channelname, expression, starttime, duration, aux) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$sth = $dbh->prepare($sql);
die "Error: $DBI::errstr\n" if $DBI::err;

open (FILE, "<$ARGV[0]") or die "Can't open file\n";
while (<FILE>) {
    $line = $_;
    $line =~ s/\n//;
    @fields = split('\t', $line);


    for ($i=0; $i<=24; $i++) { if ($fields[$i] eq '') { $fields[$i] = undef; } }

    $sth->execute($fields[0],$fields[1],$fields[2],$fields[3],$fields[4],$fields[5],$fields[6],$fields[7],$fields[8],$fields[9],$fields[10],$fields[11],$fields[12],$fields[13],$fields[14],$fields[15],$fields[16],$fields[17],$fields[18],$fields[19],$fields[20],$fields[21],$fields[22],$fields[23],$fields[24]);

}
close(FILE) or die "Can't close file\n";

}


elsif ( $ARGV[1] eq 'writedump') {

use open ':utf8';

open FILE, ">$ARGV[0]" or die "Can't open file!\n";

# select finished recordings
$sql = "SELECT id, inssp, updsp, source, state, timerid, autotimerid, title, comptitle, shorttext, compshorttext, longdescription, complongdescription, episodecompname, episodecompshortname, episodecomppartname, episodelang, episodeseason, episodepart, channelid, channelname, expression, starttime, duration, aux FROM timersdone where state = 'R' order by comptitle,compshorttext";

$sth = $dbh->prepare($sql);
die "Error: $DBI::errstr\n" if $DBI::err;
$sth->execute();
die "Error: $DBI::errstr\n" if $DBI::err;

$sth->rows;

$arrayref = $sth->fetchall_arrayref;
for (@$arrayref) {
    @fields = @$_;

    foreach $field (@fields) {  if (not defined $field) { $field = '';} }

    print FILE join("\t",@fields), "\n";

}


$sth->finish();
close(FILE) or die "Can't close file\n";

}

#Ausloggen
$dbh->disconnect;
