class Editor

  constructor: ($canvas, $controls) ->
    @values =
      logo: 0
      image: 0.5
      grain: 1
      contrast: 1

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

    @photo = new fabric.Image document.getElementById('sample-photo'), commonOptions
    @photo.set
      left: @canvas.width/2
      top: @canvas.height/2
      width: @canvas.width
      height: @canvas.height

    @logo = new fabric.Image document.getElementById('sample-logo'), commonOptions
    @logo.set
      left: @canvas.width/2
      top: @canvas.height - @logo.height/2 - 40

    @canvas.add @photo, @logo

    self = @
    $controls.find('input[type=radio]').change ->
      self.setParameter.call self, $(this).val()

    $controls.find('input[type=range]').change ->
      self.setValue.call self, parseFloat($(this).val())

    @range = $controls.find('input[type=range]')

    $controls.find('input[type=radio]').first().click()

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
    @canvas.renderAll()
    # @applyValues()

  applyValues: ->
    # for parameter, value of @values
    #   console.log parameter, "is", value

Editor._instance = new Editor $('#canvas'), $('.editor-controls')