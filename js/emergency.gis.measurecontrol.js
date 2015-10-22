var gMeasureTooltipElement;
var gMeasureTooltip;
var gHelpTooltipElement;
var gHelpTooltip;

var gMeasureDraw;

var gSketch;
var gAddedMeasureOvelays = [];

var gMeasureType = '';

var gMeasureLayer;
var gMeasureLayerSrc;

function hideMeasureTootip() {
	$(gHelpTooltipElement).addClass('hidden');
}

function createMeasureLayer() {
	gMeasureLayerSrc = new ol.source.Vector();

	gMeasureLayer = new ol.layer.Vector({
		source: gMeasureLayerSrc,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			}),
			stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({
					color: '#ffcc33'
				})
			})
		})
	});
}

function getMeasureType() {
	return gMeasureType;
}

function clearMeasureType() {
	gMeasureType = '';
}

function createMeasureDistanceControl() {
	app.MeasureDistanceControl = function(opt_options) {
		var options = opt_options || {};

		var button = document.createElement('button');
		button.setAttribute('title', 'Measure Distance');

		var handleMeasureDistance = function(e) {
			gMeasureType = 'line';
			addMeasureInteraction();
		};

		button.addEventListener('click', handleMeasureDistance, false);
		button.addEventListener('touchstart', handleMeasureDistance, false);

		var element = document.createElement('div');
		element.className = 'ol-unselectable ol-control measure-distance map-control-button';
		element.appendChild(button);

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
	};
	
	ol.inherits(app.MeasureDistanceControl, ol.control.Control);
}

function createMeasureAreaControl() {
	app.MeasureAreaControl = function(opt_options) {
		var options = opt_options || {};

		var button = document.createElement('button');
		button.setAttribute('title', 'Measure Area');

		var handleMeasureArea = function(e) {
			gMeasureType = 'area';
			addMeasureInteraction();
		};

		button.addEventListener('click', handleMeasureArea, false);
		button.addEventListener('touchstart', handleMeasureArea, false);

		var element = document.createElement('div');
		element.className = 'ol-unselectable ol-control measure-area map-control-button';
		element.appendChild(button);

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
	};
	
	ol.inherits(app.MeasureAreaControl, ol.control.Control);
}

var pointerMoveHandler = function(evt) {
	if (evt.dragging) {
		return;
	}

	var helpMsg = 'Click to start drawing';

	if (gSketch) {
		var geom = (gSketch.getGeometry());
		if (geom instanceof ol.geom.Polygon) {
			helpMsg = 'Click to continue drawing the polygon';
		} else if (geom instanceof ol.geom.LineString) {
			helpMsg = 'Click to continue drawing the line';
		}
	}

	gHelpTooltipElement.innerHTML = helpMsg;
	gHelpTooltip.setPosition(evt.coordinate);

	$(gHelpTooltipElement).removeClass('hidden');
};

function removeMeasureInteraction() {
	gMap.removeLayer(gMeasureLayer);
	if (gAddedMeasureOvelays) {
		for (var i = 0; i < gAddedMeasureOvelays.length; i++) {
			gMap.removeOverlay(gAddedMeasureOvelays[i]);
		}
		
		gAddedMeasureOvelays = [];
	}
	
	$(gHelpTooltipElement).addClass('hidden');
	$(gMeasureTooltipElement).addClass('hidden');
	
	if (gMeasureDraw)
		gMap.removeInteraction(gMeasureDraw);
}

function addMeasureInteraction() {	
	removeMeasureInteraction();
	
	createMeasureLayer();
	gMap.addLayer(gMeasureLayer);
	
	var type = (gMeasureType == 'area' ? 'Polygon' : 'LineString');
	gMeasureDraw = new ol.interaction.Draw({
		source: gMeasureLayerSrc,
		type: (type),
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			}),
			stroke: new ol.style.Stroke({
				color: 'rgba(0, 0, 0, 0.5)',
				lineDash: [10, 10],
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 5,
				stroke: new ol.style.Stroke({ color: 'rgba(0, 0, 0, 0.7)' }),
				fill: new ol.style.Fill({  color: 'rgba(255, 255, 255, 0.2)' })
			})
		})
	});

	gMap.addInteraction(gMeasureDraw);

	createMeasureTooltip();
	createHelpTooltip();

	var listener;
	gMeasureDraw.on('drawstart', function(evt) {
		// set sketch
		gSketch = evt.feature;

		/** @type {ol.Coordinate|undefined} */
		var tooltipCoord = evt.coordinate;

		listener = gSketch.getGeometry().on('change', function(evt) {
			var geom = evt.target;
			var output;
			if (geom instanceof ol.geom.Polygon) {
				output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
				tooltipCoord = geom.getInteriorPoint().getCoordinates();
			} else if (geom instanceof ol.geom.LineString) {
				output = formatLength( /** @type {ol.geom.LineString} */ (geom));
				tooltipCoord = geom.getLastCoordinate();
			}
			gMeasureTooltipElement.innerHTML = output;
			gMeasureTooltip.setPosition(tooltipCoord);
		});
	}, this);

	gMeasureDraw.on('drawend', function(evt) {
		gMeasureTooltipElement.className = 'tooltip tooltip-static';
		gMeasureTooltip.setOffset([0, -7]);
		// unset sketch
		gSketch = null;
		// unset tooltip so that a new one can be created
		gMeasureTooltipElement = null;
		createMeasureTooltip();
		ol.Observable.unByKey(listener);
	}, this);
}

function createHelpTooltip() {
	if (gHelpTooltipElement) {
		gHelpTooltipElement.parentNode.removeChild(gHelpTooltipElement);
	}
	
	gHelpTooltipElement = document.createElement('div');
	gHelpTooltipElement.className = 'tooltip hidden';
	gHelpTooltip = new ol.Overlay({
		element: gHelpTooltipElement,
		offset: [15, 0],
		positioning: 'center-left'
	});
	gMap.addOverlay(gHelpTooltip);
}

function createMeasureTooltip() {
	if (gMeasureTooltipElement) {
		gMeasureTooltipElement.parentNode.removeChild(gMeasureTooltipElement);
	}
	gMeasureTooltipElement = document.createElement('div');
	gMeasureTooltipElement.className = 'tooltip tooltip-measure tooltip-measure-result';
			
	gMeasureTooltip = new ol.Overlay({
		element: gMeasureTooltipElement,
		offset: [0, -15],
		positioning: 'bottom-center'
	});
	
	gMap.addOverlay(gMeasureTooltip);
	gAddedMeasureOvelays.push(gMeasureTooltip);
}

var formatLength = function(line) {
	var geodesic = false;
	var length;
	if (geodesic) {
		var coordinates = line.getCoordinates();
		length = 0;
		var sourceProj = gMap.getView().getProjection();
			for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
			var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
			var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
			length += wgs84Sphere.haversineDistance(c1, c2);
		}
	} else {
		length = Math.round(line.getLength() * 100) / 100;
	}
	
	var output;
	if (length > 100) {
		output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
	} else {
		output = (Math.round(length * 100) / 100) + ' ' + 'm';
	}
	
	return output;
};

var formatArea = function(polygon) {
	var area;
	var geodesic = false;
	if (geodesic) {
		var sourceProj = gMap.getView().getProjection();
		var geom = (polygon.clone().transform(sourceProj, 'EPSG:4326'));
		var coordinates = geom.getLinearRing(0).getCoordinates();
		area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
	} else {
		area = polygon.getArea();
	}
	var output;
	if (area > 10000) {
		output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
	} else {
		output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
	}
	return output; 
};