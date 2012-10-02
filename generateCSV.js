/*jshint node:true*/
"use strict";

var data = require('./data.js');
var fs = require('fs');

var generate = function(regering, voortegen, soort) {
	var voortegenaccessor = (voortegen === 'voor' ? 'ev' : (voortegen === 'tegen' ? 'et' : 'e'));

	var matrix = {};
	var matrixTotaal = {};
	var partijen = {};

	for (var time in data.matrix) {
		if (time >= regering.start && time <= regering.eind) {
			for (var s in data.matrix[time]) {
				if (s === soort || soort === undefined) {
					var table = data.matrix[time][s];
					for (var a in table) {
						partijen[a] = partijen[a] || 0;
						partijen[a] += table[a][a][voortegenaccessor];
						matrix[a] = matrix[a] || {};
						matrixTotaal[a] = matrixTotaal[a] || {};
						for (var b in table[a]) {
							matrix[a][b] = matrix[a][b] || 0;
							matrix[a][b] += table[a][b][voortegenaccessor];
							matrixTotaal[a][b] = matrixTotaal[a][b] || 0;
							matrixTotaal[a][b] += table[a][b].t;
						}
					}
				}
			}
		}
	}

	var output = '';
	for (var name in matrix) {
		output += ',' + name;
	}
	output += '\n';

	var i=0;
	for (var a in matrix) {
		output += a;
		var j =0;
		for (var b in matrix) {
			output += ',';
			if (i <= j) {
				output += matrix[a][b] || 0;
			} else {
				if (matrixTotaal[a][b] > 0) {
					output += Math.round(matrix[a][b]/matrixTotaal[a][b]*100) || '0';
					output += '%';
				} else {
					output += '-';
				}
			}
			j++;
		}
		output += '\n';
		i++;
	}

	output += '\n Top ' + regering.naam + ' - ' + (soort || 'totaal') + ' - ' + (voortegen || 'totaal') + '\n';

	var sortable = [];
	for (var partij in partijen) {
		sortable.push([partij, partijen[partij]]);
	}
	sortable.sort(function(a, b) { return b[1] - a[1]; });

	for (var z=0; z<sortable.length; z++) {
		output += sortable[z][0] + ',' + sortable[z][1] + '\n';
	}

	output += '\nStart periode,Eind periode\n';
	output += regering.start + ',' + regering.eind + '\n';

	fs.writeFile('csv/' + regering.naam + ' - ' + (soort || 'totaal') + ' - ' + (voortegen || 'totaal') + '.csv', output);
};

var voortegens = ['voor', 'tegen', undefined];
var soorten = ['motie', 'amendement', 'wetsvoorstel', 'anders', undefined];
for (var r=0; r<data.regeringen.length; r++) {
	for (var v=0; v<voortegens.length; v++) {
		for (var so=0; so<soorten.length; so++) {
			generate(data.regeringen[r], voortegens[v], soorten[so]);
		}
	}
}
