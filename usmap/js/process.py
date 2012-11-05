import json
import codecs
import random

fhOpen = open("usmap.json","r")
j = json.load(fhOpen)

jmap={}
jdata=[]

dontwant=[
"02100",
"72071",
"72027",
"72073",
"72029",
"72103",
"72105",
"72085",
"72129",
"72109",
"72033",
"72035",
"72037",
"72097",
"72095",
"72139",
"72091",
"02122",
"72045",
"02016",
"02013",
"72041",
"02240",
"72093",
"72153",
"72099",
"72031",
"72023",
"72025",
"02068",
"02060",
"02070",
"02261",
"72079",
"72075",
"72077",
"15003",
"15001",
"15009",
"02020",
"72047",
"72043",
"72125",
"72121",
"02270",
"72141",
"72069",
"72067",
"72065",
"72061",
"02050",
"02130",
"72003",
"72063",
"02201",
"72059",
"72053",
"72051",
"72057",
"72055",
"72054",
"72133",
"72083",
"72101",
"72107",
"02180",
"02185",
"02188",
"02220",
"72081",
"72087",
"72089",
"72149",
"72039",
"72019",
"72017",
"72013",
"02150",
"02232",
"72005",
"72007",
"02090",
"72131",
"02170",
"72135",
"72137",
"72009",
"02164",
"72001",
"02280",
"02282",
"72151",
"72127",
"72123",
"02110",
"72117",
"72145",
"72015",
"02290",
"72011",
"72143",
"72115",
"72113",
"72111",
"72119",
"72021"
]

maxx=0
maxy=0
minx=0
miny=0
def drawPoly(array):
	global maxx,maxy,minx,miny
	first=True
	string=""
	for pair in array:
		if first:
			string+="M"
			first=False
		else:
			string+="L"
		#x: -124.99044761898386
		#y: -48.490292570192366
		x=(pair[0]+130)*10
		y=(0-pair[1]+50.5)*10
		string+="%s %s"%(x,y)#127.5
		if (maxx<x): maxx=x
		if (maxy<y): maxy=y
		if (minx>x): minx=x
		if (miny>y): miny=y
	return string

def recurse(lst):
	string=""
	for pair in lst:
		if len(pair[0])==2:#isinstance(pair[0], float)
			print pair
			string+=drawPoly(pair)
		else:
			print "NOT  STRING"
			string+=recurse(pair)
	return string

for feature in j["features"]:
	#{"type":"Feature","id":"01001","properties":{"name":"Autauga"},"geometry":{"type":"Polygon","coordinates":[[[-86.411786,32.706342],[-86.411786,32.410587],[-86.499417,32.344863],[-86.817079,32.339387],[-86.915664,32.662526],[-86.411786,32.706342]]]}},
	if str(feature["id"]) in dontwant:
		continue
	jdata.append("\"%s\",\"%s\",%i,%i,%i\n"%(feature["id"],feature["properties"]["name"],random.randint(0,1000000),random.randint(0,100000),random.randint(0,100000)))
	string=recurse(feature["geometry"]["coordinates"])
	#for pair in feature["geometry"]["coordinates"]:
	#	if isinstance(pair, list):
	#		recurse(pair)
	#	else
	#		string+=drawPoly(pair)
	jmap[feature["id"]]=string

fhOut=codecs.open("data.csv","w","UTF-8")
fhOut.write("fips,name,random1,random2,random3\n")
for line in jdata:
	#print line
	fhOut.write(line)

#fhOut=open("usmap.js","w")
#j=json.dumps({"shapes":jmap,"width":maxx,"height":maxy})
#fhOut.write("var usmap=%s"%j)

fhOut=open("usmap.svg","w")
xml="<path style=\"fill:none;stroke:#000000;stroke-width:1px;\"  d=\"%s\" id=\"%s\"/>\n"
i=0
for shape in jmap:
	#out+=xml%(shape,i)
	fhOut.write(xml%(jmap[shape],shape))
	i=i+1

print minx
print maxx

print miny
print maxy


