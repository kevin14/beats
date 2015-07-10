canvas = new fabric.Canvas('canvas')

do ->
  circle = new fabric.Circle
    radius: 20
    fill: 'green'
    left: 100
    top: 100
    selectable: true
  tri = new fabric.Triangle
    width: 20
    height: 30
    fill: 'blue'
    left: 50
    top: 50
    selectable: true
  canvas.add circle, tri

  canvas.selection = false
  canvas.renderAll()
