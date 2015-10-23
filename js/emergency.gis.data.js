function getData(processData) {
	var data = [
		{
			"id": 1, 
			"kind": 1,
			"coord": [ [ -23376278, 4067916 ] ],
			"lat": 6178557,
			"level": 1,
			"type": 2,
			"name": "Fire danger"
		},
		{
			"id": 2, 
			"kind": 2,
			"coord": [ [ -23375853, 4067945 ] ],
			"name": "Video camera"
		},
		{
			"id": 3, 
			"kind": 3,
			"coord": [ [ -23376133, 4067245 ] ],
			"name": "Fire extinguisher"
		},
		{
			"id": 4, 
			"kind": 4,
			"coord": [ [ -23375758, 4067004 ] ],
			"name": "The 110kv transformer"
		},
		{
			"id": 5, 
			"kind": 5,
			"coord": [ [-23376066, 4067371 ], [ -23376061, 4067436 ], [ -23376295, 4067436 ] ],
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
		"base_map_url": "http://localhost:8090/iserver/services/map-Emergency/wms111/emergency",
		"base_map_group_name": "Factory",
		"layers": "emergency",
		"center": { "lon": -23375968, "lat": 4067441 },
		"extent": { "left": -23376491, "top": 4068241, "right": -23375220, "bottom": 4066655 },
		"zoom": 17,
		"minZoom": 16,
		"maxZoom": 22
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
			"text": "全厂",
			"state": { "opened" : true },
			"li_attr": { "lon": -23375968, "lat": 4067441, "zoom": 16},
			"children":
			[
				{
					"id": 2,
					"text": "炼焦分厂",
					"li_attr": { "lon": -23375790, "lat": 4067748, "zoom": 18},
					"state": { "opened" : true }
				},
				{
					"id": 3,
					"text": "钾盐厂",
					"li_attr": { "lon": -23376051, "lat": 4067110, "zoom": 18},
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

