import pprint
import xml.dom.minidom
from xml.dom.minidom import Node
import sys

def handleGroup(n):
	d = n.getAttribute("id")
	#print "var %s = paper.startSet();"%d
	#print "%s:{"%d
	cords=[]
	sys.stdout.write("\""+d+"\":\"")
	#for c in n.childNodes:
	for c in n.getElementsByTagName("path"):
		tag=c.localName
		if (tag!="path"): continue

		cl = c.getAttribute("class")
		#if (cl!="" and cl.find("landxx")==-1): continue

		#printCords(c.getAttribute("d")),
		print c.getAttribute("d"),
	#print "},"
	print "\","

def handlePath(n):
	d=n.getAttribute("d")
	id = n.getAttribute("id")
	d = d.replace ("-",",-")
	da=d.split(",")
	even=False
	out=""
	for t in da:
		if even:
			out+="L"+t
		else:
			out+=" "+t
		even=not even
	out = out.replace("mL","m")
	#print "\"%s\":\"%s\","%(id,out)
	print id


#doc = xml.dom.minidom.parse("BlankMap-World6.svg")
doc = xml.dom.minidom.parse("dontwantsvg.svg")
 
 
"""
	<svg contentScriptType="text/ecmascript" width="595px"
     xmlns:xlink="http://www.w3.org/1999/xlink" zoomAndPan="magnify"
     contentStyleType="text/css" viewBox="-704 -739 1411 1468" height="619px"
     preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"
     version="1.1">
"""

root=doc.getElementsByTagName("svg")[0]
s=root.getAttribute("viewBox").split(" ")
#offX,offY=float(s[0]),float(s[1])
offX,offY=0,0
#ratio=1
	 
 
mapping = {}
edges = {}
nodes = {}

print "var usmap={"
print "\"width\":504,\"height\":216,\"shapes\":{"
for node in doc.getElementsByTagName("path"):#root.childNodes:
	tag=node.localName
	if (tag!="g" and tag!="path"): continue
		
	#c = node.getAttribute("class")
	#if (c.find("landxx")==-1 and c.find("oceanxx")==-1): continue
	
	
	if (tag=="path"):
		handlePath(node)
	#elif (tag=="g"):
	#	handleGroup(node)		
print "}};"


#polyline
#circle
#text
