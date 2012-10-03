/*jshint node:true*/
"use strict";

var data = require('./data.js');
var fs = require('fs');

var output = 'tijd,';
for (var s=0; s<data.soorten.length; s++) {
	output += '"' + data.soorten[s] + ' (eens)",';
	output += '"' + data.soorten[s] + ' (totaal)",';
	output += '"' + data.soorten[s] + ' (procent)",';
}
output += '"totaal (eens)", "totaal (totaal)", "totaal (procent)"\n';

for (var time in data.matrix) {
	output += time + ',';
	var eens = 0, totaal = 0;
	for (s=0; s<data.soorten.length; s++) {
		var soort = data.soorten[s];
		if (data.matrix[time][soort] && data.matrix[time][soort]['vvd'] && data.matrix[time][soort]['vvd']['pvda']) {
			output += data.matrix[time][soort]['vvd']['pvda'].e + ',';
			output += data.matrix[time][soort]['vvd']['pvda'].t + ',';
			output += Math.round(100*data.matrix[time][soort]['vvd']['pvda'].e/data.matrix[time][soort]['vvd']['pvda'].t) + ',';
			eens += data.matrix[time][soort]['vvd']['pvda'].e;
			totaal += data.matrix[time][soort]['vvd']['pvda'].t;
		} else {
			output += '0,0,0,';
		}
	}
	output += eens + ',' + totaal + ',' + Math.round(100*eens/totaal) + '\n';
}

fs.writeFile('csv/vvd-pvda.csv', output);