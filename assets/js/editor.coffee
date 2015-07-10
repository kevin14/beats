class Editor

  constructor: ->
    @canvas = new fabric.Canvas 'canvas'

    selectableOpts =
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

    @photo = new fabric.Image document.getElementById('sample-photo'), selectableOpts
    @photo.set
      left: 0
      top: 0
      width: @canvas.width
      height: @canvas.height
    @logo = new fabric.Image document.getElementById('sample-logo'), selectableOpts

    @canvas.add @photo, @logo


Editor._instance = new Editor()