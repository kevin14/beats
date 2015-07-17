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

    fabric.Image.fromURL '/img/editor/sample-photo.jpg', (img)=>
      @photo = img
      @photo.set(SELECTABLE_OPTIONS).set
        selectable: false
        left: @canvas.width/2
        top: @canvas.height/2
        width: @canvas.width
        height: @canvas.height
      @photo.filters.push new GrayscaleContrastFilter(contrast: @values.contrast)
      @photo.applyFilters =>@canvas.renderAll()
      @canvas.add @photo
      @fixOrderingOnLoad()
      @photo.on 'selected', => @setParameter('photo', true)
      @setParameter('photo', true)

    fabric.Image.fromURL '/img/editor/sample-logo.png', (img)=>
      @logo = img
      @logo.set(SELECTABLE_OPTIONS).set
        left: @canvas.width/2
        top: @canvas.height - @logo.height/2 - 40
      @canvas.add @logo
      @fixOrderingOnLoad()
      @logo.on 'selected', => @setParameter('logo', true)

    fabric.Image.fromURL '/img/editor/grain.png', (img)=>
      @grain = img
      @grain.set
        originX: 'center'
        originY: 'center'
        selectable: false
      @canvas.add @grain
      @fixOrderingOnLoad()

    self = @

    $controls.find('input[type=file]').change ->
      self.setPhoto.call self, this.files[0]

    $controls.find('.download').click => @download()

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
    onBlobReady = (blob)=>deferred.resolve(blob)
    @canvas.lowerCanvasEl.toBlob(onBlobReady, type, quality)
    deferred

  download: ->
    @captureImageDeferred().then (blob)->saveAs(blob, 'StraightOuttaCompton.jpg')

  fixOrderingOnLoad: ->
    # console.log "reorder"
    if @photo? then @canvas.bringToFront @photo
    if @logo? then @canvas.bringToFront @logo
    if @grain? then @canvas.bringToFront @grain


  setParameter: (parameterId, programmatic = false) ->
    # console.log "Setting parameter to", parameterId
    if programmatic and @parameter != parameterId
      $("#control-#{parameterId}").click()
    @parameter = parameterId
    @controlsRange.val @values[@parameter]
    unless programmatic
      switch @parameter
        when 'photo' then @canvas.setActiveObject @photo
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
      when 'grain'
        @grain?.set opacity: value
    @canvas.renderAll()
    # @applyValues()

  # applyValues: ->
    # for parameter, value of @values
    #   console.log parameter, "is", value

  setPhoto: (fileDescriptor) ->
    # console.log "Setting photo"
    # console.dir fileDescriptor
    reader = new FileReader()
    reader.onload = =>
      img = new Image()
      img.src = reader.result

      if @photo?
        @photo.off 'selected'
        @canvas.remove @photo

      @photo = new fabric.Image img
      aspect = @photo.width/@photo.height
      @photo.set(SELECTABLE_OPTIONS).set
        selectable: false
        left: @canvas.width/2
        top: @canvas.height/2
        width: @canvas.width
        height: @canvas.height
      if aspect > 1
        @photo.width = @canvas.width * aspect
      else
        @photo.height = @canvas.height / aspect
      # @photo.filters.push new fabric.Image.filters.Grayscale()
      @photo.filters.push new GrayscaleContrastFilter(contrast: @values.contrast)
      @photo.applyFilters =>@canvas.renderAll()
      @canvas.add @photo
      @fixOrderingOnLoad()
      @photo.on 'selected', => @setParameter('photo', true)
      @setParameter('photo', true)
    reader.readAsDataURL fileDescriptor



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