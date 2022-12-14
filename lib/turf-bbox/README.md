# turf-bbox

# bbox

Takes a set of features, calculates the bbox of all input features, and returns a bounding box.

**Parameters**

-   `geojson` **(Feature | FeatureCollection)** input features

**Examples**

```javascript
var input = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [114.175329, 22.2524]
      }
    }, {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [114.170007, 22.267969]
      }
    }, {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [114.200649, 22.274641]
      }
    }, {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [114.186744, 22.265745]
      }
    }
  ]
};

var bbox = turf.bbox(input);

var bboxPolygon = turf.bboxPolygon(bbox);

var resultFeatures = input.features.concat(bboxPolygon);
var result = {
  "type": "FeatureCollection",
  "features": resultFeatures
};

//=result
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>** the bounding box of `input` given
as an array in WSEN order (west, south, east, north)

---

This module is part of the [Turfjs project](http://turfjs.org/), an open source
module collection dedicated to geographic algorithms. It is maintained in the
[Turfjs/turf](https://github.com/Turfjs/turf) repository, where you can create
PRs and issues.

### Installation

Install this module individually:

```sh
$ npm install turf-bbox
```

Or install the Turf module that includes it as a function:

```sh
$ npm install turf
```
