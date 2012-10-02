/*jshint node:true*/
"use strict";
module.exports = function() {
	var partijen = ['vvd', 'pvda', 'cda', 'sp', 'd66', 'gl', 'cu', 'sgp', 'pvv', 'pvdd', 'lpf', 'rpf', 'gpv', 'cd', 'groephendriks', 'groepnijpels', 'ou55plus', 'aov', 'groepverkerk', 'groeplazrak', 'groepnawijn', 'groepwilders', 'groepdejong', 'groepdejong2', 'ln', 'groepwijnschenk', 'lidverdonk', 'lidbrinkman', 'groepeerdmansvanschijndel', 'groepvanoudenallen'];

	var regeringen = [
		{naam: 'Kok I (paars I)', start: '1994-08', eind: '1998-07', minpres: 'Wim Kok', regering: ['vvd', 'pvda', 'd66'], gedoogsteun: []},
		{naam: 'Kok II (paars II)', start: '1998-08', eind: '2002-07', minpres: 'Wim Kok', regering: ['vvd', 'pvda', 'd66'], gedoogsteun: []},
		{naam: 'Balkenende I', start: '2002-08', eind: '2003-05', minpres: 'Jan Peter Balkenende', regering: ['cda', 'lpf', 'vvd'], gedoogsteun: []},
		{naam: 'Balkenende II', start: '2003-06', eind: '2006-06', minpres: 'Jan Peter Balkenende', regering: ['cda', 'vvd', 'd66'], gedoogsteun: []},
		{naam: 'Balkenende III', start: '2006-07', eind: '2007-02', minpres: 'Jan Peter Balkenende', regering: ['cda', 'vvd']},
		{naam: 'Balkenende IV', start: '2007-03', eind: '2010-09', minpres: 'Jan Peter Balkenende', regering: ['cda', 'pvda', 'cu'], gedoogsteun: []},
		{naam: 'Rutte', start: '2010-10', eind: '2012-06', minpres: 'Mark Rutte', regering: ['vvd', 'cda'], gedoogsteun: ['pvv']}
	];

	var namen = {'vvd': 'Volkspartij voor Vrijheid en Democratie', 'pvda': 'Partij van de Arbeid', 'cda': 'Christen-Democratisch Appèl', 'pvv': 'Partij voor de Vrijheid', 'sp': 'Socialistische Partij', 'd66': 'Democraten 66', 'gl': 'GroenLinks', 'cu': 'ChristenUnie', 'lpf': 'Lijst Pim Fortuyn', 'gpv': 'Gereformeerd Politiek Verbond', 'rpf': 'Reformatorische Politieke Federatie'};

	var soorten = ['motie', 'amendement', 'wetsvoorstel', 'anders'];

	return {partijen: partijen, regeringen: regeringen, namen: namen, soorten: soorten};
};