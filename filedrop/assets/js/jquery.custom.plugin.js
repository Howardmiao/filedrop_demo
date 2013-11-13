(function($){
    $.fn.shirtsioDropdown = function(option){
        var defaultOption = {
            onChange:function(){}
        }
        var option = $.extend({},defaultOption,option);
        var currentValue;
        var self = this;
        $(this).click(function(){
            $(this).find(".dropdown-options").slideToggle(100);
            return false;
        });
        $(this).find(".dropdown-option").click(function(){
            var tempValue = $(this).data("value");
            var tempText = $(this).find(".option-text").text();
            $(self).find(".dropdown-header-text").text(tempText);
            currentValue = tempValue;
            option.onChange.call(self, tempValue);
        });
        $(document).click(function(){
            $(this).find(".dropdown-options").slideUp(100);
        });
        var extendMethod =  {
            getValue:function(){
                return currentValue;
            },
            setValue:function(value){
                $(self).find(".dropdown-option").each(function(){
                    var tempValue = $(this).data("value");
                    var tempText = $(this).find(".option-text").text();
                    if(tempValue == value){
                        $(self).find(".dropdown-header-text").text(tempText);
                        currentValue = tempValue;
                    }
                });
            }
        }
        return $.extend(this, extendMethod);
    };

    /**
     * example
     * $(".counter").shirtsioCounter({
            readonly:false,
            parseFn:function(value){
                return parseInt(value.substr(0, value.length-1))
            },
            formatFn:function(value){
                return value + '%'
            },
            onChange : function(currentValue){
                ......
            }
        });
     * @param option
     */
    $.fn.shirtsioCounter = function(option){
        var defaultOption = {
            onChange:function(){},
            maxNumber:8,
            minNumber:0,
            delta:1,
            defaultValue:0,
            readonly:true,
            parseFn:function (value) {
                var parsed = value.match(/^(\D*?)(\d*(,\d{3})*(\.\d+)?)\D*$/);
                if (parsed && parsed[2]) {
                    if (parsed[1] && parsed[1].indexOf('-') >= 0) {
                        return -parsed[2].replace(',', '');
                    } else {
                        return +parsed[2].replace(',', '');
                    }
                }
                return NaN;
            },
            formatFn:false
        }
        var option = $.extend({},defaultOption,option);
        this.each(function(){
            var self = this;
            if(option.readonly){
                $(this).find(".counter-header-number").attr("readonly", true)
            }
            $(this).find(".counter-header-number").arrowIncrement({
                min: option.minNumber,
                max:option.maxNumber,
                parseFn:option.parseFn,
                formatFn:option.formatFn,
                delta:option.delta
            });
            $(this).find(".counter-header-number").keyup(function(event){
                var currentValue = getCurrentValue();
                if(currentValue > option.maxNumber){
                    currentValue = option.maxNumber;
                }
                if(currentValue < option.minNumber){
                    currentValue = option.minNumber;
                }
                setCurrentValue(currentValue);
                option.onChange.call(self, currentValue);
            })
            setCurrentValue(option.defaultValue);
            $(this).find(".counter-header-indicator:first").click(function(){
                var currentValue = getCurrentValue();
                if(currentValue < option.maxNumber){
                    currentValue = currentValue + option.delta;
                    setCurrentValue(currentValue);
                    option.onChange.call(self, currentValue);
                }

            });
            $(this).find(".counter-header-indicator:last").click(function(){
                var currentValue = getCurrentValue();
                if(currentValue > option.minNumber){
                    currentValue = currentValue - option.delta;
                    setCurrentValue(currentValue);
                    option.onChange.call(self, currentValue);
                }
            });
            function getCurrentValue(){
                var currentValue = $(self).find(".counter-header-number").val();
                var isNumber = currentValue.match(/^\d+$/);
                if(option.parseFn && !isNumber){
                    return option.parseFn(currentValue);
                }
                return parseInt(currentValue);
            }
            function setCurrentValue(value){
                var textValue = value;
                if(option.formatFn){
                    var textValue = option.formatFn(value);
                }
                $(self).find(".counter-header-number").val(textValue);
            }
        });
    };

    function ColorSelectPanel(option){
        var defaultOption = {
            id:"shirtsio_color_dropdown",
            onColorSelected:function(){},
            colors:{}
        }
        var option = $.extend({},defaultOption, option);

        var currentItem;

        var $this;
        var el;

        var customColorList = {};
        var customColorDetail = {};

        function init(){
            $("body").append(renderColorTooltip());
            $this = $("#"+option.id);
            el = $(this)[0];
            $this.on("click", ".color-picker-element", function(){
                var colorValue = $(this).data("value");
                var inkColor = $(this).data("inkcolor");
                var isCustomColor = $(this).hasClass('pantone-color');
                var result = option.onColorSelected.call(el, currentItem, colorValue, inkColor, isCustomColor);
                if(result == null || result ===true){
                    $this.slideUp(100);
                }
            });

            $this.on("mouseover", ".color-picker-element",
                function () {
                    var inkColor = $(this).data("inkcolor");
                    $this.find(".show_color_name").text(inkColor);
                }
            );

            $this.find(".custom-pms .checked_button").click(function(){
                var $input = $this.find(".custom-pms .input-text-1");
                var customCode = $input.val();
                if(customCode){
                    if(customColorDetail[customCode]){
                        showErrorMessage("Code Exist.");
                        return;
                    }
                    getHex(customCode, function(data){
                        data = data + "";
                        if(isInColorList(data)){
                            showErrorMessage("Code Exist.")
                        }else{
                            addCustomPMS(data, customCode, true);
                            $input.val('');
                        }
                    },function(){
                        showErrorMessage("Invalid code");
                    });
                }
            });
        }

        function addCustomPMS(data, customCode, addToNative){
            $this.find(".pantone-colors").append(renderCustomPMSHtml(data, customCode));
            if(addToNative){
                customColorList[data.toLowerCase()] = true;
                customColorDetail[customCode] = {
                    customCode : customCode,
                    customHex:data
                };
            }
        }

        function getHex(customCode, callback, error){
            $.ajax({
                url:"//www.ooshirts.com/lab/pantone.php",
                data:{pantone:customCode},
                success:function(data){
                    callback && callback(data);
                },
                error:function(){
                    error && error();
                }
            });
        }

        function showErrorMessage(message){
            inputBox = $this.find('.input-text-1');
            inputBox.val(message);
            inputBox.css("color","red");
            inputBox.one("focus", function(){
                $(this).val("")
                $(this).removeAttr("style")
            });
        }

        function isInColorList(hex){
            for(var key in option.colors){
                if(option.colors[key]['background_color'].toLowerCase() == hex.toLocaleString()){
                    return true;
                }
            }
            if(customColorList[hex.toLowerCase()]){
                return true;
            }
            return false;
        }

        function renderCustomPMSHtml(color, customCode){
            var html = '<li class="color-picker-element pantone-color" data-value="'+color+'" data-inkcolor="PMS'+customCode+'">'+
                            '<a class="color-picker-canvas pantone-color-canvas" title="'+customCode+'" style="background-color:#'+color+';">'+
                                '<span class="tooltip-outline" style="left: -3px; top: -36px;">'+customCode+
                                '</span>'+
                            '</a>'+
                        '</li>'
            return html;
        }

        function renderColorTooltip(){
            var html = [];
            html.push('<div id="'+option.id+'" class="color-picker tooltip" style="display: none;">');
            html.push('    <span class="show_color_name">Black</span>');
            html.push('    <ul class="color-picker-list regular-colors clearfix">');
            for(var key in option.colors){
                var colorName = key;
                var hex = option.colors[key]['background_color'];
                var colorValue = '#'+hex;
                var whiteColorClass = "";
                if(key.toLowerCase() == "white"){
                    whiteColorClass = "white"
                }
                html.push('<li class="color-picker-element regular-color '+whiteColorClass+'" data-value="'+hex+'" data-inkcolor="'+colorName+'">');
                html.push('    <a class="color-picker-canvas regular-color-canvas" href="#" style="background-color: '+colorValue+'" title="'+colorName+'" alt="'+colorName+'">');
                html.push('        <span class="tooltip-outline">'+colorName+'<br>'+colorName+'');
                html.push('    </a>');
                html.push('</li>');
            }
            html.push('</ul>');
            html.push('<div class="custom-colors clearfix">');
		    html.push('    <ul class="color-picker-list pantone-colors clearfix"></ul>');
		    html.push('	   <div class="custom-pms">');
			html.push('        <a href="#" title="Add Custom PMS" class="checked_button right">Add</a>');
			html.push('	       <input class="input-text-1 left" type="text" placeholder="Custom PMS" name="custom-pms">');
		    html.push('	    </div>');
	        html.push('</div>')
            html.push('<div class="pms_label clearfix">Custom PMS color add $5</div>')
            html.push('</div>');
            return html.join("")
        }

        init();

        $(document).click(function(){
            $this.slideUp(100);
        });

        $this.click(function(){
            return false;
        })
        function selectedColor(){
            var colorHex = $(currentItem).data("colorHex");
            var colorName = $(currentItem).data("inkColor");
            $this.find(".color-picker-element a").removeClass('color-selected');
            $this.find(".color-picker-element[data-value='"+colorHex+"']").find('a').addClass('color-selected');
            $this.find(".show_color_name").text(colorName);
        }


        return $.extend(this,{
            triggle:function(dropdownEl){
                var position = $(dropdownEl).offset();
                position.top = position.top + $(dropdownEl).height();
                var currentPosition = {};
                currentPosition.top = parseFloat($this.css("top"));
                currentPosition.left = parseFloat($this.css("left"));
                if(position.top == currentPosition.top && position.left == currentPosition.left){
                    if($this.is(":visible")){
                        $this.slideUp(100);
                    }else{
                        $this.slideDown(100);
                    }
                }else{
                    $this.slideDown(100);
                }
                $this.css(position);
                currentItem = dropdownEl;
                selectedColor();
            },
            addCustomColor:function(customCode, callback){
                if(customColorDetail[customCode]){
                    var hex = customColorDetail[customCode].customHex;
                    callback && callback(customCode, hex);
                }else{
                    getHex(customCode, function(data){
                        data = data + "";
                        if(!isInColorList(data)){
                            addCustomPMS(data, customCode, true);
                        }
                        callback && callback(customCode, data);
                    });
                }
            }
        });

    }

    var colorSelectPanel;

    $.fn.shirtsioColorSelectBox = function(option){
        var defaultOption = {
            onChange:function(){},
            colors:{
                "Athletic Gold" : { "background_color" : "FCB514", "ink_color" : "1235U"},
                "Black" : { "background_color" : "000000", "ink_color" : "Black" },
                "Blue" : { "background_color" : "0072C6", "ink_color" : "300U" },
                "Bright Purple" : { "background_color" : "59118E", "ink_color" : "267C" },
                "Brown" : { "background_color" : "843F0F", "ink_color" : "1615U" },
                "Charity Pink" : { "background_color" : "FFA0BF", "ink_color" : "210C" },
                "Dark Purple" : { "background_color" : "5B195E", "ink_color" : "2623U" },
                "Deep Navy" : { "background_color" : "003049", "ink_color" : "539C" },
                "Deep Pink" : { "background_color" : "C41E3A", "ink_color" : "200C" },
                "Forest" : { "background_color" : "215B33", "ink_color" : "357U" },
                "Cardinal" : { "background_color" : "A03033", "ink_color" : "1807U" },
                "Gold" : { "background_color" : "D8B511", "ink_color" : "110U" },
                "Grass Green" : { "background_color" : "007C66", "ink_color" : "335C" },
                "Green" : { "background_color" : "56AA1C",  "ink_color" : "369U" },
                "Grey" : { "background_color" : "827F77", "ink_color" : "424U" },
                "Hot Pink" : { "background_color" : "ED2893", "ink_color" : "225C" },
                "Kelly Green" : { "background_color" : "006B54", "ink_color" : "342U" },
                "Lemon" : { "background_color" : "F4ED7C", "ink_color" : "100C" },
                "Light Blue" : { "background_color" : "A8CEE2", "ink_color" : "291U" },
                "Light Grey" : { "background_color" : "AFAAA3", "ink_color" : "422U" },
                "Light Orange" : { "background_color" : "F99B0C", "ink_color" : "1375U" },
                "Light Purple" : { "background_color" : "AA72BF", "ink_color" : "2577U" },
                "Lime" : { "background_color" : "8DD169", "ink_color" : "367U" },
                "Magenta" : { "background_color" : "E0218E", "ink_color" : "239U" },
                "Maroon" : { "background_color" : "70193D", "ink_color" : "222C" },
                "Midtone Grey" : { "background_color" : "96938E", "ink_color" : "423U" },
                "Navy" : { "background_color" : "00335B", "ink_color" : "540U" },
                "Old Gold" : { "background_color" : "7C6316", "ink_color" : "126U" },
                "Olive" : { "background_color" : "848205", "ink_color" : "392U" },
                "Orange Red" : { "background_color" : "D81E05", "ink_color" : "485U" },
                "Orange" : { "background_color" : "EF6B00", "ink_color" : "021U" },
                "Pink" : { "background_color" : "F9BFC1", "ink_color" : "182U" },
                "Red" : { "background_color" : "CE1126", "ink_color" : "186C" },
                "Royal" : { "background_color" : "0038A8", "ink_color" : "286U" },
                "Tan" : { "background_color" : "F2C68C", "ink_color" : "156U" },
                "Teal" : { "background_color" : "007272", "ink_color" : "322U" },
                "Turquoise" : { "background_color" : "00BCE2", "ink_color" : "306U" },
                "White" : { "background_color" : "FFFFFF",  "ink_color" : "White" },
                "Yellow" : { "background_color" : "FFFF00", "ink_color" : "Yellow U" }
            }
        }
        var option = $.extend({},defaultOption,option);

        var $this = this;

        if(!colorSelectPanel){
            colorSelectPanel = new ColorSelectPanel({
                id:"color_select_box_color_panel",
                colors : option.colors,
                onColorSelected : function(opener, value, inkColor, isCustomPMS){
                    $(opener).find(".dropdown-header-color").css("background-color", '#'+value);
                    var colorData = {
                        "colorHex":value,
                        "inkColor":inkColor,
                        "isCustomPMS":isCustomPMS
                    };
                    $(opener).data(colorData);
                    opener.context.is(":visible") && opener.context.trigger("colorChanged", [colorData, opener.context.getSelectedColors()]);
                }
            });
        }


        $this.find(".color-display").show();
        $this.find(".color_selector").hide();

        $this.on('click', '.change_link', function(){
            var $panelSide = $(this).parents('.side_panel');
            $panelSide.find(".color-display").hide();
            $panelSide.find(".color_selector").show();
            return false;
        });

        $this.on('click', '.save_link', function(){
            var $panelSide = $(this).parents('.side_panel');
            var colors = getColors();
            loadColor(colors.simpleInfo, false);
            $panelSide.find(".color-display").show();
            $panelSide.find(".color_selector").hide();
            $this.trigger("colorSaved", [null, colors]);
            return false;
        });


        function renderColorDropdown(hex, customCode, isCustomPMS){
            var colorDropdownHtml =
                '<div class="dropdown" >'+
                    '<a class="dropdown-header dropdown-header-title">'+
                        '<span class="dropdown-header-color" style="background-color: #'+hex+'"></span>'+
                        '<span class="dropdown-header-indicator">'+
                            '<img src="'+empty_image_url+'" alt="Dropdown arrow" class="icon-bottom-indicator icon">'+
                        '</span>'+
                    '</a>'+
                '</div>';
            if(isCustomPMS){
                customCode = "PMS" + customCode;
            }
            var $temp = $(colorDropdownHtml).data({
                "colorHex":hex,
                "inkColor":customCode,
                "isCustomPMS":isCustomPMS
            });
            return $temp;
        }

        function renderDisplayColorDropdown(hex, customCode, isCustomPMS){
            var colorDropdownHtml =
                '<li class="white">' +
                    '<a class="color-picker-canvas" name="Prepared For Dye" style="background-color:#'+hex+'">' +
                    '</a>' +
                '</li>'
            return colorDropdownHtml;
        }

        this.find(".color_dropdown_panel").on("click", ".dropdown", function(){
            this.context = $this;
            colorSelectPanel.triggle(this);
            return false;
        });

        this.find(".counter").shirtsioCounter({
            onChange : function(currentValue){
                var $sidePanel = $(this).parents('.side_panel');
                var colorDropdownPanel = $sidePanel.find('.color_dropdown_panel');
                var colorDropdownNumber = colorDropdownPanel.find(".dropdown").length;
                if(currentValue > colorDropdownNumber){
                    colorDropdownPanel.append(renderColorDropdown("000000", "Black", false));
                }else{
                    colorDropdownPanel.find(".dropdown:last").remove();
                }
                var $fullColorButton = $sidePanel.find(".checked_button");
                if($fullColorButton.hasClass("active")){
                    $fullColorButton.removeClass("active");
                    $sidePanel.find('.or_label').show();
                }
                $this.is(":visible") && $this.trigger("colorChanged", [null, getColors()]);
            }
        });
        this.find(".checked_button").click(function(){
            var $sidePanel = $(this).parents('.side_panel');
            if($(this).hasClass("active")){
                $(this).removeClass("active");
                $sidePanel.find('.or_label').opacity(1);
                $sidePanel.find('.counter .counter-header').show();

            }else{
                $(this).addClass("active");
                $sidePanel.find('.color_dropdown_panel').empty();
                $sidePanel.find('.counter-header-number').text(0);
                $sidePanel.find('.or_label').opacity(0);
                $sidePanel.find('.counter .counter-header').hide();
            }
            $this.is(":visible") && $this.trigger("colorChanged", [null, getColors()]);
        });

        function getColors(){
            var side = ['front', 'back', 'left','right'];
            var print = {};
            var fullInfo = {};
            $this.find(".side_panel").each(function(index){
                if($(this).find(".checked_button").hasClass("active")){
                        var sidePrint = print[side[index]] = {};
                        var sideInfo = fullInfo[side[index]] = {};
                        sidePrint.color_count = 11;
                        sideInfo.isfullcolor = true;
                        sideInfo.custompms_count = 0;
                }else{
                    var colorArray = [];
                    var customPMS = [];
                    $(this).find(".color_dropdown_panel .dropdown").each(function(){
                        var color = $(this).data();
                        colorArray.push(color.inkColor);
                        if(color.isCustomPMS){
                            customPMS.push(color.inkColor);
                        }
                    })
                    var sidePrint = print[side[index]] = {};
                    if(colorArray.length > 0){
                        sidePrint.color_count = colorArray.length;
                        sidePrint.colors = colorArray;
                    }
                    var sideInfo = fullInfo[side[index]] = {};
                    sideInfo.color_count = colorArray.length;
                    sideInfo.colors = colorArray;
                    sideInfo.custompms_count = customPMS.length;
                    sideInfo.custompms = customPMS;
                    sideInfo.isfullcolor = false
                }
            });
            var totalCustomPMS = 0;
            for(var side in fullInfo){
                totalCustomPMS += fullInfo[side].custompms_count;
            }
            fullInfo.totalcustompms = totalCustomPMS;
            return {
                simpleInfo : print,
                fullInfo:fullInfo
            };
        }
        function loadColor(print, triggleEvent){
            if(triggleEvent === null || triggleEvent===undefined){
                triggleEvent = true;
            }
            var defs = [];
            function addColors(colors, $sideColorPanel, $displayColorPanel){
                $.each(colors, function(i){
                    if(this.indexOf("PMS") != -1){
                        var customColorDeferred = $.Deferred();
                        var customPMSCode = this.substr(3);
                        colorSelectPanel.addCustomColor(customPMSCode,function(customPMSCode, hex){
                            $sideColorPanel.append(renderColorDropdown(hex, customPMSCode, true));
                            $displayColorPanel.append(renderDisplayColorDropdown(hex, customPMSCode, true));
                            customColorDeferred.resolve();
                        });
                        defs.push(customColorDeferred.promise());
                    }else{
                        var colorObject = option.colors[this];
                        $sideColorPanel.append(renderColorDropdown(colorObject.background_color, this, false));
                        $displayColorPanel.append(renderDisplayColorDropdown(colorObject.background_color, this, true));
                    }
                });
            }
            for(var key in print){
                var $sidePanel = $this.find("."+key+"_side_panel");
                var $sideColorPanel = $sidePanel.find(".color_dropdown_panel");
                var $displayColorPanel = $sidePanel.find(".color-display .color-picker-list");
                $sideColorPanel.empty();
                $displayColorPanel.empty();
                $sidePanel.find(".counter .counter-header-number").val(0);
                if(!$.isEmptyObject(print[key])){
                    var colorCount = print[key].color_count;
                    if(colorCount ==11){
                        $sidePanel.find(".checked_button").click();
                    }else{
                        $sidePanel.find(".counter .counter-header-number").val(colorCount);
                        addColors(print[key].colors, $sideColorPanel, $displayColorPanel);
                    }
                }
            }
            return $.when.apply($, defs).done(function(){
                if(triggleEvent){
                    $this.trigger("colorChanged", [null, getColors()]);
                }
            });
        }
        return $.extend(this, {
            getSelectedColors : getColors,
            loadColor : loadColor
        });
    };

    $.fn.jsonAjaxLoader = function(url, method, callback, error, data){
        var self = this;
        $(self).spin("flower");
        var ajaxParams = {
            type: method,
            url: url,
            dataType: 'json',
            success: function(data){
                callback && callback(data);
            },
            error:function(xhr, textStatus, errorThrown){
                error && error(xhr, textStatus, errorThrown);
            },
            complete:function(){
                $(self).spin(false);
            }
        };
        data && (ajaxParams.data = data);
        $.ajax(ajaxParams);
    }

    $.fn.opacity = function(number){
        var tempNumber = number * 100;
        this.css({
            "opacity" : number,
            "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity="+tempNumber+")"
        });
    }

    $.fn.setImageCenter = function(option){
        var defaultOption = {width:128,height:186};
        var option = $.extend(defaultOption, option);
        this.each(function(){
            var callback = function(){
                var container = null
                if(option.container){
                    if(option.container instanceof Function){
                        container = option.container.apply(this);
                    }else if(typeof option.container === "string"){
                        container = $(option.container);
                    }else{
                        container = option.container;
                    }
                }
                var containerWidth = container? container.innerWidth() : option.width;
                var containerHeight = container? container.innerHeight() : option.height;

                var height = this.height;
                var width = this.width;
                var tempWidth = 0;
                var tempHeight = 0;
                var ratio = width/height;
                if(ratio > containerWidth/containerHeight){
                    tempWidth = containerWidth;
                    tempHeight = containerWidth/ratio;
                }else{
                    tempHeight = containerHeight;
                    tempWidth = containerHeight * ratio;
                }
                if($(this).attr("width") || $(this).attr("height")){
                    $(this).css({
                        top:(containerHeight - height)/2,
                        left:(containerWidth - width)/2
                    });
                }else{
                    $(this).css({
                        width:tempWidth,
                        height:tempHeight,
                        top:(containerHeight - tempHeight)/2,
                        left:(containerWidth - tempWidth)/2
                    });
                }
            }
            if(this.complete){
                callback.call(this)
            }else{
                $(this).load(function(){
                    callback.call(this)
                });
            }
        })
    }
})(jQuery);