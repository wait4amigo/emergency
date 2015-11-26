function getData(processData) {
	var data = {
		"dangers": [
			{
				"id": 101, 
				"coord": [-23375685, 4067791],
				"affect": [[[-23375707.14781288,4067815.47019662], [-23375651.611534517,4067832.787960841], [-23375633.69660601,4067826.2191537223], [-23375633.995188154,4067766.204143233], [-23375707.44639502,4067756.6495146975], [-23375742.679087747,4067777.550264619], [-23375737.603191335,4067804.4226573757], [-23375729.840055652,4067809.1999716433], [-23375707.14781288,4067815.47019662]]],
				"level": 1,
				"type": 1,
				"name": "燃气泄漏"
			},
			{
				"id": 102, 
				"coord": [ -23375934, 4067671 ],
				"affect": [[[-23376020.957643844,4067683.3475989006], [-23375914.0652371,4067746.049848666], [-23375832.850894548,4067770.5335842883], [-23375827.476416,4067620.6453491356], [-23375863.306273006,4067611.687884883], [-23375994.682415374,4067611.0907206], [-23376020.957643844,4067683.3475989006]]],
				"level": 2,
				"type": 2,
				"name": "甲醇储罐、丙烯储罐"
			},
			{
				"id": 103, 
				"coord": [ -23376128, 4067216 ],
				"affect": [],
				"level": 3,
				"type": 3,
				"name": "VCM转化区"
			},
			{
				"id": 104, 
				"coord": [ -23375978, 4067316 ],
				"affect": [],
				"lat": 6178557,
				"level": 4,
				"type": 4,
				"name": "电石冷却库"
			}
		],
		"videos": [
			{
				"id": 201, 
				"coord": [ -23375721, 4067816 ],
				"zone": 1,
				"name": "视频一"
			},
			{
				"id": 202, 
				"coord": [ -23375916, 4067707 ],
				"zone": 2,
				"name": "视频二"
			}
		],
		"resources": [
			{
				"id": 301, 
				"coord": [-23375811, 4067658],
				"type": 1,
                "danger_id": 101,
				"name": "黄沙"
			},
			{
				"id": 302, 
				"coord": [ -23376173, 4067145 ],
				"type": 2,
				"danger_id": 102,
				"name": "水泥"
			},
			{
				"id": 303, 
				"coord": [ -23375972, 4067686 ],
				"type": 1,
				"danger_id": 101,
				"name": "灭火器、消防栓"
			}
		],
		"harzadous": [
			{
				"id": 401, 
				"coord": [-23375963, 4067641],
				"usage_id": 1,
				"risk_id": 1,
				"name": "甲醇、丙烯"
			},
			{
				"id": 402, 
				"coord": [ -23375726, 4067786 ],
				"usage_id": 1,
				"risk_id": 2,
				"name": "液化天然气"
			},
			{
				"id": 403, 
				"coord": [ -23375958, 4067104 ],
				"usage_id": 2,
				"risk_id": 3,
				"name": "电石"
			},
			{
				"id": 404, 
				"coord": [ -23375818, 4067304 ],
				"usage_id": 3,
				"risk_id": 4,
				"name": "炉气"
			}
		],
		"escape_routes": [
			{
			    "id": 501,
                "danger_id": 102,
				"coord": [[-23375929.591508474,4067671.2550221593], [-23375885.99851578,4067671.852186443], [-23375885.401351497,4067707.0848791683], [-23375811.65156249,4067706.487714885], [-23375812.547308907,4067838.610312604]],
				"name": "甲醇事故撤离路线一"
			},
			{
				"id": 502, 
				"danger_id": 102,
				"coord": [[-23375945.714944128,4067666.776290033], [-23375945.416361984,4067644.084047261], [-23375992.59234038,4067644.9797936864], [-23375990.502265386,4067601.685383134], [-23376043.351304475,4067604.6712045516], [-23376043.351304475,4067753.962275421]],
				"name": "甲醇事故撤离路线二"
			},
			{
				"id": 503, 
				"danger_id": 101,
				"coord": [[-23375679.97683798,4067790.240005642], [-23375621.4547382,4067790.8371699257], [-23375623.24623105,4067737.0923844124], [-23375476.940981597,4067738.2867129794]],
				"name": "燃气泄漏撤离路线"
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
	//alert('Saved region id=' + id + ' lon=' + lon + ' lat=' + lat + ' zoom=' + zoom);
}

function getMapConfig() {
	var data = {
	    "base_map_layers": [
            {
	            "name": "工厂",
	            "layers": "emergency",
	            "url": "http://localhost:8090/iserver/services/map-Emergency/wms111/emergency",
                "visible_on_resolution": 2.0
	        }
	    ],
	    "center":
        {
            "lon": -23375968,
            "lat": 4067441
        },
		"zoom": 17,
		"minZoom": 16,
		"maxZoom": 22
	};
	
	return data;
}

function updateObjectPosition(id, lon, lat) {
	//alert('Update the object ' + id + ' position to ' + lon, + ', ' + lat);
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
			    'type_id': 1,
			    'type_name': "一级",
				'type_desc': "一级重大危险源"
			},
			{
			    'type_id': 2,
			    'type_name': "二级",
			    'type_desc': "二级重大危险源"
			},
			{
			    'type_id': 3,
			    'type_name': "三级",
			    'type_desc': "三级重大危险源"
			},
			{
			    'type_id': 4,
			    'type_name': "四级",
			    'type_desc': "四级重大危险源"
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
		'resource_type': [
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
		],
		'video_zone': [
			{
			    'type_id': 1,
			    'type_name': "区域一"
			},
			{
			    'type_id': 2,
			    'type_name': "区域二"
			},
			{
			    'type_id': 3,
			    'type_name': "区域三"
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
	showMessage("", coords, null);
	var data = {
		"id": id, 
		"kind": 5,
		"coord": coords,
		"name": "New added escape",
        "danger_id": 101
	};
	
	escapeRouteAddedFunc(data);
}

function updateEscapeRoute(id, coords, updateFinishedFunc) {
    //alert("避灾路线id=" + id + " 坐标更新为" + coords);
    updateFinishedFunc();
}

function updateDangerRange(id, coords, updateFinishedFunc) {
    //alert("危险源id=" + id + " 影响范围更新为" + coords);
    updateFinishedFunc();
}