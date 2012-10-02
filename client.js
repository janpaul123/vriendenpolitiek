/*jshint node:true jquery:true*/
"use strict";

var client = {};
module.exports = client;

var clayer = require('./clayer');

var findRegering = function(time, data) {
	for (var i=0; i<data.regeringen.length; i++) {
		var regering = data.regeringen[i];
		if (time >= regering.start && time <= regering.eind) {
			return regering;
		}
	}
	console.error('Regering niet gevonden: ' + time);
};

client.Client = function() { return this.init.apply(this, arguments); };
client.Client.prototype = {
	init: function() {
		this.$time = $('#time');
		this.$content = $('#content');
		this.setData(require('./data'));
		
		this.state = null;
		this.pState = null;
		this.time = new client.Time(this, $('#time'), this.data);
		this.matrix = new client.Matrix(this, $('#matrix'), this.data);
		this.content = new client.Content(this, $('#content'), this.data);
		this.setState(null, {time: '2012-06'});

		for (var i=0; i<this.data.partijen.length; i++) {
			var image = new Image();
			image.src = '/img/' + this.data.partijen[i] + '.png';
		}
	},

	setData: function(data) {
		this.data = data;
		this.data.partijen = ['vvd', 'pvda', 'cda', 'sp', 'd66', 'gl', 'cu', 'pvv', 'lpf', 'gpv', 'rpf'];

		this.data.tijden = [];
		for (var year = 1994; year <= 2012; year++) {
			for (var month = 1; month <= 12; month++) {
				var tijd = ((year + '-') + Math.floor(month/10)) + (month%10);
				if (tijd >= this.data.regeringen[0].start && tijd <= this.data.regeringen[this.data.regeringen.length-1].eind) {
					this.data.tijden.push(tijd);
				}
			}
		}
		for (var t=0; t<this.data.tijden.length; t++) {
			var time = this.data.tijden[t];
			if (!this.data.matrix[time]) {
				this.data.matrix[time] = {};
			}
			for (var s=0; s<this.data.soorten.length; s++) {
				var soort = this.data.soorten[s];
				if (!this.data.matrix[time][soort]) {
					this.data.matrix[time][soort] = {};
				}
				for (var i=0; i<this.data.partijen.length; i++) {
					var partij = this.data.partijen[i];
					if (!this.data.matrix[time][soort][partij]) {
						this.data.matrix[time][soort][partij] = {};
					}
					for (var j=0; j<this.data.partijen.length; j++) {
						var partij2 = this.data.partijen[j];
						if (!this.data.matrix[time][soort][partij][partij2]) {
							this.data.matrix[time][soort][partij][partij2] = {e: 0, o: 0, t: 0, ev: 0, et: 0, obv: 0, obt: 0};
						}
					}
				}
			}
		}
	},

	setState: function(pState, state) {
		this.pState = pState;
		this.state = state || this.state;
		this.updateStates();
	},

	resetState: function() {
		this.setState(null, this.state);
	},

	updateStates: function() {
		this.time.setState(this.state, this.pState);
		this.matrix.setState(this.state, this.pState);
		this.content.setState(this.state, this.pState);
	},

	setColumn: function(partij, preview) {
		var state = {time: this.state.time, column: partij};
		this.setState(state, preview ? null : state);
	},

	setRow: function(partij, preview) {
		var state = {time: this.state.time, row: partij};
		this.setState(state, preview ? null : state);
	},

	setCell: function(partij, partij2, preview) {
		var state = {time: this.state.time, row: partij, column: partij2};
		this.setState(state, preview ? null : state);
	},

	clearPartij: function() {
		var state = {time: this.state.time};
		this.setState(state, state);
	},

	setTime: function(time, preview) {
		var state = {time: time, row: this.state.row, column: this.state.column};
		this.setState(state, preview ? null : state);
	}
};

client.Matrix = function() { return this.init.apply(this, arguments); };
client.Matrix.prototype = {
	init: function(delegate, $matrix, data) {
		this.delegate = delegate;
		this.data = data;
		this.time = '';

		this.$table = $('<div class="matrix-table"></div>');
		this.$table.css('margin-left', (900-42*(this.data.partijen.length+1))/2);
		this.$table.css('width', 42*(this.data.partijen.length+1));
		this.$table.css('height', 42*(this.data.partijen.length+1));
		$matrix.append(this.$table);

		this.scrubbable = new clayer.Scrubbable(this.$table, this);

		this.$columns = {};
		var partij;
		for (var x=0; x<this.data.partijen.length; x++) {
			partij = this.data.partijen[x];

			var $columnContainer = $('<div class="matrix-column-container matrix-container"></div>');
			$columnContainer.css('left', 42*(x+1));
			this.$table.append($columnContainer);

			var $column = $('<div class="matrix-column-cell matrix-cell"></div>');
			$columnContainer.append($column);
			$column.text(partij);
			this.$columns[partij] = $column;
		}

		this.$rows = {};
		this.$cells = {};
		for (var y=0; y<this.data.partijen.length; y++) {
			partij = this.data.partijen[y];

			var $rowContainer = $('<div class="matrix-row-container matrix-container"></div>');
			$rowContainer.css('top', 42*(y+1));
			this.$table.append($rowContainer);

			var $row = $('<div class="matrix-row-cell matrix-cell"></div>');
			$rowContainer.append($row);
			$row.text(partij);
			this.$rows[partij] = $row;

			this.$cells[partij] = {};
			for (x=0; x<this.data.partijen.length; x++) {
				var partij2 = this.data.partijen[x];

				var $cellContainer = $('<div class="matrix-inner-container matrix-container"></div>');
				$cellContainer.css('left', 42*(x+1));
				$cellContainer.css('top', 42*(y+1));
				this.$table.append($cellContainer);

				var $cell = $('<div class="matrix-inner-cell matrix-cell"></div>');
				$cellContainer.append($cell);
				this.$cells[partij][partij2] = $cell;
			}
		}

		this.$selection = $('<div class="matrix-selection"></div>');
		this.$table.append(this.$selection);

		this.state = {};
		this.pState = {};
	},

	setState: function(state, pState) {
		this.renderTable((pState || state).time);
		this.showPreview(pState || state);
		this.showState(state);
	},

	mouseLeave: function() {
		
	},

	scrubMove: function(x, y, down) {
		var row = Math.floor(y/42), column = Math.floor(x/42);
		if (row-1 < this.data.partijen.length && column-1 < this.data.partijen.length) {
			var partij = this.data.partijen[row-1], partij2 = this.data.partijen[column-1];

			if (down && partij !== undefined || partij2 !== undefined) {
				this.wasSet = (partij === this.state.row && partij2 === this.state.column);
			}

			if (partij === undefined) {
				this.delegate.setColumn(this.data.partijen[column-1], !down);
			} else if (partij2 === undefined) {
				this.delegate.setRow(this.data.partijen[row-1], !down);
			} else if (partij !== undefined && partij2 !== undefined) {
				this.delegate.setCell(this.data.partijen[row-1], this.data.partijen[column-1], !down);
			}
		}
	},

	scrubLeave: function() {
		this.delegate.resetState();
	},

	scrubClick: function() {
		if (this.wasSet) {
			this.delegate.clearPartij();
		}
	},

	renderTable: function(time) {
		if (this.time !== time) {
			for (var y=0; y<this.data.partijen.length; y++) {
				var partij = this.data.partijen[y];
				for (var x=0; x<this.data.partijen.length; x++) {
					var partij2 = this.data.partijen[x];
					var position = this.data.matrix[time]['motie'][partij][partij2];
					var $cell = this.$cells[partij][partij2];
					var fraction = position.e/position.t;
					if (position.t > 0) {
						$cell.text(Math.round(fraction*100) + '%');
						$cell.css('background-color', 'hsl(' + Math.round(fraction*120) + ', 80%, 70%)');
					} else {
						$cell.text('-');
						$cell.css('background-color', 'hsl(0, 0%, 70%)');
					}
				}
			}
			this.time = time;
		}
	},

	showPreview: function(state) {
		if (this.pState.row !== state.row || this.pState.column !== state.column) {
			for (var y=0; y<this.data.partijen.length; y++) {
				var partij = this.data.partijen[y];

				if (this.pState.row === partij) {
					this.$rows[partij].css('font-weight', 'normal');
				}
				if (state.row === partij) {
					this.$rows[partij].css('font-weight', 'bold');
				}

				if (this.pState.column === partij) {
					this.$columns[partij].css('font-weight', 'normal');
				}
				if (state.column === partij) {
					this.$columns[partij].css('font-weight', 'bold');
				}

				for (var x=0; x<this.data.partijen.length; x++) {
					var partij2 = this.data.partijen[x];
					var position, $cell, fraction;

					if ((this.pState.row || partij ) === partij && (this.pState.column || partij2) === partij2) {
						position = this.data.matrix[state.time]['motie'][partij][partij2];
						$cell = this.$cells[partij][partij2];
						fraction = position.e/position.t;
						if (position.t > 0) {
							$cell.css('background-color', 'hsl(' + Math.round(fraction*120) + ', 80%, 70%)');
						} else {
							$cell.css('background-color', 'hsl(0, 0%, 70%)');
						}
					}

					if (state.row !== undefined || state.column !== undefined) {
						if ((state.row || partij ) === partij && (state.column || partij2) === partij2) {
							position = this.data.matrix[state.time]['motie'][partij][partij2];
							$cell = this.$cells[partij][partij2];
							fraction = position.e/position.t;
							if (position.t > 0) {
								$cell.css('background-color', 'hsl(' + Math.round(fraction*120) + ', 80%, 50%)');
							} else {
								$cell.css('background-color', 'hsl(0, 0%, 50%)');
							}
						}
					}
				}
			}
		}
		this.pState = state;
	},

	showState: function(state) {
		if (this.state.row !== state.row || this.state.column !== state.column) {
			if (state.row !== undefined || state.column !== undefined) {
				this.$selection.addClass('matrix-selection-visible');
				if (state.row !== undefined) {
					this.$selection.css('top', 42*(this.data.partijen.indexOf(state.row)+1)-4);
					this.$selection.css('height', 42+4);
				} else {
					this.$selection.css('top', 0);
					this.$selection.css('height', 42*(this.data.partijen.length+1));
				}
				if (state.column !== undefined) {
					this.$selection.css('left', 42*(this.data.partijen.indexOf(state.column)+1)-4);
					this.$selection.css('width', 42+4);
				} else {
					this.$selection.css('left', 0);
					this.$selection.css('width', 42*(this.data.partijen.length+1));
				}
			} else {
				this.$selection.removeClass('matrix-selection-visible');
			}
		}

		this.state = state;
	}
};

client.Time = function() { return this.init.apply(this, arguments); };
client.Time.prototype = {
	init: function(delegate, $time, data) {
		this.delegate = delegate;
		this.$time = $time;
		this.data = data;

		this.$container = $('<div class="time-container"></div>');
		this.$time.append(this.$container);

		this.$value = $('<div class="time-value"></div>');
		this.$container.append(this.$value);

		this.$slider = $('<div class="time-slider"></div>');
		this.$container.append(this.$slider);

		this.slider = new clayer.Slider(this.$slider, this, 2);
		var width = 2*(this.data.tijden.length);
		this.$slider.width(width);

		this.$desc = $('<div class="time-slider-desc"></div>');
		this.$slider.find('.clayer-slider-knob').append(this.$desc);

		width += 170;
		this.$container.width(width);
		this.$container.css('margin-left', -width/2);
	},

	setState: function(state, pState) {
		var time = (pState || state).time;
		if (state.time === time) {
			this.slider.setValue(this.data.tijden.indexOf(time));
		} else {
			this.slider.setKnobValue(this.data.tijden.indexOf(time));
		}
		this.$value.text(time);
		this.$desc.text(findRegering(time, this.data).naam);
	},

	sliderChanged: function(value, down) {
		this.delegate.setTime(this.data.tijden[value], !down);
	}
};

client.Content = function() { return this.init.apply(this, arguments); };
client.Content.prototype = {
	init: function(delegate, $content, data) {
		this.delegate = delegate;
		this.$content = $content;
		this.data = data;

		this.$cross = this.$content.find('.content-cross');
		this.$single = this.$content.find('.content-single');

		this.partijCrossLeft = new client.Partij(this, this.$cross.find('.content-cross-comparison-left'), this.data);
		this.partijCrossRight = new client.Partij(this, this.$cross.find('.content-cross-comparison-right'), this.data);

		this.partijSingleLeft = new client.Partij(this, this.$single.find('.content-single-left'), this.data);
		this.partijSingleRight = new client.Partij(this, this.$single.find('.content-single-right'), this.data);
	},

	setState: function(state, pState) {
		state = pState || state;

		if (state.row !== undefined && state.column !== undefined) {
			this.showCross(state);
		} else if (state.row !== undefined || state.column !== undefined) {
			this.showSingle(state);
		} else {
			this.$cross.removeClass('content-cross-visible');
			this.$single.removeClass('content-single-visible');
		}
	},

	showCross: function(state) {
		this.$cross.addClass('content-cross-visible');
		this.$single.removeClass('content-single-visible');

		var $description = this.$cross.find('.content-cross-comparison-description');
		var $value = this.$cross.find('.content-cross-comparison-value');
		var position = this.data.matrix[state.time]['motie'][state.row][state.column];
		var fraction = position.e/position.t, percentage = Math.round(fraction*100);

		if (position.t > 0) {
			$value.text(percentage + '% eens');
			if (state.row === state.column) {
				$description.text('narcisme');
			} else if (percentage <= 35) {
				$description.text('aartsrivalen');
			} else if (percentage <= 45) {
				$description.text('vijanden');
			} else if (percentage <= 55) {
				$description.text('neutraal');
			} else if (percentage <= 65) {
				$description.text('matties');
			} else if (percentage <= 75) {
				$description.text('goede vrienden');
			} else {
				$description.text('BFFs');
			}
		} else {
			$value.text('geen data');
			$description.text('');
		}

		this.partijCrossLeft.setPartijTime(state.row, state.time);
		this.partijCrossRight.setPartijTime(state.column, state.time);
	},

	showSingle: function(state) {
		this.$cross.removeClass('content-cross-visible');
		this.$single.addClass('content-single-visible');
		var partij = state.row || state.column;
		var vriend = null, vriendFraction = 0, vijand = null, vijandFraction = Infinity;

		for (var i=0; i<this.data.partijen.length; i++) {
			var partij2 = this.data.partijen[i];
			var position = this.data.matrix[state.time]['motie'][partij][partij2];
			if (partij !== partij2 && position.t > 0) {
				var fraction = position.e/position.t;
				if (fraction > vriendFraction) {
					vriendFraction = fraction;
					vriend = partij2;
				}
				if (fraction < vijandFraction) {
					vijandFraction  = fraction;
					vijand = partij2;
				}
			}
		}

		this.$single.find('.content-single-partij').text(this.data.namen[partij]);
		this.$single.find('.content-single-partij-logo').html('<img class="partij-logo" src="/img/' + partij +'.png"/>');
		this.$single.find('.content-single-title-left').text('Beste vriend (' + Math.round(vriendFraction*100) + '%)');
		this.$single.find('.content-single-title-right').text('Grootste vijand (' + Math.round(vijandFraction*100) + '%)');
		if (vriend !== null && vijand !== null) {
			this.$single.find('.content-single-left-container').show();
			this.$single.find('.content-single-right-container').show();
			this.partijSingleLeft.setPartijTime(vriend, state.time);
			this.partijSingleRight.setPartijTime(vijand, state.time);
		} else {
			this.$single.find('.content-single-left-container').hide();
			this.$single.find('.content-single-right-container').hide();
		}
	}
};

client.Partij = function() { return this.init.apply(this, arguments); };
client.Partij.prototype = {
	init: function(delegate, $container, data) {
		this.delegate = delegate;
		this.$container = $container;
		this.data = data;
		this.$partij = $('<div class="content-partij"><div class="content-partij-logo"></div><div class="content-partij-header"><div class="content-partij-name"></div><div class="content-partij-regering"></div><div class="content-partij-voor"></div><div class="content-partij-totaal"></div></div><div class="content-partij-content"></div></div>');
		this.$container.append(this.$partij);
	},

	setPartijTime: function(partij, time) {
		if (this.partij !== partij || this.time !== time) {
			this.$partij.find('.content-partij-logo').html('<img class="partij-logo" src="/img/' + partij +'.png"/>');
			this.$partij.find('.content-partij-name').text(this.data.namen[partij]);
			this.$partij.find('.content-partij-regering').text(this.getRegeringText(partij, time));
			if (this.data.matrix[time]['motie'][partij][partij].e > 0) {
				this.$partij.find('.content-partij-voor').text(Math.round(this.data.matrix[time]['motie'][partij][partij].ev/this.data.matrix[time]['motie'][partij][partij].e*100) + '% voor (' + this.data.matrix[time]['motie'][partij][partij].ev + '/' + this.data.matrix[time]['motie'][partij][partij].e + ')');
			} else {
				this.$partij.find('.content-partij-voor').text('');
			}
			this.$partij.find('.content-partij-totaal').text('');
			this.partij = partij;
			this.time = time;
		}
	},

	getRegeringText: function(partij, time) {
		var regering = findRegering(time, this.data);
		if (regering.regering.indexOf(partij) >= 0) return 'regering';
		else if (regering.gedoogsteun.indexOf(partij) >= 0) return 'gedoogpartij';
		else return 'oppositie';
	}
};