class Editor

  SELECTABLE_OPTIONS =
    originX: 'center'
    originY: 'center'
    selectable: true
    hasRotatingPoint: false
    lockRotation: true
    lockScalingFlip: true
    lockUniScaling: true
    selectionColor: 'white'
    cornerColor: 'white'
    borderColor: 'white'
    borderWidth: 3
    transparentCorners: false
    padding: 10

  constructor: ($canvas, $controls) ->
    @values =
      logo: 0
      photo: 0.5
      grain: 1
      contrast: 0.25

    @canvas = new fabric.Canvas $canvas.get(0)
    @canvas.selection = false
    @canvas.backgroundColor = 'black'

    # fabric.Image.fromURL '/img/editor/sample-photo.jpg', (img)=>
    #   @photo = img
    #   @photo.set(SELECTABLE_OPTIONS).set
    #     left: @canvas.width/2
    #     top: @canvas.height/2
    #     width: @canvas.width
    #     height: @canvas.height
    #     padding: 0
    #   @photo.filters.push new GrayscaleContrastFilter(contrast: @values.contrast)
    #   @photo.applyFilters =>@canvas.renderAll()
    #   @canvas.add @photo
    #   @fixOrderingOnLoad()
    #   @photo.on 'selected', => @setParameter('photo', true)
    #   @setParameter('photo', true)

    fabric.Image.fromURL '/img/editor/sample-logo.png', (img)=>
      @logo = img
      @logo.set(SELECTABLE_OPTIONS).set
        left: @canvas.width/2
        top: @canvas.height - @logo.height/2 - 40
      @canvas.add @logo
      @fixOrderingOnLoad()
      @logo.on 'selected', => @setParameter('logo', true)

    # fabric.Image.fromURL '/img/editor/grain.png', (img)=>
    #   @grain = img
    #   @grain.set
    #     originX: 'center'
    #     originY: 'center'
    #     left: @canvas.width/2
    #     top: @canvas.height/2
    #     selectable: false
    #   @canvas.add @grain
    #   @fixOrderingOnLoad()

    self = @

    # @canvas.on 'object:moving', (e)=>
    #   @constrainPhotoMove() if @photo? && e.target == @photo

    $controls.find('.download').click => @downloadLocal()

    $controls.find('.share').click => @upload()

    $controls.find('input[type=file]').change ->
      self.setPhoto.call self, this.files[0]

    @controlsRadios = $controls.find('input[type=radio]').change ->
      self.setParameter.call self, $(this).val()

    @controlsRange = $controls.find('input[type=range]').change ->
      self.setValue.call self, parseFloat($(this).val())

    # $controls.find('input[type=radio]').first().click()

  captureImageDeferred: (type = 'image/jpg', quality = 0.8)->
    # prepare canvas for capture
    @canvas.discardActiveObject()
    # capture as deferred
    deferred = $.Deferred()
    onBlobReady = (blob)=>deferred.resolve blob
    @canvas.lowerCanvasEl.toBlob onBlobReady, type, quality
    deferred

  downloadLocal: ->
    @captureImageDeferred().done (blob)->saveAs(blob, 'StraightOuttaCompton.jpg')

  upload: ->
    # TODO disable further editing
    @captureImageDeferred().done (blob)->
      uploader = new Uploader(blob, "Brooklyn")
      uploader.start().done (shareUrl)->
        console.log "OK done!"
        $('<a>').attr(href: shareUrl).text("Share this link.").appendTo('body')

  fixOrderingOnLoad: ->
    # console.log "reorder"
    @canvas.discardActiveObject()
    if @photo? then @canvas.bringToFront @photo
    if @logo? then @canvas.bringToFront @logo
    # if @grain? then @canvas.bringToFront @grain


  setParameter: (parameterId, programmatic = false) ->
    # console.log "Setting parameter to", parameterId
    if programmatic and @parameter != parameterId
      $("#control-#{parameterId}").click()
    @parameter = parameterId
    @controlsRange.val @values[@parameter]
    unless programmatic
      switch @parameter
        when 'photo'
          if @photo? then @canvas.setActiveObject @photo
        when 'logo' then @canvas.setActiveObject @logo
        else @canvas.discardActiveObject()

  setValue: (value) ->
    @values[@parameter] = value
    switch @parameter
      when 'photo'
        @photo?.scale(2 * value)
      when 'logo'
        @logo?.scale(2 * value)
      when 'contrast'
        @photo?.filters[0]?.contrast = value
        @photo?.applyFilters => @canvas.renderAll()
      # when 'grain'
      #   @grain?.set opacity: value
    @canvas.renderAll()

  setPhoto: (fileDescriptor) ->
    # console.log "Setting photo"
    # console.dir fileDescriptor
    reader = new FileReader()
    reader.onload = =>
      img = new Image()
      img.src = reader.result

      if @photo?
        @photo.off 'selected'
        @photo.off 'moving'
        @canvas.remove @photo

      @photo = new fabric.Image img
      aspect = @photo.width/@photo.height
      @photo.set(SELECTABLE_OPTIONS).set
        # selectable: false
        originX: 'left'
        originY: 'top'
        width: @canvas.width
        height: @canvas.height
        padding: 0
      isWide = aspect > 1
      if isWide
        @photo.width = @canvas.width * aspect
      else
        @photo.height = @canvas.height / aspect
      @photo.filters.push new GrayscaleContrastFilter(contrast: @values.contrast)
      @photo.applyFilters =>@canvas.renderAll()
      @canvas.add @photo
      @photo.center()
      @fixOrderingOnLoad()
      @photo.on 'selected', =>@setParameter('photo', true)
      @photo.on 'moving', =>@constrainPhotoMove()
      @setParameter('photo', true)
    reader.readAsDataURL fileDescriptor

  constrainPhotoMove: ->
    @photo.setCoords()
    p = @photo.getBoundingRect()
    # pw = p.width
    # ph = p.height
    # cw = @canvas.width
    # ch = @canvas.height
    @photo.setLeft Math.min(0, Math.max(@canvas.width-p.width, p.left))
    @photo.setTop Math.min(0, Math.max(@canvas.height-p.height, p.top))
    # if pw > cw
    #   l = p.left
    #   r = l + pw
    #   if r < cw || l > 0
    #     @photo.setLeft Math.min(0, Math.max(cw-pw, l))
    # else
    #   @photo.setLeft 0

    # if ph > ch
    #   t = p.top
    #   b = p.top + p.height
    #   if b > ch || t < 0
    #     @photo.setTop Math.min(0, Math.max(ch-ph, t))
    # else
    #   @photo.setTop 0

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


do ->
  Editor._instance = new Editor $('#canvas'), $('.editor-controls')
  $(".upload.button").click -> $("input[type=file]").click()