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

function applyConfig(conf) {
	addDangerLevels(conf.danger_levels);
	addDangerTypes(conf.danger_types);
}
        
function addDangerLevels(levels) {
	var content = ''
	
	for (var i = 0; i < levels.length; i++) {
		content += '<li>';
		content += '<a class="danger_level_item" href="#">'; 
		content += levels[i].level_name;
		content += '</a>';
		content += '<label style="display: none">';
		content += levels[i].level_id;
		content += '</label>';
		content += '</li>'; 
	}

	$("#filter-danger-level ul").append(content);
	
	$("#filter-danger-level").click(function() {
		$("#filter-danger-type").removeClass('active');
	});
	
	$('.danger_level_item').click(function() {
		gDangerLevelFilterId = $(this).siblings("label").text();		
		getFeatures(gSelectedType);
	});
}

function addDangerTypes(types) {
	var content = ''
	
	for (var i = 0; i < types.length; i++) {
		content += '<li>';
		content += '<a class="danger_type_item" href="#">'; 
		content += types[i].type_name;
		content += '</a>';
		content += '<label style="display: none">';
		content += types[i].type_id;
		content += '</label>';
		content += '</li>'; 
	}

	$("#filter-danger-type ul").append(content);
	
	$("#filter-danger-type").click(function() {
		$("#filter-danger-level").removeClass('active');
	});
	
	$('.danger_type_item').click(function() {
		gDangerTypeFilterId = $(this).siblings("label").text();
		$("#danger-type-filter-text").text($(this).text());
		
		getFeatures(gSelectedType);
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
	var v2 = new DropDown( $('#filter-video-type') );
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
	var v1 = new DropDown( $('#filter-escape-route-type') );
	var v2 = new DropDown( $('#filter-escape-route-danger') );
}

function initFilterText() {
	$(document).click(function() {
		$('.filter-list').removeClass('active');
	});
	
	$('#filter-danger-src button').click(function() {
		$('#filter-danger-level span').text('危险级别');
		$('#filter-danger-type span').text('危险类型');
		
		gDangerLevelFilterId = -1;
		gDangerTypeFilterId = -1;
		
		getFeatures(gSelectedType);
	});
	
	$('#filter-harzadous button').click(function() {
		$('#filter-harzadous-usage span').text('用途');
		$('#filter-harzadous-risk span').text('危险性');
		
		getFeatures(gSelectedType);
	});
	
	$('#filter-video button').click(function() {
		$('#filter-video-area span').text('视频区域');
		$('#filter-video-type span').text('视频类型');
		
		getFeatures(gSelectedType);
	});
	
	$('#filter-resource button').click(function() {
		$('#filter-resource-type span').text('物资类型');
		$('#filter-resource-danger span').text('关联危险');
		
		getFeatures(gSelectedType);
	});
	
	$('#filter-escape-route button').click(function() {
		$('#filter-escape-route-type span').text('路线类型');
		$('#filter-escape-route-danger span').text('危险类型');
		
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