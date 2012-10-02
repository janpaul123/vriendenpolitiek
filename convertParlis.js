/*jshint node:true*/
"use strict";
var fs = require('fs');
var assert = require('assert');

var data = require('./constants.js')();

fs.readFile('Stemmingen.tsv', 'utf8', function (err, input) {
	if (err) {
		return console.log(err);
	}

	var tijden = data.tijden, partijen = data.partijen, tijdenPrefixes = data.tijdenPrefixes;
	var partijenMap = {'vvd': 'vvd', 'pvda': 'pvda', 'cda': 'cda', 'pvv': 'pvv', 'sp': 'sp', 'd66': 'd66', 'groenlinks': 'gl', 'christenunie': 'cu', 'sgp': 'sgp', 'pvdd': 'pvdd', 'brinkman': 'obp', 'verdonk': 'ton'};
	var lines = input.split('\n');
	var besluiten = {};

	for (var t=0; t<tijden.length; t++) {
		var time = tijden[t];
		data.totaalPerPartij[time] = {};
		data.voors[time] = {};
		data.tegens[time] = {};
		for (var i=0; i<partijen.length; i++) {
			data.totaalPerPartij[time][partijen[i]] = data.voors[time][partijen[i]] = data.tegens[time][partijen[i]] = 0;
		}
	}

	for (var y=1; y<lines.length; y++) {
		var tabs = lines[y].split('\t');
		var besluit = (tabs[11] || '').toLowerCase();

		if (besluit.length > 0) {
			var partij = tabs[5].toLowerCase();
			var politicus = tabs[4].toLowerCase();
			var soort = tabs[1].toLowerCase();
			var datum = tabs[7];
			var time = null;

			for (var timeName in tijdenPrefixes) {
				for (var i=0; i<tijdenPrefixes[timeName].length; i++) {
					if (datum.indexOf(tijdenPrefixes[timeName][i]) >= 0) {
						time = timeName;
						break;
					}
				}
			}

			if ((politicus || partij) === partij && time !== null) {
				partij = partijenMap[partij];

				besluiten[time] = besluiten[time] || {};
				besluiten[time][besluit] = besluiten[time][besluit] || {};

				assert.equal(besluiten[time][besluit][partij], undefined);

				if (soort === 'tegen') {
					besluiten[time][besluit][partij] = 0;
					data.tegens[time][partij]++;
					data.totaalPerPartij[time][partij]++;
				} else if (soort === 'voor') {
					besluiten[time][besluit][partij] = 1;
					data.voors[time][partij]++;
					data.totaalPerPartij[time][partij]++;
				}
			}
		}
	}
	
	data.besluiten = besluiten;
	require('./analyze')(data);
	console.log('module.exports = ' + JSON.stringify(data) + ';');
});
