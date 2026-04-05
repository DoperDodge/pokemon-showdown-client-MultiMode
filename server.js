/**
 * Simple static file server for the Pokemon Showdown client.
 * Designed for Railway deployment — reads PORT from the environment.
 *
 * Serves files from <play.pokemonshowdown.com/> and injects the game server
 * URL (GAME_SERVER_URL env var) into /config/config.js at request time so
 * the same build can point at any backend without rebuilding.
 */

'use strict';

const http = requiref('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT = path.join(__dirname, '<play.pokemonshowdown.com>');

// The Railway URL of the game server, e.g. <https://action-bc4f4.up.railway.app>
// Set this in Railway → your client service → Variables → GAME_SERVER_URL
const GAME_SERVER_URL = (process.env.GAME_SERVER_URL || '').replace(/\/$/, '');

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js':   'application/javascript; charset=utf-8',
	'.css':  'text/css; charset=utf-8',
	'.png':  'image/png',
	'.jpg':  'image/jpeg',
	'.gif':  'image/gif',
	'.svg':  'image/svg+xml',
	'.ico':  'image/x-icon',
	'.json': 'application/json; charset=utf-8',
	'.woff': 'font/woff',
	'.woff2':'font/woff2',
	'.ttf':  'font/ttf',
	'.swf':  'application/x-shockwave-flash',
};

function mime(filepath) {
	return MIME[path.extname(filepath).toLowerCase()] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
	// Strip query strings and decode
	let urlPath = req.url.split('?')[0].split('#')[0];
	try { urlPath = decodeURIComponent(urlPath); } catch {}

	// Serve dynamic config.js that points at the game server
	if (urlPath === '/config/config.js') {
		const gameHost = GAME_SERVER_URL
			? new URL(GAME_SERVER_URL).hostname
			: 'localhost';
		const gamePort = GAME_SERVER_URL
			? (parseInt(new URL(GAME_SERVER_URL).port, 10) || 443)
			: 8000;

		const body = `var Config = Config || {};

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
		res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
		res.end(body);
		return;
	}

	// Map / to index.html; map battle room IDs to index.html too
	if (urlPath === '/' || /^\/[a-z0-9][a-z0-9-]*\/?$/i.test(urlPath)) {
		urlPath = '/index.html';
	}

	const filepath = path.join(ROOT, urlPath);

	// Security: make sure we stay inside ROOT
	if (!filepath.startsWith(ROOT + path.sep) && filepath !== ROOT) {
		res.writeHead(403);
		res.end('Forbidden');
		return;
	}

	fs.readFile(filepath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not found');
			return;
		}
		res.writeHead(200, {
			'Content-Type': mime(filepath),
			'Cache-Control': filepath.endsWith('.html') ? 'no-cache' : 'public, max-age=3600',
		});
		res.end(data);
	});
});

server.listen(PORT, () => {
	console.log(`PS client serving on port ${PORT}`);
	console.log(`Game server: ${GAME_SERVER_URL || '(not set — use GAME_SERVER_URL env var)'}`);
});
