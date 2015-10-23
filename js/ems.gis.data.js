function getData(processData) {
	var data = {
		"dangers": [
			{
				"id": 101, 
				"coord": [ -23376278, 4067916 ],
				"affect": [ ],
				"level": 1,
				"type": 1,
				"name": "ˮ��"
			},
			{
				"id": 102, 
				"coord": [ -23376178, 4067716 ],
				"affect": [ ],
				"level": 2,
				"type": 2,
				"name": "����"
			},
			{
				"id": 103, 
				"coord": [ -23376128, 4067216 ],
				"affect": [ ],
				"level": 3,
				"type": 3,
				"name": "����"
			},
			{
				"id": 104, 
				"coord": [ -23375978, 4067316 ],
				"affect": [ ],
				"lat": 6178557,
				"level": 4,
				"type": 4,
				"name": "������"
			}
		],
		"videos": [
			{
				"id": 201, 
				"coord": [ -23375916, 4067883 ],
				"type": 1,
				"area": 1,
				"name": "��Ƶһ"
			},
			{
				"id": 202, 
				"coord": [ -23375853, 4067945 ],
				"type": 2,
				"area": 2,
				"name": "��Ƶ��"
			}
		],
		"resources": [
			{
				"id": 301, 
				"coord": [ -23376433, 4067945 ],
				"name": "ˮ��"
			},
			{
				"id": 302, 
				"coord": [ -23376173, 4067145 ],
				"name": "��ɳ"
			},
			{
				"id": 303, 
				"coord": [ -23376133, 4067245 ],
				"name": "������"
			}
		],
		"harzadous": [
			{
				"id": 401, 
				"coord": [ -23375658, 4066904 ],
				"name": "����"
			},
			{
				"id": 402, 
				"coord": [ -23375718, 4067904 ],
				"name": "Һ��"
			},
			{
				"id": 403, 
				"coord": [ -23375958, 4067104 ],
				"name": "��ʯ"
			},
			{
				"id": 404, 
				"coord": [ -23375818, 4067304 ],
				"name": "¯��"
			}
		],
		"escape_routes": [
			{
				"id": 501, 
				"coord": [ [-23376066, 4067371 ], [ -23376061, 4067436 ], [ -23376295, 4067436 ] ],
				"name": "����·��һ"
			},
			{
				"id": 502, 
				"coord": [ [-23376666, 4067371 ], [ -23376461, 4067136 ], [ -23376195, 4067236 ] ],
				"name": "����·�߶�"
			},
			{
				"id": 503, 
				"coord": [ [-23376366, 4067371 ], [ -23376761, 4067336 ], [ -23376995, 4067936 ] ],
				"name": "����·����"
			}
		]
	};

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
				'level_name': "һ��",
				'level_desc': "һ���ش�Σ��Դ"
			},
			{
				'level_id': 2,
				'level_name': "����",
				'level_desc': "�����ش�Σ��Դ"
			},
			{
				'level_id': 3,
				'level_name': "����",
				'level_desc': "�����ش�Σ��Դ"
			},
			{
				'level_id': 4,
				'level_name': "�ļ�",
				'level_desc': "�ļ��ش�Σ��Դ"
			}
		],
		'danger_types': [
			{ 
				'type_id': 1,
				'type_name': "����"
			},
			{
				'type_id': 2,
				'type_name': "ˮ��"
			},
			{
				'type_id': 3,
				'type_name': "����"
			},
			{
				'type_id': 4,
				'type_name': "����"
			},
			{
				'type_id': 5,
				'type_name': "��ѧƷй©"
			}
		],
		'harzadous_usage': [
			{ 
				'type_id': 1,
				'type_name': "��Ʒ"
			},
			{
				'type_id': 2,
				'type_name': "�м��Ʒ"
			},
			{
				'type_id': 3,
				'type_name': "ԭ��"
			}
		],
		'harzadous_risk': [
			{ 
				'type_id': 1,
				'type_name': "�綾"
			},
			{
				'type_id': 2,
				'type_name': "���ƶ�"
			},
			{
				'type_id': 3,
				'type_name': "���Ʊ�"
			},
			{
				'type_id': 4,
				'type_name': "�����ص���"
			}
		],
		'escape-route-type': [
			{ 
				'type_id': 1,
				'type_name': "ȫ��"
			},
			{
				'type_id': 2,
				'type_name': "����Σ��Դ"
			}
		],
		'resource-type': [
			{ 
				'type_id': 1,
				'type_name': "������"
			},
			{
				'type_id': 2,
				'type_name': "��ɳ"
			},
			{
				'type_id': 3,
				'type_name': "������"
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
			"text": "ȫ��",
			"state": { "opened" : true },
			"li_attr": { "lon": -23375968, "lat": 4067441, "zoom": 16},
			"children":
			[
				{
					"id": 2,
					"text": "�����ֳ�",
					"li_attr": { "lon": -23375790, "lat": 4067748, "zoom": 18},
					"state": { "opened" : true }
				},
				{
					"id": 3,
					"text": "���γ�",
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
