var gMap;
var gBaseMapGroup;
var gVideoLayer, gResourceLayer, gDangerLayer, gHarzadousLayer, gEscapeRouteLayer;
var gVideoLayerSrc, gResourceLayerSrc, gDangerLayerSrc, gHarzadousLayerSrc, gEscapeRouteLayerSrc;
var gHoveredFeature;

var gDraw, gModify, gForCacheModifyData;

var gTimerId = null;

var gDangerLevelFilterId = -1;
var gDangerTypeFilterId = -1;
var gHarzadousUsageFilterId = -1;
var gHarzadousRiskFilterId = -1;
var gVideoAreaFilterId = -1;
var gResourceTypeFilterId = -1;
var gEscapeRouteFilterId = -1;
var gDangerForResourceFilterId = -1;
var gDangerForEscapeRouteFilterId = -1;

var ObjectKind = {
	NONE: -1,
  	DANGER: 1,
  	VIDEO: 2,
  	RESOURCE: 3,
  	HARZADOUS: 4,
  	ESCAPEROUTE: 5,
    DANGERRANGE: 6
};

var gSelectedType = ObjectKind.NONE;
var gSelectedFeatures = [];
var gSelectedFeature;

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
		createEditInfo();
	}
	else
		$("#edit-area").hide();
			
	createMap();
	
	init();

	loadAllFeatures();
	
	bindObjectTypeClickEvent();

	getFeatures(ObjectKind.NONE);
		
	registerEditEvents();
	
	createStatusTips();
	updateStatus();
	gTimerId = setInterval(updateStatus, 3000);
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

function isInEditing() {
    if (gDraw)
		return true;
		
	if (gModify)
		return true;
	
	return false;
}
	 
function registerEditEvents() {
	registerRegionLocate();
	
	$('#btn-object-locate').click(function() {
		addDragControlInteraction(onDragMouseUpEvent);
	});
	
	registerPaintEscapeRoute();
	registerModifyEscapeRoute();

	registerPaintDangerRange();
	registerModifyDangerRange();
}

function registerRegionLocate() {
	$('#btn-region-locate').click(function() {
		var center = gMap.getView().getCenter();
		var zoom = gMap.getView().getZoom();
		
		var nodeId = $('#factory-filter-tree').jstree('get_selected');
		if (!nodeId) {
		    showMessage("错误", "请先选择区域!");
			return;
		}
		
		$.when(customConfirm('保存区域范围', '确定更新区域缺省显示为当前地图范围吗?')).then(function (confirm) {
            if (confirm) {
                saveRegionLocationInfo(nodeId, center[0], center[1], zoom);
            }
        });
	});
}

Array.prototype.containsCoords = function (obj) {
    var i = this.length;
    while (i--) {
        var tho = this[i];
        if (tho.length != obj.length)
            continue;

        var hasDiff = false;
        for (var j = 0; j < tho.length; j++) {
            if ((tho[j][0] != obj[j][0]) || (tho[j][1] != obj[j][1])) {
                hasDiff = true;
                break;
            }
        }

        if (!hasDiff)
            return true;
    }

    return false;
}

function unregisterAllEditing() {
    clearMeasureType();
    removeMeasureInteraction();

    unregisterModifying();
    unregisterPainting();
}

function registerModifyDangerRange() {
    $('#btn-modify-danger-range').click(function () {
        unregisterAllEditing();

        var allRangeFeatures = [];
        gDangerLayerSrc.getFeatures().forEach(function(fe) {
            if (fe.get('kind') == ObjectKind.DANGERRANGE)
                allRangeFeatures.push(fe);
        });

        registerModifyEvent(allRangeFeatures, function (id, coords) {
            updateDangerRange(id, coords, function () {});
        });
    });
}

function registerPaintDangerRange() {
    $('#btn-paint-danger-range').click(function () {
        unregisterAllEditing();

        registerPaint(gDangerLayerSrc, 'Polygon', function () {
            if (!gSelectedFeature || gSelectedFeature.get('kind') != ObjectKind.DANGER) {
                unregisterPainting();
                showMessage('错误', '请先选择要绘制影响区域的危险源!');
                return;
            }
        }, function (e) {
            $.when(customConfirm('绘制影响区域', '影响区域绘制完成，确定更新为此新绘制的影响区域吗?')).then(function (confirm) {
                var newFeature = e.feature;

                var dangerId = gSelectedFeature.get('id');

                newFeature.set('kind', ObjectKind.DANGERRANGE);
                newFeature.set('danger_id', dangerId);
                setFeatureStyle(newFeature, false);

                var oldFeature = gSelectedFeature.get('danger_range_feature');

                var newCoords = newFeature.getGeometry().getCoordinates();
                if (confirm) {
                    updateDangerRange(dangerId, newCoords, function () {
                        gSelectedFeature.set('danger_range_feature', newFeature);

                        if (oldFeature)
                            gDangerLayerSrc.removeFeature(oldFeature);

                        gSelectedFeature = null;
                    });
                } else {
                    gDangerLayerSrc.removeFeature(newFeature);
                }
            });

            unregisterPainting();
        });
    });
}

function unregisterModifying() {
    if (gModify) {
        gMap.removeInteraction(gModify);
        gModify = null;
    }
}

function unregisterPainting() {
    if (gDraw) {
        gMap.removeInteraction(gDraw);
        gDraw = null;
    }
}

function registerModifyEscapeRoute() {
	$('#btn-modify-escaperoute').click(function() {
	    unregisterAllEditing();
			
	    registerModifyEvent(gEscapeRouteLayerSrc.getFeatures(), function (id, coords) {
	        updateEscapeRoute(id, coords, function () { });
	    });
	});
}

function registerModifyEvent(features, onModified) {
    gModify = new ol.interaction.Modify({
        features: new ol.Collection(features),
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#000000'
                })
            })
        }),
        deleteCondition: ol.events.condition.never
    });
    
    gModify.on('modifystart', function (e) {
        gForCacheModifyData = [];
        e.features.forEach(function (fe) {
            if (fe.get('kind') == ObjectKind.DANGERRANGE)
                gForCacheModifyData.push(fe.getGeometry().getCoordinates()[0]);
            else
                gForCacheModifyData.push(fe.getGeometry().getCoordinates());
        });
    });
    
    gModify.on("modifyend", function (e) {
        e.features.forEach(function (fe) {
            var coords;
            if (fe.get('kind') == ObjectKind.DANGERRANGE)
                coords = fe.getGeometry().getCoordinates()[0];
            else
                coords = fe.getGeometry().getCoordinates();

            if (!gForCacheModifyData.containsCoords(coords)) {
                onModified(fe.get('danger_id'), coords);
            }
        });
    });
    
    gMap.addInteraction(gModify);
}

function registerPaintEscapeRoute() {
    $('#btn-paint-escaperoute').click(function () {
        unregisterAllEditing();

        registerPaint(gEscapeRouteLayerSrc, 'LineString', function () {
            if (!gSelectedFeature || gSelectedFeature.get('kind') != ObjectKind.ESCAPEROUTE) {
                unregisterPainting();
                showMessage('错误', '请先选择要绘制的避灾路线!');
                return;
            }
        }, function (e) {
            $.when(customConfirm('更新避灾路线', '避灾路线绘制完成，确定更新为此新绘制的路线吗?')).then(function (confirm) {
                var newCoords = e.feature.getGeometry().getCoordinates();
                gEscapeRouteLayerSrc.removeFeature(e.feature);

                if (confirm) {
                    addEscapeRoute(ObjectKind.ESCAPEROUTE, newCoords, function (data) {
                        var fe = addEscapeObject(data);
                        fe.set('name', gSelectedFeature.get('name')); // For demo
                        gEscapeRouteLayerSrc.addFeatures([fe]);
                        gEscapeRouteLayerSrc.removeFeature(gSelectedFeature);
                        gSelectedFeature = null;
                    });
                }
            });

            unregisterPainting();
        });
	});
}

function registerPaint(vectorSrc, type, startFunc, endFunc) {
    gDraw = new ol.interaction.Draw({
        source: vectorSrc,
        type: /** @type {ol.geom.GeometryType} */ (type)
    });
    
    gDraw.on("drawstart", function (e) {
        startFunc();
    });
    
    gDraw.on("drawend", function (e) {
        endFunc(e);
    });
    
    gMap.addInteraction(gDraw);
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
        if (gDraw) {
            gSelectedFeature = feature;
            return; // We don't pop up feature detail while painting the escape route
        }

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
		
		if (kind == ObjectKind.ESCAPEROUTE)
		    coord = feature.getGeometry().getCoordinates()[0];
		else 
		    coord = feature.getGeometry().getCoordinates();

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

		var id = feature.get('id');
		var toPopId = '#' + toPopupForm;

		var oldId = $('.detail-form').data('id');
		if ($('.detail-form').is(":visible")) {
		    if (id != oldId) {
		        $('.detail-form').hide();
		        $(toPopId).slideToggle({ direction: "up" }, 300);
		    } else {
		        $(toPopId).slideToggle({ direction: "up" }, 300);
		    }
		} else {
		    $(toPopId).slideToggle({ direction: "up" }, 300);
		}

		$('.detail-form').data('id', id);
	} else {
        $('.detail-form').data('id', '');
        $('.detail-form').hide();
	}
}

function bindMapEvents() {
	gMap.on('click', function(e) {
		if (isInEditing())
			return;
			
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
		if (isInEditing())
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

		unregisterAllEditing();
	});
}

function setHoverEffect(e) {
	var feature = gMap.forEachFeatureAtPixel(e.pixel,
		function(feature, layer) {
			return feature;
	});

	showHighlightedFeatures([feature]);
}

var escapeLineStyleFunc = function(feature, resolution) {
	return getEscapeLineStyles(feature, false);
};

function pushArrowStyle(styles, icon, scale, pos, rotation) {
	styles.push(new ol.style.Style({
		geometry: new ol.geom.Point(pos),
		image: new ol.style.Icon({
			src: icon,
			anchor: [0.75, 0.5],
			rotateWithView: false,
			rotation: -rotation
		})
	}));
}

function pushEndImageStyle(styles, imageSrc, scale, pos) {
	styles.push(new ol.style.Style({
		geometry: new ol.geom.Point(pos),
		image: new ol.style.Icon({
			src: imageSrc,
			scale: scale,
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
			anchor: [6, 60]
		})
	}));
}

function getEscapeLineStyles(fe, hover) {
	var scale = 0.4;
	var lineWidth = 2;
	var color = '#00ff00';
	var icon = 'image/arrow-green.png';
	
	if (hover) {
		scale = scale * 1.5;
		lineWidth = 2;
		color = '#ffcc33';
		icon = 'image/arrow-yellow.png';
	}
	
	var geometry = fe.getGeometry();
	
    var styles = [ 
		new ol.style.Style({
			text: new ol.style.Text({
				text: fe.get('name'),
				offsetY: -32,
				scale: 1.3,
				fill: new ol.style.Fill({
					color: color
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFF99',
					width: 3.5
				})
			}),
			stroke: new ol.style.Stroke({
				color: color,
				width: 2
			})
		})
	];
	
	var num = 0;
	var numCount = geometry.getCoordinates().length;

	geometry.forEachSegment(function(start, end) {
		var dx = end[0] - start[0];
		var dy = end[1] - start[1];
		var rotation = Math.atan2(dy, dx);
		
		if (num == 0) {
			pushEndImageStyle(styles, 'image/flag.png', scale, start);
			pushArrowStyle(styles, icon, scale, end, rotation);
		} else if (num < numCount - 2) {
			pushArrowStyle(styles, icon, scale, end, rotation);
		} else {
			pushEndImageStyle(styles, 'image/meeting-point.jpg', scale, end);
		}
		num++;
	});
	
	return styles;
}

function setFeatureStyle(fe, hover) {	
	var iconSrc = getImageSrcByKind(fe);
	
	var scale = 0.4;
	var textOffsetY = -22;
	var textColor = 'green'		
	var color = '#ffcc33';
	if (hover) {
		scale = scale * 1.5;
		color = 'green';
	}
	
	if (fe.get('kind') == ObjectKind.HARZADOUS) {
		textColor = 'red';
	}
	
	var styles = [ 	
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
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            })
		})
	];
	
	fe.setStyle(styles);
}

function showHighlightedFeatures(features) {
	if (gSelectedFeatures) {
		for (var i = 0; i < gSelectedFeatures.length; i++) {
			var fe = gSelectedFeatures[i];
			if (fe.get('kind') == ObjectKind.ESCAPEROUTE)
				fe.setStyle(getEscapeLineStyles(fe, false));
			else
				setFeatureStyle(fe, false);
		}
	}
	
	if (features) {
		for (var i = 0; i < features.length; i++) {
			var fe = features[i];
			if (fe.get('kind') == ObjectKind.ESCAPEROUTE)
				fe.setStyle(getEscapeLineStyles(fe, true));
			else
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

function getLayerVector(layerTitle, vectorSource, isEscapeLine) {
	if (isEscapeLine) {
		return new ol.layer.Vector({
			title: layerTitle,
			source: vectorSource,
			style: escapeLineStyleFunc
		});
	}
	else {
	    return new ol.layer.Vector({
			title: layerTitle,
			source: vectorSource
		});
	}
}

function createMap() {
    gBaseMapGroup = new ol.layer.Group({
		title: '基础图层',
        layers: []
    });
    
    var configData = getMapConfig();
    
	for (var i = 0; i < configData.base_map_layers.length; i++) {
		var ly = configData.base_map_layers[i];
		
		gBaseMapGroup.getLayers().push(new ol.layer.Tile({
			title: ly.name,
			source: new ol.source.TileWMS({
				url: ly.url,
				params: {'LAYERS': ly.layers, 'TILED': true}
			}),
			visible_on_resolution: ly.visible_on_resolution
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
    
    gVideoLayer = getLayerVector('视频', gVideoLayerSrc, false);
    emergencyGroup.getLayers().push(gVideoLayer);
    
    gResourceLayer = getLayerVector('应急物资', gResourceLayerSrc, false);
    emergencyGroup.getLayers().push(gResourceLayer);
    
    gDangerLayer = getLayerVector('危险源', gDangerLayerSrc, false);
    emergencyGroup.getLayers().push(gDangerLayer);
    
    gHarzadousLayer = getLayerVector('危化品', gHarzadousLayerSrc, false);
    emergencyGroup.getLayers().push(gHarzadousLayer);
    		
    gEscapeRouteLayer = getLayerVector('避灾路线', gEscapeRouteLayerSrc, true);
    emergencyGroup.getLayers().push(gEscapeRouteLayer);

    createMeasureDistanceControl();
    createMeasureAreaControl();
    
    createBoxSelectionControl(function(e) {
    	showHighlightedFeatures([]);
    }, selectFeaturesByExtent);
	   
	gMap = new ol.Map({
		layers: [
			gBaseMapGroup,
			emergencyGroup
		],
		interactions: ol.interaction.defaults({ 
			doubleClickZoom: false 
		}),
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
					gBaseMapGroup
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

	gMap.getView().on('propertychange', function (e) {
	    switch (e.key) {
	        case 'resolution':
	            var newVal = e.target.get(e.key);

	            gBaseMapGroup.getLayers().forEach(function (lyr) {
	                if (newVal <= lyr.get('visible_on_resolution')) {
	                    lyr.setVisible(true);
	                }
	                else {
	                    lyr.setVisible(false);
	                }
	            });

	            $('.edit-information-text').text('Current Resolution: ' + newVal);

	            break;
	    }
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
    $("#danger-object-group").click(function () {
        clearAllFilterId();

		if (gSelectedType == ObjectKind.DANGER)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.DANGER;
			
		getFeatures(gSelectedType);
	});
	
	$("#video-object-group").click(function(){
	    clearAllFilterId();

	    if (gSelectedType == ObjectKind.VIDEO)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.VIDEO;

		getFeatures(gSelectedType);
	});
	
	$("#resource-object-group").click(function(){
	    clearAllFilterId();

	    if (gSelectedType == ObjectKind.RESOURCE)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.RESOURCE;

		getFeatures(gSelectedType);
	});
	
	$("#harzadous-object-group").click(function(){
	    clearAllFilterId();

	    if (gSelectedType == ObjectKind.HARZADOUS)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.HARZADOUS;

		getFeatures(gSelectedType);
	});
	
	$("#escaperoute-object-group").click(function(){
	    clearAllFilterId();

	    if (gSelectedType == ObjectKind.ESCAPEROUTE)
			gSelectedType = ObjectKind.NONE;
		else
			gSelectedType = ObjectKind.ESCAPEROUTE;

		getFeatures(gSelectedType);
	});
}

function addObjectIntoList(feature) {
	var trStr = '<div class="obj-in-list"><td>'; 
	trStr += '<label class="obj-id" style="display: none">' + feature.get('id') + '</label>';
	trStr += '<label class="obj-kind" style="display: none">' + feature.get('kind') + '</label>';

	trStr += '<div class="obj-item-in-list">';
	trStr += '<img src="' + getImageSrcByKind(feature) + '" class="obj-img-in-list"/>';
	trStr += '<label class="obj-name-in-list">' + feature.get('name') + '</label>';
	trStr += '</div>';

	trStr += '<label class="obj-view-detail-in-list">详情&raquo;</label>';

	var kind = feature.get('kind');
	if (kind == ObjectKind.DANGER) {
	    trStr += '<button class="btn-in-obj-list btn btn-primary btn-xs">';
	    if (kind == ObjectKind.DANGER) {
	        if (!feature.get('overlay'))
	            trStr += '事件录入';
	        else
	            trStr += '处置';
	    } else if (kind == ObjectKind.VIDEO)
	        trStr += '查看视频';
	    else if (kind == ObjectKind.RESOURCE)
	        trStr += '检查';
	    else
	        trStr += 'Detail';
	    trStr += '</button>';
	}

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

	$(".obj-item-in-list").click(function () {
	    var id = $(this).parent('div').find('.obj-id').text();

	    var feature = findFeatureById(id);
	    popupFeatureDetail(feature);
	});

	$(".obj-view-detail-in-list").click(function () {
	    var id = $(this).parent('div').find('.obj-id').text();
	    location.href = 'http://dwz.cn/1Vk25z';
	});

	bindEventInputEvent();
}

function bindEventInputEvent() {
    $("#dialog-event-input").dialog({
        autoOpen: false
    });

    $('.btn-in-obj-list').click(function (e) {
        var dangerName = $(this).parent('div').find('.obj-name-in-list').text();
        var dangerId = $(this).parent('div').find('.obj-id').text();

        if ($(this).text() == "处置") {
            processDangerEvent(dangerId, function () { updateStatus(); });
        } else {
            $("#dialog-event-input").dialog({
                title: "事件录入",
                autoOpen: true,
                resizable: false,
                modal: true,
                dialogClass: 'message-dialog',
                buttons: {
                    "确认": function () {
                        var desc = $("#event-description").val();
                        if (desc != '') {
                            saveDangerEvent(dangerId, $("#event-description").val(), function () { updateStatus(); });
                            $(this).dialog("close");
                        } else {
                            $("#event-description").focus();
                        }
                    },
                    "取消": function () {
                        $(this).dialog("close");
                    }
                },
                open: function () {
                    $(".ui-dialog-titlebar-close").hide();
                    $("#danger-for-event-input").text("危险源： " + dangerName);
                    $("#event-description").val('');
                }
            });
        }
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
		    for (var i = 0; i < features.length; i++) {
		        if (features[i].get('kind') == ObjectKind.DANGER)
		            allFeatures.push(features[i]);
		    }
		}
	}
	if (kind < 0 || kind == ObjectKind.VIDEO) {
		var features = gVideoLayerSrc.getFeatures();
		if (features)
			allFeatures = allFeatures.concat(features);
	}
	if (kind < 0 || kind == ObjectKind.RESOURCE) {
		var features = gResourceLayerSrc.getFeatures();
		if (features)
			allFeatures = allFeatures.concat(features);
	}
	if (kind < 0 || kind == ObjectKind.HARZADOUS) {
		var features = gHarzadousLayerSrc.getFeatures();
		if (features)
			allFeatures = allFeatures.concat(features);
	}
	if (kind < 0 || kind == ObjectKind.ESCAPEROUTE) {
		var features = gEscapeRouteLayerSrc.getFeatures();
		if (features)
			allFeatures = allFeatures.concat(features);
	}
	
	var filter = $("#object-name-filter").val().trim();
	
	var tmpFeatures = [];
	
	for (var i = 0; i < allFeatures.length; i++) {
		var fe = allFeatures[i];
		if (filter && fe.get('name').indexOf(filter) <= -1) {
			continue;
		}

		if (isFeatureFiltered(fe, fe.get('level'), gDangerLevelFilterId, ObjectKind.DANGER))
		    continue;

		if (isFeatureFiltered(fe, fe.get('type'), gDangerTypeFilterId, ObjectKind.DANGER))
		    continue;

		if (isFeatureFiltered(fe, fe.get('usage_id'), gHarzadousUsageFilterId, ObjectKind.HARZADOUS))
		    continue;

		if (isFeatureFiltered(fe, fe.get('risk_id'), gHarzadousRiskFilterId, ObjectKind.HARZADOUS))
		    continue;

		if (isFeatureFiltered(fe, fe.get('zone'), gVideoAreaFilterId, ObjectKind.VIDEO))
		    continue;

		if (isFeatureFiltered(fe, fe.get('type'), gResourceTypeFilterId, ObjectKind.RESOURCE))
		    continue;

		if (isFeatureFiltered(fe, fe.get('danger_id'), gDangerForResourceFilterId, ObjectKind.RESOURCE))
		    continue;

		if (isFeatureFiltered(fe, fe.get('level'), gEscapeRouteFilterId, ObjectKind.ESCAPEROUTE))
		    continue;

		if (isFeatureFiltered(fe, fe.get('danger_id'), gDangerForEscapeRouteFilterId, ObjectKind.ESCAPEROUTE))
		    continue;

		tmpFeatures.push(fe);
	}

	showFeaturesList(tmpFeatures);
}

function isFeatureFiltered(feature, id, filterId, targetKind) {
    if (filterId == -1)
        return false;

    if (feature.get('kind') != targetKind)
        return true;

    if (id != filterId)
        return true;

    return false;
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
    statusStatistic.innerHTML = '警报: 0';

    $(statusStatistic).insertBefore("#map");	
}

function createEditInfo() {
    var div = document.createElement("div");
    div.className = 'edit-information-text';
    div.innerHTML = '';

    $(div).insertBefore("#map");
}

function getDangerFeatureById(id) {
    var features = gDangerLayerSrc.getFeatures();
    if (features) {
        for (var i = 0; i <= features.length - 1; i++) {
            if (features[i].get("id") == id)
                return features[i];
        }		
    }

    return null;
}

function updateStatus() {
	getStatus(function(data) {
		var warningCnt = 0;
		for (var i=0; i<data.length; i++)
  		{
		    var obj = data[i];
  			if (obj.alarm) {
  			    warningCnt++;
  			}

  			var fe = getDangerFeatureById(obj.id);
  			alarmAnimation(fe, obj.alarm);
  			showEscapeAnimation(obj.id, obj.alarm);
  			updateDangerButtonText(fe.get('id'), obj.alarm);
  		}
  		
		$('.status-summary-text').text('警报: ' + warningCnt);
  		if (warningCnt == 0)
  			$('.status-summary-text').css({ color: "#000080" });
  		else
  			$('.status-summary-text').css({ color: "red" });
	});
}

function showMessage(title, customMessage, funcAfterOKClicked) {
    $("#dialog-message").html(customMessage);
    $("#dialog-message").dialog({
        title: title,
        modal: true,
        resizable: false,
        dialogClass: 'message-dialog',
        buttons: {
            "关闭": function () {
                $(this).dialog("close");
                if (funcAfterOKClicked)
                    funcAfterOKClicked();
            }
        },
        open: function () {
            $(".ui-dialog-titlebar-close").hide();
        }
    });
}

function customConfirm(title, customMessage) {
    var dfd = new jQuery.Deferred();
    $("#dialog-confirm").html(customMessage);
    $("#dialog-confirm").dialog({
        title: title,
        resizable: false,
        modal: true,
        dialogClass: 'message-dialog',
        buttons: {
            "确认": function () {
                $(this).dialog("close");
                dfd.resolve(true);
            },
            "取消": function () {
                $(this).dialog("close");
                dfd.resolve(false);
            }
        },
        open: function () {
            $(".ui-dialog-titlebar-close").hide();
        }
    });

    return dfd.promise();
}

function createCircleOutOverlay(position) {
    var elem = document.createElement('div');
    elem.setAttribute('class', 'circleOut');

    return new ol.Overlay({
        element: elem,
        position: position,
        positioning: 'center-center'
    });
}

function updateDangerButtonText(id, hasEvent) {
    $(".obj-id").each(function (i, obj) {
        if ($(this).text() == id) {
            if (hasEvent)
                $(this).siblings(".btn-in-obj-list").eq(0).text('处置');
            else
                $(this).siblings(".btn-in-obj-list").eq(0).text('事件录入');
        }
    });
}

function alarmAnimation(feature, isRun) {
    if (!feature)
        return;

    var oly = feature.get('overlay');
    if (!oly) {
        if (!isRun)
            return;

        var coordinates = feature.getGeometry().getCoordinates();
        var overlay = createCircleOutOverlay(coordinates);
        gMap.addOverlay(overlay);

        feature.set('overlay', overlay);
    } else {
        if (isRun)
            return;

        gMap.removeOverlay(feature.get('overlay'));
        feature.set('overlay', null);
    }
}

function showEscapeAnimation(danger_id, hasAlarm) {
    var features = gEscapeRouteLayerSrc.getFeatures();
    if (features) {
        for (var i = 0; i < features.length; i++) {
            var fe = features[i];
            if (fe.get('danger_id') == danger_id) {
                if (hasAlarm)
                    startEscapeAnimation(fe);
                else
                    stopEscapeAnimation(fe);
            }
        }
    }
}

function stopEscapeAnimation(feature) {
    var timer_id = feature.get('timer_id');
    if (timer_id === undefined || timer_id === null)
        return;

    clearInterval(timer_id);
    feature.set('timer_id', null);

    gMap.removeOverlay(feature.get('animation_marker'));
    feature.set('animation_marker', null);

    var elm = document.getElementById("animation_element" + feature.get('id'));
    elm.parentNode.removeChild(elm);
}

function startEscapeAnimation(feature) {
    var timer_id = feature.get('timer_id');
    if (timer_id != undefined && timer_id != null)
        return;

    var elm = document.createElement("div");
    elm.className = 'man-run-marker';
    elm.setAttribute("id", "animation_element" + feature.get('id'));
    $(elm).insertBefore("#dialog-message");

    var coords = splitLineString(feature.getGeometry(), 100);

    var marker = new ol.Overlay({
        positioning: 'center-center',
        offset: [0, 0],
        element: elm,
        stopEvent: false
    });

    gMap.addOverlay(marker);
    feature.set('animation_marker', marker);

    var i = 0;

    timer_id = setInterval(function () {
        $('.man-run-marker').removeClass('man-run-marker-pos' + i % 2).addClass('man-run-marker-pos' + (i + 1) % 2);
        marker.setPosition(coords[i]);
        i++;

        if (i == coords.length) {
            i = 0;
        }
    }, 50);

    feature.set('timer_id', timer_id);
}