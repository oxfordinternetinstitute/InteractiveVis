var sigInst, canvas, $GP, clusters = [{
    nom: "Josh",
    coords: {
        x: -2240,
        y: -1690
    },
    size: 70,
    deltaX: 100,
    deltaY: 0,
    pos: "left"
}, {
    nom: "Oxford Internet Institute",
    coords: {
        x: -3090,
        y: -669
    },
    size: 320,
    deltaX: 0,
    deltaY: 93,
    pos: "left"
}, {
    nom: "Veolia",
    coords: {
        x: -2962,
        y: 1620
    },
    size: 190,
    deltaX: 204,
    deltaY: 0,
    pos: "left"
}, {
    nom: "UMP",
    coords: {
        x: -1127,
        y: 1620
    },
    size: 285,
    deltaX: 353,
    deltaY: 80,
    pos: "left"
}, {
    nom: "F\u00e9d\u00e8ration environnement durable",
    coords: {
        x: 21,
        y: 2466
    },
    size: 115,
    deltaX: 1020,
    deltaY: 10,
    pos: "left"
}, {
    nom: "GDF Suez",
    coords: {
        x: -1E3,
        y: 93
    },
    size: 400,
    deltaX: 217,
    deltaY: 50,
    pos: "left"
}, {
    nom: "Areva",
    coords: {
        x: -300,
        y: -1960
    },
    size: 513,
    deltaX: 70,
    deltaY: -30,
    pos: "left"
}, {
    nom: "Sauvons le climat",
    coords: {
        x: 1935,
        y: -2200
    },
    size: 245,
    deltaX: 60,
    deltaY: 0,
    pos: "right"
}, {
    nom: "ASN",
    coords: {
        x: 1370,
        y: -40
    },
    size: 340,
    deltaX: 140,
    deltaY: -30,
    pos: "right"
}, {
    nom: "IRSN",
    coords: {
        x: 1355,
        y: 1460
    },
    size: 147,
    deltaX: 475,
    deltaY: 90,
    pos: "right"
}, {
    nom: "Eiffage",
    coords: {
        x: 2800,
        y: 220
    },
    size: 100,
    deltaX: 155,
    deltaY: 0,
    pos: "right"
}, {
    nom: "X Mines",
    coords: {
        x: 545,
        y: 239
    },
    size: 480,
    deltaX: 130,
    deltaY: 50,
    pos: "right"
}, {
    nom: "Alstom",
    coords: {
        x: 2520,
        y: 1457
    },
    size: 120,
    deltaX: 218,
    deltaY: 0,
    pos: "right"
}, {
    nom: "Bouygues",
    coords: {
        x: 2888,
        y: 2557
    },
    size: 200,
    deltaX: 0,
    deltaY: 0,
    pos: "right"
}];

function Search(a) {
    this.input = a.find("input[name=search]");
    this.state = a.find(".state");
    this.results = a.find(".resultats");
    this.exactMatch = !1;
    this.lastSearch = "";
    this.searching = !1;
    var b = this;
    this.input.focus(function () {
        var a = $(this);
        a.data("focus") || (a.data("focus", !0), a.removeClass("empty"));
        b.clean()
    });
    this.input.keydown(function (a) {
        if (13 == a.which) return b.state.addClass("searching"), b.search(b.input.val()), !1
    });
    this.state.click(function () {
        var a = b.input.val();
        b.searching && a == b.lastSearch ? b.close() : (b.state.addClass("searching"), b.search(a))
    });
    this.dom = a;
    this.close = function () {
        this.state.removeClass("searching");
        this.results.hide();
        this.searching = !1;
        nodeNormal()
    };
    this.clean = function () {
        this.results.empty().hide();
        this.state.removeClass("searching");
        this.input.val("")
    };
    this.search = function (a) {
        var b = !1,
            c = [],
            b = this.exactMatch ? ("^" + a + "$").toLowerCase() : a.toLowerCase(),
            g = RegExp(b);
        this.exactMatch = !1;
        this.searching = !0;
        this.lastSearch = a;
        this.results.empty();
        if (2 >= a.length) this.results.html("<i>You must search for a name with a minimum of 3 letters.</i>");
        else {
            sigInst.iterNodes(function (a) {
                g.test(a.label.toLowerCase()) && c.push({
                    id: a.id,
                    nom: a.label
                })
            });
            c.length ? (b = !0, nodeActif(c[0].id)) : b = showCluster(a);
            a = ["<b>Results of your search: </b>"];
            if (1 < c.length) for (var d = 0, h = c.length; d < h; d++) a.push('<a href="#' + c[d].nom + '" onclick="nodeActif(\'' + c[d].id + "')\">" + c[d].nom + "</a>");
            0 == c.length && !b && a.push("<i>No results found.</i>");
            1 < a.length && this.results.html(a.join(""));
            this.results.show()
        }
    }
}

function Cluster(a) {
    this.cluster = a;
    this.display = !1;
    this.list = this.cluster.find(".list");
    this.list.empty();
    this.select = this.cluster.find(".select");
    this.select.click(function () {
        $GP.cluster.toggle()
    });
    this.toggle = function () {
        this.display ? this.hide() : this.show()
    };
    this.content = function (a) {
        this.list.html(a);
        this.list.find("a").click(function () {
            var a = $(this).attr("href").substr(1);
            showCluster(a)
        })
    };
    this.hide = function () {
        this.display = !1;
        this.list.hide();
        this.select.removeClass("close")
    };
    this.show = function () {
        this.display = !0;
        this.list.show();
        this.select.addClass("close")
    }
}
function showGroups(a) {
    a ? ($GP.intro.find("#showGroups").text("Hide groups"), $GP.bg.show(), $GP.bg2.hide(), $GP.showgroupe = !0) : ($GP.intro.find("#showGroups").text("View Groups"), $GP.bg.hide(), $GP.bg2.show(), $GP.showgroupe = !1)
}

function nodeNormal() {
    !0 != $GP.calculating && !1 != sigInst.detail && (showGroups(!1), $GP.calculating = !0, sigInst.detail = !0, $GP.info.hide(), $GP.cluster.hide(), sigInst.iterEdges(function (a) {
        a.attr.color = !1;
        a.hidden = !1
    }), sigInst.iterNodes(function (a) {
        a.hidden = !1;
        a.attr.color = !1;
        a.attr.lineWidth = !1;
        a.attr.size = !1
    }), sigInst.draw(2, 2, 2, 2), sigInst.neighbors = {}, sigInst.actif = !1, $GP.calculating = !1, window.location.hash = "")
}

function nodeActif(a) {
    sigInst.neighbors = {};
    sigInst.detail = !0;
    var b = sigInst._core.graph.nodesIndex[a];
    showGroups(!1);
    sigInst.iterEdges(function (b) {
        b.attr.lineWidth = !1;
        b.hidden = !0;
        if (a == b.source || a == b.target) sigInst.neighbors[a == b.target ? b.source : b.target] = {
            nom: b.label,
            couleur: b.color
        }, b.hidden = !1, b.attr.color = "rgba(0, 0, 0, 1)"
    });
    var f = [];
    sigInst.iterNodes(function (a) {
        a.hidden = !0;
        a.attr.lineWidth = !1;
        a.attr.color = a.color
    });
    var e = [],
        c = sigInst.neighbors,
        g;
    for (g in c) {
        var d = sigInst._core.graph.nodesIndex[g];
        d.hidden = !1;
        d.attr.lineWidth = !1;
        d.attr.color = c[g].couleur;
        a != g && e.push({
            id: g,
            nom: d.label,
            reseau: c[g].nom,
            couleur: c[g].couleur
        })
    }
    e.sort(function (a, b) {
        var c = a.reseau.toLowerCase(),
            d = b.reseau.toLowerCase(),
            e = a.nom.toLowerCase(),
            f = b.nom.toLowerCase();
        return c != d ? c < d ? -1 : c > d ? 1 : 0 : e < f ? -1 : e > f ? 1 : 0
    });
    d = "";
    for (g in e) c = e[g], c.reseau != d && (d = c.reseau, f.push('<li class="reseau cf" rel="' + c.couleur + '"><div class="puce"></div><div class="n">' + d + "</div></li>")), f.push('<li class="membre"><a href="#' + c.nom + '" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + c.id + "'])\" onclick=\"nodeActif('" + c.id + '\')" onmouseout="sigInst.refresh()">' + c.nom + "</a></li>");
    b.hidden = !1;
    b.attr.color = b.color;
    b.attr.lineWidth = 6;
    b.attr.strokeStyle = "#000000";
    sigInst.draw(2, 2, 2, 2);
    $GP.info_name.html("<b onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</b>");
    $GP.info_link.find("ul").html(f.join(""));
    $GP.info_link.find("li.reseau").each(function () {
        var a = $(this),
            b = a.attr("rel");
        a.find("div.puce").css("background-color", b)
    });
    f = b.attr;
    if (f.attributes && 0 < f.attributes.length) {
        e = [];
        g = 0;
        for (c = f.attributes.length; g < c; g++) {
            var d = f.attributes[g].val,
                h = "";
            switch (f.attributes[g].attr) {
            case "biography":
                h = '<span class="plus"></span><a href="' + d + '" target="_blank" class="lien">View full biography</a>'
            }
            e.push(h)
        }
        $GP.info_data.html(e.join("<br/>"))
    }
    $GP.info_data.show();
    $GP.info_p.html("is connected to:");
    $GP.info.show();
    resize();
    sigInst.actif = a;
    window.location.hash = b.label;
}

function showCluster(a) {
    var b = sigInst.clusters[a];
    if (b && 0 < b.length) {
        showGroups(!1);
        sigInst.detail = !0;
        b.sort();
        sigInst.iterEdges(function (a) {
            a.hidden = !1;
            a.attr.lineWidth = !1;
            a.attr.color = !1
        });
        sigInst.iterNodes(function (a) {
            a.hidden = !0
        });
        for (var f = [], e = [], c = 0, g = b.length; c < g; c++) {
            var d = sigInst._core.graph.nodesIndex[b[c]];
            !0 == d.hidden && (e.push(b[c]), d.hidden = !1, d.attr.lineWidth = !1, d.attr.color = d.color, f.push('<li class="membre" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + d.id + "'])\" onclick=\"nodeActif('" + d.id + '\')" onmouseout="sigInst.refresh()"><div class="n">' + d.label + "</div></li>"))
        }
        sigInst.clusters[a] = e;
        sigInst.draw(2, 2, 2, 2);
        $GP.info_name.html("<b>" + a + "</b>");
        $GP.info_data.hide();
        $GP.info_p.html("which includes:");
        $GP.info_link.find("ul").html(f.join(""));
        $GP.info.show();
        resize();
        $GP.search.clean();
        return !0
    }
    return !1
}

function init() {
    var a = sigma.init(document.getElementById("sigma-example")).drawingProperties({
        defaultLabelColor: "#fff",
        defaultLabelSize: 12,
        defaultLabelBGColor: "#ddd",
        defaultHoverLabelBGColor: "#258EA4",
        defaultLabelHoverColor: "#fff",
        labelThreshold: 8,
        defaultEdgeType: "curve",
        hoverFontStyle: "bold",
        fontStyle: "bold",
        activeFontStyle: "bold"
    }).graphProperties({
        minNodeSize: 1,
        maxNodeSize: 7,
        minEdgeSize: 0.2,
        maxEdgeSize: 0.5
    }).mouseProperties({
        minRatio: 0.5,
        maxRatio: 32,
        zoomDelta: 0.1,
        zoomMultiply: 2
    });
    sigInst = a;
    a.actif = !1;
    a.neighbors = {};
    a.detail = !1;
    a.parseGexf("data/egonet2.gexf");
    gexf = sigmaInst = null;
    a.clusters = {};
    for (var b = 0, f = clusters.length; b < f; b++) {
        var e = clusters[b];
        a.addNodeBG(e.nom, {
            x: e.coords.x,
            y: e.coords.y,
            size: e.size,
            label: e.nom,
            id: e.nom,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            position: e.pos
        })
    }
    a.iterEdges(function (b) {
        a.clusters[b.label] || (a.clusters[b.label] = []);
        a.clusters[b.label].push(b.source);
        a.clusters[b.label].push(b.target)
    });
    a.bind("upnodes", function (a) {
        nodeActif(a.content[0])
    });
    a.draw()
}

function resize() {
    var a = $("body");
    500 > a.width() ? ($GP.intro.hide(), $GP.mini.show()) : ($GP.intro.show(), $GP.mini.hide());
    $GP.minifier.hide();
    a = a.height() - 120;
    $GP.info.css("height", a);
    var b = $GP.info_link.position(),
        f = $GP.info.position();
    $GP.info_link.height(a - b.top - f.top)
}
$(document).ready(function () {
    var a = $;
    $GP = {
        calculating: !1,
        showgroupe: !1
    };
    $GP.intro = a("#intro");
    $GP.minifier = $GP.intro.find("#minifier");
    $GP.mini = a("#minify");
    $GP.info = a("#info");
    $GP.info_donnees = $GP.info.find(".donnees");
    $GP.info_name = $GP.info.find(".name");
    $GP.info_link = $GP.info.find(".link");
    $GP.info_data = $GP.info.find(".data");
    $GP.info_close = $GP.info.find(".retour");
    $GP.info_close2 = $GP.info.find(".fermer");
    $GP.info_p = $GP.info.find(".p");
    $GP.info_close.click(nodeNormal);
    $GP.info_close2.click(nodeNormal);
    $GP.form = a("#intro").find("form");
    $GP.search = new Search($GP.form.find("#search"));
    $GP.cluster = new Cluster($GP.form.find("#cluster"));
    init();
    resize();
    $GP.bg = a(sigInst._core.domElements.bg);
    $GP.bg2 = a(sigInst._core.domElements.bg2);
    var a = [],
        b;
    for (b in sigInst.clusters) a.push('<div><a href="#' + b + '">' + b + "</a></div>");
    a.sort();
    $GP.cluster.content(a.join(""));
    b = {
        minWidth: 400,
        maxWidth: 800,
        minHeight: 300,
        maxHeight: 600
    };
    $("a.fb").fancybox(b);
    $("#zoom").find("div.z").each(function () {
        var a = $(this),
            b = a.attr("rel");
        a.click(function () {
            var a = sigInst._core;
            sigInst.zoomTo(a.domElements.nodes.width / 2, a.domElements.nodes.height / 2, a.mousecaptor.ratio * ("in" == b ? 1.5 : 0.5))
        })
    });
    $GP.mini.click(function () {
        $GP.mini.hide();
        $GP.intro.show();
        $GP.minifier.show()
    });
    $GP.minifier.click(function () {
        $GP.intro.hide();
        $GP.minifier.hide();
        $GP.mini.show()
    });
    $GP.intro.find("#showGroups").click(function () {
        !0 == $GP.showgroupe ? showGroups(!1) : showGroups(!0)
    });
    a = window.location.hash.substr(1);
    if (0 < a.length) switch (a) {
    case "Groups":
        showGroups(!0);
        break;
    case "savoir-plus":
        $.fancybox.open($("#plus"), b);
        break;
    default:
        $GP.search.exactMatch = !0, $GP.search.search(a)
    }
});
$(window).resize(resize);