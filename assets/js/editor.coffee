Maths =
  clamp: (val, min = 0, max = 1) ->
    if val > max
      max
    else if val < min
      min
    else
      val
  normalizeFromRange: (val, min, max) -> (val - min) / (max - min)
  mapToRange: (normalized, min, max) -> min + (max - min) * normalized

class Editor

  SELECTABLE_OPTIONS =
    selectable: true
    hasRotatingPoint: false
    lockRotation: true
    lockScalingFlip: true
    lockUniScaling: true
    lockMovementX: false
    lockMovementY: false
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

  LOGO_SCALE_MIN = 0.25
  LOGO_SCALE_MAX = 2.0
  PHOTO_RESIZE_PIXEL_THRESHOLD = 1024 * 1024

  constructor: ($canvas, $controls) ->
    @values =
      logo: Maths.normalizeFromRange(1, LOGO_SCALE_MIN, LOGO_SCALE_MAX)
      photo: 0
      grain: 1
      contrast: 0.25
      invert: 0

    @canvas = new fabric.Canvas $canvas.get(0)
    @canvas.selection = false

    @cityText = ""
    @controls = $controls

    self = @

    # Hook up editor control events

    $controls.find('.download').click => @downloadLocal()

    $controls.find('.share').click => @upload()

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

    @setMode 'text'

  #region EDITOR MODES

  initializeTextMode: ->
    console.log "Entering city entry Phase"

    grimePattern = new fabric.Pattern
      source: document.getElementById('img-pattern-grime')
      repeat: 'repeat'

    @logoFrame = new fabric.Image document.getElementById('img-logo-frame'),
      left: @canvas.width/2 - 768/4
      top: @canvas.height - 824/2 - 40
      scaleX: 0.5
      scaleY: 0.5
      selectable: false
      evented: false

    @logoText = new fabric.IText "",
      originX: 'center'
      fill: grimePattern
      left: 750/4 + 4 + @logoFrame.left
      top: 594/2 - 16 + @logoFrame.top
      height: 80
      lineHeight: 0.4
      fontSize: 254/2
      fontFamily: 'knockout'
      editable: true
      cursorWidth: 5
      cursorColor: '#ed1c24'
      hoverCursor: 'text'
      selectionColor: 'rgba(255,255,255,0.85)'
    # Experimental fabric addon features
    @logoText.set
      selectionColor: 'transparent'
      textAlign: 'stretch'
      width: 750/2 - 8
      fixedLineWidth: 750/2 - 8
      multiline: false
      capitalize: true
      cursorHeightPercent: 0.7
      cursorDeltaX: 0
      cursorDeltaY: -5
      maxLength: 25


    @logoText.set NO_CONTROLS_OPTIONS

    @canvas.add @logoFrame
    @canvas.add @logoText

    # keep capitalized
    # TODO better way to do this as well as avoid newline input?
    @logoText.on 'changed', (e) =>
      # console.log(e)
      newText = @logoText.text
      window.reactToKeypress(newText.length < @cityText.length)
      @cityText = newText # = @logoText.text.toUpperCase() #.replace(/\n/, ' ')
      @canvas.renderAll()

    # forcibly keep selected
    # @logoText.on 'editing:exited', =>
    @canvas.on 'selection:cleared', =>
      @canvas.setActiveObject(@logoText)
      @logoText.enterEditing()

    @canvas.setActiveObject @logoText
    @logoText.enterEditing()


  initializePhotoMode: ->
    console.log "Entering photo phase"
    # fabric.Image.fromURL '/img/editor/sample-logo.png', (img)=>
    #   @logo = img
    #   @logo.set(SELECTABLE_OPTIONS).set
    #     left: @canvas.width/2 - @logo.width/2
    #     top: @canvas.height - @logo.height - 40
    #   @canvas.add @logo
    #   @fixOrderingOnLoad()
    console.log "Baking text image"

    @canvas.backgroundColor = 'black'

    # Unbind events and deselect text object
    @canvas.off 'selection:cleared'
    @logoText.off 'editing:exited'
    @logoText.off 'changed'
    @logoText.exitEditing()
    @canvas.discardActiveObject()

    # Make group out of logo text and frame
    @canvas.remove @logoText
    @canvas.remove @logoFrame
    logoGroup = new fabric.Group [@logoText, @logoFrame], SELECTABLE_OPTIONS

    # Bake as an image
    logoGroup.cloneAsImage (img)=>
      @logo = img
      @logo.set(SELECTABLE_OPTIONS).set
        left: @canvas.width/2 - @logo.width/2
        top: @canvas.height - @logo.height - 40
      @canvas.add @logo
      # @fixOrderingOnLoad()

      # Setup select & move event handlers
      @logo.on 'selected', =>@setParameter('logo', true)
      @logo.on 'moving', =>@constrainLogoMove()
      @logo.on 'scaling', =>
        scale = @logo.scaleX
        if scale < LOGO_SCALE_MIN
          @logo.scaleX = @logo.scaleY = scale = LOGO_SCALE_MIN
        scaleSlider = Maths.normalizeFromRange scale, LOGO_SCALE_MIN, LOGO_SCALE_MAX
        @values.logo = scaleSlider
        @controlsRange.set scaleSlider

    # Watermark beats logo
    @watermark = new fabric.Image document.getElementById('img-beats-watermark'),
      originX: 'center'
      originY: 'bottom'
      scaleX: 0.5
      scaleY: 0.5
      selectable: false
      evented: false
    @watermark.set
      left: @canvas.width/2
      top: @canvas.height - 5

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

  setMode: (newMode)->
    oldMode = @mode
    return if oldMode == newMode
    console.log "editor.mode = #{newMode}"
    $('.editor').removeClass("mode-#{oldMode}").addClass("mode-#{newMode}")
    # switch oldMode
    #   when 'text' then @bakeLogoText()
    switch newMode
      when 'text' then @initializeTextMode()
      when 'photo' then @initializePhotoMode()
      when 'done' then @finalizeForDoneMode()
    @mode = newMode

  #region EXPORTING AND SHARING

  captureImageDeferred: (type = 'image/jpg', quality = 0.8)->
    # prepare canvas for capture
    @canvas.discardActiveObject()
    # capture as deferred
    deferred = $.Deferred()
    onBlobReady = (blob)=>deferred.resolve blob
    @canvas.lowerCanvasEl.toBlob onBlobReady, type, quality
    deferred

  downloadLocal: ->
    @setMode 'done'
    @captureImageDeferred().done (blob)->saveAs(blob, 'StraightOuttaCompton.jpg')

  upload: ->
    # TODO disable further editing
    @setMode 'done'
    @captureImageDeferred().done (blob)=>
      uploader = new Uploader(blob, @cityText)
      uploader.start().done (shareUrl)->
        console.log "OK done!"
        $('<a>').attr(href: shareUrl).text("Share this link.").appendTo('body')

  #region PHOTO EDITING

  setPhoto: (fileDescriptor) ->
    @setMode 'photo'
    reader = new FileReader()
    reader.onload = =>

      img = new Image()
      img.src = reader.result
      aspect = img.width/img.height

      @downscalePhotoIfNeededDeferred(img).done (photo)=>
        if @photo?
          @photo.off 'selected'
          @photo.off 'moving'
          @canvas.remove @photo

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
    OVERSCALE = 1
    deferred = $.Deferred()
    aspect = img.width/img.height
    console.log "Loaded image at #{img.width}x#{img.height}"
    scaleNeeded = img.width > @canvas.width * OVERSCALE && img.height > @canvas.height * OVERSCALE
    if scaleNeeded
      console.warn "Scaling down image"
      resizeCanvas = document.createElement 'canvas'
      resizeCanvas.width = @canvas.width * OVERSCALE
      resizeCanvas.height = @canvas.height * OVERSCALE
      if aspect > 1
        resizeCanvas.width = @canvas.width * OVERSCALE * aspect
      else
        resizeCanvas.heigth = @canvas.height * OVERSCALE / aspect
      ctx = resizeCanvas.getContext '2d'
      ctx.drawImage img, 0, 0, resizeCanvas.width, resizeCanvas.height
      fabric.Image.fromURL resizeCanvas.toDataURL(), (photo)=>deferred.resolve(photo)
    else
      deferred.resolve new fabric.Image(img)
    deferred


  setParameter: (parameterId, programmatic = false) ->
    # console.log "Setting parameter to", parameterId
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
    @logo.setLeft Math.max(0, Math.min(@canvas.width-l.width, @logo.left))
    @logo.setTop Math.max(0, Math.min(@canvas.height-l.height, @logo.top))

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
