function initFilters() {
	initObjectFilter();
	
	initDangerFilters();
	initVideoFilters();
	initHarzadousFilters();
	initResourceFilters();
	initEscapeRouteFilters();

	initFilterText();
	
	getFilterConfig(applyConfig);
}

function applyDangerFilter(dangers) {
    addFilter('resource_danger_item', 'filter-resource-danger', dangers, function (id) {
        var tmp = gResourceTypeFilterId;
        clearAllFilterId();

        gDangerForResourceFilterId = id;
        gResourceTypeFilterId = tmp;

        getFeatures(gSelectedType);
    });
    
    addFilter('escape_route_danger_item', 'filter-escape-route-danger', dangers, function (id) {
        clearAllFilterId();

        gDangerForEscapeRouteFilterId = id;

        getFeatures(gSelectedType);
    });
}

function clearAllFilterId() {
    gDangerLevelFilterId = -1;
    gDangerTypeFilterId = -1;
    gHarzadousUsageFilterId = -1;
    gHarzadousRiskFilterId = -1;
    gVideoAreaFilterId = -1;
    gResourceTypeFilterId = -1;
    gEscapeRouteFilterId = -1;
    gDangerForResourceFilterId = -1;
    gDangerForEscapeRouteFilterId = -1;
}

function applyConfig(conf) {
    addFilter('danger_level_item', 'filter-danger-level', conf.danger_levels, function (id) {
        var tmp = gDangerTypeFilterId;
        clearAllFilterId();

        gDangerLevelFilterId = id;
        gDangerTypeFilterId = tmp;

        getFeatures(gSelectedType);
    });

    addFilter('danger_type_item', 'filter-danger-type', conf.danger_types, function (id) {
        var tmp = gDangerLevelFilterId;
        clearAllFilterId();

        gDangerTypeFilterId = id;
        gDangerLevelFilterId = tmp;

        getFeatures(gSelectedType);
    });

    addFilter('harzadous_usage_item', 'filter-harzadous-usage', conf.harzadous_usage, function (id) {
        var tmp = gHarzadousRiskFilterId;
        clearAllFilterId();

        gHarzadousUsageFilterId = id;
        gHarzadousRiskFilterId = tmp;

        getFeatures(gSelectedType);
    });

    addFilter('harzadous_risk_item', 'filter-harzadous-risk', conf.harzadous_risk, function (id) {
        var tmp = gHarzadousUsageFilterId;
        clearAllFilterId();

        gHarzadousRiskFilterId = id;
        gHarzadousUsageFilterId = tmp;

        getFeatures(gSelectedType);
    });

    addFilter('video_area_item', 'filter-video-area', conf.video_zone, function (id) {
        clearAllFilterId();
        gVideoAreaFilterId = id;

        getFeatures(gSelectedType);
    });

    //addFilter('video_type_item', 'filter-video-type', conf.harzadous_risk, function (id) {
    //});

    addFilter('resource_type_item', 'filter-resource-type', conf.resource_type, function (id) {
        var tmp = gDangerForResourceFilterId;
        clearAllFilterId();

        gResourceTypeFilterId = id;
        gDangerForResourceFilterId = tmp;

        getFeatures(gSelectedType);
    });

    /*addFilter('escape_route_type_item', 'filter-escape-route-type', conf.escape_route_type, function (id) {
        gDangerFilterId = id;
        getFeatures(gSelectedType);
    });*/
}


function addFilter(class_name, list_name, data, onClick) {
    var content = ''

    for (var i = 0; i < data.length; i++) {
        content += '<li>';
        content += '<a class="' + class_name + '" href="#">';
        content += data[i].type_name;
        content += '</a>';
        content += '<label style="display: none">';
        content += data[i].type_id;
        content += '</label>';
        content += '</li>';
    }

    $('#' + list_name + ' ul').append(content);

    $('#' + list_name).click(function () {
        $('.filter-list').not(this).removeClass('active');
    });

    $('.' + class_name).click(function () {
        $('#' + list_name + ' span').text($(this).text());
        onClick($(this).siblings("label").text());
    });
}

function initObjectFilter() {
	$("#object-name-filter-clear").click(function(){
		$("#object-name-filter").val('');
		getFeatures(gSelectedType);
	});
	
	$("#object-name-filter").keyup(function(){
		getFeatures(gSelectedType);
	});
}

function initDangerFilters() {
	var v1 = new DropDown( $('#filter-danger-level') );
	var v2 = new DropDown( $('#filter-danger-type') );
}

function initVideoFilters() {
	var v1 = new DropDown( $('#filter-video-area') );
	//var v2 = new DropDown( $('#filter-video-type') );
}

function initHarzadousFilters() {
	var v1 = new DropDown( $('#filter-harzadous-usage') );
	var v2 = new DropDown( $('#filter-harzadous-risk') );
}

function initResourceFilters() {
	var v1 = new DropDown( $('#filter-resource-type') );
	var v2 = new DropDown( $('#filter-resource-danger') );
}

function initEscapeRouteFilters() {
	//var v1 = new DropDown( $('#filter-escape-route-type') );
	var v2 = new DropDown( $('#filter-escape-route-danger') );
}

function initFilterText() {
	$(document).click(function() {
		$('.filter-list').removeClass('active');
	});
	
	$('#filter-danger-src button').click(function() {
		$('#filter-danger-level span').text('危险级别');
		$('#filter-danger-type span').text('危险类型');
		
		clearAllFilterId();
		
		getFeatures(gSelectedType);
	});
	
	$('#filter-harzadous button').click(function() {
		$('#filter-harzadous-usage span').text('用途');
		$('#filter-harzadous-risk span').text('危险性');

		clearAllFilterId();

		getFeatures(gSelectedType);
	});
	
	$('#filter-video button').click(function() {
		$('#filter-video-area span').text('视频区域');
		//$('#filter-video-type span').text('视频类型');

		clearAllFilterId();

		getFeatures(gSelectedType);
	});
	
	$('#filter-resource button').click(function() {
		$('#filter-resource-type span').text('物资类型');
		$('#filter-resource-danger span').text('关联危险源');

		clearAllFilterId();

		getFeatures(gSelectedType);
	});
	
	$('#filter-escape-route button').click(function() {
		//$('#filter-escape-route-type span').text('路线类型');
	    $('#filter-escape-route-danger span').text('关联危险源');

		clearAllFilterId();

		getFeatures(gSelectedType);
	});
}

function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.val = '';
    this.index = -1;
    this.initEvents();
}

DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
        });
    },
    getValue : function() {
        return this.val;
    },
    getIndex : function() {
        return this.index;
    }
}