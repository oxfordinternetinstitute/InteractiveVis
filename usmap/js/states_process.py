import json
import codecs
import random

fhOpen = open("usstates.json","r")
j = json.load(fhOpen)

jmap={}
jdata=[]

dontwant=["15","72","02"]

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

#fhOut=codecs.open("data.csv","w","UTF-8")
#fhOut.write("fips,name,random1,random2,random3\n")
#for line in jdata:
#	#print line
#	fhOut.write(line)

fhOut=open("usstates.js","w")
j=json.dumps({"shapes":jmap,"width":maxx,"height":maxy})
fhOut.write("var usmap=%s"%j)

#fhOut=open("usmap.svg","w")
#xml="<path style=\"fill:none;stroke:#000000;stroke-width:1px;\"  d=\"%s\" id=\"%s\"/>\n"
#i=0
#for shape in jmap:
#	#out+=xml%(shape,i)
#	fhOut.write(xml%(jmap[shape],shape))
#	i=i+1

print minx
print maxx

print miny
print maxy


