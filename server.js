'use strict';

const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);

// Railway URL of the game server, e.g. <https://action-bc4f4.up.railway.app>
// Set this in Railway → client service → Variables → GAME_SERVER_URL
const GAME_SERVER_URL = (process.env.GAME_SERVER_URL || '').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Dynamic config.js — tells the PS client which server to connect to
// ---------------------------------------------------------------------------
function makeConfigJs() {
	const gameHost = GAME_SERVER_URL ? new URL(GAME_SERVER_URL).hostname : 'localhost';
	const gamePort = GAME_SERVER_URL
		? (parseInt(new URL(GAME_SERVER_URL).port, 10) || 443)
		: 8000;

	return `var Config = Config || {};
Config.defaultserver = {
	id: 'multimultiplayer',
	host: '${gameHost}',
	port: ${gamePort},
	httpport: ${gamePort},
	registered: false,
};
Config.routes = {
	root: '<pokemonshowdown.com>',
	client: '<play.pokemonshowdown.com>',
	dex: '<dex.pokemonshowdown.com>',
	replays: '<replay.pokemonshowdown.com>',
	users: '<pokemonshowdown.com/users>',
	teams: '<teams.pokemonshowdown.com>',
};
Config.whitelist = ['<wikipedia.org>'];
Config.bannedHosts = ['cool.jit.su', '<pokeball-nixonserver.rhcloud.com>'];
`;
}

// ---------------------------------------------------------------------------
// index.html — standard PS client UI, all scripts from CDN except:
//   /config/config.js  → served above (connects to game server)
//   /js/battle.js      → served by the game server (our FFA-fixed build)
// ---------------------------------------------------------------------------
function makeIndexHtml() {
	const battleJs = GAME_SERVER_URL
		? `${GAME_SERVER_URL}/js/battle.js`
		: '//<play.pokemonshowdown.com/js/battle.js?0.25125081874966204'>;

	return `<!DOCTYPE html>
<meta charset="UTF-8" />
<meta id="viewport" name="viewport" content="width=device-width" />
<title>Showdown!</title>
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<link rel="shortcut icon" href="//<play.pokemonshowdown.com/favicon.ico>" id="dynamic-favicon" />
<link rel="icon" sizes="256x256" href="//<play.pokemonshowdown.com/favicon-256.png>" />
<link rel="stylesheet" href="//<play.pokemonshowdown.com/style/battle.css?0.4107849879045409>" />
<link rel="stylesheet" href="//<play.pokemonshowdown.com/style/client.css?0.48869571366441966>" />
<link rel="stylesheet" href="//<play.pokemonshowdown.com/style/sim-types.css?0.8549695978533578>" />
<link rel="stylesheet" href="//<play.pokemonshowdown.com/style/utilichart.css?0.7709787351103543>" />
<link rel="stylesheet" href="//<play.pokemonshowdown.com/style/font-awesome.css?0.1188522586244336>" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<!--[if lte IE 8]><script>document.location.replace('<http://pokemonshowdown.com/autodownload/win>');</script><![endif]-->
<div id="header" class="header">
<img class="logo" src="//<play.pokemonshowdown.com/pokemonshowdownbeta.png>" srcset="//play.pokemonshowdown.com/pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown! (beta)" width="146" height="44" /><div class="maintabbarbottom"></div>
</div>
<div class="ps-room scrollable" id="mainmenu"><div class="mainmenuwrapper">
<div class="leftmenu">
<div class="activitymenu"><div class="pmbox"><div class="pm-window news-embed" data-newsid="null">
<h3><button class="closebutton" tabindex="-1"><i class="fa fa-times-circle"></i></button><button class="minimizebutton" tabindex="-1"><i class="fa fa-minus-circle"></i></button>News</h3>
<div class="pm-log" style="max-height:none"></div>
</div></div></div>
<div class="mainmenu"><div id="loading-message" class="mainmessage">Initializing... <noscript>FAILED<br /><br />Pok&eacute;mon Showdown requires JavaScript.</noscript></div></div>
</div>
<div class="rightmenu"></div>
<div class="mainmenufooter"><div class="bgcredit"></div>
<small><a href="//<dex.pokemonshowdown.com/>" target="_blank">Pok&eacute;dex</a> | <a href="//<replay.pokemonshowdown.com/>" target="_blank">Replays</a> | <a href="//<pokemonshowdown.com/rules>" target="_blank">Rules</a> | <a href="//<pokemonshowdown.com/credits>" target="_blank">Credits</a> | <a href="<http://smogon.com/forums/>" target="_blank">Forum</a> | <a href="//<pokemonshowdown.com/privacy>" target="_blank">Privacy policy</a></small>
</div>
</div></div>
<script>var LM=document.getElementById('loading-message');LM.innerHTML+=' DONE<br />Loading libraries...';</script>
<script nomodule src="//<play.pokemonshowdown.com/js/lib/ps-polyfill.js>"></script>
<script src="/config/config.js"></script>
<script src="//<play.pokemonshowdown.com/js/lib/jquery-2.2.4.min.js>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/jquery-cookie.js>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/autoresize.jquery.min.js?0.370702902359062>"></script>
<script src="//<play.pokemonshowdown.com/js/battle-sound.js?0.699654337201973>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/html-css-sanitizer-minified.js?0.15628609339320576>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/lodash.core.js?0.7672358003747721>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/backbone.js?0.892155412613584>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/d3.v3.min.js>"></script>
<script>LM.innerHTML+=' DONE<br />Loading data...';</script>
<script src="//<play.pokemonshowdown.com/js/battledata.js?0.7224291083345067>"></script>
<script src="//<play.pokemonshowdown.com/js/storage.js?0.7542330760044569>"></script>
<script src="//<play.pokemonshowdown.com/data/pokedex-mini.js?0.32188894390693146>"></script>
<script src="//<play.pokemonshowdown.com/data/typechart.js?0.6991180337701373>"></script>
<script src="${battleJs}"></script>
<script src="//<play.pokemonshowdown.com/js/lib/sockjs-1.4.0-nwjsfix.min.js>"></script>
<script src="//<play.pokemonshowdown.com/js/lib/color-thief.min.js>"></script>
<script>LM.innerHTML+=' DONE<br />Loading client...';</script>
<script src="//<play.pokemonshowdown.com/data/commands.js?0.2591268648371079>"></script>
<script src="//<play.pokemonshowdown.com/js/client.js?0.7745538672005716>"></script>
<script src="//<play.pokemonshowdown.com/js/client-topbar.js?0.3271207621463039>"></script>
<script src="//<play.pokemonshowdown.com/js/client-mainmenu.js?0.9701146398113143>"></script>
<script src="//<play.pokemonshowdown.com/js/client-teambuilder.js?0.6217814929732897>"></script>
<script src="//<play.pokemonshowdown.com/js/client-ladder.js?0.32424941121699113>"></script>
<script src="//<play.pokemonshowdown.com/js/client-chat.js?0.3756979312798545>"></script>
<script src="//<play.pokemonshowdown.com/js/client-chat-tournament.js?0.32018618418100053>"></script>
<script src="//<play.pokemonshowdown.com/js/battle-tooltips.js?0.029287721331421546>"></script>
<script src="//<play.pokemonshowdown.com/js/client-battle.js?0.8302235016625652>"></script>
<script src="//<play.pokemonshowdown.com/js/client-rooms.js?0.896684195139761>"></script>
<script src="//<play.pokemonshowdown.com/data/graphics.js?0.21017754301048686>"></script>
<script>
var app;
if(self===top){app=new App();}
else{LM.innerHTML+=' IN FRAME<br />Please visit Showdown directly.';top.location=self.location;}
</script>
<script src="//<play.pokemonshowdown.com/data/pokedex.js?0.4172775422083619>"></script>
<script src="//<play.pokemonshowdown.com/data/moves.js?0.3970874821446315>"></script>
<script src="//<play.pokemonshowdown.com/data/items.js?0.6153671233869424>"></script>
<script src="//<play.pokemonshowdown.com/data/abilities.js?0.994421842852087>"></script>
<script src="//<play.pokemonshowdown.com/data/search-index.js?0.9418965066921439>"></script>
<script src="//<play.pokemonshowdown.com/data/teambuilder-tables.js?0.6180470667497808>"></script>
<script src="//<play.pokemonshowdown.com/js/battle-dex-search.js?0.35221400354011045>"></script>
<script src="//<play.pokemonshowdown.com/js/search.js?0.5400072700275571>"></script>
<script src="//<play.pokemonshowdown.com/data/aliases.js?0.9605658231022614>" async></script>
<script src="//<play.pokemonshowdown.com/js/clean-cookies.php>" async></script>
`;
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const indexHtml = makeIndexHtml();
const configJs  = makeConfigJs();

const server = http.createServer((req, res) => {
	const urlPath = (req.url || '/').split('?')[0].split('#')[0];

	if (urlPath === '/config/config.js') {
		res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
		res.end(configJs);
		return;
	}

	// Serve index.html for root and any battle/room paths
	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
	res.end(indexHtml);
});

server.listen(PORT, () => {
	console.log(`PS client serving on port ${PORT}`);
	console.log(`Game server: ${GAME_SERVER_URL || '(not set — use GAME_SERVER_URL env var)'}`);
});
