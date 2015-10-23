var gMap;
var gVideoLayer, gResourceLayer, gDangerLayer, gHarzadousLayer, gEscapeRouteLayer;
var gVideoLayerSrc, gResourceLayerSrc, gDangerLayerSrc, gHarzadousLayerSrc, gEscapeRouteLayerSrc;
var gHoveredFeature;

var gEscapeRouteDraw, gEscapeRouteModify;

var gTimerId = null;

var gDangerLevelFilterId = -1;
var gDangerTypeFilterId = -1;

var forCreateEscapeRoute = [];

var ObjectKind = {
	NONE: -1,
  	DANGER: 1,
  	VIDEO: 2,
  	EMERGENCY: 3,
  	HARZADOUS: 4,
  	ESCAPEROUTE: 5
};

var gSelectedType = ObjectKind.NONE;
var gSelectedFeatures = [];

window.app = {};
var app = window.app;

(function ($) {
	$.getUrlParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	}
})(jQuery);

$(document).ready(function(){
	var mode = $.getUrlParam('mode');
	if (mode && mode == "edit") {
		$(".obj-list-area").css({ top: '200px' });
		$("#edit-area").show();
	}
	else
		$("#edit-area").hide();
	
	getConfig(applyConfig);
		
	createMap();

	getData(addObjects);
	
	bindObjectTypeClickEvent();

	getFeatures(ObjectKind.NONE);
		
	registerEditEvents();
	
	//createStatusTips();
	//updateStatus();
	//gTimerId = setInterval(updateStatus, 5000);
	
	$('.btn-in-obj-list').click(function(e) {
		e.preventDefault();
		alert($(this).text());
	});
	
	init();
});

function init() {
	var filterDangerLevel = new DropDown( $('#filter-danger-level') );
	var filterDangerType = new DropDown( $('#filter-danger-type') );
		
	initObjectFilter();
	
	initTextFilter();
	
	initFactoryDialog();
	
	initFactoryFilterTree();
}

function initTextFilter() {
	$(document).click(function() {
		$('.filter-list').removeClass('active');
	});
	
	$('#btn-reset-filter').click(function() {
		$('#danger-level-filter-text').text('Danger Level');
		$('#danger-type-filter-text').text('Danger Type');
		
		gDangerLevelFilterId = -1;
		gDangerTypeFilterId = -1;
		
		getFeatures(gSelectedType);
	});
}

function initFactoryDialog() {
	$("#factory-filter-dialog").dialog({
		autoOpen: false
	});
    
	$('.factory-filter').hover(function() {
		showFactoryFilterDialog();
	});
	
	$('.factory-filter').mouseleave(function(e) {
		if (e.clientX >= 50 && e.clientY >= 0 && e.clientX <= 300 && e.clientY <= 200) {
			// Mouse moved to the target panel, do nothing
		}
    	else {
    		$("#factory-filter-dialog").dialog('close');
    	}
    	
	});
		
	$('#factory-filter-dialog').mouseleave(function(e) {
    	$("#factory-filter-dialog").dialog('close');
	});
}

function initFactoryFilterTree() {		    
	$('#factory-filter-tree').jstree({
		"core" : {
			"animation" : 0,
			"themes" : { 
				"stripes" : false,
				"icons": false
			},
			'data' : getFactoryTreeData()
		},
		"plugins" : [
		]
	});
        
    $('#factory-filter-tree').on("changed.jstree", function (e, data) {
    	var node = data.instance.get_node(data.selected[0]);
    	if (node) {
			var center = [node.li_attr.lon, node.li_attr.lat];
			
			apan = ol.animation.pan({duration: 500, source: gMap.getView().getCenter()});
			azoom = ol.animation.zoom({duration: 500, resolution: gMap.getView().getResolution()});
			
			gMap.beforeRender(apan, azoom);

			gMap.getView().setCenter(center);
			gMap.getView().setZoom(node.li_attr.zoom);
		}
		
		$("#factory-filter-dialog").dialog('close');
	});
}

function initObjectFilter() {
	$("#object-filter-clear").click(function(){
		$("#object-filter").val('');
		getFeatures(gSelectedType);
	});
	
	$("#object-filter").keyup(function(){
		getFeatures(gSelectedType);
	});
}

function showFactoryFilterDialog() {
	$("#factory-filter-dialog").dialog({
		autoOpen: true,
		width: 350,
		height: $(window).height(),
		modal: false,
		closeOnEscape: true,
		position:[50, 0],
		dialogClass: 'factory-filter-dialog',
		open: function () {			
			$(".ui-dialog-titlebar").css({ display: 'none'});

			$(".ui-widget-content").css({
				background: "white"
			});
		}
	});
}
        
function addDangerLevels(levels) {
	var content = ''
	
	for (var i = 0; i < levels.length; i++) {
		content += '<li>';
		content += '<a class="danger_level_item" href="#">'; 
		content += levels[i].level_name;
		content += '</a>';
		content += '<label style="display: none">';
		content += levels[i].level_id;
		content += '</label>';
		content += '</li>'; 
	}

	$("#filter-danger-level ul").append(content);
	
	$("#filter-danger-level").click(function() {
		$("#filter-danger-type").removeClass('active');
	});
	
	$('.danger_level_item').click(function() {
		gDangerLevelFilterId = $(this).siblings("label").text();
		$("#danger-level-filter-text").text($(this).text());
		
		getFeatures(gSelectedType);
	});
}

function addDangerTypes(types) {
	var content = ''
	
	for (var i = 0; i < types.length; i++) {
		content += '<li>';
		content += '<a class="danger_type_item" href="#">'; 
		content += types[i].type_name;
		content += '</a>';
		content += '<label style="display: none">';
		content += types[i].type_id;
		content += '</label>';
		content += '</li>'; 
	}

	$("#filter-danger-type ul").append(content);
	
	$("#filter-danger-type").click(function() {
		$("#filter-danger-level").removeClass('active');
	});
	
	$('.danger_type_item').click(function() {
		gDangerTypeFilterId = $(this).siblings("label").text();
		$("#danger-type-filter-text").text($(this).text());
		
		getFeatures(gSelectedType);
	});
}

function applyConfig(conf) {
	addDangerLevels(conf.danger_levels);
	addDangerTypes(conf.danger_types);
}

function isPaintEscapeRoute() {
	if (gEscapeRouteDraw)
		return true;
	
	return false;
}

function registerEditEvents() {
	$('#btn-set-center').click(function() {
		var center = gMap.getView().getCenter();
		var zoom = gMap.getView().getZoom();
		
		saveMapCenterInfo(center[0], center[1], zoom);
	});
	
	$('#btn-locate').click(function() {
		addDragControlInteraction(onDragMouseUpEvent);
	});
	
	$('#btn-paint-escaperoute').click(function() {
		gEscapeRouteDraw = new ol.interaction.Draw({
		  source: gEscapeRouteLayerSrc,
		  type: /** @type {ol.geom.GeometryType} */ ('LineString')
		});
		
		gEscapeRouteDraw.on("drawend", function(e){
			gMap.removeInteraction(gEscapeRouteDraw);
			//gMap.removeInteraction(gEscapeRouteModify);
			gEscapeRouteDraw = null;
			
			addEscapeRoute(6, forCreateEscapeRoute, function(data) {
				var feature = addEscapeObject(data);
				gEscapeRouteLayerSrc.addFeatures([feature]);
			});
		});
		
		gEscapeRouteDraw.on("drawstart", function(e){
			forCreateEscapeRoute = [];
		});
		
		gMap.addInteraction(gEscapeRouteDraw);	
				
		/*gEscapeRouteModify = new ol.interaction.Modify({
			source: gEscapeRouteLayerSrc,
			// the SHIFT key must be pressed to delete vertices, so
			// that new vertices can be drawn at the same position
			// of existing vertices
			deleteCondition: function(event) {
			return ol.events.condition.shiftKeyOnly(event) &&
				ol.events.condition.singleClick(event);
			}
		});
		
		gMap.addInteraction(gEscapeRouteModify);*/
	});
}

function onDragMouseUpEvent(feature, coordinate) {
	updateObjectPosition(feature.get('id'), coordinate[0], coordinate[1]);
	removeDragControlInteraction();
}

function getImageSrcByKind(kind) {
	var iconSrc;
	
	switch (kind) {
		case ObjectKind.DANGER:
			iconSrc = 'image/danger.png';
			break;
		case ObjectKind.VIDEO:
			iconSrc = 'image/video.png';
			break;
		case ObjectKind.EMERGENCY:
			iconSrc = 'image/resource.png';
			break;
		case ObjectKind.HARZADOUS:
			iconSrc = 'image/harzadous.png';
			break;
		case ObjectKind.ESCAPEROUTE:
			iconSrc = 'image/flag.png';
			break;
		default:
			iconSrc = '';
			break;
	}
	
	return iconSrc;
}

function addEscapeObject(obj) {
	var startPoint = new ol.geom.Point(obj.coord[0]);
	var lineStrings = new ol.geom.LineString(obj.coord);
	var meetingPoint = new ol.geom.Point(obj.coord[obj.coord.length - 1]);
				
	var feature = new ol.Feature({
		geometry: new ol.geom.GeometryCollection([
			startPoint,
			lineStrings,
			meetingPoint
			
		]),
		name: obj.name,
		kind: obj.kind,
		id: obj.id,
		lineStrings: lineStrings
	});
		
	setFeatureStyle(feature, false);
	
	return feature;
}

function addObjects(data) {
	var iconFeatures = [[], [], [], [], []];
	
	for (var i = 0; i < data.length; i++)
  	{
  		var obj = data[i];
  		var iconFeature;
  		
  		if (obj.kind != ObjectKind.ESCAPEROUTE) {
			iconFeature = new ol.Feature({
				geometry: new ol.geom.Point(obj.coord[0]),
				name: obj.name,
				kind: obj.kind,
				type: obj.type,
				level: obj.level,
				id: obj.id
			});
		} else {
			iconFeature = addEscapeObject(obj);
		}
		
		setFeatureStyle(iconFeature, false);
		iconFeatures[obj.kind - 1].push(iconFeature);
  	}
	 
	gDangerLayerSrc.addFeatures(iconFeatures[0]);
	gVideoLayerSrc.addFeatures(iconFeatures[1]);
	gResourceLayerSrc.addFeatures(iconFeatures[2]);
	gHarzadousLayerSrc.addFeatures(iconFeatures[3]);	
	gEscapeRouteLayerSrc.addFeatures(iconFeatures[4]);	
}

function updateDangerDetail(feature) {
	getDangerInfo(feature.get('id'), function (data) {
		$('#danger-object-name').text(data.name);
		$('#danger-object-level').text('Level: ' + feature.get('level') + ' Type: ' + feature.get('type'));
		$("#danger-object-link").attr("href", 'http://dwz.cn/1Vk25z');
		$("#danger-object-img").attr("src", data.img);
	});
}

function updateVideoDetail(feature) {
	getVideoInfo(feature.get('id'), function (data) {
		$('#video-object-name').text(data.name);
		$("#video-object-name").attr("href", 'http://dwz.cn/1Vk1nA');
	});
}

function updateResourceDetail(feature) {
	getResourceInfo(feature.get('id'), function (data) {
		$('#resource-object-name').text(data.name);
		$('#resource-object-type').text('Type: ' + data.type);
		$("#resource-object-name").attr("href", 'http://dwz.cn/1Vk0eM');
		$("#resource-object-img").attr("src", data.img);
	});
}

function updateHarzadousDetail(feature) {
	getHarzadousInfo(feature.get('id'), function (data) {
		$('#harzadous-object-name').text(data.name);
		$('#harzadous-object-type').text('Type: ' + data.type);
		$("#harzadous-object-name").attr("href", 'http://dwz.cn/1Vk47f');
		$("#harzadous-object-img").attr("src", data.img);
	});
}

function popupFeatureDetail(feature) {
	if (feature) {
		var toPopupForm;
		var kind = feature.get('kind');
		if (kind == ObjectKind.DANGER) {
			toPopupForm = 'danger-detail-form';
			updateDangerDetail(feature);
		} else if (kind == ObjectKind.VIDEO) {
			toPopupForm = 'video-detail-form';
			updateVideoDetail(feature);
		} else if (kind == ObjectKind.EMERGENCY) {
			toPopupForm = 'resource-detail-form';
			updateResourceDetail(feature);
		} else if (kind == ObjectKind.HARZADOUS) {
			toPopupForm = 'harzadous-detail-form';
			updateHarzadousDetail(feature);
		}
		
		var prevPos = gMap.getView().getCenter();
		var prevCenter = gMap.getPixelFromCoordinate(prevPos);

		var coord = feature.getGeometry().getCoordinates();
		var fePixel = gMap.getPixelFromCoordinate(coord);

		var x = fePixel[0] >= 170 ? 0 : (190 - fePixel[0]);
		var y = fePixel[1] >= 220 ? 0 : (240 - fePixel[1]);
		
		if (fePixel[0] > prevCenter[0]*2)
			x = prevCenter[0]*2 - fePixel[0] - 150;
		
		if (fePixel[1] > prevCenter[1]*2)
			y = prevCenter[1]*2 - fePixel[1] - 20;
		
		prevCenter[0] -= x;
		prevCenter[1] -= y;
		
		var pan = ol.animation.pan({
			duration: 500,
			source: (prevPos)
		});
		gMap.beforeRender(pan);
		
		gMap.getView().setCenter(gMap.getCoordinateFromPixel(prevCenter));

		var popup = new ol.Overlay({
		  element: document.getElementById(toPopupForm),
		  positioning: 'top',
		  stopEvent: false,
		  position: coord
		});
		gMap.addOverlay(popup);

		$('.detail-form').not('#' + toPopupForm).hide();
		$('#' + toPopupForm).slideToggle({ direction: "up" }, 300);
	} else {
		$('.detail-form').hide();
	}
}

function bindMapEvents() {
	gMap.on('click', function(evt) {
		if (isPaintEscapeRoute()) {
			forCreateEscapeRoute.push(evt.coordinate);
			return;
		}
			
		if (getMeasureType() == '') {
			var feature = gMap.forEachFeatureAtPixel(evt.pixel,
				function(feature, layer) {
					return feature;
			});

			popupFeatureDetail(feature);
		}
	});
	
	// change mouse cursor when over marker
	gMap.on('pointermove', function(e) {
		if (isPaintEscapeRoute())
			return;
			
		if (e.dragging) {
			$('.detail-form').hide();
			return;
		}
		
		if (getMeasureType() == '') {
			var pixel = gMap.getEventPixel(e.originalEvent);
			var hit = gMap.hasFeatureAtPixel(pixel);
			gMap.getTarget().style.cursor = hit ? 'pointer' : '';

			setHoverEffect(e);
		} else {
			pointerMoveHandler(e);
		}
	});
	
	$(gMap.getViewport()).on('mouseout', function() {
		hideMeasureTootip();
	});
	
	gMap.getViewport().addEventListener('contextmenu', function (e) {
		e.preventDefault();
		
		clearMeasureType();
		removeMeasureInteraction();
	});
}

function setHoverEffect(e) {
	var feature = gMap.forEachFeatureAtPixel(e.pixel,
		function(feature, layer) {
			return feature;
	});
	
	showHighlightedFeatures([feature]);
}

function getIconStyle(kind, hover) {
	var iconSrc = getImageSrcByKind(kind);
	
	var scale = 0.05;
	
	if (kind == ObjectKind.ESCAPEROUTE)
		scale = 0.13;
		
	var lineWidth = 2;
	var color = '#ffcc33';
	if (hover) {
		scale = scale * 1.4;
		lineWidth = 2;
		color = 'blue';
	}
	
	return [ 	
		new ol.style.Style({
			image: new ol.style.Icon(({
				opacity: 1,
				src: iconSrc,
				scale: scale
			}))
		}),
		// Line style
		new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: color,
				width: lineWidth
			})
		})
	];
}

function setFeatureStyle(feature, isHover) {
	var kind = feature.get('kind');
	var styles = getIconStyle(kind, isHover);
	feature.setStyle(styles);
	
	if (kind == ObjectKind.ESCAPEROUTE) {
		var lineStrings = feature.get('lineStrings');
		var icon = 'image/arrow.png';
		if (isHover)
			icon = 'image/arrow-blue.png';
		
		if (lineStrings) {
			lineStrings.forEachSegment(function(start, end) {
				var dx = end[0] - start[0];
				var dy = end[1] - start[1];
				var rotation = Math.atan2(dy, dx);
				
				// arrows
				styles.push(new ol.style.Style({
					geometry: new ol.geom.Point(end),
					image: new ol.style.Icon({
						src: icon,
						anchor: [0.75, 0.5],
						rotateWithView: false,
						rotation: -rotation
					})
				}));
			});	
		}
	}
}

function showHighlightedFeatures(features) {
	if (gSelectedFeatures) {
		for (var i = 0; i < gSelectedFeatures.length; i++) {
			var fe = gSelectedFeatures[i];
			setFeatureStyle(fe, false);
		}
	}
	
	if (features) {
		for (var i = 0; i < features.length; i++) {
			var fe = features[i];
			setFeatureStyle(fe, true);
		}
	}
	
	gSelectedFeatures = features;
}

function selectFeaturesByExtent(extent) {
	var selectedFeatures = [];
	
	gDangerLayerSrc.forEachFeatureIntersectingExtent(extent, function(feature) {
		selectedFeatures.push(feature);
	});
	
	gVideoLayerSrc.forEachFeatureIntersectingExtent(extent, function(feature) {
		selectedFeatures.push(feature);
	});
	
	gResourceLayerSrc.forEachFeatureIntersectingExtent(extent, function(feature) {
		selectedFeatures.push(feature);
	});
	
	gHarzadousLayerSrc.forEachFeatureIntersectingExtent(extent, function(feature) {
		selectedFeatures.push(feature);
	});
	
	gEscapeRouteLayerSrc.forEachFeatureIntersectingExtent(extent, function(feature) {
		selectedFeatures.push(feature);
	});
	
	showHighlightedFeatures(selectedFeatures);
	showFeaturesList(selectedFeatures);
}

var escapeLineStyleFunc = function(feature, resolution) {
	var geometry = feature.getGeometry();
	var styles = [
		new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 2
			})
		})
	];

	geometry.forEachSegment(function(start, end) {
		var dx = end[0] - start[0];
		var dy = end[1] - start[1];
		var rotation = Math.atan2(dy, dx);
		// arrows
		styles.push(new ol.style.Style({
			geometry: new ol.geom.Point(end),
			image: new ol.style.Icon({
				src: 'image/arrow.png',
				anchor: [0.75, 0.5],
				rotateWithView: false,
				rotation: -rotation
			})
		}));
	});

	return styles;
};

function getLayerVector(layerTitle, vectorSource, style) {
	if (style)
		return new ol.layer.Vector({
			title: layerTitle,
			source: vectorSource,
			style: style
		});
	else
	    return new ol.layer.Vector({
        title: layerTitle,
        source: vectorSource
    });
}

function createMap() {
    var baseMapGroup = new ol.layer.Group({
		title: 'Base Maps',
        layers: []
    });
    
    var configData = getMapConfig();
    
    baseMapGroup.getLayers().push(new ol.layer.Tile({
        title: configData.base_map_group_name,
        source: new ol.source.TileWMS({
			url: configData.base_map_url,
			params: {'LAYERS': configData.layers, 'TILED': true}
		  })
    }));
    
    gVideoLayerSrc = new ol.source.Vector();
    gResourceLayerSrc = new ol.source.Vector();   
    gDangerLayerSrc = new ol.source.Vector();
    gHarzadousLayerSrc = new ol.source.Vector();
    gEscapeRouteLayerSrc = new ol.source.Vector();
          
    var emergencyGroup = new ol.layer.Group({
        title: 'Emergency Maps',
        layers: []
    });
    
    gVideoLayer = getLayerVector('Videos', gVideoLayerSrc, null);
    emergencyGroup.getLayers().push(gVideoLayer);
    
    gResourceLayer = getLayerVector('Resources', gResourceLayerSrc, null);
    emergencyGroup.getLayers().push(gResourceLayer);
    
    gDangerLayer = getLayerVector('Dangers', gDangerLayerSrc, null);
    emergencyGroup.getLayers().push(gDangerLayer);
    
    gHarzadousLayer = getLayerVector("Harzadous'", gHarzadousLayerSrc, null);
    emergencyGroup.getLayers().push(gHarzadousLayer);
    		
    gEscapeRouteLayer = getLayerVector("Escape Routes", gEscapeRouteLayerSrc, escapeLineStyleFunc);
    emergencyGroup.getLayers().push(gEscapeRouteLayer);		
  
    createMeasureDistanceControl();
    createMeasureAreaControl();
    
    createBoxSelectionControl(function(e) {
    	showHighlightedFeatures([]);
    }, selectFeaturesByExtent);
    
	gMap = new ol.Map({
	  layers: [
	  	baseMapGroup,
	  	emergencyGroup
	  ],
	  controls: ol.control.defaults({
		attributionOptions: ({
		  collapsible: false
		})
	  }).extend([
	  	new ol.control.ZoomSlider(),
		new ol.control.ScaleLine(),
		new ol.control.FullScreen({
			label: '',
			labelActive: '',
			className: 'ol-full-screen'
		}),
		new ol.control.OverviewMap({
			layers: [
				baseMapGroup
			]
		}),
		new ol.control.LayerSwitcher(),
		new app.MeasureDistanceControl(),
		new app.MeasureAreaControl(),
		new app.BoxSelectionControl()
	  ]),
	  target: document.getElementById('map'),
	  view: new ol.View({
		center: [configData.center.lon, configData.center.lat],
        zoom: configData.zoom,
		minZoom: configData.minZoom,
		maxZoom: configData.maxZoom
	  })
	});
	
	var mode = $.getUrlParam('mode');
	if (mode && mode == "debug") {
		gMap.addControl(new ol.control.MousePosition({
	  		coordinateFormat: ol.coordinate.createStringXY(2)
	  	}));
	}
	
	bindMapEvents();
}

function setObjectTypeHightlight(kind) {	
	$('#danger-object-group').css({ background: '#F0F8FF' });
	$('#video-object-group').css({ background: '#F0F8FF' });
	$('#resource-object-group').css({ background: '#F0F8FF' });
	$('#harzadous-object-group').css({ background: '#F0F8FF' });
	$('#escaperoute-object-group').css({ background: '#F0F8FF' });
		
	if (kind == ObjectKind.DANGER)
		$('#danger-object-group').css({ background: 'lightgray' });
	else if (kind == ObjectKind.VIDEO)
		$('#video-object-group').css({ background: 'lightgray' });
	else if (kind == ObjectKind.RESOURCE)
		$('#resource-object-group').css({ background: 'lightgray' });
	else if (kind == ObjectKind.HARZADOUS)
		$('#harzadous-object-group').css({ background: 'lightgray' });
	else if (kind == ObjectKind.ESCAPEROUTE)
		$('#escaperoute-object-group').css({ background: 'lightgray' });
	else
		;	
}

function showObjectLayers(kind) {
	gDangerLayer.setVisible(kind == ObjectKind.DANGER || kind == ObjectKind.NONE);
	gVideoLayer.setVisible(kind == ObjectKind.VIDEO || kind == ObjectKind.NONE);
	gResourceLayer.setVisible(kind == ObjectKind.EMERGENCY || kind == ObjectKind.NONE);
	gHarzadousLayer.setVisible(kind == ObjectKind.HARZADOUS || kind == ObjectKind.NONE);
	gEscapeRouteLayer.setVisible(kind == ObjectKind.ESCAPEROUTE || kind == ObjectKind.NONE);
}

function bindObjectTypeClickEvent() {
	$("#danger-object-group").click(function(){
		if (gSelectedType == ObjectKind.DANGER)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.DANGER;
			
		getFeatures(gSelectedType);
	});
	
	$("#video-object-group").click(function(){
		if (gSelectedType == ObjectKind.VIDEO)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.VIDEO;

		getFeatures(gSelectedType);
	});
	
	$("#resource-object-group").click(function(){
		if (gSelectedType == ObjectKind.EMERGENCY)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.EMERGENCY;

		getFeatures(gSelectedType);
	});
	
	$("#harzadous-object-group").click(function(){
		if (gSelectedType == ObjectKind.HARZADOUS)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.HARZADOUS;

		getFeatures(gSelectedType);
	});
	
	$("#escaperoute-object-group").click(function(){
		if (gSelectedType == ObjectKind.ESCAPEROUTE)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.ESCAPEROUTE;

		getFeatures(gSelectedType);
	});
}

function addObjectIntoList(feature) {
	var trStr = '<div class="obj-in-list"><td>'; 
	trStr += '<label class="obj-id" style="display: none">';
	trStr += feature.get('id');
	trStr += '</label><label class="obj-kind" style="display: none">';
	trStr += feature.get('kind');
	trStr += '</label><img src="';
	trStr += getImageSrcByKind(feature.get('kind'));
	trStr += '" class="obj-img-in-list"/>';
	trStr += '<label class="obj-name-in-list">';
	trStr += feature.get('name');
	trStr += '</label>';
	trStr += '<button class="btn-in-obj-list">';
	
	var kind = feature.get('kind');
	if (kind == ObjectKind.DANGER)
		trStr += 'Start';
	else if (kind == ObjectKind.VIDEO)
		trStr += 'View';
	else if (kind == ObjectKind.EMERGENCY)
		trStr += 'Check';
	else
		trStr += 'Detail';
		
	trStr += '</button>';
	trStr += '</td></div>';
	
	return trStr;
}

function showFeaturesList(features) {
	var contentStr = '';
	
	if (features) {
		for (var i = 0; i <= features.length - 1; i++) {
			contentStr += addObjectIntoList(features[i]);
		}		
	}
	
	$("#object-list tbody").html('');
	$("#object-list tbody").append(contentStr);
	
	bindObjectListEvents();
}

function getFeatures(kind) {
	showObjectLayers(gSelectedType);
	setObjectTypeHightlight(kind);
		
	var allFeatures = [];
	
	if (kind < 0 || kind == ObjectKind.DANGER) {
		var features = gDangerLayerSrc.getFeatures();
		if (features) {
			allFeatures = allFeatures.concat(features);
		}
	}
	if (kind < 0 || kind == ObjectKind.VIDEO) {
		var features = gVideoLayerSrc.getFeatures();
		if (features) {
			allFeatures = allFeatures.concat(features);
		}
	}
	if (kind < 0 || kind == ObjectKind.EMERGENCY) {
		var features = gResourceLayerSrc.getFeatures();
		if (features) {
			allFeatures = allFeatures.concat(features);
		}
	}
	if (kind < 0 || kind == ObjectKind.HARZADOUS) {
		var features = gHarzadousLayerSrc.getFeatures();
		if (features) {
			allFeatures = allFeatures.concat(features);
		}
	}
	if (kind < 0 || kind == ObjectKind.ESCAPEROUTE) {
		var features = gEscapeRouteLayerSrc.getFeatures();
		if (features) {
			allFeatures = allFeatures.concat(features);
		}
	}
	
	var filter = $("#object-filter").val().trim();
	
	var tmpFeatures = [];
	
	for (var i = 0; i < allFeatures.length; i++) {
		var fe = allFeatures[i];
		if (filter && fe.get('name').indexOf(filter) <= -1) {
			continue;
		}
		
		if (gDangerLevelFilterId != -1) {
			if (fe.get('kind') != 1 || fe.get('level') != gDangerLevelFilterId)
				continue;
		}
		
		if (gDangerTypeFilterId != -1) {
			if (fe.get('kind') != 1 || fe.get('type') != gDangerTypeFilterId)
				continue;
		}
		
		tmpFeatures.push(fe);
	}

	showFeaturesList(tmpFeatures);
}

function findFeatureAux(features, id) {
	if (features) {
		for (var i = 0; i <= features.length - 1; i++) {
			if (features[i].get("id") == id)
				return features[i];
		}		
	}

	return null;
}

function findFeatureById(id) {
	var feature = findFeatureAux(gDangerLayerSrc.getFeatures(), id);
	if (feature)
		return feature;
	
	feature = findFeatureAux(gVideoLayerSrc.getFeatures(), id);
	if (feature)
		return feature;
		
	feature = findFeatureAux(gResourceLayerSrc.getFeatures(), id);
	if (feature)
		return feature;
		
	feature = findFeatureAux(gHarzadousLayerSrc.getFeatures(), id);
	if (feature)
		return feature;
		
	feature = findFeatureAux(gEscapeRouteLayerSrc.getFeatures(), id);
	if (feature)
		return feature;
	
	return null;
}

function bindObjectListEvents() {
	$(".obj-in-list").hover(function() {
		var id = $(this).find('.obj-id').text();
		
		var feature = findFeatureById(id);
		
		showHighlightedFeatures([feature]);
	});
	
	$(".obj-in-list").mouseleave(function() {
		showHighlightedFeatures(null);
	});
	
	$(".obj-name-in-list").click(function() {
		var id = $(this).parent('div').find('.obj-id').text();
		
		var feature = findFeatureById(id);
		popupFeatureDetail(feature);
	});
}

function createStatusTips() {
    var statusStatistic = document.createElement("div");
    statusStatistic.className = 'status-summary-text';
    statusStatistic.innerHTML = 'Warning: 0';

    $(statusStatistic).insertBefore("#map");	
}

function updateStatus() {
	getStatus(function(data) {
		var warningCnt = 0;
		for (var i=0; i<data.length; i++)
  		{
  			var obj = data[i];
  			if (obj.status == 1)
  				warningCnt++;
  		}
  		
  		$('.status-summary-text').text('Warning: ' + warningCnt);
  		if (warningCnt == 0)
  			$('.status-summary-text').css({ color: "#000080" });
  		else
  			$('.status-summary-text').css({ color: "red" });
	});
}

function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.val = '';
    this.index = -1;
    this.initEvents();
}

DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
        });
    },
    getValue : function() {
        return this.val;
    },
    getIndex : function() {
        return this.index;
    }
}