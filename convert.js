fs = require('fs');
assert = require('assert');

var partijen = ['vvd', 'pvda', 'cda', 'pvv', 'groenlinks', 'd66', 'christenunie', 'verdonk', 'sp', 'sgp', 'brinkman', 'pvdd'];

fs.readFile('Stemmingen.tsv', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	var lines = data.split('\n');
	var besluiten = [];
	var totaal = [];
	var voors = [];
	var tegens = [];

	for (var jaar=2008; jaar<=2012; jaar++) {
		totaal[jaar] = {};
		voors[jaar] = {};
		tegens[jaar] = {};
		for (var i=0; i<partijen.length; i++) {
			totaal[jaar][partijen[i]] = voors[jaar][partijen[i]] = tegens[jaar][partijen[i]] = 0;
		}
	}

	for (var y=1; y<lines.length; y++) {
		if (y % 10000 === 0) {
			console.log('regel ' + y);
		}

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
					tegens[jaar][partij]++;
					totaal[jaar][partij]++;
				} else if (soort === 'voor') {
					besluiten[jaar][besluit][partij] = 1;
					voors[jaar][partij]++;
					totaal[jaar][partij]++;
				}
			}
		}
	}


	console.log('totaal:');
	for(var i=0; i<partijen.length; i++) {
		var output = partijen[i];
		for(jaar=2008; jaar<=2012; jaar++) {
			output += '\t' + totaal[jaar][partijen[i]];
		}
		console.log(output);
	}
	console.log();

	console.log('voors:');
	for(var i=0; i<partijen.length; i++) {
		var output = partijen[i];
		for(jaar=2008; jaar<=2012; jaar++) {
			output += '\t' + voors[jaar][partijen[i]];
		}
		console.log(output);
	}
	console.log();

	console.log('tegens:');
	for(var i=0; i<partijen.length; i++) {
		var output = partijen[i];
		for(jaar=2008; jaar<=2012; jaar++) {
			output += '\t' + tegens[jaar][partijen[i]];
		}
		console.log(output);
	}
	console.log();

	console.log('helemaal totaal:');
	var output = '';
	for(jaar=2008; jaar<=2012; jaar++) {
		var length = 0;
		for (var name in besluiten[jaar]) {
			length++;
		}
		output += '\t' + length;
	}
	console.log(output);
	console.log();

	var matrix = [];
	for (var jaar=2008; jaar<=2012; jaar++) {
		matrix[jaar] = {};
		for (var i=0; i<partijen.length; i++) {
			matrix[jaar][partijen[i]] = {};
			for (var j=0; j<partijen.length; j++) {
				matrix[jaar][partijen[i]][partijen[j]] = {agree: 0, disagree: 0, total: 0, agreeVoor: 0, agreeTegen: 0, disagreeFirstVoor: 0, disagreeFirstTegen: 0};
			}
		}
	}

	for (var jaar=2008; jaar<=2012; jaar++) {
		for (var name in besluiten[jaar]) {
			var besluit = besluiten[jaar][name];
			for (var a in besluit) {
				for (var b in besluit) {
					matrix[jaar][a][b].total++;
					matrix[jaar][b][a].total++;
					if (besluit[a] === besluit[b]) {
						matrix[jaar][a][b].agree++;
						matrix[jaar][b][a].agree++;
						if (besluit[a]) {
							matrix[jaar][a][b].agreeVoor++;
							matrix[jaar][b][a].agreeVoor++;
						} else {
							matrix[jaar][a][b].agreeTegen++;
							matrix[jaar][b][a].agreeTegen++;
						}
					} else {
						matrix[jaar][a][b].disagree++;
						matrix[jaar][b][a].disagree++;
						if (besluit[a]) {
							matrix[jaar][a][b].disagreeFirstVoor++;
							matrix[jaar][b][a].disagreeFirstTegen++;
						} else {
							matrix[jaar][a][b].disagreeFirstTegen++;
							matrix[jaar][b][a].disagreeFirstVoor++;
						}
					}
				}
			}
		}
	}

	for (var jaar=2008; jaar<=2012; jaar++) {
		console.log('jaar ' + jaar + ':');

		var output = '';
		for (var i=0; i<partijen.length; i++) {
			output += '\t' + partijen[i];
		}
		console.log(output);

		for (var i=0; i<partijen.length; i++) {
			var output = partijen[i];
			for (var j=0; j<partijen.length; j++) {
				output += '\t' + Math.round(matrix[jaar][partijen[i]][partijen[j]].agree / matrix[jaar][partijen[i]][partijen[j]].total * 100);
			}
			console.log(output);
		}
		console.log();
	}
});
