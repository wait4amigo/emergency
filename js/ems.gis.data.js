function getData(processData) {
	var data = {
		"dangers": [
			{
				"id": 101, 
				"coord": [-40074536, 811],
				"affect": [[[-40074567.91661944, 839.0158182865049], [-40074530.89243387, 862.6038074838835], [-40074481.0292162, 853.0491789482364], [-40074468.78734839, 786.1667791987072], [-40074541.04422669, 765.2660292769793], [-40074581.05423369, 821.1008897821667], [-40074567.91661944, 839.0158182865049]]],
				"level": 1,
				"type": 1,
				"name": "燃气泄漏"
			},
			{
				"id": 102, 
				"coord": [-40074306, 885],
				"affect": [[[-40074333.678929254, 906.0475091069037], [-40074303.52213294, 921.1259072647217], [-40074276.948322326, 920.0808697686352], [-40074266.79652951, 886.4903788230012], [-40074273.81320984, 867.2318306808377], [-40074334.42538461, 870.3669431690968], [-40074333.678929254, 906.0475091069037]]],
				"level": 2,
				"type": 2,
				"name": "甲醇储罐、丙烯储罐"
			},
			{
				"id": 103, 
				"coord": [-40074368, 663],
				"affect": [],
				"level": 3,
				"type": 3,
				"name": "VCM转化区"
			},
			{
				"id": 104, 
				"coord": [ -40074821, 460 ],
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
				"coord": [-40074542, 813],
				"zone": 1,
				"name": "视频一"
			},
			{
				"id": 202, 
				"coord": [ -40074283, 662 ],
				"zone": 2,
				"name": "视频二"
			}
		],
		"resources": [
			{
				"id": 301, 
				"coord": [-40074740, 647],
				"type": 1,
                "danger_id": 101,
				"name": "黄沙"
			},
			{
				"id": 302, 
				"coord": [ -40074269, 657 ],
				"type": 2,
				"danger_id": 102,
				"name": "水泥"
			},
			{
				"id": 303, 
				"coord": [ -40074587, 800 ],
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
				"coord": [ -40074572, 801 ],
				"usage_id": 1,
				"risk_id": 2,
				"name": "液化天然气"
			},
			{
				"id": 403, 
				"coord": [ -40074487, 800 ],
				"usage_id": 2,
				"risk_id": 3,
				"name": "电石"
			},
			{
				"id": 404, 
				"coord": [ -40074314, 871 ],
				"usage_id": 3,
				"risk_id": 4,
				"name": "炉气"
			}
		],
		"escape_routes": [
			{
			    "id": 501,
                "danger_id": 102,
                "coord": [[-40074535.66974814, 808.7097308999993], [-40074520.74064105, 808.4111487582603], [-40074520.29276784, 829.6104808217272], [-40074444.90077705, 830.3569361760746], [-40074444.30361277, 880.2201538464827], [-40074443.70644849, 954.2685249977472], [-40074501.0342197, 968.3018856594788]],
				"name": "甲醇事故撤离路线一"
			},
			{
				"id": 502, 
				"danger_id": 102,
				"coord": [[-40074535.66974815, 806.1717826952182], [-40074535.371166006, 796.0199898760933], [-40074555.3761695, 796.0199898760933], [-40074555.97333378, 766.7589399856743], [-40074622.55715139, 765.2660292769795], [-40074627.633047804, 712.1184080474428], [-40074677.49626547, 711.8198259057037], [-40074678.392011896, 804.6788719865234], [-40074756.32195089, 764.6688649935014], [-40074759.606354445, 806.7689469786962]],
				"name": "甲醇事故撤离路线二"
			},
			{
				"id": 503, 
				"danger_id": 101,
				"coord": [[-40074366.07509164, 660.1651153848621], [-40074363.38785236, 693.0091509761488], [-40074143.63139604, 695.3978081100605]],
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
                "name": "BasicLayer",
	            "layers": "BasicLayer",
	            "url": "http://127.0.0.1:8090/iserver/services/map-BasicLayer/wms111/BasicLayer",
                "visible_on_resolution": 100.0
            },
            {
                "name": "DetailLayer",
                "layers": "DetailLayer",
                "url": "http://127.0.0.1:8090/iserver/services/map-DetailLayer/wms111/DetailLayer",
                "visible_on_resolution": 0.8
            },
            {
                "name": "TextLv1",
                "layers": "TextLv1",
                "url": "http://127.0.0.1:8090/iserver/services/map-TextLv1/wms111/TextLv1",
                "visible_on_resolution": 1.0
            },
            {
                "name": "TextLv2",
                "layers": "TextLv2",
                "url": "http://127.0.0.1:8090/iserver/services/map-TextLv2/wms111/TextLv2",
                "visible_on_resolution": 0.5
            },
            {
                "name": "TextLv3",
                "layers": "TextLv3",
                "url": "http://127.0.0.1:8090/iserver/services/map-TextLv3/wms111/TextLv3",
                "visible_on_resolution": 0.25
            }
	    ],
	    "center":
        {
            "lon": -40074510,
            "lat": 600
        },
		"zoom": 1,
		"minZoom": 1,
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
			"li_attr": { "lon": -40074510, "lat": 600, "zoom": 16 },
			"children":
			[
				{
					"id": 2,
					"text": "炼焦分厂",
					"li_attr": { "lon": -40074321, "lat": 933, "zoom": 18 },
					"state": { "opened" : true }
				},
				{
					"id": 3,
					"text": "钾盐厂",
					"li_attr": { "lon": -40074625, "lat": 304, "zoom": 18 },
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
	//showMessage("", coords, null);

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