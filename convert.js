fs = require('fs');
assert = require('assert');

var partijenMap = {'vvd': 'vvd', 'pvda': 'pvda', 'cda': 'cda', 'pvv': 'pvv', 'sp': 'sp', 'd66': 'd66', 'groenlinks': 'gl', 'christenunie': 'cu', 'sgp': 'sgp', 'pvdd': 'pvdd', 'brinkman': 'obp', 'verdonk': 'ton'};
var partijen = ['vvd', 'pvda', 'cda', 'pvv', 'sp', 'd66', 'gl', 'cu', 'sgp', 'pvdd', 'ton', 'obp'];
var tijden = ['herfst 2008', 'winter 2009', 'lente 2009', 'zomer 2009', 'herfst 2009', 'winter 2010', 'lente 2010', 'zomer 2010', 'herfst 2010', 'winter 2011', 'lente 2011', 'zomer 2011', 'herfst 2011', 'winter 2012', 'lente 2012', 'zomer 2012'];
var tijdenPrefixes = {
	'herfst 2008': ['2008-09', '2008-10', '2008-11'],
	'winter 2009': ['2008-12', '2009-01', '2009-02'],
	'lente 2009': ['2009-03', '2009-04', '2009-05'],
	'zomer 2009': ['2009-06', '2009-07', '2009-08'],
	'herfst 2009': ['2009-09', '2009-10', '2009-11'],
	'winter 2010': ['2009-12', '2010-01', '2010-02'],
	'lente 2010': ['2010-03', '2010-04', '2010-05'],
	'zomer 2010': ['2010-06', '2010-07', '2010-08'],
	'herfst 2010': ['2010-09', '2010-10', '2010-11'],
	'winter 2011': ['2010-12', '2011-01', '2011-02'],
	'lente 2011': ['2011-03', '2011-04', '2011-05'],
	'zomer 2011': ['2011-06', '2011-07', '2011-08'],
	'herfst 2011': ['2011-09', '2011-10', '2011-11'],
	'winter 2012': ['2011-12', '2012-01', '2012-02'],
	'lente 2012': ['2012-03', '2012-04', '2012-05'],
	'zomer 2012': ['2012-06', '2012-07', '2012-08']
};
var tijdenOmschrijvingen = {
	'herfst 2008': "sept, okt, nov '08",
	'winter 2009': "dec '08, jan, feb '09",
	'lente 2009': "mar, apr, mei '09",
	'zomer 2009': "juni, juli, aug '09",
	'herfst 2009': "sept, okt, nov '09",
	'winter 2010': "dec '09, jan, feb '10",
	'lente 2010': "mar, apr, mei '10",
	'zomer 2010': "juni, juli, aug '10",
	'herfst 2010': "sept, okt, nov '10",
	'winter 2011': "dec '10, jan, feb '11",
	'lente 2011': "mar, apr, mei '11",
	'zomer 2011': "juni, juli, aug '11",
	'herfst 2011': "sept, okt, nov '11",
	'winter 2012': "dec '11, jan, feb '12",
	'lente 2012': "mar, apr, mei '12",
	'zomer 2012': "juni, juli, aug '12"
};

var regeringen = {
	'herfst 2008': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'winter 2009': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'lente 2009': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'zomer 2009': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'herfst 2009': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'winter 2010': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'lente 2010': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'zomer 2010': {'vvd': 'oppositie', 'pvda': 'regering', 'cda': 'regering', 'pvv': 'oppositie', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie'},
	'herfst 2010': {'vvd': 'oppositie/regering', 'pvda': 'regering/oppositie', 'cda': 'regering', 'pvv': 'oppositie/gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'regering', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'oppositie/niet in kamer'},
	'winter 2011': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'niet in kamer'},
	'lente 2011': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'niet in kamer'},
	'zomer 2011': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'niet in kamer'},
	'herfst 2011': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'niet in kamer'},
	'winter 2012': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'niet in kamer', 'ton': 'niet in kamer'},
	'lente 2012': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'oppositie', 'ton': 'niet in kamer'},
	'zomer 2012': {'vvd': 'regering', 'pvda': 'oppositie', 'cda': 'regering', 'pvv': 'gedoogpartner', 'sp': 'oppositie', 'd66': 'oppositie', 'gl': 'oppositie', 'cu': 'oppositie', 'sgp': 'oppositie', 'pvdd': 'oppositie', 'obp': 'oppositie', 'ton': 'niet in kamer'}
};

var namen = {'vvd': 'Volkspartij voor Vrijheid en Democratie', 'pvda': 'Partij van de Arbeid', 'cda': 'Christen-Democratisch Appèl', 'pvv': 'Partij voor de Vrijheid', 'sp': 'Socialistische Partij', 'd66': 'Democraten 66', 'gl': 'GroenLinks', 'cu': 'ChristenUnie', 'sgp': 'Staatkundig Gereformeerde Partij', 'pvdd': 'Partij voor de Dieren', 'obp': 'Onafhankelijke Burger Partij (lid-Brinkman)', 'ton': 'Trots op Nederland (lid-Verdonk)'};

fs.readFile('Stemmingen.tsv', 'utf8', function (err, input) {
	if (err) {
		return console.log(err);
	}

	var lines = input.split('\n');

	var data = {tijden: tijden, tijdenPrefixes: tijdenPrefixes, tijdenOmschrijvingen: tijdenOmschrijvingen, partijen: partijen, regeringen: regeringen, namen: namen, voors: {}, tegens: {}, totaalPerPartij: {}};
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

	data.totaalPerJaar = {};
	for (t=0; t<tijden.length; t++) {
		var time = tijden[t];
		data.totaalPerJaar[time] = 0;
		for (var name in besluiten[time]) {
			data.totaalPerJaar[time]++;
		}
	}

	data.matrix = {};
	for (t=0; t<tijden.length; t++) {
		var time = tijden[t];
		data.matrix[time] = {};
		for (var i=0; i<partijen.length; i++) {
			data.matrix[time][partijen[i]] = {};
			for (var j=0; j<partijen.length; j++) {
				data.matrix[time][partijen[i]][partijen[j]] = {eens: 0, oneens: 0, total: 0, eensVoor: 0, eensTegen: 0, oneensBuitensteVoor: 0, oneensBuitensteTegen: 0};
			}
		}
	}

	for (t=0; t<tijden.length; t++) {
		var time = tijden[t];
		for (var name in besluiten[time]) {
			var besluit = besluiten[time][name];
			for (var a in besluit) {
				data.matrix[time][a][a].total++;
				data.matrix[time][a][a].eens++;
				if (besluit[a]) {
					data.matrix[time][a][a].eensVoor++;
				} else {
					data.matrix[time][a][a].eensTegen++;
				}
				for (var b in besluit) {
					if (a !== b) {
						data.matrix[time][a][b].total++;
						if (besluit[a] === besluit[b]) {
							data.matrix[time][a][b].eens++;
							if (besluit[a]) {
								data.matrix[time][a][b].eensVoor++;
							} else {
								data.matrix[time][a][b].eensTegen++;
							}
						} else {
							data.matrix[time][a][b].oneens++;
							if (besluit[a]) {
								data.matrix[time][a][b].oneensBuitensteVoor++;
							} else {
								data.matrix[time][a][b].oneensBuitensteTegen++;
							}
						}
					}
				}
			}
		}
	}

	console.log('module.exports = ' + JSON.stringify(data) + ';');
});
