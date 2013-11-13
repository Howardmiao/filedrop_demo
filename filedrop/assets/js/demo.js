$(document).ready(function () {
    fd.jQuery();  // you can also pass an object like 'jQuery'.
    $.browser = {}
    function uaMatch(ua) {
        ua = ua.toLowerCase();

        var match = /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) ||
            [];

        return { browser: match[1] || "", version: match[2] || "0" };
    }

    var browserMatch = uaMatch(navigator.userAgent);
    if (browserMatch.browser) {
        $.browser[ browserMatch.browser ] = true;
        $.browser.version = browserMatch.version;
    }

    if ($.browser.webkit) {
        $.browser.safari = true;
    }

    if (!($.browser.webkit || $.browser.opera || $.browser.mozilla)) {
        $(".left .text").text("Upload file")
    }

    // Henceforth it's possible to access FileDrop as $().filedrop().
    var options = {iframe: {url: 'uploadfile/', force: false}, fullDocDragDetect:false};


    $('#artwork_zone .left, #proof_zone .left').each(function(){
        var self = this;
        $(this)
        .filedrop(options)
        // jQuery always passes event object as the first argument.
        .on('fdsend', function (e, files) {
            $.each(files, function (i, file) {
                file.SendTo('uploadfile/');
            });
        })
        .on('fileprogress', function(current, total){
            console.log("aaaa")
            var width = current*200/total;
            $(self).find(".progress_bar").show().css("width",width);
        })
        .on('filedone', function (e, file) {
            if (file.xhr.status == 200) {
                var response = $.parseJSON(file.xhr.response);
                var image_panel = $(this).parents('.drop_zone').find('.right');
                image_panel.empty().append($("<img>", {
                    src: response.file
                })).find("img").setImageCenter({
                    container:image_panel
                });
            } else {
                alert('Upload file error!');
            }
            $(self).find(".progress_bar").hide();
            $(self).find(".over").removeClass("over");
        })
        .on('fdiframeDone', function (event, response) {
            var image_panel = $(this).parents('.drop_zone').find('.right');
            image_panel.empty().append($("<img>", {
                src: response.file
            })).find("img").setImageCenter({
                container:image_panel
            });
            $(self).find(".progress_bar").hide();
            $(self).find(".over").removeClass("over");
        });
    });
})