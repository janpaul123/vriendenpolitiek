fs = require('fs');
assert = require('assert');

var partijen = ['vvd', 'pvda', 'cda', 'pvv', 'groenlinks', 'd66', 'christenunie', 'verdonk', 'sp', 'sgp', 'brinkman', 'pvdd'];

fs.readFile('Stemmingen.tsv', 'utf8', function (err, input) {
	if (err) {
		return console.log(err);
	}

	var lines = input.split('\n');

	var data = {voors: {}, tegens: {}, totaalPerPartij: {}};
	var besluiten = {};

	for (var jaar=2008; jaar<=2012; jaar++) {
		data.totaalPerPartij[jaar] = {};
		data.voors[jaar] = {};
		data.tegens[jaar] = {};
		for (var i=0; i<partijen.length; i++) {
			data.totaalPerPartij[jaar][partijen[i]] = data.voors[jaar][partijen[i]] = data.tegens[jaar][partijen[i]] = 0;
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
			var jaar = datum.split('-')[0] || '';

			if ((politicus || partij) === partij && jaar.length > 0) {
				besluiten[jaar] = besluiten[jaar] || {};
				besluiten[jaar][besluit] = besluiten[jaar][besluit] || {};

				assert.equal(besluiten[jaar][besluit][partij], undefined);
				if (partijen.indexOf(partij) < 0) {
					console.log('onbekende partij: ' + partij);
					return;
				}

				if (soort === 'tegen') {
					besluiten[jaar][besluit][partij] = 0;
					data.tegens[jaar][partij]++;
					data.totaalPerPartij[jaar][partij]++;
				} else if (soort === 'voor') {
					besluiten[jaar][besluit][partij] = 1;
					data.voors[jaar][partij]++;
					data.totaalPerPartij[jaar][partij]++;
				}
			}
		}
	}

	data.totaalPerJaar = {};
	for(jaar=2008; jaar<=2012; jaar++) {
		data.totaalPerJaar[jaar] = 0;
		for (var name in besluiten[jaar]) {
			data.totaalPerJaar[jaar]++;
		}
	}

	data.matrix = {};
	for (var jaar=2008; jaar<=2012; jaar++) {
		data.matrix[jaar] = {};
		for (var i=0; i<partijen.length; i++) {
			data.matrix[jaar][partijen[i]] = {};
			for (var j=0; j<partijen.length; j++) {
				data.matrix[jaar][partijen[i]][partijen[j]] = {eens: 0, oneens: 0, total: 0, eensVoor: 0, eensTegen: 0, oneensBuitensteVoor: 0, oneensBuitensteTegen: 0};
			}
		}
	}

	for (var jaar=2008; jaar<=2012; jaar++) {
		for (var name in besluiten[jaar]) {
			var besluit = besluiten[jaar][name];
			for (var a in besluit) {
				for (var b in besluit) {
					data.matrix[jaar][a][b].total++;
					data.matrix[jaar][b][a].total++;
					if (besluit[a] === besluit[b]) {
						data.matrix[jaar][a][b].eens++;
						data.matrix[jaar][b][a].eens++;
						if (besluit[a]) {
							data.matrix[jaar][a][b].eensVoor++;
							data.matrix[jaar][b][a].eensVoor++;
						} else {
							data.matrix[jaar][a][b].eensTegen++;
							data.matrix[jaar][b][a].eensTegen++;
						}
					} else {
						data.matrix[jaar][a][b].oneens++;
						data.matrix[jaar][b][a].oneens++;
						if (besluit[a]) {
							data.matrix[jaar][a][b].oneensBuitensteVoor++;
							data.matrix[jaar][b][a].oneensBuitensteTegen++;
						} else {
							data.matrix[jaar][a][b].oneensBuitensteTegen++;
							data.matrix[jaar][b][a].oneensBuitensteVoor++;
						}
					}
				}
			}
		}
	}

	console.log('module.exports = ' + JSON.stringify(data) + ';');
});
