<?php
#Convert table format to json
//TODO: Deal with auto detection of delimiter and delimiter within quoted field
//PHP csvlib can deal with this; not sure the cf equivolent

$DELIM=","; #Delimiter

$input = fopen("input.csv","r");#file_get_contents
$out= fopen("out.json","w");

$header = fgets($input);//Read one line
$header=trim($header);//Get rid of last line break
$fields = explode($DELIM,$header);
print_r($fields);
print "\n";

//Standard json header
fwrite($out,"{\"data\":{");

$line=fgets($input);
while ($line!=null) {
	$line=trim($line);//Get rid of last line break
	$vals = explode($DELIM,$line);
	print "$vals[0]\n";
	//vals[0] is code
	fwrite($out,quote($vals[0]).":{");
	for ($i=1; $i<count($vals); $i++){
		fwrite($out,quote($fields[$i]).":".quote($vals[$i]));
		if ($i!=count($vals)-1)	fwrite($out,",");//Write a comma unless it is the last field/value
		else						fwrite($out,"}");//Write } if it is the last field
	}
	$line=fgets($input);
	if ($line!=null) 	fwrite($out,",");//Write a comma if there is another country coming
}
//Write json trailer: close data object, close overall group
fwrite($out,"}}");

//Add a quotation mark in front and/or at the end if not present
function quote($str) {
	if ($str[0]!="\"") 
		$str="\"$str";
	if ($str[strlen($str)-1]!="\"") 
		$str="$str\"";
	return $str;
}

?>
