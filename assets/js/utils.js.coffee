String::toTitleCase = ->@replace /\w\S*/g, (txt) -> (txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
String::contains = (str)->@indexOf(str) != -1

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

