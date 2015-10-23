function loadAllFeatures() {
	getData(addObjects);
}

function addObjects(data) {
	if (!data)
		return;
		
	addDangers(data.dangers);	
	addVideos(data.videos);	
	addResources(data.resources);	
	addHarzadous(data.harzadous);	
	addEscapeRoutes(data.escape_routes);
}

function addDangers(data) {
	if (!data)
		return;
		
	var fes = [];	
	for (var i = 0; i < data.length; i++) {
  		var obj = data[i];
  		var fe = new ol.Feature({
			geometry: new ol.geom.Point(obj.coord),
			name: obj.name,
			kind: ObjectKind.DANGER,
			type: obj.type,
			level: obj.level,
			id: obj.id
		});
		
		setFeatureStyle(fe, false);
		fes.push(fe);
  	}
	
	gDangerLayerSrc.addFeatures(fes);
}

function addVideos(data) {
	if (!data)
		return;

	var fes = [];
	for (var i = 0; i < data.length; i++) {
  		var obj = data[i];
  		var fe = new ol.Feature({
			geometry: new ol.geom.Point(obj.coord),
			name: obj.name,
			kind: ObjectKind.VIDEO,
			type: obj.type,
			area: obj.area,
			id: obj.id
		});
		
		setFeatureStyle(fe, false);
		fes.push(fe);
  	}
	
	gVideoLayerSrc.addFeatures(fes);
}

function addResources(data) {
	if (!data)
		return;
		
	var fes = [];	
	for (var i = 0; i < data.length; i++) {
  		var obj = data[i];
  		var fe = new ol.Feature({
			geometry: new ol.geom.Point(obj.coord),
			name: obj.name,
			kind: ObjectKind.RESOURCE,
			id: obj.id
		});
		
		setFeatureStyle(fe, false);
		fes.push(fe);
  	}
	
	gResourceLayerSrc.addFeatures(fes);
}

function addHarzadous(data) {
	if (!data)
		return;
		
	var fes = [];
	for (var i = 0; i < data.length; i++)
  	{
  		var obj = data[i];
  		var fe = new ol.Feature({
			geometry: new ol.geom.Point(obj.coord),
			name: obj.name,
			kind: ObjectKind.HARZADOUS,
			id: obj.id
		});
		
		setFeatureStyle(fe, false);
		fes.push(fe);
  	}
	
	gHarzadousLayerSrc.addFeatures(fes);
}

function addEscapeRoutes(data) {
	if (!data)
		return;
		
	var fes = [];
	for (var i = 0; i < data.length; i++)
  	{
  		var obj = data[i];
		var fe = addEscapeObject(obj);
		
		setFeatureStyle(fe, false);
		fes.push(fe);
  	}
	
	gEscapeRouteLayerSrc.addFeatures(fes);
}

function addEscapeObject(obj) {
	var startPoint = new ol.geom.Point(obj.coord[0]);
	var lineStrings = new ol.geom.LineString(obj.coord);
	var meetingPoint = new ol.geom.Point(obj.coord[obj.coord.length - 1]);
				
	var fe = new ol.Feature({
		geometry: new ol.geom.GeometryCollection([
			startPoint,
			lineStrings,
			meetingPoint		
		]),
		name: obj.name,
		kind: ObjectKind.ESCAPEROUTE,
		id: obj.id,
		lineStrings: lineStrings
	});
		
	setFeatureStyle(fe, false);
	
	return fe;
}
