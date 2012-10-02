/*jshint node:true*/
"use strict";

// e: eens
// o: oneens
// t: totaal
// ev: eens-voor
// et: eens-tegen
// obv: oneens, buitenste (array) voor
// obt: oneens, buitenste (array) tegen

module.exports = function(data) {
	var tijden = data.tijden, partijen = data.partijen, besluiten = data.besluiten, soorten = data.soorten;

	data.totaalPerMaand = {};
	for (var time in besluiten) {
		data.totaalPerMaand[time] = 0;
		for (var name in besluiten[time]) {
			data.totaalPerMaand[time]++;
		}
		console.error(time + ': ' + data.totaalPerMaand[time]);
	}

	data.matrix = {};
	for (var time in besluiten) {
		data.matrix[time] = {};
		for (var s=0; s<soorten.length; s++) {
			var soort = soorten[s];
			data.matrix[time][soort] = {};
		}
	}

	for (var time in besluiten) {
		for (var name in besluiten[time]) {
			var besluit = besluiten[time][name];
			for (var a in besluit.partijen) {
				if (partijen.indexOf(a) >= 0) {
					if (data.matrix[time][besluit.soort][a] === undefined) {
						data.matrix[time][besluit.soort][a] = {};
					}
					if (data.matrix[time][besluit.soort][a][a] === undefined) {
						data.matrix[time][besluit.soort][a][a] = {e: 0, o: 0, t: 0, ev: 0, et: 0, obv: 0, obt: 0};
					}
					data.matrix[time][besluit.soort][a][a].t++;
					data.matrix[time][besluit.soort][a][a].e++;
					if (besluit.partijen[a]) {
						data.matrix[time][besluit.soort][a][a].ev++;
					} else {
						data.matrix[time][besluit.soort][a][a].et++;
					}
					for (var b in besluit.partijen) {
						if (partijen.indexOf(b) >= 0) {
							if (a !== b) {
								if (data.matrix[time][besluit.soort][a][b] === undefined) {
									data.matrix[time][besluit.soort][a][b] = {e: 0, o: 0, t: 0, ev: 0, et: 0, obv: 0, obt: 0};
								}
								data.matrix[time][besluit.soort][a][b].t++;
								if (besluit.partijen[a] === besluit.partijen[b]) {
									data.matrix[time][besluit.soort][a][b].e++;
									if (besluit.partijen[a]) {
										data.matrix[time][besluit.soort][a][b].ev++;
									} else {
										data.matrix[time][besluit.soort][a][b].et++;
									}
								} else {
									data.matrix[time][besluit.soort][a][b].o++;
									if (besluit.partijen[a]) {
										data.matrix[time][besluit.soort][a][b].obv++;
									} else {
										data.matrix[time][besluit.soort][a][b].obt++;
									}
								}
							}
						}
					}
				} else {
					console.error(a);
				}
			}
		}
	}
};