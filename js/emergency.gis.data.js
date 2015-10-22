function getData(processData) {
	var data = [
		{
			"id": 1, 
			"kind": 1,
			"coord": [ [ -13254792, 6178557 ] ],
			"lat": 6178557,
			"level": 1,
			"type": 2,
			"name": "Fire danger"
		},
		{
			"id": 2, 
			"kind": 2,
			"coord": [ [ -13890000, 4290000 ] ],
			"name": "Video camera"
		},
		{
			"id": 3, 
			"kind": 3,
			"coord": [ [ -10510000, 6030000 ] ],
			"name": "Fire extinguisher"
		},
		{
			"id": 4, 
			"kind": 4,
			"coord": [ [ -11490000, 4070000 ] ],
			"name": "The 110kv transformer"
		},
		{
			"id": 5, 
			"kind": 5,
			"coord": [ [-11470000, 4570000 ], [ -12470000, 5570000 ], [ -13470000, 5670000 ] ],
			"name": "Fire escape route"
		}
	];

	processData(eval(data));
}

function getDangerInfo(id, processDangerInfo) {
	var data = {
		"name": "Fire danger",
		"img": "http://dwz.cn/1Vkn7w"
	};
	
	processDangerInfo(eval(data));
}

function getVideoInfo(id, processVideoInfo) {
	var data = {
		"name": "Video camera",
		"img": "image/video.png"
	};
	
	processVideoInfo(eval(data));
}

function getResourceInfo(id, processResourceInfo) {
	var data = {
		"name": "Fire extinguisher",
		"type": "Fire extinguisher",
		"img": "http://dwz.cn/1Vmvsr"
	};
	
	processResourceInfo(eval(data));
}

function getHarzadousInfo(id, processHarzadousInfo) {
	var data = {
		"name": "Bad small",
		"type": "Waste water",
		"img": "http://dwz.cn/1VmJBZ"
	};
	
	processHarzadousInfo(eval(data));
}

function saveMapCenterInfo(lon, lat, zoom) {
	alert('Saved lon=' + lon + ' lat=' + lat + ' zoom=' + zoom);
}

function getMapConfig() {
	var data = {
		"base_map_url": "http://demo.boundlessgeo.com/geoserver/wms",
		"base_map_group_name": "Factory",
		"layers": "topp:states",
		"center": { "lon": -11864991, "lat": 4870341},
		"extent": { "left": -15054991, "top": 1600341, "right": -5835066, "bottom": 7338219 },
		"zoom": 5
	};
	
	return data;
}

function updateObjectPosition(id, lon, lat) {
	alert('Update the object ' + id + ' position to ' + lon, + ', ' + lat);
}

function getStatus(processStatus) {
	var data = [
		{
			"id": 1, 
			"status": 0
		},
		{
			"id": 2, 
			"status": 0
		},
		{
			"id": 3, 
			"status": 1
		},
		{
			"id": 4, 
			"status": 2
		}
	];
	
	processStatus(data);
}

function getConfig(applyConfig) {
	var data = {
		'danger_levels': [
			{ 
				'level_id': 1,
				'level_name': "Severe"
			},
			{
				'level_id': 2,
				'level_name': "Normal"
			},
			{
				'level_id': 3,
				'level_name': "Light"
			}
		],
		'danger_types': [
			{ 
				'type_id': 1,
				'type_name': "Fire"
			},
			{
				'type_id': 2,
				'type_name': "Water"
			},
			{
				'type_id': 3,
				'type_name': "Electricity"
			},
			{
				'type_id': 4,
				'type_name': "Stolen"
			}
		]
	};
	
	applyConfig(data);
}

function getFactoryTreeData() {
	var data = 
	[
		{
			"id": 1,
			"text": "Whole Map",
			"state": { "opened" : true },
			"li_attr": { "lon": -11864991, "lat": 4870341, "zoom": 6},
			"children":
			[
				{
					"id": 2,
					"text": "Factory Zone 1",
					"li_attr": { "lon": -11864991, "lat": 4870341, "zoom": 5},
					"state": { "opened" : true }
				},
				{
					"id": 3,
					"text": "Factory Zone 2",
					"li_attr": { "lon": -11864991, "lat": 4870341, "zoom": 4},
					"state": { "opened" : true }
				}
			]
		}
	];
	
	return data;
}

function addEscapeRoute(id, pts, escapeRouteAddedFunc) {
	var data = {
		"id": id, 
		"kind": 5,
		"coord": pts,
		"name": "New added escape"
	};
	
	escapeRouteAddedFunc(data);
}

