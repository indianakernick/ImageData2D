//i probably should have used a library like mathjs for this matrix stuff but
//i went and made my own. yup...
var Matrix = class Matrix extends Array {
  constructor(width, height, data) {
    //for some reason "this" isn't defined. ???
    //it messed up my nice pretty syntax and turned it into garbage!
    var newThis;
    if (!width)
      width = data.length / height;
    else if (!height)
      height = data.length / width;
    else if (!data)
      newThis = super(width * height).fill(0);
    else
      //if i define this as [data[0]] the result is NOT an instanceof Matrix
      //i have no clue why
      newThis = data.length > 1 ? super(...data) : super(1).fill(data[0]);
    newThis.width = width;
    newThis.height = height;
    newThis.square = width == height;
    return newThis;
  }
  
  det() {
    if (this.square) {
      if (this.width == 2)
        return (this[0] * this[3]) - (this[2] * this[1]);
      else {
        /*
        Thank you,
        Math Meeting
        
        https://www.youtube.com/watch?v=pKZyszzmyeQ
        
        and thank you,
        Khan Academy
        
        https://www.youtube.com/watch?v=01c12NaUQDw
        */
        var a = new Array(this.width).fill(1), b = new Array(this.width).fill(1), w, d;
        for (w = 0; w < this.width; w++) {
          for (d = 0; d < this.width; d++) {
            a[w] *= this[d * this.width + (d + w) % this.width];
            b[w] *= this[(this.width - d - 1) * this.width + (d + w) % this.width];
          }
        }
        return sum(a) - sum(b);
      }
    }
  }
  
  adj() {
    if (this.square) {
      if (this.width == 2)
        return new Matrix(2,2,[this[3],-this[1],-this[2],this[0]]);
      else {
        var newMatrix = new Matrix(this.width,this.width), i, j, temp, visited = [];
        //it turns out the Array.prototype.fill references the given object instead of copying
        for (i = 0; i < this.width * this.height; i++)
          newMatrix[i] = [];
        for (i = 0; i < this.width * this.width; i++)
          for (j = 0; j < this.width * this.width; j++)
            if (j % this.width != i % this.width && (j - j % this.width) / this.width != (i - i % this.width) / this.width)
              newMatrix[i].push(this[j]);
        for (i = 0; i < this.width * this.height; i++)
          newMatrix[i] = new Matrix(2,2,newMatrix[i]).det() * (i % 2 === 0 ? 1 : -1);
        for (i = 0; i < this.width * this.width; i++) {
          //before this I was swaping them all then swapping them back. It took me half an hour to figure out what was wrong. by then there were more console.log messages than code
          if (!visited.includes(i) && !visited.includes((i % this.width) * this.width + ((i - i % this.width) / this.width))) {
            temp = newMatrix[i];
            newMatrix[i] = newMatrix[(i % this.width) * this.width + ((i - i % this.width) / this.width)];
            newMatrix[(i % this.width) * this.width + ((i - i % this.width) / this.width)] = temp;
            visited.push(i);
            visited.push((i % this.width) * this.width + ((i - i % this.width) / this.width));
          }
        }
        return newMatrix;
      }
    }
  }
  
  multiplyMatrix(matrix) {
    if (this.width == matrix.height && this.height == matrix.width) {
      //mathamatical notation is messing with my head. For some reason the size of a matrix is written height x width instead of width x height
      //math and computers are best buddies, how could we have a disagreement like this!
      var newMatrix = new Matrix(this.height,matrix.width);
      for (var y = 0; y < this.height; y++)
        for (var x = 0; x < this.width; x++)
          for (var i = 0; i < this.width; i++)
            //console.log((y * this.height + x) + ' += ' + this[y * this.width + i] + ' * ' + matrix[i * matrix.width + x] + ' = ' + (this[y * this.width + i] * matrix[i * matrix.width + x]));
            newMatrix[y * this.height + x] += this[y * this.width + i] * matrix[i * matrix.width + x];
      return newMatrix;
    }
  }
  
  inverse() {
    var det = this.det();
    if (this.square && det)
      return this.adj().multiplyScalar(1 / this.det());
    else
      console.error('Tryed to invert an uninvertable matrix. square:',this.square,'determinant:',det);
  }
  
  clone() {
    return new Matrix(this.width,this.height,this);
  }
};
//are vectors actually just matricies
//like squares are "special" rectangles
//and circles are "special" ellipses.
//vectors are "special" matricies?
var Vector = class Vector extends Array {
  constructor(data) {
    if (typeof data == 'number')
      return super(data).fill(0);
    else
      return super(...data);
  }
  
  multiplyMatrix(matrix) {
    if (this.length == matrix.width) {
      var newVector = new Vector(this.length);
      for (var y = 0; y < matrix.height; y++)
        for (var x = 0; x < matrix.width; x++)
          newVector[y] += matrix[y * matrix.width + x] * this[x];
      return newVector;
    }
  }
};
//just a little class for making bitmaps of anything
//it’s used by path.
//in fact this is actually just the first version of ImageData2D ever!
var ArrayGrid = class ArrayGrid {
  constructor(width, height, image) {
    this.width = width;
    this.height = height;
    if (!image)
      image = [new Array(width * height).fill([0, 0, 0, 0]), 0, 0];
    this.image = image;
  }
  
  setPx(x, y, color) {
    this.image[0][y * this.width + x] = color.slice(0);
  }
  
  getPx(x, y) {
    return this.image[0][y * this.width + x].slice(0);
  }
};

function sum(l) {
  return l.length == 1 ? l[0] : l[0] + sum(l.slice(1));
}

//kind of unnecisary but it cleans up a lot of other code
function inter(from, to, t) {
  //0 / 0 == NaN
  if (!t)
    t = 0;
  if (from.length) {
    for (var i = 0, mid = []; i < from.length; i++)
      mid[i] = from[i] + (t * (to[i] - from[i]));
    return mid;
  } else
    return from + (t * (to - from));
}

function clamp(n, min, max) {
  return Math.min(Math.max(n,min),max);
}

/*
 returns the decimal precision of a number
 for example:
 
 input    output
 14       0
 783.9    1
 0.57     2
 1.4e-2   3
*/
function deci(n) {
  var match = ('' + n).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match)
    return 0;
  return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
}

function degGra(degrees) {
  return Math.tan(degrees * Math.PI / 180);
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

/*
transforms with raster images is tricky, complicated and really messy.
so much so that i took half and hour of my time to make a vectorimage class
and it was transforming just fine. 
it also looked better because the raster image was rough around the edges
(round/floor/ceil doesn't seem to help)
i guess its because vectorimages have a floating origin (is that the correct terminology)
so you don't really need to deal with the origin at all
*/
var ImageData2D = class ImageData2D {
  constructor(width, height, data, pos) {
    if (width instanceof ImageData) {
      height = width.height;
      data = width.data;
      width = width.width;
    } else {
      if (!width && height && data)
        width = data.length / height;
      else if (width && !height && data)
        height = data.length / width;
      else if (width && height && !data)
        data = new Uint32Array(width * height);
      else if (!(width && height && data)) {
        //I'll work on this later
        console.log(...arguments);
        console.error('Not enough arguments were provided to construct ImageData2D');
      }
    }
    if (!(data instanceof Uint32Array))
      data = new Uint32Array(data.buffer || data);
    if (!pos)
      pos = [0, 0];
    this.width = width * 1;
    this.height = height * 1;
    this.data = data;
    //pos is only for transformations
    //use Keyframe instead
    this.pos = [pos[0] * 1,pos[1] * 1];
  }
  
  toImageData() {
    return new ImageData(new Uint8ClampedArray(this.data.buffer),this.width);
  }
  //when an object is serialized it loses it's class. I made this so that you can transfer
  static fromSerial(data) {
    //does this condition need to be any more detailed?
    if (typeof data.width == 'number' && typeof data.height == 'number' && data.data instanceof Uint32Array && data.data.length == data.width * data.height && data.pos instanceof Array && data.pos.length == 2)
      return new ImageData2D(data.width, data.height, data.data, data.pos);
  }
  
  // >>> 0 will encode a SIGNED int
  encode(noBlob) {
    var output = new Uint32Array(16 + this.data.length);
              //I   m  a   g   e  D  a   t  a  2  D  \n
    output.set([73,109,97,103,101,68,97,116,97,50,68,10,this.width,this.height,this.pos[0] >>> 0,this.pos[1] >>> 0]);
    output.set(this.data,25);
    if (!noBlob)
      return new Blob([output],{type: 'image/imagedata2d'});
    return output;
  }
  
  static decode(data, offset) {          //I   m  a   g   e  D  a   t  a  2  D  \n
    if (data.subarray(0,12).toString() == '73,109,97,103,101,68,97,116,97,50,68,10') {
      var output = new ImageData2D(...data.subarray(12,14),data.subarray(16,16 + data[12] * data[13]),...data.subarray(14,16));
      if (offset)
        //when the file is embeded in another file you may want to know where this file will end
        return [output,16 + data[12] * data[13]];
      return output;
    }
    console.error('ImageData2D decoder was given invalid data');
  }
  
  static compare() {
    for (var i = 1; i < arguments.length; i++)
      if (arguments[i - 1].data.toString() != arguments[i].data.toString() || arguments[i - 1].width != arguments[i].width || arguments[i - 1].height != arguments[i].height)
        return false;
    return true;
  }
  
  compareTo(imagedata) {
    if (this.data.toString() != imagedata.data.toString() || this.width != imagedata.width || this.height != imagedata.height)
      return false;
    return true;
  }
  
  //pixels bottom to top
  static mergePx(pixels) {
    var colors = [], color, i;
    for (i = 0; i < pixels.length; i++) {
      if (pixels[i]) {
        color = pixels[i];
        colors.push([color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255]);
      }
    }
    if (colors.length === 0)
      return [0, 0, 0, 0];
    else if (colors.length == 1)
      return [Math.floor(colors[0][0] * 255), Math.floor(colors[0][1] * 255), Math.floor(colors[0][2] * 255), Math.floor(colors[0][3] * 255)];
    var under, over, newColor = [];
    for (i = 1; i < colors.length; i++) {
      if (newColor.length === 0)
        under = colors[0].slice(0);
      else
        under = newColor.slice(0);
      over = colors[i].slice(0);
      newColor[3] = 1 - (1 - over[3]) * (1 - under[3]);
      if (newColor[3] < 0.001) {
        newColor = [0, 0, 0, 0];
      } else {
        newColor[0] = over[0] * over[3] / newColor[3] + under[0] * under[3] * (1 - over[3]) / newColor[3];
        newColor[1] = over[1] * over[3] / newColor[3] + under[1] * under[3] * (1 - over[3]) / newColor[3];
        newColor[2] = over[2] * over[3] / newColor[3] + under[2] * under[3] * (1 - over[3]) / newColor[3];
      }
    }
    return [Math.floor(newColor[0] * 255), Math.floor(newColor[1] * 255), Math.floor(newColor[2] * 255), Math.floor(newColor[3] * 255)];
  }
  
  display() {
    var pixel, result = [];
    for (var i = 0; i < this.width * this.height; i++) {
      pixel = new Uint8Array(this.data.buffer.slice(i * 4, i * 4 + 4)).toString() + ', ';
      while (pixel.length < 20) {
        pixel += ' ';
      }
      result.push(pixel);
      if ((result.length - 1) % this.width === 0)
        result[result.length - 1] += '\n';
    }
    return result.join('');
  }
  
  clone() {
    return new ImageData2D(this.width,this.height,new Uint32Array(this.data.buffer.slice(0)),[this.pos[0],this.pos[1]]);
  }
  
  setPx(x, y, color, aa, merge) {
    color = color.slice(0);
    if (aa && (x - Math.floor(x) > 0.001 || y - Math.floor(y) > 0.001)) {
      if (Math.floor(color[3] * (x - Math.floor(x)) * (1 - (y - Math.floor(y)))) > 0)
        this.setPx(Math.floor(x + 1), Math.floor(y), [color[0], color[1], color[2], color[3] * (x - Math.floor(x)) * (1 - (y - Math.floor(y)))], false, true);
      if (Math.floor(color[3] * (1 - (x - Math.floor(x))) * (y - Math.floor(y))) > 0)
        this.setPx(Math.floor(x), Math.floor(y + 1), [color[0], color[1], color[2], color[3] * (1 - (x - Math.floor(x))) * (y - Math.floor(y))], false, true);
      if (Math.floor(color[3] * (x - Math.floor(x)) * (y - Math.floor(y))) > 0)
        this.setPx(Math.floor(x + 1), Math.floor(y + 1), [color[0], color[1], color[2], color[3] * (x - Math.floor(x)) * (y - Math.floor(y))], false, true);
      color[3] *= (1 - (x - Math.floor(x))) * (1 - (y - Math.floor(y)));
      x = Math.floor(x);
      y = Math.floor(y);
    } else {
      x = Math.round(x);
      y = Math.round(y);
    }
    if (merge || aa)
      color = ImageData2D.mergePx([this.getPx(x,y),color]);
    color = [clamp(Math.floor(color[0]),0,255), clamp(Math.floor(color[1]),0,255), clamp(Math.floor(color[2]),0,255), Math.floor(color[3])];
    if (x > -1 && y > -1 && x < this.width && y < this.height)
      this.data[y * this.width + x] = color[0] | (color[1] << 8) | (color[2] << 16) | (color[3] << 24);
  }
  
  setArea(image, x, y, width, height) {
    if (!x)
      x = 0;
    if (!y)
      y = 0;
    if (!width) {
      width = image.width;
      height = image.height;
    }
    //all this math just ensures that we never iterate over the edge of the image
    //but the size of the resulting image will always be as expected
    //its the same code as in getArea
    var c0 = width - (width + x < this.width ? 0 : width + x - this.width), c1 = height - (height + y < this.height ? 0 : height + y - this.height), c2 = x < 0 ? -x : 0, c3 = y < 0 ? -y : 0;
    if (image.width > c2 && image.height > c3 && x < this.width && y < this.height)
      for (var yy = c3; yy < c1; yy++)
        this.data.set(image.data.subarray(yy * image.width + c2, yy * image.width + c0), (yy + y) * this.width + x + c2);
    return this;
  }
  
  getPx(x, y) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return [this.data[y * this.width + x] & 255,(this.data[y * this.width + x] & 65280) >> 8,(this.data[y * this.width + x] & 16711680) >> 16,(this.data[y * this.width + x] & 4278190080) >>> 24];
    return [];
  }
  
  getArea(x, y, width, height) {
    if (!x)
      x = 0;
    if (!y)
      y = 0;
    width = Math.round(width);
    height = Math.round(height);
    var c0 = width - (width + x < this.width ? 0 : width + x - this.width), c1 = height - (height + y < this.height ? 0 : height + y - this.height), c2 = x < 0 ? -x : 0, c3 = y < 0 ? -y : 0, image = new ImageData2D(width,height);
    for (var yy = c3; yy < c1; yy++)
      image.data.set(this.data.subarray((y + yy) * this.width + x + c2, (y + yy) * this.width + x + c0), yy * width + c2);
    return image;
  }
  
  clearPx(x, y) {
    this.setPx(x, y, [0, 0, 0, 0]);
  }
  
  clearArea(x, y, width, height, color) {
    if (!x)
      x = 0;
    if (!y)
      y = 0;
    width = Math.round(width);
    height = Math.round(height);
    if (x < 1 && y < 1 && width >= this.width && height >= this.height)
      this.clear(color);
    else {
      var row = new Uint32Array(width - (width + x < this.width ? 0 : width + x - this.width)), c0 = height - (height + y < this.height ? 0 : height + y - this.height), c1 = x < 0 ? -x : 0, c2 = y < 0 ? -y : 0;
      if (color)
        row.fill(color[0] | (color[1] << 8) | (color[2] << 16) | (color[3] << 24));
      if (width > c1 && height > c2)
        for (var yy = c2; yy < c0; yy++)
          this.data.set(row, (yy + y) * this.width + x + c1);
    }
    return this;
  }
  
  clear(color) {
    if (color)
      this.data.fill(color[0] | (color[1] << 8) | (color[2] << 16) | (color[3] << 24));
    else
      this.data = new Uint32Array(this.width * this.height);
    return this;
  }
  
  isClear() {
    //after a lot of testing and a little bit of graphing, 340 is the theshold where
    //row-by-row becomes faster than all-at-once
    if (this.width > 340) {
      for (var y = 0; y < this.height; y++)
        if (this.data.subarray(y * this.width,(y + 1) * this.width).toString() != new Uint32Array(this.width).toString())
          return false;
      return true;
    } else
      return (this.data.toString() == new Uint32Array(this.data.length));
  }
  
  merge(image, pos) {
    pos = pos || image.pos;
    ImageData2D.canvas0.width = this.width;
    ImageData2D.canvas1.width = this.width;
    ImageData2D.canvas0.height = this.height;
    ImageData2D.canvas1.height = this.height;
    ImageData2D.ctx0.putImageData(this.toImageData(), ...this.pos);
    ImageData2D.ctx1.drawImage(ImageData2D.canvas0, 0, 0);
    ImageData2D.ctx0.clearRect(0,0,this.width,this.height);
    ImageData2D.ctx0.putImageData(image.toImageData(), ...pos);
    ImageData2D.ctx1.drawImage(ImageData2D.canvas0, 0, 0);
    this.data = new Uint32Array(ImageData2D.ctx1.getImageData(0,0,this.width,this.height).data.buffer);
    return this;
  }
  
  toPNG(mimetype) {
    ImageData2D.canvas0.width = this.width;
    ImageData2D.canvas0.height = this.height;
    ImageData2D.ctx0.putImageData(this.toImageData(),0,0);
    return new Blob([ImageData2D.canvas0.toDataURL(mimetype)],{type: mimetype || 'image/png'});
  }
  
  line(from, to, color, aa, degDist) {
    if (degDist) {
      to[0] = Math.round(from[0] + Math.sin(degRad(to[0])) * to[1]);
      to[1] = Math.round(from[1] + -Math.cos(degRad(to[0])) * to[1]);
    }
    var c0 = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
    for (var i = 0; i <= c0; i++)
      this.setPx(...inter(from,to,i / c0), color, aa);
    return this;
  }
  
  rect(pos, size, color, fillColor) {
    for (var x = pos[0]; x < pos[0] + size[0]; x++) {
      this.setPx(x, pos[1], color);
      this.setPx(x, pos[1] + size[1] - 1, color);
    }
    for (var y = pos[1]; y < pos[1] + size[1]; y++) {
      this.setPx(pos[0], y, color);
      this.setPx(pos[0] + size[0] - 1, y, color);
    }
    if (fillColor)
      this.clearArea(pos[0] + 1,pos[1] + 1,size[0] - 2,size[1] - 2,fillColor);
    return this;
  }
  
  circle(pos, radius, color, fillColor, aa) {
    var x, y;
    for (y = -radius + pos[1] < 0 ? -(-radius + pos[1]) + -radius : -radius; y <= this.height - (radius + pos[1] > this.height ? radius + pos[1] - this.height : 0); y++) {
      x = Math.sqrt(Math.pow(radius, 2) - Math.pow(y, 2));
      if (fillColor && y > -radius && y < radius)
        this.data.set(new Uint32Array(x * 2).fill(fillColor[0] | (fillColor[1] << 8) | (fillColor[2] << 16) | (fillColor[3] << 24)),(y + pos[1]) * this.width + -x + pos[0] + 1);
      this.setPx(x + pos[0], y + pos[1], color, aa);
      this.setPx(-x + pos[0], y + pos[1], color, aa);
    }
    for (x = -radius; x <= radius; x++) {
      y = Math.sqrt(Math.pow(radius, 2) - Math.pow(x, 2));
      this.setPx(x + pos[0], y + pos[1], color, aa);
      this.setPx(x + pos[0], -y + pos[1], color, aa);
    }
    return this;
  }
  
  /*
   I may have over-optimized this slightly! hahaha
   Check out the original code:
   
   http://jeremykun.com/2013/05/11/bezier-curves-and-picasso/
   */
  bezierCurve(from, control0, control1, to, color, aa) {
    var curve = [from, control0, control1, to], midpoints = [curve, [], [], []], i, j, k = 0;
    if (Math.max(Math.pow(3 * curve[1][0] - 2 * curve[0][0] - curve[3][0], 2), Math.pow(3 * curve[2][0] - curve[0][0] - 2 * curve[3][0], 2)) + Math.max(Math.pow(3 * curve[1][1] - 2 * curve[0][1] - curve[3][1], 2), Math.pow(3 * curve[2][1] - curve[0][1] - 2 * curve[3][1], 2)) <= 1) {
      for (i = 1; i < curve.length; i++)
        this.line(curve[i - 1], curve[i], color, aa);
      //for (i = 0; i < curve.length; i++)
      //  this.setPx(curve[i][0],curve[i][1],color,aa);
    } else {
      for (j = 3; j < 9; j++) {
        midpoints[k + 1][j % (midpoints[k].length - 1)] = [(midpoints[k][j % (midpoints[k].length - 1)][0] + midpoints[k][j % (midpoints[k].length - 1) + 1][0]) / 2, (midpoints[k][j % (midpoints[k].length - 1)][1] + midpoints[k][j % (midpoints[k].length - 1) + 1][1]) / 2];
        k = midpoints[k].length - 1 == midpoints[k + 1].length ? k + 1 : k;
      }
      this.curve(midpoints[0][0], midpoints[1][0], midpoints[2][0], midpoints[3][0], color, aa);
      this.curve(midpoints[3][0], midpoints[2][1], midpoints[1][2], midpoints[0][3], color, aa);
    }
    return this;
  }
  
  //I broke my personal record for longest single statement that actually does something useful
  //unlike the cubic curve this is all my code as is the recusive version
  //refactoring the inter function literally halfed the length!
  //and its now a lot easier to read
  quadCurveIter(from, control, to, color, aa) {
    var c0 = Math.max(Math.abs(from[0] - control[0]), Math.abs(from[1] - control[1]), Math.abs(control[0] - to[0]),Math.abs(control[1] - to[1])) / 10/*low numbers are slower but more accurate*/, prevpoint = from, point;
    for (var i = 1; i <= c0; i++) {
      point = [inter(inter(from[0],control[0],i / c0),inter(control[0],to[0],i / c0),i / c0), inter(inter(from[1],control[1],i / c0),inter(control[1],to[1],i / c0),i / c0)];
      this.line(prevpoint,point,color,aa);
      prevpoint = point;
    }
    return this;
  }
  /*
   here is a slightly less confusing but still pretty confusing version
   
   the only reason i use the above is because its shorter (sort of) faster
   
   quadCurveIter(from, control, to, color, aa) {
     var c0 = Math.max(Math.abs(from[0] - control[0]), Math.abs(from[1] - control[1]), Math.abs(control[0] - to[0]),Math.abs(control[1] - to[1])) / 5, prevpoint = from, p0, p1, p2;
     for (var i = 1; i <= c0; i++) {
       p0 = inter(from,control,i / c0);
       p1 = inter(control,to,i / c0);
       p2 = inter(point0,point1,i / c0);
       this.line(prevpoint,p2,color,aa);
       prevpoint = p2;
     }
     return this;
   };
   
   benchmarks show that both iter and recu are fast. they both have the same performance. 
   they work in different ways but the perform the same you can choose which one to use because it really doesnt matter
   */
  
  quadCurveRecu(from, control, to, color, aa) {
    if (Math.max(Math.abs(from[0] - control[0]),Math.abs(from[1] - control[1]),Math.abs(control[0] - to[0]),Math.abs(control[1] - to[1])) < 10/*low numbers are slower but more accurate*/) {
      this.line(from,control,color,aa);
      this.line(control,to,color,aa);
    } else {
      this.quadCurveRecu(from,[(from[0] + control[0]) / 2, (from[1] + control[1]) / 2],[(((from[0] + control[0]) / 2) + ((control[0] + to[0]) / 2)) / 2, (((from[1] + control[1]) / 2) + ((control[1] + to[1]) / 2)) / 2],color,aa);
      this.quadCurveRecu([(((from[0] + control[0]) / 2) + ((control[0] + to[0]) / 2)) / 2, (((from[1] + control[1]) / 2) + ((control[1] + to[1]) / 2)) / 2],[(control[0] + to[0]) / 2,(control[1] + to[1]) / 2],to,color,aa);
    }
    return this;
  }
  //i hate this function. it works but its really slow. i cant think of any way to make it any faster
  //thats just the nature of the algorithm. every pixel has to be check individually. there's no way around it
  //unless there is something i've missed?...
  
  //find the nearest edge
  //follow it around
  //row-by-row somehow?
  fill(pos, color, image) {
    if (!image)
      image = this;
    var initColor = image.getPx(pos[0],pos[1]), callList = [pos], stringList = [callList[0].toString()], curr, i;
    if (color.toString() != initColor.toString()) {
      while (callList.length) {
        /*
        Didn't work properly until I added the console.log! Why does that keep happening?!
        console.log(callList.length,callList.display());
        */
        curr = callList[0];
        if (image.getPx(curr[0] - 1, curr[1]).toString() == initColor.toString() && !stringList.includes(([curr[0] - 1, curr[1]]).toString())) {
          i = callList.push([curr[0] - 1, curr[1]]);
          stringList.push(callList[i - 1].toString());
        }
        if (image.getPx(curr[0], curr[1] - 1).toString() == initColor.toString() && !stringList.includes(([curr[0], curr[1] - 1]).toString())) {
          i = callList.push([curr[0], curr[1] - 1]);
          stringList.push(callList[i - 1].toString());
        }
        if (image.getPx(curr[0] + 1, curr[1]).toString() == initColor.toString() && !stringList.includes(([curr[0] + 1, curr[1]]).toString())) {
          i = callList.push([curr[0] + 1, curr[1]]);
          stringList.push(callList[i - 1].toString());
        }
        if (image.getPx(curr[0], curr[1] + 1).toString() == initColor.toString() && !stringList.includes(([curr[0], curr[1] + 1]).toString())) {
          i = callList.push([curr[0], curr[1] + 1]);
          stringList.push(callList[i - 1].toString());
        }
        this.setPx(curr[0], curr[1], color);
        callList = callList.slice(1);
      }
    }
    return this;
  }
  
  path(from, to, color, image) {
    if (!image)
      image = this;
    var callList = [[to[0], to[1], 0]], stringList = [callList[0].toString()], curr = [to[0], to[1], 0], i, j, initColor = image.getPx(to[0], to[1]), pathway = [], pathGrid = new ArrayGrid(image.width, image.height);
    while (!(curr[0] == from[0] && curr[1] == from[1])) {
      if (image.getPx(curr[0] - 1, curr[1]).toString() == initColor.toString() && stringList.indexOf(([curr[0] - 1, curr[1], curr[2] + 1]).toString()) == -1) {
        i = callList.push([curr[0] - 1, curr[1], curr[2] + 1]);
        stringList.push(callList[i - 1].toString());
      }
      if (image.getPx(curr[0], curr[1] - 1).toString() == initColor.toString() && stringList.indexOf(([curr[0], curr[1] - 1, curr[2] + 1]).toString()) == -1) {
        i = callList.push([curr[0], curr[1] - 1, curr[2] + 1]);
        stringList.push(callList[i - 1].toString());
      }
      if (image.getPx(curr[0] + 1, curr[1]).toString() == initColor.toString() && stringList.indexOf(([curr[0] + 1, curr[1], curr[2] + 1]).toString()) == -1) {
        i = callList.push([curr[0] + 1, curr[1], curr[2] + 1]);
        stringList.push(callList[i - 1].toString());
      }
      if (image.getPx(curr[0], curr[1] + 1).toString() == initColor.toString() && stringList.indexOf(([curr[0], curr[1] + 1, curr[2] + 1]).toString()) == -1) {
        i = callList.push([curr[0], curr[1] + 1, curr[2] + 1]);
        stringList.push(callList[i - 1].toString());
      }
      pathGrid.setPx(curr[0], curr[1], curr[2]);
      callList = callList.slice(1);
      stringList = stringList.slice(1);
      if (callList[0] === undefined)
        return false;
      curr = callList[0];
    }
    j = curr[2];
    while (j !== 0) {
      pathway.push([curr[0], curr[1]]);
      if (image.getPx(curr[0] - 1, curr[1]) == (j - 1)) {
        j--;
        curr = [curr[0] - 1, curr[1]];
      } else if (image.getPx(curr[0], curr[1] - 1) == (j - 1)) {
        j--;
        curr = [curr[0], curr[1] - 1];
      } else if (image.getPx(curr[0] + 1, curr[1]) == (j - 1)) {
        j--;
        curr = [curr[0] + 1, curr[1]];
      } else if (image.getPx(curr[0], curr[1] + 1) == (j - 1)) {
        j--;
        curr = [curr[0], curr[1] + 1];
      }
    }
    pathway.push(to);
    if (!color)
      return pathway;
    else
      for (i = 0; i < pathway.length; i++)
        image.setPx(pathway[i][0], pathway[i][1], color);
    return this;
  }
  
  /*polygon(pos, sides, radius, rotation, color, aa) {
    for (var i = 0; i < sides; i++)
      this.line([Math.floor(radius * Math.cos(2 * Math.PI * (i / sides + rotation)) + pos[0]), Math.floor(radius * Math.sin(2 * Math.PI * (i / sides + rotation)) + pos[1])], [Math.floor(radius * Math.cos(2 * Math.PI * ((i + 1 == sides ? 0 : i + 1) / sides + rotation)) + pos[0]), Math.floor(radius * Math.sin(2 * Math.PI * ((i + 1 == sides ? 0 : i + 1) / sides + rotation)) + pos[1])], color, aa);
    return this;
  }*/
  
  backdrop(backImage, applyImage, repeatBack, repeatApply, progress) {
    var x, y, i, c0 = (!repeatApply && applyImage instanceof ImageData2D ? applyImage.pos[0] * applyImage.pos[1] : 0), c1 = (!repeatApply && applyImage instanceof ImageData2D ? (applyImage.pos[0] + applyImage.width) * (applyImage.pos[1] + applyImage.height) : this.width * this.height);
    for (i = c0; i < c1; i++) {
      x = i % this.width;
      y = (i - x) / this.width;
      if (backImage.getPx((x - backImage.pos[0]) % (repeatBack ? backImage.width : 1), (y - backImage.pos[1]) % (repeatBack ? backImage.height : 1)).toString() == this.getPx(x, y).toString())
        this.setPx(x, y, applyImage.getPx((x - applyImage.pos[0]) % (repeatApply ? applyImage.width : 1), (y - applyImage.pos[1]) % (repeatApply ? applyImage.height : 1)));
      if (progress && x === 0 && y % 4 === 0) {
        if (progress(i / this.data.length)) {
          console.error('Canceled backdrop');
          return;
        }
      }
    }
    if (progress)
      progress(1);
    return this;
  }
  //kernal convolution filter
  applyKCFilter(filter, args, progress) {
    /*
     args[0]        Boolean applyRed
     args[1]        Boolean applyGreen
     args[2]        Boolean applyBlue
     args[3]        Boolean applyAlpha
     args[4]        Number edge      what do at the edge of the image
                    0         extend the edge pixels out (default)
                    1         wrap from the opposite side
                    Array[4]  put args[4]
     */
    var x, xx, y, yy, sums = [0, 0, 0, 0], result = new ImageData2D(this.width,this.height), i, j, k, pixel;
    for (i = 0; i < this.data.length; i++) {
      x = i % this.width;
      y = (i - x) / this.width;
      for (j = 0; j < filter.length; j++) {
        xx = j % filter.size[0];
        yy = (j - xx) / filter.size[0];
        if (!this.getPx(x + xx - ((filter.size[0] - 1) / 2),y + yy - ((filter.size[1] - 1) / 2)).length) {
          if (!args[4])
            pixel = this.getPx(clamp(x + xx - ((filter.size[0] - 1) / 2),0,this.width - 1),clamp(y + yy - ((filter.size[1] - 1) / 2),0,this.height - 1));
          else if (args[4] == 1)
            pixel = this.getPx((x + xx - ((filter.size[0] - 1) / 2) + this.width) % this.width,(y + yy - ((filter.size[1] - 1) / 2) + this.height) % this.height);
          else if (args[4].length == 4)
            pixel = [args[4][0], args[4][1], args[4][2], args[4][3]];
        } else
          pixel = this.getPx(x + xx - ((filter.size[0] - 1) / 2),y + yy - ((filter.size[1] - 1) / 2));
        for (k = 0; k < 4; k++)
          if (args[k])
            sums[k] += pixel[k] * filter[j];
      }
      for (k = 0; k < 4; k++) {
        if (args[k])
          pixel[k] = Math.round(sums[k] / (filter.divisor ? filter.divisor : 1) + (filter.offset ? filter.offset : 0));
        else
          pixel[k] = this.getPx(x,y)[k];
        sums[k] = 0;
      }
      result.setPx(x,y,pixel);
      if (progress && x === 0 && y % 4 === 0) {
        if (progress(i / this.data.length)) {
          console.error('Canceled applyKCFilter');
          return;
        }
      }
    }
    if (progress)
      progress(1);
    return result;
  }
  //javascript filter
  applyJSFilter(filter, args, progress) {
    /*
     args[ >= 0]     all yours
     */
    var result = new ImageData2D(this.width, this.height), x, y;
    for (var i = 0; i < this.data.length; i++) {
      x = i % this.width;
      y = (i - x) / this.width;
      result.setPx(x, y, filter(x, y, this.getPx(x, y), args));
      if (progress && x === 0 && y % 4 === 0) {
        if (progress(i / this.data.length)) {
          console.error('Canceled applyJSFilter');
          return;
        }
      }
    }
    if (progress)
      progress(1);
    return result;
  }
  //this could obviouly be optimized but its called to infrequently that it really doesnt matter
  minMax(trans, origin) {
    origin = origin || [0, 0];
    return [
      Math.min(new Vector([origin[0],origin[1],1]).multiplyMatrix(trans)[0], new Vector([this.width + origin[0],origin[1],1]).multiplyMatrix(trans)[0], new Vector([origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[0], new Vector([this.width + origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[0]),
      Math.min(new Vector([origin[0],origin[1],1]).multiplyMatrix(trans)[1], new Vector([this.width + origin[0],origin[1],1]).multiplyMatrix(trans)[1], new Vector([origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[1], new Vector([this.width + origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[1]),
      Math.max(new Vector([origin[0],origin[1],1]).multiplyMatrix(trans)[0], new Vector([this.width + origin[0],origin[1],1]).multiplyMatrix(trans)[0], new Vector([origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[0], new Vector([this.width + origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[0]),
      Math.max(new Vector([origin[0],origin[1],1]).multiplyMatrix(trans)[1], new Vector([this.width + origin[0],origin[1],1]).multiplyMatrix(trans)[1], new Vector([origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[1], new Vector([this.width + origin[0],this.height + origin[1],1]).multiplyMatrix(trans)[1])
    ];
  }
  
  size(trans) {
    if (trans instanceof Matrix)
      trans = this.minMax(trans);
    return [trans[2] - trans[0], trans[3] - trans[1]];
  }
  
  static rotate(angle) {
    return new Matrix(3,3,[Math.cos(degRad(angle)),-Math.sin(degRad(angle)),0,Math.sin(degRad(angle)),Math.cos(degRad(angle)),0,0,0,1]);
  }
  
  static scale(x,y) {
    return new Matrix(3,3,[x,0,0,0,y,0,0,0,1]);
  }
  
  static skew(x,y) {
    return new Matrix(3,3,[1,x,0,y,1,0,0,0,1]);
  }
  
  static horiReflect() {
    return new Matrix(3,3,[-1,0,0,0,1,0,0,0,1]);
  }
  
  static vertReflect() {
    return new Matrix(3,3,[1,0,0,0,-1,0,0,0,1]);
  }
  
  static reflect(angle) {
    return new Matrix(3,3,[1 - degGra(angle) * degGra(angle),2 * degGra(angle),0,degGra(angle),degGra(angle) * degGra(angle) - 1,0,0,0,1]).multiplyScalar(1 / (1 + degGra(angle) * degGra(angle)));
  }
  
  //i have to somehow figure out how to fragment this!
  //transform is applyed with origin in center then pos is chnaged depending on the given origin
  applyTransform(trans, origin, progress) {
    origin = origin || [0, 0];
    var x, y, oldPos, newTrans = trans.inverse(), minMax = this.minMax(trans, origin), newSize = this.size(minMax), newImage = new ImageData2D(Math.round(newSize[0]),Math.round(newSize[1]));
    for (var i = 0; i < (newSize[0]) * (newSize[1]); i++) {
      x = (i % newSize[0]) - Math.floor(newSize[0] / 2);
      y = ((i - (i % newSize[0])) / newSize[0]) - Math.floor(newSize[1] / 2);
      oldPos = new Vector([x, y, 1]).multiplyMatrix(newTrans);
      newImage.setPx(x + Math.floor(newSize[0] / 2), y + Math.floor(newSize[1] / 2), this.getPx(Math.floor(oldPos[0] + (this.width / 2)), Math.floor(oldPos[1] + (this.height / 2))));
      if (progress && x === 0 && y % 4 === 0) {
        if (progress(i / this.data.length)) {
          console.error('Canceled applyTransform');
          return;
        }
      }
    }
    newImage.pos = [minMax[0], minMax[1]];
    if (progress)
      progress(1);
    return newImage;
  }
  
  //fragment and assemble fragments are used if you want to divide the job into fragments
  //and process each of those fragments on a web worker. sadly, the performance is pretty much the same
  //this probably because of 
  
  //we need edge overlap for KCFilter
  fragment(frags, edgeOverlap) {
    var fragments = [], x, y;
    frags = Math.floor(frags);
    edgeOverlap = Math.floor(edgeOverlap) || 0;
    if (frags == 1) {
      fragments = [new Fragment(this,[0,0],0,this.width,this.height)];
    } else if (Math.sqrt(frags) == Math.floor(Math.sqrt(frags))) {//square number we do something fancy!
      for (y = 0; y < Math.sqrt(frags); y++)
        for (x = 0; x < Math.sqrt(frags); x++)
          fragments.push(new Fragment(this.getArea(Math.floor(x / Math.sqrt(frags) * this.width) - edgeOverlap,Math.floor(y / Math.sqrt(frags) * this.height) - edgeOverlap,Math.floor(this.width / Math.sqrt(frags)) + edgeOverlap * 2,Math.floor(this.height / Math.sqrt(frags)) + edgeOverlap * 2),[Math.floor(x / Math.sqrt(frags) * this.width),Math.floor(y / Math.sqrt(frags) * this.height)],edgeOverlap, this.width, this.height));
    } else {//rows instead of grid
      for (y = 0; y < frags; y++)
        fragments.push(new Fragment(this.getArea(-edgeOverlap,Math.floor(y / Math.sqrt(frags) * this.width) - edgeOverlap,this.width + edgeOverlap * 2,Math.floor(this.height / frags) + edgeOverlap * 2),[0,Math.floor(y / Math.sqrt(frags) * this.width)],edgeOverlap, this.width, this.height));
    }
    return fragments;
  }
  
  static assembleFragments(frags) {
    if (frags.length == 1)
      return new ImageData2D(frags[0].width,frags[0].height,frags[0].data);
    var image = new ImageData2D(frags[0].wholeWidth,frags[0].wholeHeight), pos;
    for (var i = 0; i < frags.length; i++) {
      /*all fragsments should have the same overlap and same size
      i was going to make a FragmentGroup class but I think that would be kind of weird because
      when you separate the fragments you would have to store the data store in the group.
      the most logical hting to do is to store the info mation in each of the fragments
      that way you don't have to worry about that separate infomation
      
      BTW, getArea returns an ImageData2D so the position is lost
      */
      pos = frags[i].pos;
      if (frags[i].overlap)
        frags[i] = frags[i].getArea(frags[i].overlap,frags[i].overlap,frags[i].width - frags[i].overlap * 2,frags[i].height - frags[i].overlap * 2);
      image.setArea(frags[i],pos[0],pos[1]);
    }
    return image;
  }
};

//why the hell isnt this defined in and extended contructor?!
var Fragment = class Fragment extends ImageData2D {
  constructor(image, pos, overlap, width, height) {
    var newThis = image;
    newThis.pos = pos;
    newThis.overlap = overlap;
    newThis.wholeWidth = width;
    newThis.wholeHeight = height;
    return newThis;
  }
};
//even though its called a kernal convolution MATRIX i decided that it didnt need 
//to extend Matrix because it doesn't any of the matrix functions
ImageData2D.KCFilter = class KCFilter extends Array {
  constructor(filter, size, divisor, offset) {
    var newThis = super(filter);
    newThis.size = size;
    newThis.divisor = divisor || 1;
    newThis.offset = offset || 0;
    return newThis;
  }
  
  static fromSerial(data) {
    if (typeof data.size == 'object' && typeof data.divisor == 'number' && typeof data.offset == 'number')
      return new ImageData2D.KCFilter(data, data.size, data.divisor, data.offset);
  }
};

function gaussianBlur(width, height, ampl, stdDevX, stdDevY) {
  var matrix = [];
  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++)
      matrix[y * width + x] = ampl * Math.exp(-((Math.pow(x - ((width - 1) / 2),2) / Math.pow(2 * stdDevX,2)) + (Math.pow(y - ((height - 1) / 2),2) / Math.pow(2 * stdDevY,2))));
  return new ImageData2D.KCFilter(matrix,[width,height],sum(matrix),0);
}

//I don't think native is really the word I'm looking for...
ImageData2D.nativeKCFilter = {
  blur3: new ImageData2D.KCFilter([
     1,  1,  1,
     1,  1,  1,
     1,  1,  1
  ], [3, 3], 9),
  blur5: new ImageData2D.KCFilter([
     1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,
  ], [5, 5], 25),
  blur7: new ImageData2D.KCFilter([
     1,  1,  1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,  1,  1,
     1,  1,  1,  1,  1,  1,  1,
  ], [7, 7], 49),
  horiMotionBlur: new ImageData2D.KCFilter([
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     1,  1,  1,  1,  1,  1,  1,  1,  1,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [9, 9], 9),
  vertMotionBlur: new ImageData2D.KCFilter([
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
  ], [9, 9], 9),
  leftDiagMotionBlur: new ImageData2D.KCFilter([
     1,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  1,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  1,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  1,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  1,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  1,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  1,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  1,
  ], [9, 9], 9),
  rightDiagMotionBlur: new ImageData2D.KCFilter([
     0,  0,  0,  0,  0,  0,  0,  0,  1,
     0,  0,  0,  0,  0,  0,  0,  1,  0,
     0,  0,  0,  0,  0,  0,  1,  0,  0,
     0,  0,  0,  0,  0,  1,  0,  0,  0,
     0,  0,  0,  0,  1,  0,  0,  0,  0,
     0,  0,  0,  1,  0,  0,  0,  0,  0,
     0,  0,  1,  0,  0,  0,  0,  0,  0,
     0,  1,  0,  0,  0,  0,  0,  0,  0,
     1,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [9, 9], 9),
  sharpen: new ImageData2D.KCFilter([
    -1, -1, -1,
    -1,  9, -1,
    -1, -1, -1
  ], [3, 3]),
  edges: new ImageData2D.KCFilter([
    -1, -1, -1,
    -1,  8, -1,
    -1, -1, -1
  ], [3, 3]),
  horiEdges: new ImageData2D.KCFilter([
     0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,
    -1, -1,  4, -1, -1,
     0,  0,  0,  0,  0,
     0,  0,  0,  0,  0
  ], [5, 5]),
  vertEdges: new ImageData2D.KCFilter([
     0,  0, -1,  0,  0,
     0,  0, -1,  0,  0,
     0,  0,  4,  0,  0,
     0,  0, -1,  0,  0,
     0,  0, -1,  0,  0
  ], [5, 5]),
  leftDiagEdges: new ImageData2D.KCFilter([
    -1,  0,  0,  0,  0,
     0, -1,  0,  0,  0,
     0,  0,  4,  0,  0,
     0,  0,  0, -1,  0,
     0,  0,  0,  0, -1
  ], [5, 5]),
  rightDiagEdges: new ImageData2D.KCFilter([
     0,  0,  0,  0, -1,
     0,  0,  0, -1,  0,
     0,  0,  4,  0,  0,
     0, -1,  0,  0,  0,
    -1,  0,  0,  0,  0
  ], [5, 5]),
  enhanceEdges: new ImageData2D.KCFilter([
     1,  1,  1,
     1, -7,  1,
     1,  1,  1
  ], [3, 3]),
  enhanceHoriEdges: new ImageData2D.KCFilter([
     0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,
     1,  1, -3,  1,  1,
     0,  0,  0,  0,  0,
     0,  0,  0,  0,  0
  ], [5, 5]),
  enhanceVertEdges: new ImageData2D.KCFilter([
     0,  0,  1,  0,  0,
     0,  0,  1,  0,  0,
     0,  0, -3,  0,  0,
     0,  0,  1,  0,  0,
     0,  0,  1,  0,  0
  ], [5, 5]),
  enhanceLeftDiagEdges: new ImageData2D.KCFilter([
     1,  0,  0,  0,  0,
     0,  1,  0,  0,  0,
     0,  0, -3,  0,  0,
     0,  0,  0,  1,  0,
     0,  0,  0,  0,  1
  ], [5, 5]),
  enhanceRightDiagEdges: new ImageData2D.KCFilter([
     0,  0,  0,  0,  1,
     0,  0,  0,  1,  0,
     0,  0, -3,  0,  0,
     0,  1,  0,  0,  0,
     1,  0,  0,  0,  0
  ], [5, 5]),
  emboss3: new ImageData2D.KCFilter([
    -1, -1,  0,
    -1,  0,  1,
     0,  1,  1
  ], [3, 3], 1, 127),
  emboss5: new ImageData2D.KCFilter([
     -1, -1, -1, -1,  0,
     -1, -1, -1,  0,  1,
     -1, -1,  0,  1,  1,
     -1,  0,  1,  1,  1,
      0,  1,  1,  1,  1
  ], [5, 5], 1, 127),
  emboss7: new ImageData2D.KCFilter([
     -1, -1, -1, -1, -1, -1,  0,
     -1, -1, -1, -1, -1,  0,  1,
     -1, -1, -1, -1,  0,  1,  1,
     -1, -1, -1,  0,  1,  1,  1,
     -1, -1,  0,  1,  1,  1,  1,
     -1,  0,  1,  1,  1,  1,  1,
      0,  1,  1,  1,  1,  1,  1
  ], [7, 7], 1, 127)
};

ImageData2D.nativeJSFilter = {
  greyscale: function(x, y, color, args) {
    return new Array(3).fill(Math.floor((color[0] + color[1] + color[2]) / 3)).concat(color[3]);
  }/*,'GreyScale','Replaces color with blacks, whites and grays'*/,
  percLumin: function(x, y, color, args) {
    return new Array(3).fill(Math.floor((color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114) / 3)).concat(color[3]);
  }/*,'Perceived Luminance','Similar to greyscale but each channel is weighted to better suit the way the we see color'*/,
  invert: function(x, y, color, args) {
    return [args[0] ? 255 - color[0] : color[0], args[1] ? 255 - color[1] : color[1], args[2] ? 255 - color[2] : color[2], args[3] ? 255 - color[3] : color[3]];
  }/*,'Invert','Inverts the image so that black becomes white and white becomes black etc'*/,
  /*
  On TeX images from  wikipedia, low alpha areas are actually shades of white and the alpha of all the text is 255
  This looks fine if you're putting it on a white background but wont work for any other background
  This function takes the new color of the text as an argument so you can change it to to whatever you like
  */
  wikiMathFix: function(x, y, color, args) {
    if (!args[0])
      args[0] = [0, 0, 0];
    if (color[3] > 0)
      return args[0].concat([255 - (255 * (sum(color.slice(0, 3)) / (255 * 3)))]);
    return [0, 0, 0, 0];
  }/*,'Wikipedia LaTeX fix','Fixs the alpha and optionally changes the color of Wikipedia LaTeX images.\n\n"Wikipedia LaTeX images" are the math equations and other math related images you may find on Wikipedia pages'*/,
  //implementing error diffusal would involve changing the api
  palette: function(x, y, color, args) {
    var minDist = 255 * 255 + 255 * 255 + 255 * 255 + 1, dist, nearest;
    for (i = 0; i < args.length; i++) {
      dist = (color[0] - args[i][0]) * (color[0] - args[i][0]) + 
             (color[1] - args[i][1]) * (color[1] - args[i][1]) + 
             (color[2] - args[i][2]) * (color[2] - args[i][2]) + 
             (color[3] - args[i][3]) * (color[3] - args[i][3]);
      if (dist < minDist) {
        minDist = dist;
        nearest = args[i];
      }
    }
    return nearest;
  }/*,'Color Palette', 'Re-creates the image using only colors from the given palette. If the first color in the palette is true, Floyd-Steinberg error idffusal will be used to give the illusion that more colors than those on the palette are being used'*/,
  brightness: function(x, y, color, args) {
    if (args.length == 1) {
      return [clamp(color[0] + args[0],0,255),clamp(color[1] + args[0],0,255),clamp(color[2] + args[0],0,255),clamp(color[3] + args[0],0,255)];
    } else {
      return [clamp(color[0] + args[0],0,255),clamp(color[1] + args[1],0,255),clamp(color[2] + args[2],0,255),clamp(color[3] + args[3],0,255)];
    }
  }/*,'Brightness adjust',''*/,
  contrast: function(x, y, color, args) {
    if (args.length == 1) {
      var fact = (259 * (args[0] + 255)) / (255 * (259 - args[0]));
      return [fact * (color[0] - 128) + 128,fact * (color[1] - 128) + 128,fact * (color[2] - 128) + 128,color[3]];
    } else if (args.length == 4) {
      return [
        (259 * (args[0] + 255)) / (255 * (259 - args[0])) * (color[0] - 128) + 128,
        (259 * (args[1] + 255)) / (255 * (259 - args[1])) * (color[1] - 128) + 128,
        (259 * (args[2] + 255)) / (255 * (259 - args[2])) * (color[2] - 128) + 128,
        (259 * (args[3] + 255)) / (255 * (259 - args[3])) * (color[3] - 128) + 128
     ];
    }
  }/*,'Contrast adjust','If a single argument is given, the contrast will be set for all channels but if 4 arguments are given, the contrast will be set individually for each channel'*/,
  gammaCorr: function(x, y, color, args) {
    if (args.length == 1) {
      var gammaCorr = 1 / args[0];
      return [255 * Math.pow(color[0] / 255,gammaCorr),255 * Math.pow(color[1] / 255,gammaCorr),255 * Math.pow(color[2] / 255,gammaCorr),color[3]];
    } else if (args.length == 4) {
      return [255 * Math.pow(color[0] / 255,1 / args[0]),255 * Math.pow(color[1] / 255,1 / args[1]),255 * Math.pow(color[2] / 255,1 / args[2]),255 * Math.pow(color[3] / 255,1 / args[3])];
    }
  }/*,'Gamma correction','Corrects the gamma? lol'*/,
  solarise: function(x, y, color, args) {
    if (args.length == 1 || args.length == 2) {
      return [
        args[1] ? (color[0] > args[0] ? 255 - color[0] : color[0]) : (color[0] < args[0] ? 255 - color[0] : color[0]),
        args[1] ? (color[1] > args[0] ? 255 - color[1] : color[1]) : (color[1] < args[0] ? 255 - color[1] : color[1]),
        args[1] ? (color[2] > args[0] ? 255 - color[2] : color[2]) : (color[2] < args[0] ? 255 - color[2] : color[2]),
        color[3],
      ];
    } else if (args.length == 4) {
      return [
        args[0][1] ? (color[0] > args[0][0] ? 255 - color[0] : color[0]) : (color[0] < args[0][0] ? 255 - color[0] : color[0]),
        args[1][1] ? (color[1] > args[1][0] ? 255 - color[1] : color[1]) : (color[1] < args[1][0] ? 255 - color[1] : color[1]),
        args[2][1] ? (color[2] > args[2][0] ? 255 - color[2] : color[2]) : (color[2] < args[2][0] ? 255 - color[2] : color[2]),
        args[3][1] ? (color[3] > args[3][0] ? 255 - color[3] : color[3]) : (color[3] < args[3][0] ? 255 - color[3] : color[3]),
      ];
    }
  }/*,'Solarise','Similar to invert but only inverts if a color value is above or below a set theshold. If the boolean is true then values ABOVE the theshold will be inverted'*/,
};

ImageData2D.canvas0 = document.createElement('canvas');
ImageData2D.canvas0.style.display = 'none';
document.body.appendChild(ImageData2D.canvas0);
ImageData2D.ctx0 = ImageData2D.canvas0.getContext('2d');

ImageData2D.canvas1 = document.createElement('canvas');
ImageData2D.canvas1.style.display = 'none';
document.body.appendChild(ImageData2D.canvas1);
ImageData2D.ctx1 = ImageData2D.canvas1.getContext('2d');
