var Editor, GrayscaleContrastFilter;

function getLength(str) {
    var length = 0;
    var regx = /[a-zA-z0-9]/
    var strArr = str.split('');
    strArr.forEach(function(key, index) {
        if (regx.test(key)) {
            length++;
        } else {
            length += 2;
        }
    })
    return length;
}
fontSpy('Flaticon', {
    success: function() {
    },
    failure: function() {
    }
});
Editor = (function() {
    var INTRO_CITIES, PROFANITIES;
    var $itext;

    INTRO_CITIES = ["北京", "遵义", "开封"];

    PROFANITIES = /fuck|fcking|nigger|nigga|asshole|cocksucker|blowjob|clit|gangbang|wetback|faggot/i;

    function Editor($canvas, $controls) {
        var ref, self, sliderElement;
        this.photoAdded = false;
        this.values = {
            photo: 0,
            contrast: 0.25,
            invert: 0
        };
        this.canvas = new fabric.Canvas($canvas.get(0));
        this.canvas.selection = false;
        this.canvasUpdateFunction = (function(_this) {
            return function() {
                return _this.canvas.renderAll();
            };
        })(this);
        this.cityText = "";
        this.controls = $controls;
        self = this;
        if (((ref = window.location.search) != null ? ref.indexOf('skip=1') : void 0) > -1) {
            $("#slides").hide();
            this.logActionToAnalytics('restart');
            INTRO_CITIES = [" "];
        } else {
            $("#slides").show();
        }
        $controls.find('.download').click((function(_this) {
            return function() {
                return _this.downloadLocal();
            };
        })(this));
        $controls.find('.restart').click((function(_this) {
            return function() {
                return location.href = "/?skip=1";
            };
        })(this));
        $controls.find('.donthave').click((function(_this) {
            return function() {
                var obj = self.logoText;
                obj.exitEditing();
                var val = $itext.val();
                val = val.trim();
                if (getLength(val) > 10) {
                    obj.set('fontSize', 140);
                    obj.set('top', 650);
                };
                obj.set('text', $itext.val().trim().toUpperCase());
                //$(this).remove();
                self.canvas.add(obj);
                self.canvas.renderAll();
                $itext.hide();

                $(".donthave").hide();
                return _this.setMode('nophoto').done(function() {});
            };
        })(this));
        $controls.find('.share').click((function(_this) {
            return function() {
                return _this.share();
            };
        })(this));
        $(".upload").click(function(e) {
            var $input;
            $input = $("input[type=file]");
            if ($('html').is('.ios')) {
                return $input.trigger(e).click();
            } else {
                return $input.click();
            }
        });
        $controls.find('input[type=file]').change(function() {
            var obj = self.logoText;
            obj.exitEditing();
            obj.set('text', $itext.val().trim().toUpperCase());
            //$(this).remove();
            self.canvas.add(obj);
            self.canvas.renderAll();
            $itext.hide();
            return self.setPhoto.call(self, this.files[0]);
        });
        $controls.find('form.editor-invert-control').change(function() {
            return self.setValue.call(self, parseInt($(this).find(':checked').val()));
        });
        this.controlsRadios = $controls.find('.editor-types input[type=radio]').change(function() {
            return self.setParameter.call(self, $(this).val());
        });
        sliderElement = $('.editor-range-control .range')[0];
        noUiSlider.create(sliderElement, {
            start: 0,
            range: {
                min: 0,
                max: 1
            },
            connect: 'lower'
        });
        this.controlsRange = sliderElement.noUiSlider;
        this.controlsRange.on('change', function(values) {
            return self.setValue.call(self, parseFloat(values[0]), 'change');
        });
        this.controlsRange.on('update', function(values) {
            return self.setValue.call(self, parseFloat(values[0]), 'update');
        });
        this.initializeTextMode();
        this.setMode('intro');
    }

    Editor.prototype.initializeTextMode = function(deferred) {
        var fontSize, grimePattern, logoTop;
        if (this.logoText != null) {
            return;
        }
        grimePattern = new fabric.Pattern({
            source: document.getElementById('img-pattern-grime'),
            repeat: 'repeat'
        });
        this.logoFrame = new fabric.Image(document.getElementById('img-logo-frame'), {
            selectable: false,
            evented: false
        });
        this.canvas.add(this.logoFrame);
        this.logoFrame.scaleToHeight(this.canvas.height);
        this.logoFrame.center();
        logoTop = 620;
        fontSize = 200;
        this.logoText = new fabric.IText(INTRO_CITIES[0], {
            originX: 'center',
            textAlign: 'center',
            fill: grimePattern,
            left: this.canvas.width / 2,
            top: logoTop,
            lineHeight: 1,
            fontSize: fontSize,
            fontFamily: 'knockout, Impact, Flaticon',
            editable: false,
            cursorWidth: 0,
            cursorColor: '#ed1c24',
            hoverCursor: 'text',
            hasBorders: false,
            hasControls: false,
            hasRotatingPoint: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            selectionColor: 'rgba(255,255,255,0.9)',
            caching: false,
            width: 740,
            fixedLineWidth: 740,
            multiline: false,
            capitalize: true,
            cursorHeightPercent: 0.7,
            cursorDeltaX: 0,
            cursorDeltaY: -12,
            maxLength: 15
        });
        $itext = $('<input/>').attr('type', 'text').addClass('itext');
        var self = this;
        this.logoText.on('editing:entered', function(e) {
            var obj = this;
            var keyDownCode = 0;

            self.canvas.remove(obj);

            // show input area
            $itext.val(obj.text)
                .appendTo($(self.canvas.wrapperEl).closest('.canvas-outer'));

            // text submit event
            // submit text by ENTER key
            var willChange = true;
            var lastValue = '';

            // $itext.off('keydown').on('keydown',function(e){
            //   if (getLength($(this).val()) > 11 && e.keyCode != 8) {
            //       willChange = false;
            //     }else{
            //       willChange = true;
            //     }
            // })

            $itext.off('input').on('input', function(e) {
                // obj.exitEditing();
                // obj.set('text', $(this).val());
                //$(this).remove();
                // self.canvas.add(obj);
                // self.canvas.renderAll();
                if (willChange) {
                    var value = $(this).val().trim();
                    if (value !== "") {
                        $(this).removeClass('itext-5 itext-6');
                        // if (len === 5) $(this).addClass('itext-5');
                        // if (len >= 6) $(this).addClass('itext-6');
                        var len = getLength(value);
                        if (len > 8) {
                            $(this).addClass('itext-5');
                        };

                        if (len >= 10) {
                            $(this).addClass('itext-6');
                        };

                        $(".upload").addClass("showanimation");
                        $(".donthave").animate({
                            opacity: 1
                        }, function(e) {});
                    } else {
                        $(".upload").removeClass("showanimation");
                        $(".donthave").animate({
                            opacity: 0
                        });
                    }
                    lastValue = value;

                } else {
                    $(this).val(lastValue);
                }
                self.cityText = $(this).val();
            });

            // focus on text
            setTimeout(function() {
                $itext.val(' ').focus();
            }, 10);
        });
        this.canvas.add(this.logoText);
        this.logoText.on('changed', (function(_this) {
            return function(e) {
                var newText, tempText;
                newText = _this.logoText.text;
                if (newText !== "") {
                    $(".upload").addClass("showanimation");
                    $(".donthave").animate({
                        opacity: 1
                    }, function(e) {});
                } else {
                    $(".upload").removeClass("showanimation");
                    $(".donthave").animate({
                        opacity: 0
                    });
                }
                tempText = newText.replace(/\s+/g, '');
                if (PROFANITIES.test(tempText)) {
                    return _this.typeTextClear();
                } else {
                    window.reactToKeypress(newText.length < _this.cityText.length);
                    return _this.cityText = newText;
                }
            };
        })(this));
        this.canvas.on('selection:cleared', (function(_this) {
            return function() {
                return _this.focusTextField();
            };
        })(this));
        this.focusTextField();
        return deferred != null ? deferred.resolve() : void 0;
    };

    Editor.prototype.initializePhotoMode = function(deferred, animate) {
        if (deferred == null) {
            deferred = null;
        }
        if (animate == null) {
            animate = true;
        }
        if (this.logo != null) {
            return;
        }
        this.canvas.off('selection:cleared');
        this.logoText.off('editing:exited');
        this.logoText.off('changed');
        this.logoText.exitEditing();
        this.canvas.discardActiveObject();
        this.watermark = new fabric.Image(document.getElementById('img-beats-watermark'), {
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            left: this.canvas.width / 2,
            top: this.canvas.height * 0.9
        });
        return fabric.util.loadImage(this.canvas.toDataURL(), (function(_this) {
            return function(img) {
                var duration, opts, toScale, toTop;
                _this.canvas.remove(_this.logoText);
                _this.canvas.remove(_this.logoFrame);
                _this.logo = new fabric.Image(img);
                _this.logo.set({
                    selectable: false,
                    evented: false,
                    originX: 'center',
                    originY: 'center',
                    left: _this.canvas.width / 2,
                    top: _this.canvas.height / 2
                });
                _this.canvas.add(_this.logo);
                _this.photo = new fabric.Image(document.getElementById('img-bg'), {
                    selectable: false,
                    evented: false,
                    width: _this.canvas.width,
                    height: _this.canvas.height
                });
                _this.canvas.insertAt(_this.photo, 0);
                duration = 2000;
                if (_this.photoAdded) {
                    toScale = 0.4;
                    toTop = 640 / 1000 * _this.canvas.height;
                } else {
                    toScale = 0.6;
                    toTop = 410;
                }
                if (animate) {
                    opts = {
                        duration: duration,
                        easing: fabric.util.ease.easeOutExpo
                    };
                    _this.logo.animate('scaleX', toScale, opts);
                    _this.logo.animate('scaleY', toScale, opts);
                    _this.logo.animate('top', toTop, opts);
                } else {
                    _this.logo.set({
                        scaleX: toScale,
                        scaleY: toScale,
                        top: toTop
                    });
                    _this.canvas.renderAll();
                }
                if (_this.photoAdded) {
                    toScale = 0.7;
                    toTop = _this.canvas.height * 0.92;
                } else {
                    toScale = 1;
                    toTop = _this.canvas.height * 0.9;
                }
                if (animate) {
                    opts = {
                        duration: duration,
                        easing: fabric.util.ease.easeOutExpo
                    };
                    _this.watermark.animate('scaleX', toScale, opts);
                    _this.watermark.animate('scaleY', toScale, opts);
                    opts.onChange = function() {
                        return _this.canvas.renderAll();
                    };
                    _this.watermark.animate('top', toTop, opts);
                } else {
                    _this.watermark.set({
                        scaleX: toScale,
                        scaleY: toScale,
                        top: toTop
                    });
                    _this.canvas.renderAll();
                }
                _this.canvas.backgroundColor = 'black';
                _this.canvas.add(_this.watermark);
                return deferred != null ? deferred.resolve() : void 0;
            };
        })(this));
    };

    Editor.prototype.initializeIntroMode = function(deferred) {
        this.typeTextSeries(INTRO_CITIES).always((function(_this) {
            return function() {
                $('#slides').delay(100).fadeOut(600, function() {
                    return $(this).remove();
                });
                return _this.setMode('text').done(function() {
                    _this.logoText.setText('');
                    _this.logoText.set({
                        editable: true
                    });
                    return _this.focusTextField();
                });
            };
        })(this));
        return deferred != null ? deferred.resolve() : void 0;
    };

    Editor.prototype.fixOrderingOnLoad = function() {
        this.canvas.discardActiveObject();
        if (this.photo != null) {
            this.canvas.sendToBack(this.photo);
        }
        if (this.logo != null) {
            this.canvas.bringToFront(this.logo);
        }
        if (this.watermark != null) {
            return this.canvas.bringToFront(this.watermark);
        }
    };

    Editor.prototype.finalizeForDoneMode = function(deferred) {
        var secondDeferred;
        secondDeferred = $.Deferred();
        secondDeferred.always((function(_this) {
            return function() {
                var j, len1, obj, ref;
                _this.canvas.discardActiveObject();
                ref = [_this.photo, _this.logo, _this.logoText];
                for (j = 0, len1 = ref.length; j < len1; j++) {
                    obj = ref[j];
                    if (obj != null) {
                        obj.set({
                            selectable: false,
                            evented: false,
                            editable: false
                        });
                    }
                }
                _this.canvas.renderAll();
                return deferred != null ? deferred.resolve() : void 0;
            };
        })(this));
        if (this.mode !== 'photo') {
            this.initializePhotoMode(secondDeferred, false);
        } else {
            secondDeferred.resolve();
        }
        return deferred;
    };

    Editor.prototype.setMode = function(newMode) {
        var deferred, oldMode;
        deferred = new $.Deferred();
        oldMode = this.mode;
        if (newMode !== "intro") {
            $("#bottom").show();
            $("#down").show();
            $("#legal").show();
        }
        switch (newMode) {
            case 'nophoto':
                this.finalizeForDoneMode(deferred);
                break;
            case 'intro':
                this.initializeIntroMode(deferred);
                break;
            case 'photo':
                this.initializePhotoMode(deferred);
                break;
            case 'done':
                this.finalizeForDoneMode(deferred);
                break;
            default:
                deferred.resolve();
        }
        window.setTimeout((function() {
            return $('.editor').removeClass().addClass("editor mode-" + newMode);
        }), 1000);
        this.mode = newMode;
        return deferred;
    };

    Editor.prototype.focusTextField = function() {
        var ref, ref1;
        if (((ref = this.canvas.getActiveObject()) != null ? ref.type : void 0) === 'i-text' && ((ref1 = this.logoText) != null ? ref1.isEditing : void 0)) {
            return $('textarea').trigger('focus');
        } else {
            this.canvas.setActiveObject(this.logoText);
            return this.logoText.enterEditing();
        }
    };

    Editor.prototype.typeTextSeries = function(textArray) {
        this.typeTextSeriesDeferred = $.Deferred();
        this.typeTextSeriesArray = textArray;
        this.typeTextSeriesNext(true);
        return this.typeTextSeriesDeferred;
    };

    Editor.prototype.typeTextSeriesNext = function(isFirst) {
        var delay, text;
        if (this.typeTextCanceling) {
            return;
        }
        text = this.typeTextSeriesArray.shift();
        delay = 800;
        if (text != null) {
            return window.setTimeout((function(_this) {
                return function() {
                    var $slide;
                    if (!isFirst) {
                        $slide = $('#slides .slide').first();
                        $slide.fadeOut(200, function() {
                            return $(this).remove();
                        });
                    }
                    return _this.typeTextImmediate(text).done(_this.typeTextSeriesNext.bind(_this));
                };
            })(this), delay);
        } else {
            return window.setTimeout(((function(_this) {
                return function() {
                    return _this.typeTextSeriesDeferred.resolve();
                };
            })(this)), delay);
        }
    };

    Editor.prototype.typeTextClear = function() {
        if (this.logoText.isEditing) {
            this.logoText.exitEditing();
        }
        this.logoText.setSelectionStart(0);
        this.logoText.setSelectionEnd(0);
        this.logoText.setText('');
        this.logoText._clearCache();
        this.logoText.enterEditing();
        return this.canvasUpdateFunction();
    };

    Editor.prototype.typeTextImmediate = function(text) {
        this.typeTextDeferred = $.Deferred();
        this.logoText.setText(text);
        this.canvas.renderAll();
        return this.typeTextDeferred.resolve();
    };

    Editor.prototype.typeText = function(text) {
        if (!((this.logoText != null) && (this.typeTextDeferred = $.Deferred()))) {
            return;
        }
        this.typeTextClear();
        this.autoTypeChars = text.split('');
        this.typeTextQueueUpdate();
        return this.typeTextDeferred;
    };

    Editor.prototype.typeTextStop = function() {
        var ref, ref1;
        this.typeTextCanceling = true;
        window.clearTimeout(this.interval);
        this.typeTextClear();
        this.canvas.renderAll();
        if ((ref = this.typeTextDeferred) != null) {
            ref.reject();
        }
        return (ref1 = this.typeTextSeriesDeferred) != null ? ref1.reject() : void 0;
    };

    Editor.prototype.typeTextQueueUpdate = function() {
        var delay;
        delay = 10 + Math.random() * 20;
        return this.interval = window.setTimeout(this.typeTextUpdate.bind(this), delay);
    };

    Editor.prototype.typeTextUpdate = function() {
        var char;
        if (this.typeTextCanceling) {
            return;
        }
        char = this.autoTypeChars.shift();
        if (!((char != null) && (this.logoText != null))) {
            return this.typeTextDeferred.resolve();
        }
        this.logoText.insertChar(char);
        return this.typeTextQueueUpdate();
    };

    Editor.prototype.captureImageDeferred = function(type, quality) {
        var deferred, oldColor, onBlobReady;
        if (type == null) {
            type = 'image/jpeg';
        }
        if (quality == null) {
            quality = 0.8;
        }
        oldColor = this.canvas.backgroundColor;
        this.canvas.backgroundColor = 'black';
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
        deferred = $.Deferred();
        onBlobReady = (function(_this) {
            return function(blob) {
                _this.canvas.backgroundColor = oldColor;
                return deferred.resolve(blob);
            };
        })(this);
        this.canvas.lowerCanvasEl.toBlob(onBlobReady, type, quality);
        return deferred;
    };

    Editor.prototype.logActionToAnalytics = function(label) {
        return typeof ga === "function" ? ga('send', 'event', 'action', label) : void 0;
    };

    Editor.prototype.downloadLocal = function() {
        this.logActionToAnalytics('download');
        $(".editor-image-controls").slideUp();
        return this.captureImageDeferred().done(function(blob) {
            return saveAs(blob, 'StraightOuttaSomewhere.jpg');
        });
    };

    Editor.prototype.share = function() {
        var loader;
        if (this.isSharingBusy) {
            return;
        } else {
            this.isSharingBusy = true;
        }
        $(".editor-image-controls").slideUp();
        this.logActionToAnalytics('share');
        if (this.permalink != null) {
            return this.popupSharing();
        } else {
            loader = this.getLoader();
            return this.captureImageDeferred().done((function(_this) {
                return function(blob) {
                    var $facebook, $popup, $twitter, $weibo, $weixin, cityText, redir, twitterString, url, weiboString;
                    _this.cityText = _this.cityText.toTitleCase();
                    loader.resolve();
                    _this.permalink = 'http://demandware.edgesuite.net/aany_prd/on/demandware.static/-/Sites-beats-CN-Library/default/dw3f9311aa/images/homepage/touts/powerbeats-2-tout-O.jpg';
                    $popup = $('#share-popup-src').addClass('ready');
                    cityText = _this.cityText;
                    $twitter = $popup.find('a.twitter');
                    twitterString = "I'm #StraightOutta {CITY}. Where you from? #BeatsByDre";
                    twitterString = encodeURIComponent(twitterString.replace('{CITY}', cityText));
                    url = "https://twitter.com/intent/tweet?text=" + twitterString + "&url=" + (encodeURI(_this.permalink));
                    $twitter.attr({
                        href: url
                    });
                    $twitter.click(function() {
                        return _this.logActionToAnalytics('share_twitter');
                    });
                    $facebook = $popup.find('a.facebook');
                    redir = window.location.origin + "/close.html";
                    url = "https://www.facebook.com/dialog/share?app_id=415295758676714&display=popup&href=" + (encodeURI(_this.permalink)) + "&redirect_uri=" + (encodeURI(redir));
                    $facebook.attr({
                        href: url
                    });
                    $facebook.click(function() {
                        return _this.logActionToAnalytics('share_facebook');
                    });
                    $weibo = $popup.find('a.weibo');
                    weiboString = "未来有无限可能，但我们都有一个不变的起点！我是#StraightOutta#{CITY}，你来自哪里？@BeatsbyDre";
                    weiboString = encodeURIComponent(weiboString.replace('{CITY}', cityText));
                    // url = "http://v.t.sina.com.cn/share/share.php?title=" + weiboString + "&pic=" + (encodeURI(_this.permalink));
                    // $weibo.attr({
                    //   href: url
                    // });
                    //file uploading...
                    // console.log(blob,'111111')
                    $weixin = $popup.find('a.weixin');
                    if (!Wxapi.canUse) $weixin.hide();

                    $('.weixin').click(function() {
                        _this.popupWeixin();
                    });
                    var form = new FormData();
                    form.append('image', blob);
                    $.ajax({
                        method: 'POST',
                        data: form,
                        processData: false,
                        contentType: false,
                        url: '/uploads',
                        type: 'JSON',
                        success: function(data) {
                            var imageUrl = data.url;
                            url = "http://v.t.sina.com.cn/share/share.php?title=" + weiboString + "&url=http://www.straightoutta.cn/" + "&pic=" + (encodeURI(imageUrl));
                            $('.weibo').attr({
                                href: url
                            });
                            $('.weibo').click(function() {
                                return _this.logActionToAnalytics('share_weibo');
                            });
                            Wxapi.setShare({
                                place: cityText,
                                imgUrl: imageUrl
                            });
                        }
                    })


                    return _this.popupSharing();
                };
            })(this));
        }
    };

    Editor.prototype.popupSharing = function() {
        return $.featherlight($('#share-popup-src'), {
            variant: 'featherlight-share',
            afterOpen: function() {
                return $('.share-popup').find('.weibo').click(function(e) {
                    var $this, h, w;
                    e.preventDefault();
                    $this = $(this);
                    w = $this.data('popwidth');
                    h = $this.data('popheight');
                    return window.open($(this).attr('href'), "share", "width=" + w + ",height=" + h + ",centerscreen=true");
                });
            },
            afterClose: (function(_this) {
                return function() {
                    return _this.isSharingBusy = false;
                };
            })(this)
        });
    };
    Editor.prototype.popupWeixin = function() {
        return $.featherlight($('#share-popup-weixin'), {
            variant: 'featherlight-weixin',
            otherClose: '.know',
            afterClose: (function(_this) {
                return function() {
                };
            })(this)
        });
    };
    Editor.prototype.setPhoto = function(fileDescriptor) {
        var loader, reader;
        if (fileDescriptor == null) {
            return;
        }
        this.logActionToAnalytics('add-photo');
        loader = this.getLoader();
        reader = new FileReader();
        reader.onload = (function(_this) {
            return function(e) {
                var aspect, dataUrl, img, imgHeader, ref;
                img = new Image();
                dataUrl = e.target.result;
                img.src = dataUrl;
                aspect = img.width / img.height;
                if ((img.width === (ref = img.height) && ref === 0)) {
                    loader.reject();
                    console.error("Load fail. Retrying.");
                    window.setTimeout(_this.setPhoto.call(_this, fileDescriptor), 1000);
                    return;
                }
                try {
                    imgHeader = _this.dataUrlToBinary(dataUrl, 64 * 1024 + 32);
                } catch (_error) {
                    e = _error;
                    console.error(e);
                }
                _this.photoAdded = true;
                return _this.setMode('photo').done(function() {
                    return _this.downscalePhotoIfNeededDeferred(img).done(function(photo) {
                        if (_this.photo != null) {
                            _this.photo.off('selected');
                            _this.photo.off('moving');
                            _this.canvas.remove(_this.photo);
                        }
                        _this.photo = photo;
                        _this.photo.set({
                            selectable: true,
                            originX: 'center',
                            originY: 'center',
                            centeredScaling: true,
                            hasRotatingPoint: false,
                            lockRotation: true,
                            lockScalingFlip: true,
                            lockUniScaling: true,
                            lockMovementX: false,
                            lockMovementY: false,
                            lockScalingX: true,
                            lockScalingY: true,
                            hasBorders: false,
                            hasControls: false,
                            width: _this.canvas.width,
                            height: _this.canvas.height,
                            padding: 0
                        });
                        if (aspect > 1) {
                            _this.photo.width = _this.canvas.width * aspect;
                        } else {
                            _this.photo.height = _this.canvas.height / aspect;
                        }
                        _this.photo.filters.push(new GrayscaleContrastFilter({
                            contrast: _this.values.contrast
                        }));
                        _this.photo.applyFilters(function() {
                            _this.canvas.insertAt(_this.photo, 0);
                            _this.photo.center();
                            _this.photo.on('selected', function() {
                                return _this.setParameter('photo', true);
                            });
                            _this.photo.on('moving', function() {
                                return _this.constrainPhotoMove();
                            });
                            _this.setParameter('photo', true);
                            return loader.resolve();
                        });
                        if (imgHeader != null) {
                            return inkjet.exif(imgHeader, function(err, metadata) {
                                if ((metadata != null ? metadata.Orientation : void 0) != null) {
                                    switch (metadata.Orientation.value) {
                                        case 8:
                                            _this.photo.setAngle(-90);
                                            break;
                                        case 3:
                                            _this.photo.setAngle(-180);
                                            break;
                                        case 6:
                                            _this.photo.setAngle(90);
                                    }
                                    if (_this.photo.angle !== 0) {
                                        return _this.canvas.renderAll();
                                    }
                                }
                            });
                        }
                    });
                });
            };
        })(this);
        return reader.readAsDataURL(fileDescriptor);
    };

    Editor.prototype.dataUrlToBinary = function(dataURL, stopAfterBytes) {
        var BASE64_MARKER, base64, binArray, i, j, len, parts, raw, ref, stopAfterChars;
        BASE64_MARKER = ';base64,';
        parts = dataURL.split(BASE64_MARKER);
        base64 = parts[1];
        if (stopAfterBytes > 0) {
            stopAfterChars = Math.ceil((4 * stopAfterBytes / 3) / 4) * 4;
            base64 = base64.substr(0, stopAfterChars);
        }
        raw = window.atob(base64);
        len = raw.length;
        binArray = new Uint8Array(len);
        for (i = j = 0, ref = len; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            binArray[i] = raw.charCodeAt(i);
        }
        return binArray;
    };

    Editor.prototype.downscalePhotoIfNeededDeferred = function(img) {
        var H, OVERSCALE, W, aspect, ctx, deferred, resizeCanvas;
        deferred = $.Deferred();
        OVERSCALE = 1;
        W = this.canvas.width * OVERSCALE;
        H = this.canvas.height * OVERSCALE;
        aspect = img.width / img.height;
        if (img.width > W && img.height > H) {
            console.warn("Scaling down image");
            resizeCanvas = document.createElement('canvas');
            resizeCanvas.width = W;
            resizeCanvas.height = H;
            if (aspect > 1) {
                resizeCanvas.width = W * aspect;
            } else {
                resizeCanvas.heigth = H / aspect;
            }
            ctx = resizeCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, resizeCanvas.width, resizeCanvas.height);
            fabric.Image.fromURL(resizeCanvas.toDataURL(), (function(_this) {
                return function(photo) {
                    return deferred.resolve(photo);
                };
            })(this));
        } else {
            deferred.resolve(new fabric.Image(img));
        }
        return deferred;
    };

    Editor.prototype.setParameter = function(parameterId, programmatic) {
        if (programmatic == null) {
            programmatic = false;
        }
        if (programmatic && this.parameter !== parameterId) {
            $("#control-" + parameterId).click();
        }
        this.controls.removeClass().addClass('editor-controls').addClass(parameterId);
        this.parameter = parameterId;
        this.controlsRange.set(this.values[this.parameter]);
        if (!programmatic) {
            if (this.parameter === 'photo' && (this.photo != null)) {
                return this.canvas.setActiveObject(this.photo);
            } else {
                return this.canvas.discardActiveObject();
            }
        }
    };

    Editor.prototype.setValue = function(value, eventType) {
        var ref, ref1, ref2, ref3;
        this.values[this.parameter] = value;
        switch (this.parameter) {
            case 'photo':
                if ((ref = this.photo) != null) {
                    ref.scale(value + 1);
                }
                this.constrainPhotoMove();
                break;
            case 'contrast':
                if (eventType !== 'update') {
                    if ((ref1 = this.photo) != null) {
                        if ((ref2 = ref1.filters[0]) != null) {
                            ref2.contrast = value;
                        }
                    }
                    if ((ref3 = this.photo) != null) {
                        ref3.applyFilters((function(_this) {
                            return function() {
                                return _this.canvas.renderAll();
                            };
                        })(this));
                    }
                }
                break;
            case 'invert':
                if (value <= 0) {
                    this.logo.filters = this.watermark.filters = [];
                } else if (this.logo.filters.length === 0) {
                    this.logo.filters = this.watermark.filters = [new fabric.Image.filters.Invert()];
                }
                this.watermark.applyFilters((function(_this) {
                    return function() {
                        return _this.logo.applyFilters(function() {
                            return _this.canvas.renderAll();
                        });
                    };
                })(this));
        }
        return this.canvas.renderAll();
    };

    Editor.prototype.constrainPhotoMove = function() {
        var p;
        this.photo.setCoords();
        p = this.photo.getBoundingRect();
        this.photo.setLeft(Math.min(0, Math.max(this.canvas.width - p.width, p.left)) + p.width / 2);
        return this.photo.setTop(Math.min(0, Math.max(this.canvas.height - p.height, p.top)) + p.height / 2);
    };

    Editor.prototype.getLoader = function() {
        var deferred;
        $('#loader').show();
        deferred = $.Deferred();
        deferred.always(function() {
            return $('#loader').hide();
        });
        return deferred;
    };

    return Editor;

})();

GrayscaleContrastFilter = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
    type: 'Contrast',
    initialize: function(options) {
        options = options || {};
        return this.contrast = options.contrast || 0;
    },
    applyTo: function(canvasEl) {
        var color, context, contrast, data, i, imageData, j, px, ref;
        context = canvasEl.getContext('2d');
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
        contrast = 0.5 + this.contrast * 2;
        data = imageData.data;
        for (px = j = 0, ref = data.length / 4; 0 <= ref ? j <= ref : j >= ref; px = 0 <= ref ? ++j : --j) {
            i = px * 4;
            color = (data[i] + data[i + 1] + data[i + 2]) / 3;
            color = (color - 128) * contrast + 128;
            data[i] = data[i + 1] = data[i + 2] = color;
        }
        return context.putImageData(imageData, 0, 0);
    },
    toObject: function() {
        return extend(this.callSuper('toObject'), {
            contrast: this.contrast
        });
    }
});

GrayscaleContrastFilter.fromObject = function(o) {
    return new GrayscaleContrastFilter(o);
};

$(window).load(function() {
    return Editor._instance = new Editor($('#canvas'), $('.editor-controls'));
});
