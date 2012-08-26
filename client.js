/*jshint node:true jquery:true*/
"use strict";

var client = {};
module.exports = client;

var clayer = require('./clayer');

client.Client = function() { return this.init.apply(this, arguments); };
client.Client.prototype = {
	init: function() {
		this.$year = $('#year');
		this.$content = $('#content');
		this.data = require('./data');
		this.state = null;
		this.pState = null;
		this.year = new client.Year(this, $('#year'), this.data);
		this.matrix = new client.Matrix(this, $('#matrix'), this.data);
		this.setState({year: 2012});
	},

	setState: function(state) {
		this.pState = null;
		this.state = state;
		this.updateStates();
	},

	previewState: function(state) {
		this.pState = state;
		this.updateStates();
	},

	updateStates: function() {
		this.year.setState(this.state, this.pState);
		this.matrix.setState(this.state, this.pState);
	},

	resetState: function() {
		if (this.pState !== null) {
			this.setState(this.state);
		}
	},

	previewColumn: function(partij) {
		this.previewState({year: this.state.year, column: partij});
	},

	previewRow: function(partij) {
		this.previewState({year: this.state.year, row: partij});
	},

	previewCell: function(partij, partij2) {
		this.previewState({year: this.state.year, row: partij, column: partij2});
	},

	selectColumn: function(partij) {
		this.setState({year: this.state.year, column: partij});
	},

	selectRow: function(partij) {
		this.setState({year: this.state.year, row: partij});
	},

	selectCell: function(partij, partij2) {
		this.setState({year: this.state.year, row: partij, column: partij2});
	},

	previewYear: function(year) {
		this.previewState({year: year, row: this.state.row, column: this.state.column});
	},

	selectYear: function(year) {
		this.setState({year: year, row: this.state.row, column: this.state.column});
	}
};

client.Matrix = function() { return this.init.apply(this, arguments); };
client.Matrix.prototype = {
	init: function(delegate, $matrix, data) {
		this.delegate = delegate;
		this.data = data;
		this.year = 0;

		this.$table = $('<div class="matrix-table"></div>');
		this.$table.css('margin-left', (900-44*(this.data.partijen.length+1))/2);
		this.$table.css('width', 44*(this.data.partijen.length+1));
		this.$table.css('height', 44*(this.data.partijen.length+1));
		$matrix.append(this.$table);
		this.$table.on('mouseleave', this.mouseLeave.bind(this));

		var $topLeft = $('<div class="matrix-topleft"></div>');
		this.$table.append($topLeft);
		$topLeft.on('mouseenter', this.mouseLeave.bind(this));

		this.$columns = {};
		var partij;
		for (var x=0; x<this.data.partijen.length; x++) {
			partij = this.data.partijen[x];

			var $columnContainer = $('<div class="matrix-column-container matrix-container"></div>');
			$columnContainer.css('left', 44*(x+1));
			this.$table.append($columnContainer);

			var $column = $('<div class="matrix-column-cell matrix-cell"></div>');
			$columnContainer.append($column);
			$column.text(partij);
			$column.data('partij', partij);
			$column.on('click', this.columnClick.bind(this));
			$column.on('mousemove', this.columnMouseMove.bind(this));
			this.$columns[partij] = $column;
		}

		this.$rows = {};
		this.$cells = {};
		for (var y=0; y<this.data.partijen.length; y++) {
			partij = this.data.partijen[y];

			var $rowContainer = $('<div class="matrix-row-container matrix-container"></div>');
			$rowContainer.css('top', 44*(y+1));
			this.$table.append($rowContainer);

			var $row = $('<div class="matrix-row-cell matrix-cell"></div>');
			$rowContainer.append($row);
			$row.text(partij);
			$row.data('partij', partij);
			$row.on('click', this.rowClick.bind(this));
			$row.on('mousemove', this.rowMouseMove.bind(this));
			this.$rows[partij] = $row;

			this.$cells[partij] = {};
			for (x=0; x<this.data.partijen.length; x++) {
				var partij2 = this.data.partijen[x];

				var $cellContainer = $('<div class="matrix-inner-container matrix-container"></div>');
				$cellContainer.css('left', 44*(x+1));
				$cellContainer.css('top', 44*(y+1));
				this.$table.append($cellContainer);

				var $cell = $('<div class="matrix-inner-cell matrix-cell"></div>');
				$cellContainer.append($cell);
				$cell.data('partij', partij);
				$cell.data('partij2', partij2);
				$cell.on('click', this.cellClick.bind(this));
				$cell.on('mousemove', this.cellMouseMove.bind(this));
				this.$cells[partij][partij2] = $cell;
			}
		}

		this.$selection = $('<div class="matrix-selection"></div>');
		this.$table.append(this.$selection);

		this.state = {};
		this.pState = {};
	},

	setState: function(state, pState) {
		this.renderTable((pState || state).year);
		this.showPreview(pState || state);
		this.showState(state);
	},

	mouseLeave: function() {
		this.delegate.resetState();
	},

	columnMouseMove: function(event) {
		this.delegate.previewColumn($(event.delegateTarget).data('partij'));
	},

	rowMouseMove: function(event) {
		this.delegate.previewRow($(event.delegateTarget).data('partij'));
	},

	cellMouseMove: function(event) {
		var $target = $(event.delegateTarget);
		this.delegate.previewCell($target.data('partij'), $target.data('partij2'));
	},

	columnClick: function(event) {
		this.delegate.selectColumn($(event.delegateTarget).data('partij'));
	},

	rowClick: function(event) {
		this.delegate.selectRow($(event.delegateTarget).data('partij'));
	},

	cellClick: function(event) {
		var $target = $(event.delegateTarget);
		this.delegate.selectCell($target.data('partij'), $target.data('partij2'));
	},

	renderTable: function(year) {
		if (this.year !== year) {
			for (var y=0; y<this.data.partijen.length; y++) {
				var partij = this.data.partijen[y];
				for (var x=0; x<this.data.partijen.length; x++) {
					var partij2 = this.data.partijen[x];
					var position = this.data.matrix[year][partij][partij2];
					var $cell = this.$cells[partij][partij2];
					var fraction = position.eens/position.total;
					if (position.total > 0) {
						$cell.text(Math.round(fraction*100) + '%');
						$cell.css('background-color', 'hsl(' + Math.round(fraction*120) + ', 80%, 70%)');
					} else {
						$cell.text('-');
						$cell.css('background-color', 'hsl(0, 0%, 70%)');
					}
				}
			}
			this.year = year;
		}
	},

	showPreview: function(state) {
		if (this.pState.row !== state.row || this.pState.column !== state.column) {
			for (var y=0; y<this.data.partijen.length; y++) {
				var partij = this.data.partijen[y];

				if (this.pState.row === partij) {
					this.$rows[partij].css('background-color', 'hsl(0, 0%, 100%');
				}
				if (state.row === partij) {
					this.$rows[partij].css('background-color', 'hsl(0, 0%, 70%');
				}

				if (this.pState.column === partij) {
					this.$columns[partij].css('background-color', 'hsl(0, 0%, 100%');
				}
				if (state.column === partij) {
					this.$columns[partij].css('background-color', 'hsl(0, 0%, 70%');
				}

				for (var x=0; x<this.data.partijen.length; x++) {
					var partij2 = this.data.partijen[x];
					var position, $cell, fraction;

					if ((this.pState.row || partij ) === partij && (this.pState.column || partij2) === partij2) {
						position = this.data.matrix[state.year][partij][partij2];
						$cell = this.$cells[partij][partij2];
						fraction = position.eens/position.total;
						if (position.total > 0) {
							$cell.css('background-color', 'hsl(' + Math.round(fraction*120) + ', 80%, 70%)');
						} else {
							$cell.css('background-color', 'hsl(0, 0%, 70%)');
						}
					}

					if (state.row !== undefined || state.column !== undefined) {
						if ((state.row || partij ) === partij && (state.column || partij2) === partij2) {
							position = this.data.matrix[state.year][partij][partij2];
							$cell = this.$cells[partij][partij2];
							fraction = position.eens/position.total;
							if (position.total > 0) {
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
					this.$selection.css('top', 44*(this.data.partijen.indexOf(state.row)+1));
					this.$selection.css('height', 44-4);
					this.$selection.addClass('matrix-selection-horizontal');
				} else {
					this.$selection.css('top', 0);
					this.$selection.css('height', 44*(this.data.partijen.length+1));
					this.$selection.removeClass('matrix-selection-horizontal');
				}
				if (state.column !== undefined) {
					this.$selection.css('left', 44*(this.data.partijen.indexOf(state.column)+1));
					this.$selection.css('width', 44-4);
					this.$selection.addClass('matrix-selection-vertical');
				} else {
					this.$selection.css('left', 0);
					this.$selection.css('width', 44*(this.data.partijen.length+1));
					this.$selection.removeClass('matrix-selection-vertical');
				}
			} else {
				this.$selection.removeClass('matrix-selection-visible');
			}
		}

		this.state = state;
	}
};

client.Year = function() { return this.init.apply(this, arguments); };
client.Year.prototype = {
	init: function(delegate, $year, data) {
		this.delegate = delegate;
		this.$year = $year;
		this.data = data;

		this.$container = $('<div class="year-container"></div>');
		this.$year.append(this.$container);

		this.$value = $('<div class="year-value"></div>');
		this.$container.append(this.$value);

		this.$slider = $('<div class="year-slider"></div>');
		this.$container.append(this.$slider);

		this.slider = new clayer.Slider(this.$slider, this, 50);
		var width = 50*(data.maxYear-data.minYear+1);
		this.$slider.width(width);

		width += 100;
		this.$container.width(width);
		this.$container.css('margin-left', -width/2);
	},

	setState: function(state, pState) {
		var year = (pState || state).year;
		if (state.year === year) {
			this.slider.setValue(year - this.data.minYear);
		} else {
			this.slider.setKnobValue(year - this.data.minYear);
		}
		this.$value.text(year);
	},

	sliderChanged: function(value) {
		this.delegate.selectYear(Math.min(this.data.minYear + value, this.data.maxYear));
	},

	sliderPreviewChanged: function(value) {
		this.delegate.previewYear(Math.min(this.data.minYear + value, this.data.maxYear));
	}
};