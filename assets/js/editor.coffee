class Editor

  constructor: ($canvas, $controls) ->
    @values =
      logo: 0
      image: 0.5
      grain: 1
      contrast: 0.25

    @canvas = new fabric.Canvas $canvas.get(0)

    commonOptions =
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

    fabric.Image.fromURL '/img/editor/sample-photo.jpg', (img)=>
      img.set commonOptions
      @photo = img
      @photo.set
        left: @canvas.width/2
        top: @canvas.height/2
        width: @canvas.width
        height: @canvas.height
      @photo.filters.push new fabric.Image.filters.Contrast(contrast: @values.contrast)
      @photo.applyFilters =>@canvas.renderAll()
      @canvas.add @photo

    fabric.Image.fromURL '/img/editor/sample-logo.png', (img)=>
      img.set commonOptions
      @logo = img
      @logo.set
        left: @canvas.width/2
        top: @canvas.height - @logo.height/2 - 40
      @canvas.add @logo

    self = @
    $controls.find('input[type=radio]').change ->
      self.setParameter.call self, $(this).val()

    $controls.find('input[type=range]').change ->
      self.setValue.call self, parseFloat($(this).val())

    @range = $controls.find('input[type=range]')

    # $controls.find('input[type=radio]').first().click()

  setParameter: (parameterId) ->
    # console.log "Setting parameter to", parameterId
    @parameter = parameterId
    @range.val @values[@parameter]
    switch @parameter
      when 'image' then @canvas.setActiveObject @photo
      when 'logo' then @canvas.setActiveObject @logo
      else @canvas.discardActiveObject()

  setValue: (value) ->
    @values[@parameter] = value
    switch @parameter
      when 'image'
        @photo.scale(2 * value)
      when 'logo'
        @logo.scale(2 * value)
      when 'contrast'
        @photo.filters[0].contrast = value
        @photo.applyFilters =>@canvas.renderAll()
    @canvas.renderAll()
    # @applyValues()

  # applyValues: ->
    # for parameter, value of @values
    #   console.log parameter, "is", value


fabric.Image.filters.Contrast = fabric.util.createClass fabric.Image.filters.BaseFilter,
  type: 'Contrast'

  initialize: (options)->
    options = options || { };
    @contrast = options.contrast || 0;

  applyTo: (canvasEl)->
    context = canvasEl.getContext '2d'
    imageData = context.getImageData 0, 0, canvasEl.width, canvasEl.height
    contrast = 0.5 + @contrast * 2
    data = imageData.data
    for val, i in data
      data[i] = (val-128) * contrast + 128
    context.putImageData imageData, 0, 0

  toObject: ->
    extend @callSuper('toObject'), contrast: @contrast

fabric.Image.filters.Contrast.fromObject = (o)->new fabric.Image.filters.Contrast(o)


do ->
  Editor._instance = new Editor $('#canvas'), $('.editor-controls')