# turf-simplify

# simplify

Takes a [LineString](LineString) or [Polygon](Polygon) and returns a simplified version. Internally uses [simplify-js](http://mourner.github.io/simplify-js/) to perform simplification.

**Parameters**

-   `feature` **(Feature&lt;(LineString | Polygon | MultiLineString | MultiPolygon)> | FeatureCollection | GeometryCollection)** feature to be simplified
-   `tolerance` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** simplification tolerance
-   `highQuality` **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** whether or not to spend more time to create
    a higher-quality simplification with a different algorithm

**Examples**

```javascript
var feature = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-70.603637, -33.399918],
      [-70.614624, -33.395332],
      [-70.639343, -33.392466],
      [-70.659942, -33.394759],
      [-70.683975, -33.404504],
      [-70.697021, -33.419406],
      [-70.701141, -33.434306],
      [-70.700454, -33.446339],
      [-70.694274, -33.458369],
      [-70.682601, -33.465816],
      [-70.668869, -33.472117],
      [-70.646209, -33.473835],
      [-70.624923, -33.472117],
      [-70.609817, -33.468107],
      [-70.595397, -33.458369],
      [-70.587158, -33.442901],
      [-70.587158, -33.426283],
      [-70.590591, -33.414248],
      [-70.594711, -33.406224],
      [-70.603637, -33.399918]
    ]]
  }
};

var tolerance = 0.01;

var simplified = turf.simplify(
 feature, tolerance, false);

//=feature

//=simplified
```

Returns **(Feature&lt;(LineString | Polygon | MultiLineString | MultiPolygon)> | FeatureCollection | GeometryCollection)** a simplified feature

---

This module is part of the [Turfjs project](http://turfjs.org/), an open source
module collection dedicated to geographic algorithms. It is maintained in the
[Turfjs/turf](https://github.com/Turfjs/turf) repository, where you can create
PRs and issues.

### Installation

Install this module individually:

```sh
$ npm install turf-simplify
```

Or install the Turf module that includes it as a function:

```sh
$ npm install turf
```
