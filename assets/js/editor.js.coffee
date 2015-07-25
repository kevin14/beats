class Editor

  INTRO_CITIES = ["College Park", "New York", "Los Angeles", "Chicago", "Brooklyn"]

  #  PROFANITIES = /fuckload|fuckem|fuckin'|motherfuckin-g|fcking|fuckity|fuckn|fucktards|niggas|nigger|motherfuckin|fucker|nigga|asshole|fuckhole|fuckapple|fuckwad|fuckoff|cocksucker|fuckers|niggaz|mutherfucker|fuck|fuckme|fucks|fuckin|fuckwit|fuckin|motherfucker|fuckman|fuckass|fuckin|fuckyou|titfucker|fucked|blowjob|tittyfucker|clit|fuckwhore|gangbang|motherfucking|titfuck|wetback|fuckfest/i
  # All duplicates removed
  PROFANITIES = /fuck|fcking|nigger|nigga|asshole|cocksucker|blowjob|clit|gangbang|wetback/i

  SELECTABLE_OPTIONS =
    selectable: true
    hasRotatingPoint: false
    lockRotation: true
    lockScalingFlip: true
    lockUniScaling: true
    lockMovementX: false
    lockMovementY: false
#    centeredScaling: true
    selectionColor: 'white'
    cornerColor: 'white'
    borderColor: 'white'
    borderWidth: 3
    transparentCorners: false
    padding: 10

  NO_CONTROLS_OPTIONS =
    hasBorders: false
    hasControls: false
    hasRotatingPoint: false
    lockMovementX: true
    lockMovementY: true
    lockRotation: true
    lockScalingX: true
    lockScalingY: true

  LOGO_SCALE_MIN = 0.1
  LOGO_SCALE_MAX = 1.0

  constructor: ($canvas, $controls) ->
    @values =
      logo: Maths.normalizeFromRange(1, LOGO_SCALE_MIN, LOGO_SCALE_MAX)
      photo: 0
      grain: 1
      contrast: 0.25
      invert: 0

    @canvas = new fabric.Canvas $canvas.get(0)
    @canvas.selection = false
    @canvasUpdateFunction = =>@canvas.renderAll()

    @cityText = ""
    @controls = $controls

    self = @

    # Hook up editor control events

    $controls.find('.download').click => @downloadLocal()

    $controls.find('.share').click => @share()

    $(".upload.button").click -> $("input[type=file]").click()
    $controls.find('input[type=file]').change ->
      self.setPhoto.call self, this.files[0]

    $controls.find('form.editor-invert-control').change ->
      self.setValue.call self, parseInt(this['invert'].value)

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
    @setMode 'intro'

  #region EDITOR MODES -------------------------------------------------------------------------------------------------

  initializeTextMode: ->
    # don't reinitialize
    return if @logoText?
    console.log "Entering city entry Phase"

    grimePattern = new fabric.Pattern
      source: document.getElementById('img-pattern-grime')
      repeat: 'repeat'

    @logoFrame = new fabric.Image document.getElementById('img-logo-frame'),
      left: @canvas.width/2 - 768/4
      top: @canvas.height - 824/2 - 40
#      scaleX: 0.5
#      scaleY: 0.5
      selectable: false
      evented: false
    @canvas.add @logoFrame
    @logoFrame.scaleToHeight @canvas.height
    @logoFrame.center()

    @logoText = new fabric.IText "",
      originX: 'center'
      fill: grimePattern
      left: @canvas.width/2
      top: 580
      lineHeight: 0.4
      fontSize: 260
      fontFamily: 'knockout'
      editable: true
      cursorWidth: 8
      cursorColor: '#ed1c24'
      hoverCursor: 'text'
      selectionColor: 'rgba(255,255,255,0.85)'
    # Experimental fabric addon features
    @logoText.set
      selectionColor: 'transparent'
      textAlign: 'stretch'
      width: 740
      fixedLineWidth: 740
      multiline: false
      capitalize: true
      cursorHeightPercent: 0.7
      cursorDeltaX: 0
      cursorDeltaY: -12
      maxLength: 25
    @logoText.set NO_CONTROLS_OPTIONS
    @canvas.add @logoText

    @logoText.on 'changed', (e) =>
      newText = @logoText.text
      if PROFANITIES.test newText
        @typeTextClear()
      else
        window.reactToKeypress(newText.length < @cityText.length)
        @cityText = newText

    # forcibly keep selected
#    @logoText.on 'editing:exited', =>
    @canvas.on 'selection:cleared', =>@focusTextField()
    @focusTextField()

  initializePhotoMode: ->
    # don't reinitialize
    return if @logo?
    console.log "Entering photo phase"
    console.log "Baking text image"

    # Unbind events and deselect text object
    @canvas.off 'selection:cleared'
    @logoText.off 'editing:exited'
    @logoText.off 'changed'
    @logoText.exitEditing()
    @canvas.discardActiveObject()

    # Bake as an image
    fabric.util.loadImage @canvas.toDataURL(), (img)=>
      @canvas.remove @logoText
      @canvas.remove @logoFrame
      @logo = new fabric.Image(img)
      @logo.set(SELECTABLE_OPTIONS).set
        minScaleLimit: LOGO_SCALE_MIN
        originX: 'center'
        originY: 'center'
        left: @canvas.width/2
        top: @canvas.height/2
      @canvas.add @logo
      @canvas.backgroundColor = 'black'

      # Setup select & move event handlers
      @logo.on 'selected', =>@setParameter('logo', true)
      @logo.on 'moving', =>@constrainLogoMove()
      @logo.on 'scaling', =>
        scale = @logo.scaleX
        scaleSlider = Maths.normalizeFromRange scale, LOGO_SCALE_MIN, LOGO_SCALE_MAX
        @values.logo = scaleSlider
        @controlsRange.set scaleSlider

    # Watermark beats logo
    @watermark = new fabric.Image document.getElementById('img-beats-watermark'),
      originX: 'center'
      originY: 'center'
      selectable: false
      evented: false
    @watermark.set
      left: @canvas.width/2
      top: @canvas.height - 80

  initializeIntroMode: ->
    $(document).on 'keydown', =>
      @typeTextStop()
      $(document).off 'keydown'
    @typeTextSeries(INTRO_CITIES).always =>
      console.log 'Intro over'
      $('#slides').delay(100).fadeOut 600, ->$(this).remove()
      $('#bottom').removeClass('hidden').show()
      $('#down').removeClass('hidden').show().click ->
        $('body').animate {scrollTop: $('#bottom').offset().top}, 750
      $('#beats-logo').show()
      @setMode 'text'
      @typeTextClear()
      @focusTextField()

  fixOrderingOnLoad: ->
    @canvas.discardActiveObject()
    if @photo? then @canvas.sendToBack @photo
    if @logo? then @canvas.bringToFront @logo
    if @watermark? then @canvas.bringToFront @watermark

  finalizeForDoneMode: ->
    @logoText?.exitEditing()
    @canvas.discardActiveObject()
    for obj in [@photo, @logo, @logoText]
      obj?.set(selectable: false, evented: false, editable: false)
    @canvas.renderAll()

  setMode: (newMode)->
    oldMode = @mode
    return if oldMode == newMode
    console.log "editor.mode = #{newMode}"

    # turn the sound on
    if newMode == "text"
      window.intro = false
      console.log("SETTING INTRO TO FALSE")


    # switch oldMode
    #   when 'text' then @bakeLogoText()
    switch newMode
#      when 'text' then @initializeTextMode()
      when 'intro' then @initializeIntroMode()
      when 'photo' then @initializePhotoMode()
      when 'done' then @finalizeForDoneMode()
    $('.editor').removeClass("mode-#{oldMode}").addClass("mode-#{newMode}")
    @mode = newMode

  #region INTRO --------------------------------------------------------------------------------------------------------

  focusTextField: ->
    # console.log "focusTextField()"
    @canvas.setActiveObject @logoText
    @logoText.enterEditing()

  typeTextSeries: (textArray)->
    # console.log "typeTextSeries()"
    @typeTextSeriesDeferred = $.Deferred()
    @typeTextSeriesArray = textArray
    @typeTextSeriesNext(true)
    @typeTextSeriesDeferred

  typeTextSeriesNext: (isFirst)->
    # console.log "typeTextSeriesNext()"
    return if @typeTextCanceling
    text = @typeTextSeriesArray.shift()
    delay = 250
    if text?
      window.setTimeout =>
        unless isFirst
          $slide = $('#slides .slide').first()
          $slide.fadeOut 200, ->$(this).remove()
        @typeText(text).done @typeTextSeriesNext.bind(@)
      , delay
    else
      window.setTimeout (=>@typeTextSeriesDeferred.resolve()), delay

  typeTextClear: ->
    # console.log "typeTextClear()"
    @logoText.exitEditing()
    @logoText.setSelectionStart 0
    @logoText.setSelectionEnd 0
    @logoText.setText ''
    @logoText._clearCache()
    @logoText.enterEditing()
    @canvasUpdateFunction()

  typeText: (text)->
    # console.log "typeText()"
    return unless @logoText? and
    @typeTextDeferred = $.Deferred()
    @typeTextClear()
    @autoTypeChars = text.split ''
    @typeTextQueueUpdate()
    @typeTextDeferred

  typeTextStop: ->
    console.log "typeTextStop()"
    @typeTextCanceling = true
    window.clearTimeout @interval
    @typeTextDeferred.reject()
    @typeTextSeriesDeferred.reject()


  typeTextQueueUpdate: ->
    # console.log "typeTextQueueUpdate()"
    delay = 10 + Math.random()*20
    @interval = window.setTimeout @typeTextUpdate.bind(@), delay

  typeTextUpdate: ->
    # console.log "typeTextUpdate()"
    return if @typeTextCanceling
    char = @autoTypeChars.shift()
    unless char? && @logoText?
      return @typeTextDeferred.resolve()
    @logoText.insertChar char
    @typeTextQueueUpdate()


  #region EXPORTING AND SHARING ----------------------------------------------------------------------------------------

  captureWideImageDeferred: ->
    @canvas.discardActiveObject()


  captureImageDeferred: (type = 'image/jpeg', quality = 0.8)->
    # prepare canvas for capture
    @canvas.discardActiveObject()
    # capture as deferred
    deferred = $.Deferred()
    onBlobReady = (blob)=>deferred.resolve blob
    @canvas.lowerCanvasEl.toBlob onBlobReady, type, quality
    deferred

  downloadLocal: ->
    oldColor = @canvas.backgroundColor
    @canvas.backgroundColor = 'black'
    @setMode 'done'
    @captureImageDeferred().done (blob)->saveAs(blob, 'StraightOuttaCompton.jpg')
    @canvas.backgroundColor = oldColor
    @canvasUpdateFunction()

  share: ->
    if @isSharingBusy then return else @isSharingBusy = true

    if @permalink?
      @popupSharing()
    else
      loader = @getLoader()
      @setMode 'done'
      @canvasUpdateFunction()
      @captureImageDeferred('image/png').done (blob)=>
        @cityText = @cityText.toTitleCase()
        uploader = new Uploader(blob, @cityText)
        uploader.start().done (shareUrl)=>
          loader.resolve()
          @permalink = window.location.origin + shareUrl
          console.log "Ready to share!", @permalink

          $popup = $('#share-popup-src').addClass('ready')

          encodedData = (src) =>
            cityText = @cityText
            (key)-> encodeURI src.data(key).replace('{CITY}',cityText)

          $twitter = $popup.find 'a.twitter'
          td = encodedData $twitter
          url = "https://twitter.com/intent/tweet?text=#{td 'text'}&hashtags=#{td 'hashtags'}&url=#{encodeURI @permalink}"
          $twitter.attr(href: url)

          $facebook = $popup.find 'a.facebook'
          redir = window.location.origin + "/close.html"
          url = "https://www.facebook.com/dialog/share?app_id=415295758676714&display=popup&href=#{encodeURI @permalink}&redirect_uri=#{encodeURI redir}"
          $facebook.attr(href: url)

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
    $(".upload img").attr("src", "/img/btn-changephoto.png")
    loader = @getLoader()
    reader = new FileReader()
    reader.onload = (e)=>

      console.log "Loaded!"
      img = new Image()
      img.src = e.target.result
      aspect = img.width/img.height
      console.log "Set into an image tag of size #{img.width}x#{img.height}"

      @downscalePhotoIfNeededDeferred(img).done (photo)=>
        loader.resolve()
        @setMode 'photo'
        if @photo?
          @photo.off 'selected'
          @photo.off 'moving'
          @canvas.remove @photo
        else
          # Animate logo into smaller position
          window.setTimeout =>
            toScale = 0.55
            opts = duration: 2000, easing: fabric.util.ease.easeOutExpo
            @logo.animate 'scaleX', toScale, opts
            @logo.animate 'scaleY', toScale, opts
            opts.onChange = =>@canvas.renderAll()
            @logo.animate 'top', 440, opts
            @values.logo = Maths.normalizeFromRange toScale, LOGO_SCALE_MIN, LOGO_SCALE_MAX
          , 1000

        console.log "Final dimensions #{photo.width}x#{photo.height}"
        @photo = photo
        @photo.set(SELECTABLE_OPTIONS).set
          originX: 'left'
          originY: 'top'
          hasBorders: false
          hasControls: false
          lockScalingX: true
          lockScalingY: true
          width: @canvas.width
          height: @canvas.height
          padding: 0
        if aspect > 1
          @photo.width = @canvas.width * aspect
        else
          @photo.height = @canvas.height / aspect
        @photo.filters.push new GrayscaleContrastFilter(contrast: @values.contrast)
        @photo.applyFilters =>@canvas.renderAll()
        @canvas.add @photo
        @canvas.sendToBack @photo
        @photo.center()
        @fixOrderingOnLoad()
        @photo.on 'selected', =>@setParameter('photo', true)
        @photo.on 'moving', =>@constrainPhotoMove()
        @setParameter('photo', true)
    reader.readAsDataURL fileDescriptor

  downscalePhotoIfNeededDeferred: (img) ->
    deferred = $.Deferred()
    OVERSCALE = 1
    W = @canvas.width * OVERSCALE
    H = @canvas.height * OVERSCALE
    aspect = img.width/img.height
    console.log "Loaded image at #{img.width}x#{img.height}"
    scaleNeeded = img.width > W && img.height > H
    if scaleNeeded
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
      switch @parameter
        when 'photo'
          if @photo? then @canvas.setActiveObject @photo
        when 'logo' then @canvas.setActiveObject @logo
        else @canvas.discardActiveObject()

  setValue: (value, eventType) ->
    @values[@parameter] = value
    switch @parameter
      when 'photo'
        @photo?.scale(value + 1)
        @constrainPhotoMove()
      when 'logo'
        @logo?.scale Maths.mapToRange(value, LOGO_SCALE_MIN, LOGO_SCALE_MAX)
        @constrainLogoMove()
      when 'contrast'
        unless eventType == 'update'
          @photo?.filters[0]?.contrast = value
          @photo?.applyFilters => @canvas.renderAll()
      when 'invert'
        if value <= 0
          @logo.filters = []
          @logo.applyFilters()
        else if @logo.filters.length == 0
          @logo.filters = [new fabric.Image.filters.Invert()]
          @logo.applyFilters => @canvas.renderAll()
      # when 'grain'
      #   @grain?.set opacity: value
    @canvas.renderAll()

  constrainPhotoMove: ->
    @photo.setCoords()
    p = @photo.getBoundingRect()
    @photo.setLeft Math.min(0, Math.max(@canvas.width-p.width, p.left))
    @photo.setTop Math.min(0, Math.max(@canvas.height-p.height, p.top))

  constrainLogoMove: ->
    @logo.setCoords()
    l = @logo.getBoundingRect()
    l.width -= @logo.padding*2
    l.height -= @logo.padding*2
    @logo.setLeft Math.max(0, Math.min(@canvas.width-l.width, l.left)) + l.width/2
    @logo.setTop Math.max(0, Math.min(@canvas.height-l.height, l.top)) + l.height/2


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
