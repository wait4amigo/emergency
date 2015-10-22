var gDragBoxInteraction;

function createBoxSelectionControl(onBoxStart, onBoxEnd) {
	app.BoxSelectionControl = function(opt_options) {
		var options = opt_options || {};

		var button = document.createElement('button');
		button.setAttribute('title', 'Box Selection');

		var this_ = this;
		var handleBoxSelection = function(e) {
			addBoxSelectionInteraction(onBoxStart, onBoxEnd);
		};

		button.addEventListener('click', handleBoxSelection, false);
		button.addEventListener('touchstart', handleBoxSelection, false);

		var element = document.createElement('div');
		element.className = 'ol-unselectable ol-control box-selection map-control-button';
		element.appendChild(button);

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
	};
	
	ol.inherits(app.BoxSelectionControl, ol.control.Control);
}

function addBoxSelectionInteraction(onBoxStart, onBoxEnd) {
	gDragBoxInteraction = new ol.interaction.DragBox({
		//condition: ol.events.condition.shiftKeyOnly,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: [0, 0, 255, 1]
			})
		})
	});

	gMap.addInteraction(gDragBoxInteraction);

	gDragBoxInteraction.on('boxend', function(e) {
		var extent = gDragBoxInteraction.getGeometry().getExtent();
		onBoxEnd(extent);
		gMap.removeInteraction(gDragBoxInteraction);
	});

	// clear selection when drawing a new box and when clicking on the map
	gDragBoxInteraction.on('boxstart', function(e) {
		onBoxStart(e);
	});
}