#ImageData2D

`ImageData2D` is a raster image class kind of like JavaScript's native `ImageData` BUT BETTER! It has built-in algorithms for lines, circles, rectangles, curves and even path finding (for some reason). It has a file format that can easily be embeded (because its a typed array). The image itself is a `Uint32Array`. This means that each pixel is a single element which means that operations with `ImageData2D` are faster than the same operations with `ImageData`.

#Documenation

###Getting started
You can create a `new ImageData2D` like so
```javascript
var image = new ImageData2D(width, height);
```
You can convert an `ImageData` to an `ImageData2D` by simply passing it as the `width`.

You're probably going to want to see that image so you can use the `toImageData` method to convert to an `ImageData`
```javascript
ctx.putImageData(image.toImageData(), 0, 0);
```
You can convert to a png or a given mimetype with the `toPNG` method. It returns a `Blob`
```javascript
var png = image.toPNG();    
var jpg = image.toPNG('image/jpg');
```

To compare images you have two options.
`ImageData2D.compare` is a static method of `ImageData2D` and can compare 2 or more images at a time.
`image.compareTo` will compare and image to a single other image.

###Pixel Level Manipulation
An the data property of an `ImageData` object is a `Uint8ClampedArray` which means that it can be easily manipulated with `.data.set(data, offset)` but it also means that getting and setting pixels is slower. red, green, blue, alpha have to be set separatly. But the data property of an `ImageData2D` object is a `Uint32Array`. Each pixel is a single number. Which means that the entire pixel be set at once. This means that getting and setting pixels on an `ImageData2D` is faster than doing so on an `ImageData`.

`setPx(x, y, color, aa)` will set a single pixel to a single color with optional antialiasing. Antialiasing will obviously slow it down a fair bit because you end up with a total of 4 `setPx` calls and 4 `ImageData2D.mergePx` calls. If you were wondering, `ImageData2D.mergePx(pixels)` will simply merge the given list of pixels from bottom to top.

`getPx(x, y)` will return the color at the given coordinates. It converts `50462976` to `[0, 1, 2, 3]` so that you don't have to!

`clearPx(x, y)` will clear pixel at the given coordinates. Its essentially just `setPx(x, y, [0, 0, 0, 0])`

`setArea(image, x, y, width, height)` will set a given image at the given coordinates. `width` and `height` can be used to restrain the size of the given image. It's pretty much `ctx.putImageData`

`merge(image, pos)` is very similar to `setArea` but will merge `image` on top of `this`. `pos` is the position of `image` if it is `undefined` then `image.pos` will be used.

`getArea(x, y, width, height)` will return the image at the given coordinates. It's pretty much `ctx.getImageData`

`clearArea(x, y, width, height, color)` will draw a rectangle of the given color. If `color` is not specified it will draw `[0, 0, 0, 0]` instead.

`clear(color)` will set every pixel on the image to `color`. If color is not specified, `[0, 0, 0, 0]` will be used instead.

`isClear()` will return `true` if every pixel is `[0, 0, 0, 0]` and false otherwise.

###Drawing
`ImageData2D` has some methods that can help with drawing basic shapes. I didn't realise how little there were until writing this so I might add more soon.

`line(from, to, color, aa, degDist)` The arguments `from` and `to` are arrays `[x, y]`. The `aa` argument will enable antialiasing if `true`. An anitaliased line looks a whole lot better than a non-antialiased line. It may be a little slower but its definity worth it. `degDist` is short for "degrees and distance". If enabled, the `to` argument will be interpreted as `[degrees, distance]` so that you can draw a line from a point `from` in a direction `to[0]` at a length `to[1]`.

`rect(pos, size, color, fillColor)` I think this pretty self explainitory.

`circle(pos, radius, color, fillColor, aa)` Yeah this pretty self explainitory too.

`bezierCurve(from, control0, control1, to, color, aa)` Now this is interesting! I will admit first up that this is NOT my algorithm but I did optimize it beyond readablilty so I think that deserves SOME credit. So anyway this draws a curve from `from` to `to` (haha) with the points `control0` and `control1` controling how the curve will look.

`quadCurveIter quadCurveRecu(from, control, to, color, aa)` Now both of these are my algorithms. Both have the same input and output just slightly different algorithms. Notice that a quadratic curve on has a single control point whereas a bezier curve has two. There is a iterative algorithm and a recusive algorithm. I'll let you find out which is faster!

`fill(pos, color, image)` I know that this function is slow. It’s the algorithm. It’s a bad algorithm. But on small images <=128 you’ll be fine! So you give it a start `pos` and it fill `color` on all surrounding pixels the same color as that of `pos`. If you pass an `image` argument, it will fill as if it were filling `image` but will set all the changes on `this` image.

`path(from, to, color, image)` Now this is my favourite method! Even though it’s probably the most useless of them all. It will find a path between `from` and `to`. If `color` is undefined then instead of drawing the path it will return a list of positions that is the path. It has the same image argument as `fill`.

###Advanced
Everything you’ve seen so far is just baby stuff when compared to these mighty functions! Because everyone can make a `setPx` function `data[y * this.width + x] = color`. These are probably the only reason to download this library to be honest! I’d imagine that as soon as you know what an `ImageData` is you’ll start making functions like `setPx`, `getPx`, `clear` and all those. But who has the time to do the following!

`backdrop(backImage, applyImage, repeatBack, repeatApply, progress)` This will apply a backdrop to an image. `backImage` is the image that is going to be replaced. You’ll usually find your self using 1x1 image for the `backImage` unless you’re doing something fancy! `applyImage` is the image that will replace the `backImage`. If a pixel from `this` image match with a pixel on `backImage` that pixel will be replaced by one on the `applyImage`. `repeatBack` should definitely be true if `backImage` is 1x1 because you want to repeat that one pixel thought the image. `repeatApply` is the same as `repeatBack` but with the `applyImage`. `progress` is a function that will be given the progress of the operation as a number between `0` and `1`. If `progress` returns `true` the operation will be canceled. This is useful if you have a progress bar will a cancel button.

`applyKCFilter(filter, args, progress)` `filter` is an `ImageData2D.KCFilter`. The constructor looks like this `constructor(filter, size, divisor, offset)`. `filter` is an array which is the filter itself. `size` is simply `[width, height]` where `filter.length == width * height`. `width` and `height` should be odd because of the way that KCFilters work. If you know what a Kernal Convolution Filter is then `divisor` and `offset` will be self explanatory. `args` is an array. The first 4 properties a `Boolean`s paired to `rgba`. So if `args` is `[true, true, true]` then the filter will be applied on red, green and blue which is probably what you want. The final property in `args` specifies what to do at the edge of the image. `0` to extend the edge (default), `1` to wrap from the opposite side and a color to put that at the edge. `progress` is the same as in `backdrop`.

If you want to understand what a Kernal Convolution filter is you can [watch this great video](https://youtu.be/C_zFhWdM4ic)

You can find a bunch of default `ImageData2D.KCFilter`s in `ImageData2D.nativeKCFilter`

You can also generate a gaussian blur matrix with this function
`gaussianBlur(width, height, ampl, stdDevX, stdDevY)`
A gaussian blur kind of looks like a radial gradient. `ampl` is the value in the center. All other values decrease as they move away from the center. `stdDevX` and `stdDevY` is the standard deviation. It’s kind of like the radius but not really. Higher standard deviation means that values way from the center will be higher and therefore the affected area of the filter will be larger.

If my explanation was a brown smelly pile of something then [wikipedia will help](https://en.wikipedia.org/wiki/Gaussian_function) 

`applyJSFilter(filter, args, progress)` `filter` is a function that looks like `function(x, y, color, args) {return newColor}`. It will be applied to every pixel and given that pixels position and color. It will also be given `args` which is the same `args` as that given in the `applyJSFilter` call. `progress` is the same as in `applyKCFilter`.

You can find a bunch of default `ImageData2D.JSFilter`s in `ImageData2D.nativeJSFilter`

`applyTransform(trans, origin, progress)` `trans` is a 3x3 `Matrix`. A position on the new image will be divided by `trans` (yes you CAN divide matricies!) to get a position on the old image where the color will be taken and put on the new image. If you’re wondering why I did it that way it’s because it’s the easiest way to ensure that there will never be any holes in the resulting image. `origin` is negative to what you might expect. If you image is 100x100 and you want the `origin` in the centre the origin would be equal to `[-50, -50]`. If you think about it, this actually makes more sense because the origin is actually the position of the image. `progress` is the same as in `applyJSFilter`.

You can find a bunch of default transforms in `ImageData2D`. They are:

* `rotate(angle)`
* `scale(x, y)`
* `skew(x, y)`
* `horiReflect()`
* `vertReflect()`
* `reflect(angle)`

You can `matrix0.multiplyMatrix(matrix1)` them together.

###Files
A `ImageData2D` image can be encoded into a file! I know this probably sounds crazy but I did it anyway. This is so that the `pos` can be preserved. There used to be more properties but then I removed them. So now encoding and decoding is kind of pointless. But It might be useful if you’re making your own file format and you want to embed images into it. Because you can embed a PNG into a file but you can’t decode the file because in order to decode the PNG you must separate it from the file. You don’t know how long the PNG is without reading it. And you don’t want to read it! So if you want to embed and image into a file then you can embed an `ImageData2D`

The extension for an `ImageData2D` file is "imagedata2d" and the magic number at the start of the file is "ImageData2D\n".

`encode(blob)` if `noBlob` is `false` it will return a `Blob` of the image. if `noBlob` is `true` then a `Uint32Array` will be returned. You can concatenate this into your file.

`ImageData2D.decode(data, offset)` data should be a `Uint32Array`. if `offset` is `true` then `[image, newOffset]` will be returned so that you know where you’re up to in the file. if `offset` is false then just the image will be returned.

###Misc

`fragment(frags, edgeOverlap)` This will break the image up into `Fragment`s. `frags` is the number of `Fragment`s you want and `edgeOverlap` is the number of pixels you want to overlap each of the fragments.

`ImageData2D.assembleFragments(frags)` will take an array of `Fragment`s, assemble them into image and return it.

Fragmenting is very useful with the use of web workers. If you want distribute the load cpu load into web workers they can each process a part of the image and the results can be re assembled on the main thread. I LOVE WEB WORKERS!

`ImageData2D.fromSerial(data)` will return an `ImageData2D` from an object that kind of looks like an `ImageData2D`. This is for when sending images to and from web workers because messages are serialised. So 
```javascript
ImageData2D.compare(
  image,
  ImageData2D.fromSerial(
    JSON.parse(
      JSON.stringify(image)
    )
  )
) == true
```
This function is also present in `ImageData2D.KCFilter`

`minMax(trans, origin)` will give you the four corners of the resulting image of a transformation as `[minX, minY, maxX, maxY]`. `applyTransform` uses this.

`size(trans)` will give you the size of the resulting image of a transformation. It is also used by `applyTransform`.

`display()` is great for small images `<10`. It tabulates the string form of the image. It’s great if you want to inspect a tiny and see the color values and where they are.

`clone()` will return a copy of `this`. I make sure that all of my classes have a `clone` function so that I can use the following.
```javascript
Object.prototype.clone = function() {
  var o = this.length ? [] : {};
  //there’s the problem      ^
  for (var i in this) {
    if (!this.hasOwnProperty(i))
      continue;
    o[i] = typeof this[i] == 'object' ? this[i].clone() : this[i];
  }
  return o;
};```
It recursively copies any object BUT doesn’t copy the class but if that class has it’s own `clone` function it can be used with this to preserve the class.
