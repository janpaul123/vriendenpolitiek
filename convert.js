fs = require('fs');
assert = require('assert');

var partijenMap = {'vvd': 'vvd', 'pvda': 'pvda', 'cda': 'cda', 'pvv': 'pvv', 'sp': 'sp', 'd66': 'd66', 'groenlinks': 'gl', 'christenunie': 'cu', 'sgp': 'sgp', 'pvdd': 'pvdd', 'brinkman': 'obp', 'verdonk': 'ton'};
var partijen = ['vvd', 'pvda', 'cda', 'pvv', 'sp', 'd66', 'gl', 'cu', 'sgp', 'pvdd', 'obp', 'ton'];

fs.readFile('Stemmingen.tsv', 'utf8', function (err, input) {
	if (err) {
		return console.log(err);
	}

	var lines = input.split('\n');

	var data = {partijen: partijen, voors: {}, tegens: {}, totaalPerPartij: {}, minYear: 2008, maxYear: 2012};
	var besluiten = {};

	for (var year=2008; year<=2012; year++) {
		data.totaalPerPartij[year] = {};
		data.voors[year] = {};
		data.tegens[year] = {};
		for (var i=0; i<partijen.length; i++) {
			data.totaalPerPartij[year][partijen[i]] = data.voors[year][partijen[i]] = data.tegens[year][partijen[i]] = 0;
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
			var year = datum.split('-')[0] || '';

			if ((politicus || partij) === partij && year.length > 0) {
				partij = partijenMap[partij];

				besluiten[year] = besluiten[year] || {};
				besluiten[year][besluit] = besluiten[year][besluit] || {};

				assert.equal(besluiten[year][besluit][partij], undefined);

				if (soort === 'tegen') {
					besluiten[year][besluit][partij] = 0;
					data.tegens[year][partij]++;
					data.totaalPerPartij[year][partij]++;
				} else if (soort === 'voor') {
					besluiten[year][besluit][partij] = 1;
					data.voors[year][partij]++;
					data.totaalPerPartij[year][partij]++;
				}
			}
		}
	}

	data.totaalPerJaar = {};
	for(year=2008; year<=2012; year++) {
		data.totaalPerJaar[year] = 0;
		for (var name in besluiten[year]) {
			data.totaalPerJaar[year]++;
		}
	}

	data.matrix = {};
	for (var year=2008; year<=2012; year++) {
		data.matrix[year] = {};
		for (var i=0; i<partijen.length; i++) {
			data.matrix[year][partijen[i]] = {};
			for (var j=0; j<partijen.length; j++) {
				data.matrix[year][partijen[i]][partijen[j]] = {eens: 0, oneens: 0, total: 0, eensVoor: 0, eensTegen: 0, oneensBuitensteVoor: 0, oneensBuitensteTegen: 0};
			}
		}
	}

	for (var year=2008; year<=2012; year++) {
		for (var name in besluiten[year]) {
			var besluit = besluiten[year][name];
			for (var a in besluit) {
				data.matrix[year][a][a].total++;
				data.matrix[year][a][a].eens++;
				if (besluit[a]) {
					data.matrix[year][a][a].eensVoor++;
				} else {
					data.matrix[year][a][a].eensTegen++;
				}
				for (var b in besluit) {
					if (a !== b) {
						data.matrix[year][a][b].total++;
						if (besluit[a] === besluit[b]) {
							data.matrix[year][a][b].eens++;
							if (besluit[a]) {
								data.matrix[year][a][b].eensVoor++;
							} else {
								data.matrix[year][a][b].eensTegen++;
							}
						} else {
							data.matrix[year][a][b].oneens++;
							if (besluit[a]) {
								data.matrix[year][a][b].oneensBuitensteVoor++;
							} else {
								data.matrix[year][a][b].oneensBuitensteTegen++;
							}
						}
					}
				}
			}
		}
	}

	console.log('module.exports = ' + JSON.stringify(data) + ';');
});
