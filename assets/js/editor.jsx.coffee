class Editor

  INTRO_CITIES = ["INGLEWOOD", "BROOKLYN", "COLLEGE PARK", "COMPTON"]

  PROFANITIES = /fuck|fcking|nigger|nigga|asshole|cocksucker|blowjob|clit|gangbang|wetback|faggot/i

  constructor: ($canvas, $controls) ->
    @photoAdded = false
    @values =
      photo: 0
      contrast: 0.25
      invert: 0

    @canvas = new fabric.Canvas $canvas.get(0)
    @canvas.selection = false
    @canvasUpdateFunction = =>@canvas.renderAll()

    @cityText = ""
    @controls = $controls

    self = @

    if window.location.search?.indexOf('skip=1') > -1
      # skip intro
      $("#slides").hide()
      @logActionToAnalytics 'restart'
      # $('#slides').fadeOut 100, ->$(this).remove()
      INTRO_CITIES = [" "]
    else
      $("#slides").show()


    # Hook up editor control events

    $controls.find('.download').click => @downloadLocal()
    $controls.find('.restart').click =>
      location.href = "/?skip=1"
    $controls.find('.donthave').click =>
      $(".donthave").hide()
      @setMode('nophoto').done =>
        #
    $controls.find('.share').click => @share()

    $(".upload").click (e)->
      # console.log "click upload"
      $input = $("input[type=file]")
      if $('html').is('.ios')
        $input.trigger(e).click()
      else
        $input.click()
    $controls.find('input[type=file]').change ->
      self.setPhoto.call self, this.files[0]

    $controls.find('form.editor-invert-control').change ->
      # console.log this, this['invert']
      self.setValue.call self, parseInt($(this).find(':checked').val())

    @controlsRadios = $controls.find('.editor-types input[type=radio]').change ->
      self.setParameter.call self, $(this).val()

    # @controlsRange = $controls.find('input[type=range]').change ->
    #   self.setValue.call self, parseFloat($(this).val())

    sliderElement = $('.editor-range-control .range')[0]
    noUiSlider.create sliderElement,
      start: 0
      range: {min: 0, max: 1}
      connect: 'lower'
    @controlsRange = sliderElement.noUiSlider
    @controlsRange.on 'change', (values)->
      self.setValue.call self, parseFloat(values[0]), 'change'
    @controlsRange.on 'update', (values)->
      self.setValue.call self, parseFloat(values[0]), 'update'

    @initializeTextMode()

    # play intro
    @setMode 'intro'

  #region EDITOR MODES -------------------------------------------------------------------------------------------------

  initializeTextMode: (deferred)->
    # don't reinitialize
    return if @logoText?
    #console.log "Entering city entry Phase"

    grimePattern = new fabric.Pattern
      source: document.getElementById('img-pattern-grime')
      repeat: 'repeat'

    @logoFrame = new fabric.Image document.getElementById('img-logo-frame'),
      selectable: false
      evented: false
    @canvas.add @logoFrame
    @logoFrame.scaleToHeight @canvas.height
    @logoFrame.center()

    #if $("body").hasClass("lang-de") || $("body").hasClass("lang-fr")
    #  logoTop = 590
    #  fontSize = 260
    #else
    logoTop = 560
    fontSize = 300

    @logoText = new fabric.IText INTRO_CITIES[0],
      originX: 'center'
      textAlign: 'center'
      fill: grimePattern
      left: @canvas.width/2
      top: logoTop
      lineHeight: 1
      fontSize: fontSize
      fontFamily: 'knockout'
      editable: false
      cursorWidth: 8
      cursorColor: '#ed1c24'
      hoverCursor: 'text'
      hasBorders: false
      hasControls: false
      hasRotatingPoint: false
      lockMovementX: true
      lockMovementY: true
      lockRotation: true
      lockScalingX: true
      lockScalingY: true
      selectionColor: 'rgba(255,255,255,0.9)'
      caching: false
      width: 740
      # BEGIN EXPERIMENTAL FABRIC ADDONS
      fixedLineWidth: 740
      multiline: false
      capitalize: true
      cursorHeightPercent: 0.7
      cursorDeltaX: 0
      cursorDeltaY: -12
      maxLength: 15
    @canvas.add @logoText

    @logoText.on 'changed', (e) =>
      newText = @logoText.text
      if newText != ""
        #$(".upload").show()
        #$(".donthave").show()
        #$(".upload").animate {opacity: 1}, (e) ->
        $(".upload").addClass("showanimation")
          #$(this).css("opacity", " ")
        $(".donthave").animate {opacity: 1}, (e) ->
          #$(this).css("opacity", " ")
      else
        #$(".upload").hide()
        #$(".donthave").hide()
        $(".upload").removeClass("showanimation")
        #$(".upload").animate({opacity: 0})
        $(".donthave").animate({opacity: 0})

      tempText = newText.replace(/\s+/g, '')
      if PROFANITIES.test tempText
        @typeTextClear()
      else
        window.reactToKeypress(newText.length < @cityText.length)
        @cityText = newText

    # forcibly keep selected
#    @logoText.on 'editing:exited', =>
    @canvas.on 'selection:cleared', =>@focusTextField()
    @focusTextField()
    deferred?.resolve()

  initializePhotoMode: (deferred = null, animate = true)->
    # don't reinitialize
    return if @logo?
    #console.log "Entering photo phase"
    #console.log "Baking text image"

    # Unbind events and deselect text object
    @canvas.off 'selection:cleared'
    @logoText.off 'editing:exited'
    @logoText.off 'changed'
    @logoText.exitEditing()
    @canvas.discardActiveObject()

    # Watermark beats logo
    @watermark = new fabric.Image document.getElementById('img-beats-watermark'),
      originX: 'center'
      originY: 'center'
      selectable: false
      evented: false
      left: @canvas.width/2
      top: @canvas.height * 0.9

    # Bake as an image
    fabric.util.loadImage @canvas.toDataURL(), (img)=>
      @canvas.remove @logoText
      @canvas.remove @logoFrame
      @logo = new fabric.Image(img)
      @logo.set
        selectable: false
        evented: false
        originX: 'center'
        originY: 'center'
        left: @canvas.width/2
        top: @canvas.height/2
      @canvas.add @logo

      # Use background texture
      @photo = new fabric.Image document.getElementById('img-bg'),
        selectable: false
        evented: false
        width: @canvas.width
        height: @canvas.height
      @canvas.insertAt @photo, 0

      # Animate logo to final position
      duration = 2000
      if @photoAdded
        toScale = 0.4
        toTop = 640/1000*@canvas.height
      else
        toScale = 0.6
        toTop = 410
      if animate
        opts = duration: duration, easing: fabric.util.ease.easeOutExpo
        @logo.animate 'scaleX', toScale, opts
        @logo.animate 'scaleY', toScale, opts
        @logo.animate 'top', toTop, opts
      else
        @logo.set scaleX: toScale, scaleY: toScale, top: toTop
        @canvas.renderAll()

      # Animate watermark to final position
      if @photoAdded
        toScale = 0.7
        toTop = @canvas.height * 0.92
      else
        toScale = 1
        toTop = @canvas.height * 0.9
      if animate
        opts = duration: duration, easing: fabric.util.ease.easeOutExpo
        @watermark.animate 'scaleX', toScale, opts
        @watermark.animate 'scaleY', toScale, opts
        opts.onChange = =>@canvas.renderAll()
        @watermark.animate 'top', toTop, opts
      else
        @watermark.set scaleX: toScale, scaleY: toScale, top: toTop
        @canvas.renderAll()

      @canvas.backgroundColor = 'black'
      @canvas.add @watermark

      deferred?.resolve()

  initializeIntroMode: (deferred)->
    @typeTextSeries(INTRO_CITIES).always =>
      #console.log 'Intro over'
      $('#slides').delay(100).fadeOut 600, ->$(this).remove()
#      $('#bottom').removeClass('hidden').show()
#      $('#down').removeClass('hidden').show().click ->
#        $('body').animate {scrollTop: $('#bottom').offset().top}, 750
#      $('#beats-logo').show()
      @setMode('text').done =>
        @logoText.setText ''
        @logoText.set editable: true
        @focusTextField()
    deferred?.resolve()

  fixOrderingOnLoad: ->
    @canvas.discardActiveObject()
    if @photo? then @canvas.sendToBack @photo
    if @logo? then @canvas.bringToFront @logo
    if @watermark? then @canvas.bringToFront @watermark

  finalizeForDoneMode: (deferred)->
    secondDeferred = $.Deferred()
    secondDeferred.always =>
      @canvas.discardActiveObject()
      for obj in [@photo, @logo, @logoText]
        obj?.set(selectable: false, evented: false, editable: false)
      @canvas.renderAll()
      deferred?.resolve()

    if @mode != 'photo'
      @initializePhotoMode(secondDeferred, false)
    else
      secondDeferred.resolve()

    deferred

  setMode: (newMode)->
    # console.log "setMode #{newMode}"
    deferred = new $.Deferred()
    oldMode = @mode
    #if oldMode == newMode
    #  deferred.resolve()
    #  return deferred


    if newMode != "intro"
      $("#bottom").show()
      $("#down").show()
      $("#legal").show()
    #console.log "editor.mode = #{newMode}"
    switch newMode
      when 'nophoto' then @finalizeForDoneMode(deferred)
      when 'intro' then @initializeIntroMode(deferred)
      when 'photo' then @initializePhotoMode(deferred)
      when 'done' then @finalizeForDoneMode(deferred)
      else deferred.resolve()
    window.setTimeout (->$('.editor').removeClass().addClass("editor mode-#{newMode}")), 1000
    @mode = newMode
    deferred

  #region INTRO --------------------------------------------------------------------------------------------------------

  focusTextField: ->
    # console.log "focusTextField()"
    if @canvas.getActiveObject()?.type == 'i-text' and @logoText?.isEditing
      $('textarea').trigger('focus')
    else
      @canvas.setActiveObject @logoText
      @logoText.enterEditing()

  typeTextSeries: (textArray)->
    #console.log "typeTextSeries()"
    @typeTextSeriesDeferred = $.Deferred()
    @typeTextSeriesArray = textArray
    @typeTextSeriesNext(true)
    @typeTextSeriesDeferred

  typeTextSeriesNext: (isFirst)->
    return if @typeTextCanceling
    #console.log "typeTextSeriesNext()"
    text = @typeTextSeriesArray.shift()
    delay = 500
    if text?
      window.setTimeout =>
        unless isFirst
          $slide = $('#slides .slide').first()
          $slide.fadeOut 200, ->$(this).remove()
        @typeTextImmediate(text).done @typeTextSeriesNext.bind(@)
      , delay
    else
      window.setTimeout (=>@typeTextSeriesDeferred.resolve()), delay

  typeTextClear: ->
    # console.log "typeTextClear()"
    @logoText.exitEditing() if @logoText.isEditing
    @logoText.setSelectionStart 0
    @logoText.setSelectionEnd 0
    @logoText.setText ''
    @logoText._clearCache()
    @logoText.enterEditing()
    @canvasUpdateFunction()

  typeTextImmediate: (text)->
    @typeTextDeferred = $.Deferred()
    @logoText.setText text
    @canvas.renderAll()
    @typeTextDeferred.resolve()

  typeText: (text)->
    #console.log "typeText()"
    return unless @logoText? and
    @typeTextDeferred = $.Deferred()
    @typeTextClear()
    @autoTypeChars = text.split ''
    @typeTextQueueUpdate()
    @typeTextDeferred

  typeTextStop: ->
    #console.log "typeTextStop()"
    @typeTextCanceling = true
    window.clearTimeout @interval
    @typeTextClear()
    @canvas.renderAll()
    @typeTextDeferred?.reject()
    @typeTextSeriesDeferred?.reject()

  typeTextQueueUpdate: ->
    #console.log "typeTextQueueUpdate()"
    delay = 10 + Math.random()*20
    @interval = window.setTimeout @typeTextUpdate.bind(@), delay

  typeTextUpdate: ->
    #console.log "typeTextUpdate()"
    return if @typeTextCanceling
    char = @autoTypeChars.shift()
    unless char? && @logoText?
      return @typeTextDeferred.resolve()
    @logoText.insertChar char
    @typeTextQueueUpdate()


  #region EXPORTING AND SHARING ----------------------------------------------------------------------------------------

  captureImageDeferred: (type = 'image/jpeg', quality = 0.8)->
    # prepare canvas for capture
    oldColor = @canvas.backgroundColor
    @canvas.backgroundColor = 'black'
    @canvas.discardActiveObject()
    @canvas.renderAll()
    # capture as deferred
    deferred = $.Deferred()
    onBlobReady = (blob)=>
      @canvas.backgroundColor = oldColor
      deferred.resolve blob
    @canvas.lowerCanvasEl.toBlob onBlobReady, type, quality
    deferred

  logActionToAnalytics: (label)->
    ga?('send', 'event', 'action', label)

  downloadLocal: ->
    #console.log("download")
    @logActionToAnalytics 'download'
    $(".editor-image-controls").slideUp()
    #@setMode('done').done =>
    #console.log('mode set to done')
    # console.log "setmode done is done"
    @captureImageDeferred().done (blob)->
      #console.log("blob done")
      # console.log "image is captured is done, blob is #{blob}"
      #userAgent = window.navigator.userAgent.toLowerCase()
      #isMobile = /twitter|facebook|fbav|fbdv|fbsv|fban/.test( userAgent )
      #if isMobile
      #    reader = new (window.FileReader)
      #    reader.readAsDataURL blob
      #    reader.onloadend = ->
      #      base64data = reader.result
      #      location.href = base64data
      #else
      saveAs(blob, 'StraightOuttaSomewhere.jpg')

  share: ->
    if @isSharingBusy then return else @isSharingBusy = true

    $(".editor-image-controls").slideUp()

    @logActionToAnalytics 'share'
    if @permalink?
      @popupSharing()
    else
      loader = @getLoader()
      #@setMode('done').done =>
      @captureImageDeferred().done (blob)=>
        @cityText = @cityText.toTitleCase()
        #uploader = new Uploader(blob, @cityText)
        #uploader.start().done (shareUrl)=>
        loader.resolve()
        @permalink = 'http://demandware.edgesuite.net/aany_prd/on/demandware.static/-/Sites-beats-CN-Library/default/dw3f9311aa/images/homepage/touts/powerbeats-2-tout-O.jpg'
        #@permalink = window.location.origin + shareUrl
        #console.log "Ready to share!", @permalink

        $popup = $('#share-popup-src').addClass('ready')

        #encodedData = (src) =>
        cityText = @cityText
        #  console.log("city text: " + cityText)
        #  console.log(src.data)
        #  (key)-> encodeURIComponent src.data(key).replace('{CITY}',cityText)

        $twitter = $popup.find 'a.twitter'
        #td = encodedData $twitter

        twitterString = "I'm #StraightOutta {CITY}. Where you from? #BeatsByDre"
        twitterString = encodeURIComponent twitterString.replace('{CITY}',cityText)

        url = "https://twitter.com/intent/tweet?text=#{twitterString}&url=#{encodeURI @permalink}"
        $twitter.attr(href: url)
        $twitter.click =>
          @logActionToAnalytics 'share_twitter'

        $facebook = $popup.find 'a.facebook'
        redir = window.location.origin + "/close.html"
        url = "https://www.facebook.com/dialog/share?app_id=415295758676714&display=popup&href=#{encodeURI @permalink}&redirect_uri=#{encodeURI redir}"
        $facebook.attr(href: url)
        $facebook.click =>
          @logActionToAnalytics 'share_facebook'

        $weibo = $popup.find 'a.weibo'
        #td = encodedData $weibo

        weiboString = "I'm #StraightOutta {CITY}. Where you from? #BeatsByDre"
        weiboString = encodeURIComponent twitterString.replace('{CITY}',cityText)

        url = "http://v.t.sina.com.cn/share/share.php?title=#{weiboString}&pic=#{encodeURI @permalink}"
        $weibo.attr(href: url)
        $weibo.click =>
          @logActionToAnalytics 'share_weibo'

        @popupSharing()

  popupSharing: ->
    $.featherlight $('#share-popup-src'),
      variant: 'featherlight-share'
      afterOpen: ->
        $('.share-popup').find('a').click (e)->
          e.preventDefault()
          $this = $(this)
          w = $this.data('popwidth')
          h = $this.data('popheight')
          # Override href to open in new window
          window.open $(this).attr('href'), "share", "width=#{w},height=#{h},centerscreen=true"
      afterClose: =>
        @isSharingBusy = false


  #region PHOTO EDITING ------------------------------------------------------------------------------------------------

  setPhoto: (fileDescriptor) ->
    return unless fileDescriptor?
    #console.log "Loading file", fileDescriptor.name
    #console.dir fileDescriptor
    @logActionToAnalytics 'add-photo'
    #$(".upload img").attr("src", "/img/btn-changephoto.png")
    loader = @getLoader()
    reader = new FileReader()
    reader.onload = (e)=>
      #console.log "Loaded!"

      img = new Image()
      dataUrl = e.target.result
      img.src = dataUrl
      aspect = img.width/img.height
      #console.log "Set into an image tag of size #{img.width}x#{img.height}"
      if img.width == img.height == 0
        loader.reject()
        console.error "Load fail. Retrying."
        window.setTimeout @setPhoto.call(this, fileDescriptor), 1000
        return

      try
        imgHeader = @dataUrlToBinary(dataUrl, 64*1024+32)
      catch e
        console.error e

      @photoAdded = true
      @setMode('photo').done =>
        @downscalePhotoIfNeededDeferred(img).done (photo)=>
          if @photo?
            @photo.off 'selected'
            @photo.off 'moving'
            @canvas.remove @photo

          #console.log "Final dimensions #{photo.width}x#{photo.height}"
          @photo = photo
          @photo.set
            selectable: true
            originX: 'center'
            originY: 'center'
            centeredScaling: true
            hasRotatingPoint: false
            lockRotation: true
            lockScalingFlip: true
            lockUniScaling: true
            lockMovementX: false
            lockMovementY: false
            lockScalingX: true
            lockScalingY: true
            hasBorders: false
            hasControls: false
            width: @canvas.width
            height: @canvas.height
            padding: 0
          if aspect > 1
            @photo.width = @canvas.width * aspect
          else
            @photo.height = @canvas.height / aspect
          @photo.filters.push new GrayscaleContrastFilter(contrast: @values.contrast)
          @photo.applyFilters =>
            @canvas.insertAt @photo, 0
            @photo.center()
            @photo.on 'selected', =>@setParameter('photo', true)
            @photo.on 'moving', =>@constrainPhotoMove()
            @setParameter('photo', true)
            loader.resolve()

          # Now that photo is loaded, try to parse EXIF out and rotate as needed
          if imgHeader? then inkjet.exif imgHeader, (err, metadata)=>
            if metadata?.Orientation?
              #console.log "Rotating from", metadata.Orientation.description
              switch metadata.Orientation.value
                when 8 then @photo.setAngle -90
                when 3 then @photo.setAngle -180
                when 6 then @photo.setAngle 90
              @canvas.renderAll() unless @photo.angle == 0

    reader.readAsDataURL fileDescriptor

  dataUrlToBinary: (dataURL, stopAfterBytes)->
    BASE64_MARKER = ';base64,'
    parts = dataURL.split(BASE64_MARKER)
    base64 = parts[1]
    #contentType = parts[0].split(':')[1]
    if stopAfterBytes > 0
      stopAfterChars = Math.ceil((4*stopAfterBytes/3)/4)*4
      base64 = base64.substr(0, stopAfterChars)
    raw = window.atob base64
    len = raw.length
    binArray = new Uint8Array(len)
    for i in [0..len]
      binArray[i] = raw.charCodeAt(i)
    binArray

  downscalePhotoIfNeededDeferred: (img) ->
    deferred = $.Deferred()
    OVERSCALE = 1
    W = @canvas.width * OVERSCALE
    H = @canvas.height * OVERSCALE
    aspect = img.width/img.height
    #console.log "Loaded image at #{img.width}x#{img.height}"
    if img.width > W && img.height > H
      console.warn "Scaling down image"
      resizeCanvas = document.createElement 'canvas'
      resizeCanvas.width = W
      resizeCanvas.height = H
      if aspect > 1
        resizeCanvas.width = W * aspect
      else
        resizeCanvas.heigth = H / aspect
      ctx = resizeCanvas.getContext '2d'
      ctx.drawImage img, 0, 0, resizeCanvas.width, resizeCanvas.height
      fabric.Image.fromURL resizeCanvas.toDataURL(), (photo)=>deferred.resolve(photo)
    else
      deferred.resolve new fabric.Image(img)
    deferred

  setParameter: (parameterId, programmatic = false) ->
    if programmatic and @parameter != parameterId
      $("#control-#{parameterId}").click()
    @controls.removeClass().addClass('editor-controls').addClass(parameterId)
    @parameter = parameterId
    @controlsRange.set @values[@parameter]
    unless programmatic
      if @parameter == 'photo' and @photo?
        @canvas.setActiveObject @photo
      else
        @canvas.discardActiveObject()

  setValue: (value, eventType) ->
    @values[@parameter] = value
    switch @parameter
      when 'photo'
        @photo?.scale(value + 1)
        @constrainPhotoMove()
      when 'contrast'
        unless eventType == 'update'
          @photo?.filters[0]?.contrast = value
          @photo?.applyFilters => @canvas.renderAll()
      when 'invert'
        if value <= 0
          @logo.filters = @watermark.filters = []
        else if @logo.filters.length == 0
          @logo.filters = @watermark.filters = [new fabric.Image.filters.Invert()]
        @watermark.applyFilters =>
          @logo.applyFilters =>
            @canvas.renderAll()

    @canvas.renderAll()

  constrainPhotoMove: ->
    @photo.setCoords()
    p = @photo.getBoundingRect()
    @photo.setLeft Math.min(0, Math.max(@canvas.width-p.width, p.left)) + p.width/2
    @photo.setTop Math.min(0, Math.max(@canvas.height-p.height, p.top)) + p.height/2

  getLoader: ->
    $('#loader').show()
    deferred = $.Deferred()
    deferred.always ->$('#loader').hide()
    deferred

# /class Editor

GrayscaleContrastFilter = fabric.util.createClass fabric.Image.filters.BaseFilter,
  type: 'Contrast'

  initialize: (options)->
    options = options || { }
    @contrast = options.contrast || 0

  applyTo: (canvasEl)->
    context = canvasEl.getContext '2d'
    imageData = context.getImageData 0, 0, canvasEl.width, canvasEl.height
    contrast = 0.5 + @contrast * 2
    data = imageData.data
    # # CONTRAST ONLY
    # for val, i in data
    #   data[i] = (val-128) * contrast + 128
    for px in [0..data.length/4]
      i = px*4
      color = (data[i]+data[i+1]+data[i+2])/3
      color = (color-128) * contrast + 128
      data[i] = data[i+1] = data[i+2] = color

    context.putImageData imageData, 0, 0

  toObject: ->
    extend @callSuper('toObject'), contrast: @contrast

GrayscaleContrastFilter.fromObject = (o)->new GrayscaleContrastFilter(o)


# Wait for all images to be loaded - this way we can create canvas images from <img> in document, knowing they exist
# To behave better, we should instead execute this after a certain set of required images are loaded
$(window).load ->
  Editor._instance = new Editor $('#canvas'), $('.editor-controls')
  # $(window).on 'keydown', (e)->
  #   key = String.fromCharCode(e.keyCode)
  #   rightTarget = HTMLTextAreaElement.prototype.isPrototypeOf e.target
  #   console.warn "Wrong target #{key}" unless rightTarget
