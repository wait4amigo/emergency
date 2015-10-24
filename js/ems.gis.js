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
  	RESOURCE: 3,
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
		$(".obj-list-area").css({ top: '255px' });
		$("#edit-area").show();
	}
	else
		$("#edit-area").hide();
			
	createMap();
	
	init();

	loadAllFeatures();
	
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
});

function init() {
	initFilters();
		
	initFactoryDialog();
	
	initFactoryFilterTree();
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
	
	$('#factory-filter-dialog').mouseout(function(e){
		e.preventDefault();
	});
}

function initFactoryFilterTree() {	  
	$('#factory-filter-tree').bind('loaded.jstree', function(e, data) {
		$(this).jstree('select_node', 'ul > li:first'); 
	}).jstree({
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
			
			$('#selected-area-text').text('当前区域：' + node.text);
		}
		
		$("#factory-filter-dialog").dialog('close');
	});	
}

function showFactoryFilterDialog() {
	$("#factory-filter-dialog").dialog({
		autoOpen: true,
		resizable: false,
		width: 'auto',
		height: 'auto',
		minHeight: 'auto',
		//width: 350,
		//height: $(window).height(),
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

function isPaintEscapeRoute() {
	if (gEscapeRouteDraw)
		return true;
	
	return false;
}

function registerEditEvents() {
	$('#btn-region-locate').click(function() {
		var center = gMap.getView().getCenter();
		var zoom = gMap.getView().getZoom();
		
		var nodeId = $('#factory-filter-tree').jstree('get_selected');
		if (!nodeId) {
			alert("请先选择区域!");
			return;
		}
		
		saveRegionLocationInfo(nodeId, center[0], center[1], zoom);
	});
	
	$('#btn-object-locate').click(function() {
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

function getImageSrcByKind(feature) {
	var kind = feature.get('kind');
	
	var iconSrc;	
	switch (kind) {
		case ObjectKind.DANGER:
			iconSrc = 'image/danger-level-' + feature.get('level') + '.png';
			break;
		case ObjectKind.VIDEO:
			iconSrc = 'image/video.png';
			break;
		case ObjectKind.RESOURCE:
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

function updateEscapeRouteDetail(feature) {
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
		} else if (kind == ObjectKind.RESOURCE) {
			toPopupForm = 'resource-detail-form';
			updateResourceDetail(feature);
		} else if (kind == ObjectKind.HARZADOUS) {
			toPopupForm = 'harzadous-detail-form';
			updateHarzadousDetail(feature);
		} else if (kind == ObjectKind.ESCAPEROUTE) {
			toPopupForm = 'escaperoute-detail-form';
			updateEscapeRouteDetail(feature);
		}
		
		var prevPos = gMap.getView().getCenter();
		var prevCenter = gMap.getPixelFromCoordinate(prevPos);
		
		var gem = feature.getGeometry();
		if (kind == ObjectKind.ESCAPEROUTE)
			gem = (gem.getGeometries())[0];

		var coord = gem.getCoordinates();
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

		var toPopId = '#' + toPopupForm;
		//if (!$(toPopId).is(":visible"))
		//	$('.detail-form').not(toPopId).hide();
			
		$('.detail-form').hide();
		$(toPopId).slideToggle({ direction: "up" }, 300);
	} else {
		$('.detail-form').hide();
	}
}

function bindMapEvents() {
	gMap.on('click', function(e) {
		if (isPaintEscapeRoute()) {
			forCreateEscapeRoute.push(e.coordinate);
			return;
		}
			
		if (getMeasureType() == '') {
			var feature = gMap.forEachFeatureAtPixel(e.pixel,
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

function getEscapeLineStyles(fe, hover) {
	var scale = 0.18;

	var lineWidth = 2;
	var color = '#ffcc33';
	if (hover) {
		scale = scale * 1.5;
		lineWidth = 2;
		color = 'green';
	}

	var geoms = fe.getGeometry().getGeometries();
    var startStyle = new ol.style.Style({
        geometry: geoms[0],
        image: new ol.style.Icon({
			opacity: 1,
			src: 'image/flag.png',
			scale: scale,
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
			anchor: [0, 120]
		}),
		text: new ol.style.Text({
		  text: fe.get('name'),
		  offsetY: -32,
		  scale: 1.3,
		  fill: new ol.style.Fill({
			color: 'green'
		  }),
		  stroke: new ol.style.Stroke({
			color: '#FFFF99',
			width: 3.5
		  })
		})
    });

    var endStyle = new ol.style.Style({
        geometry: geoms[2],
        image: new ol.style.Icon({
			opacity: 1,
			src: 'image/meeting-point.jpg',
			scale: scale
		})
    });
	
    var lineStyle = new ol.style.Style({
        geometry: geoms[1],
        stroke: new ol.style.Stroke({
			color: color,
			width: lineWidth
		})
    });

    return [startStyle, lineStyle, endStyle];
}

function setEscapeLineStyle(feature, styles, isHover) {
	var lineStrings = feature.get('lineStrings');
	var icon = 'image/arrow.png';
	if (isHover)
		icon = 'image/arrow-blue.png';
	
	if (lineStrings) {
		var segNum = 1;
		lineStrings.forEachSegment(function(start, end) {
			segNum++;
			if (segNum >= lineStrings.getCoordinates().length) {
				return;
			}
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

function getStyles(fe, hover) {
	if (fe.get('kind') == ObjectKind.ESCAPEROUTE) {
		return getEscapeLineStyles(fe, hover);
	}
	
	var iconSrc = getImageSrcByKind(fe);
	
	var scale = 0.18;
	var textOffsetY = -22;
	var textColor = 'green'		
	var lineWidth = 2;
	var color = '#ffcc33';
	if (hover) {
		scale = scale * 1.5;
		lineWidth = 2;
		color = 'green';
	}
	
	if (fe.get('kind') == ObjectKind.HARZADOUS) {
		textColor = 'red';
	}
	
	return [ 	
		new ol.style.Style({
			image: new ol.style.Icon({
				opacity: 1,
				src: iconSrc,
				scale: scale
			}),
			text: new ol.style.Text({
			  text: fe.get('name'),
			  offsetY: textOffsetY,
			  scale: 1.3,
			  fill: new ol.style.Fill({
				color: textColor
			  }),
			  stroke: new ol.style.Stroke({
				color: '#FFFF99',
				width: 3.5,
				lineCap: 'butt'
			  })
			})
		})
	];
}

function setFeatureStyle(feature, isHover) {
	var styles = getStyles(feature, isHover);
	
	var kind = feature.get('kind');
	if (kind == ObjectKind.ESCAPEROUTE) {
		setEscapeLineStyle(feature, styles, isHover);
	}
	
	feature.setStyle(styles);
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
		title: '基础图层',
        layers: []
    });
    
    var configData = getMapConfig();
    
	for (var i = 0; i < configData.base_map_layers.length; i++) {
		var ly = configData.base_map_layers[i];
		
		baseMapGroup.getLayers().push(new ol.layer.Tile({
			title: ly.name,
			source: new ol.source.TileWMS({
				url: ly.url,
				params: {'LAYERS': ly.layers, 'TILED': true}
			  })
		}));
	}
    
    gVideoLayerSrc = new ol.source.Vector();
    gResourceLayerSrc = new ol.source.Vector();   
    gDangerLayerSrc = new ol.source.Vector();
    gHarzadousLayerSrc = new ol.source.Vector();
    gEscapeRouteLayerSrc = new ol.source.Vector();
          
    var emergencyGroup = new ol.layer.Group({
        title: '应急图层',
        layers: []
    });
    
    gVideoLayer = getLayerVector('视频', gVideoLayerSrc, null);
    emergencyGroup.getLayers().push(gVideoLayer);
    
    gResourceLayer = getLayerVector('应急物资', gResourceLayerSrc, null);
    emergencyGroup.getLayers().push(gResourceLayer);
    
    gDangerLayer = getLayerVector('危险源', gDangerLayerSrc, null);
    emergencyGroup.getLayers().push(gDangerLayer);
    
    gHarzadousLayer = getLayerVector('危化品', gHarzadousLayerSrc, null);
    emergencyGroup.getLayers().push(gHarzadousLayer);
    		
    gEscapeRouteLayer = getLayerVector('避灾路线', gEscapeRouteLayerSrc, escapeLineStyleFunc);
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
	gResourceLayer.setVisible(kind == ObjectKind.RESOURCE || kind == ObjectKind.NONE);
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
		if (gSelectedType == ObjectKind.RESOURCE)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.RESOURCE;

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
	trStr += '</label><div class="obj-item-in-list"><img src="';
	trStr += getImageSrcByKind(feature);
	trStr += '" class="obj-img-in-list"/>';
	trStr += '<label class="obj-name-in-list">';
	trStr += feature.get('name');
	trStr += '</label></div>';
	trStr += '<button class="btn-in-obj-list">';
	
	var kind = feature.get('kind');
	if (kind == ObjectKind.DANGER)
		trStr += 'Start';
	else if (kind == ObjectKind.VIDEO)
		trStr += 'View';
	else if (kind == ObjectKind.RESOURCE)
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

function bindObjectListEvents() {
	$(".obj-in-list").hover(function() {
		var id = $(this).find('.obj-id').text();
		
		var feature = findFeatureById(id);
		
		showHighlightedFeatures([feature]);
	});
	
	$(".obj-in-list").mouseleave(function() {
		showHighlightedFeatures(null);
	});
	
	$(".obj-item-in-list").click(function() {
		var id = $(this).parent('div').find('.obj-id').text();
		
		var feature = findFeatureById(id);
		popupFeatureDetail(feature);
	});
}

function showFilter(kind) {	
	$('.filters-area table').hide();
	
	if (kind < 0) {
		$('#filter-danger-src').show();
	}
	
	if (kind == ObjectKind.DANGER) {
		$('#filter-danger-src').show();
	}	
	if (kind == ObjectKind.VIDEO) {
		$('#filter-video').show();
	}
	if (kind == ObjectKind.RESOURCE) {
		$('#filter-resource').show();
	}
	if (kind == ObjectKind.HARZADOUS) {
		$('#filter-harzadous').show();
	}
	if (kind == ObjectKind.ESCAPEROUTE) {
		$('#filter-escape-route').show();
	}
}

function getFeatures(kind) {
	showObjectLayers(gSelectedType);
	setObjectTypeHightlight(kind);
	showFilter(kind);
		
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
	if (kind < 0 || kind == ObjectKind.RESOURCE) {
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
	
	var filter = $("#object-name-filter").val().trim();
	
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
