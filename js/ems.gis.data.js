function getData(processData) {
	var data = {
		"dangers": [
			{
				"id": 101, 
				"coord": [-23376278, 4067916],
				"affect": [[[-23377011.05602585, 4067904.596965929], [-23376607.37297022, 4067904.596965929], [-23376822.35211227, 4067555.853024378], [-23377199.75993943, 4067565.4076529136], [-23377011.05602585, 4067904.596965929]]],
				"level": 1,
				"type": 1,
				"name": "水灾"
			},
			{
				"id": 102, 
				"coord": [ -23376178, 4067716 ],
				"affect": [],
				"level": 2,
				"type": 2,
				"name": "火灾"
			},
			{
				"id": 103, 
				"coord": [ -23376128, 4067216 ],
				"affect": [],
				"level": 3,
				"type": 3,
				"name": "冰雹"
			},
			{
				"id": 104, 
				"coord": [ -23375978, 4067316 ],
				"affect": [],
				"lat": 6178557,
				"level": 4,
				"type": 4,
				"name": "龙卷风"
			}
		],
		"videos": [
			{
				"id": 201, 
				"coord": [ -23375916, 4067883 ],
				"type": 1,
				"area": 1,
				"name": "视频一"
			},
			{
				"id": 202, 
				"coord": [ -23375853, 4067945 ],
				"type": 2,
				"area": 2,
				"name": "视频二"
			}
		],
		"resources": [
			{
				"id": 301, 
				"coord": [ -23376433, 4067945 ],
				"name": "水泥"
			},
			{
				"id": 302, 
				"coord": [ -23376173, 4067145 ],
				"name": "黄沙"
			},
			{
				"id": 303, 
				"coord": [ -23376133, 4067245 ],
				"name": "混凝土"
			}
		],
		"harzadous": [
			{
				"id": 401, 
				"coord": [ -23375658, 4066904 ],
				"name": "硫酸"
			},
			{
				"id": 402, 
				"coord": [ -23375718, 4067904 ],
				"name": "液氧"
			},
			{
				"id": 403, 
				"coord": [ -23375958, 4067104 ],
				"name": "电石"
			},
			{
				"id": 404, 
				"coord": [ -23375818, 4067304 ],
				"name": "炉气"
			}
		],
		"escape_routes": [
			{
			    "id": 501,
                "danger_id": 101,
				"coord": [ [-23376066, 4067371 ], [ -23376061, 4067436 ], [ -23376295, 4067436 ] ],
				"name": "逃跑路线一"
			},
			{
				"id": 502, 
				"danger_id": 101,
				"coord": [[-23376666, 4067371], [-23376461, 4067136], [-23376195, 4067236]],
				"name": "逃跑路线二"
			},
			{
				"id": 503, 
				"danger_id": 102,
				"coord": [[-23376366, 4067371], [-23376761, 4067336], [-23376995, 4067936]],
				"name": "逃跑路线三"
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

function saveRegionLocationInfo(id, lon, lat, zoom) {
	alert('Saved region id=' + id + ' lon=' + lon + ' lat=' + lat + ' zoom=' + zoom);
}

function getMapConfig() {
	var data = {
		"base_map_layers": [ { "name": "厂区", "layers": "emergency", "url": "http://localhost:8090/iserver/services/map-Emergency/wms111/emergency" } ],
		"center": { "lon": -23375968, "lat": 4067441 },
		"zoom": 17,
		"minZoom": 16,
		"maxZoom": 22
	};
	
	return data;
}

function updateObjectPosition(id, lon, lat) {
	alert('Update the object ' + id + ' position to ' + lon, + ', ' + lat);
}

function getRandomAlarm() {
    var value = Math.random();
    if (value < 0.3)
        return true;
    return false;
}

var alarms = [];
function saveDangerEvent(id, eventDesc, afterSaveFunc) {
    var found = false;

    for (var i = 0; i < alarms.length; i++) {
        if (alarms[i].id == id) {
            alarms[i].alarm = true;
            found = true;
            break;
        }
    }

    if (!found)
        alarms.push({ "id": id, "alarm": true });

    afterSaveFunc();
}

function processDangerEvent(id, afterProcessFunc) {
    for (var i = 0; i < alarms.length; i++) {
        if (alarms[i].id == id) {
            alarms[i].alarm = false;
            break;
        }
    }

    afterProcessFunc();
}

function getStatus(processStatus) {
    var data = alarms;
	
	processStatus(data);
}

function getFilterConfig(applyConfig) {
	var data = {
		'danger_levels': [
			{ 
				'level_id': 1,
				'level_name': "一级",
				'level_desc': "一级重大危险源"
			},
			{
				'level_id': 2,
				'level_name': "二级",
				'level_desc': "二级重大危险源"
			},
			{
				'level_id': 3,
				'level_name': "三级",
				'level_desc': "三级重大危险源"
			},
			{
				'level_id': 4,
				'level_name': "四级",
				'level_desc': "四级重大危险源"
			}
		],
		'danger_types': [
			{ 
				'type_id': 1,
				'type_name': "火灾"
			},
			{
				'type_id': 2,
				'type_name': "水灾"
			},
			{
				'type_id': 3,
				'type_name': "触电"
			},
			{
				'type_id': 4,
				'type_name': "盗窃"
			},
			{
				'type_id': 5,
				'type_name': "化学品泄漏"
			}
		],
		'harzadous_usage': [
			{ 
				'type_id': 1,
				'type_name': "产品"
			},
			{
				'type_id': 2,
				'type_name': "中间产品"
			},
			{
				'type_id': 3,
				'type_name': "原料"
			}
		],
		'harzadous_risk': [
			{ 
				'type_id': 1,
				'type_name': "剧毒"
			},
			{
				'type_id': 2,
				'type_name': "易制毒"
			},
			{
				'type_id': 3,
				'type_name': "易制爆"
			},
			{
				'type_id': 4,
				'type_name': "国家重点监管"
			}
		],
		'escape-route-type': [
			{ 
				'type_id': 1,
				'type_name': "全局"
			},
			{
				'type_id': 2,
				'type_name': "关联危险源"
			}
		],
		'resource-type': [
			{ 
				'type_id': 1,
				'type_name': "消防车"
			},
			{
				'type_id': 2,
				'type_name': "黄沙"
			},
			{
				'type_id': 3,
				'type_name': "防化服"
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

function addEscapeRoute(id, coords, escapeRouteAddedFunc) {
	var data = {
		"id": id, 
		"kind": 5,
		"coord": coords,
		"name": "New added escape"
	};
	
	escapeRouteAddedFunc(data);
}

function updateEscapeRoute(id, coords, updateFinishedFunc) {
    alert("避灾路线id=" + id + " 坐标更新为" + coords);
    updateFinishedFunc();
}

function updateDangerRange(id, coords, updateFinishedFunc) {
    alert("危险源id=" + id + " 影响范围更新为" + coords);
    updateFinishedFunc();
}