/*jshint node:true*/
"use strict";
var fs = require('fs');
var assert = require('assert');

var data = require('./constants.js')();

var minYear = 1994;
var maxYear = 2011;

// #house;legislative-period;session-number;date of vote;dossier nummer;onder nummer;type;outcome;stemmings type;bron amendement op OB;link amendement HTML op PM;link stemming XML op PM;link stemming in context HTML op PM;bron stemming op OB;nl.p.aov;nl.p.cd;nl.p.cda;nl.p.d66;nl.p.fractiebierman;nl.p.fractiehendriks;nl.p.gl;nl.p.gpv;nl.p.groephendriks;nl.p.groepnijpels;nl.p.groepverkerk;nl.p.ou55plus;nl.p.pvda;nl.p.rpf;nl.p.sgp;nl.p.sp;nl.p.vvd;indiener 1, naam volgens stemming;indiener 1, id volgens stemming;indiener 2, naam volgens stemming;indiener 2, id volgens stemming;titel document volgens stemming

// var partijenMap = {'vvd': 'vvd', 'pvda': 'pvda', 'cda': 'cda', 'pvv': 'pvv', 'sp': 'sp', 'd66': 'd66', 'groenlinks': 'gl', 'christenunie': 'cu', 'sgp': 'sgp', 'pvdd': 'pvdd', 'brinkman': 'obp', 'verdonk': 'ton'};
var besluiten = {};
var handleYear = function(year) {
	console.error('year: ' + year);
	fs.readFile('Stemmingen/stemmingen ' + year + '-' + (year+1) + '.txt', 'utf8', function (err, input) {
		if (err) {
			return console.error(err);
		}

		var partijen = [];
		var lines = input.split('\n');

		var tabs = lines[0].split(';');
		if (lines[0].substring(0, '#house'.length) === '#house') {
			for (var i=0; i<tabs.length; i++) {
				var tab = tabs[i];
				if (tab.substring(0, 'nl.p.'.length) === 'nl.p.') {
					partijen[tab.substring('nl.p.'.length)] = i;
				}
			}
		}

		for (var y=1; y<lines.length; y++) {
			var tabs = lines[y].split(';');

			var type = (tabs[8] || '').toLowerCase();
			var house = (tabs[0] || '').toLowerCase();

			if (type === 'fractie' && house === 'commons') {
				for (var partij in partijen) {
					var stemming = tabs[partijen[partij]];
					var besluit = tabs[11].toLowerCase();
					var time = tabs[3].substring(0, 7);
					var soort = tabs[6].toLowerCase();
					if (data.soorten.indexOf(soort) < 0) soort = 'anders';

					if (stemming !== '') {
						besluiten[time] = besluiten[time] || {};
						besluiten[time][besluit] = besluiten[time][besluit] || {partijen: {}, soort: soort};

						assert.equal(besluiten[time][besluit].partijen[partij], undefined);

						if (stemming === 'no') {
							besluiten[time][besluit].partijen[partij] = 0;
						} else if (stemming === 'aye') {
							besluiten[time][besluit].partijen[partij] = 1;
						}
					}
				}
			} else if (house !== 'commons') {
				// console.error('Geen Tweede Kamer: ' + house);
			}
		}
		
		if (year+1 <= maxYear) {
			handleYear(year+1);
		} else {
			data.besluiten = besluiten;
			require('./analyze.js')(data);
			data.besluiten = undefined;
			console.log('module.exports = ' + JSON.stringify(data) + ';');
		}
	});
};

handleYear(minYear);