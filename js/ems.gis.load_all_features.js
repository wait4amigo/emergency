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

	    var fer = null;
	    if (obj.affect && obj.affect.length != 0) {
	        fer = new ol.Feature({
	            geometry: new ol.geom.Polygon(obj.affect),
	            kind: ObjectKind.DANGERRANGE,
	            danger_id: obj.id
	        });

	        setFeatureStyle(fer, false);
	        fes.push(fer);
	    }

  		var fe = new ol.Feature({
			geometry: new ol.geom.Point(obj.coord),
			name: obj.name,
			kind: ObjectKind.DANGER,
			type: obj.type,
			level: obj.level,
			id: obj.id
  		});

  		if (fer)
  		    fe.set('danger_range_feature', fer);

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
		fes.push(addEscapeObject(obj));
  	}
	
	gEscapeRouteLayerSrc.addFeatures(fes);
}

function addEscapeObject(obj) {
    var fe = new ol.Feature({
        geometry: new ol.geom.LineString(obj.coord),
		name: obj.name,
		kind: ObjectKind.ESCAPEROUTE,
		id: obj.id,
        danger_id: obj.danger_id
    });
	
	return fe;
}
