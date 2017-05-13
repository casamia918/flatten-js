"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Alex Bol on 2/18/2017.
 */

/**
 *
 * @param Flatten
 */
module.exports = function (Flatten) {
    /**
     *
     * Class representing a point
     * @type {Point}
     */
    Flatten.Point = function () {
        /**
         *
         * @param {number} x - x-coordinate (float number)
         * @param {number} y - y-coordinate (float number)
         */
        function Point() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            _classCallCheck(this, Point);

            /**
             * x-coordinate (float number)
             * @type {number}
             */
            this.x = Number.isNaN(x) ? 0 : x;
            /**
             * y-coordinate (float number)
             * @type {number}
             */
            this.y = Number.isNaN(y) ? 0 : y;
        }

        /**
         * Returns bounding box of a point
         * @returns {Box}
         */


        _createClass(Point, [{
            key: "clone",


            /**
             * Method clone returns new instance of Point
             * @returns {Point}
             */
            value: function clone() {
                return new Flatten.Point(this.x, this.y);
            }

            /**
             * Returns true if points are equal up to DP_TOL tolerance
             * @param {Point} pt
             * @returns {boolean}
             */

        }, {
            key: "equalTo",
            value: function equalTo(pt) {
                return Flatten.Utils.EQ(this.x, pt.x) && Flatten.Utils.EQ(this.y, pt.y);
            }

            /**
             * Defines predicate "less than" between points. Need for spatial index
             * @param pt - other point
             * @returns {boolean} - true if this point less than other points, false otherwise
             */

        }, {
            key: "lessThan",
            value: function lessThan(pt) {
                if (Flatten.Utils.LT(this.y, pt.y)) return true;
                if (Flatten.Utils.EQ(this.y, pt.y) && Flatten.Utils.LT(this.x, pt.x)) return true;
                return false;
            }

            /**
             * Returns new point rotated by given angle around given center point.
             * If center point is omitted, rotates around zero point (0,0).
             * @param {number} angle - angle in radians, positive value defines rotation
             * in counter clockwise direction, negative - clockwise
             * @param {Point} [center=(0,0)] center
             * @returns {Point}
             */

        }, {
            key: "rotate",
            value: function rotate(angle) {
                var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { x: 0, y: 0 };

                var x_rot = center.x + (this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle);
                var y_rot = center.y + (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle);

                return new Flatten.Point(x_rot, y_rot);
            }

            /**
             * Returns new point translated by given vector.
             * Translation vector may by also defined by a pair of numbers dx, dy
             * @param {Vector} vector - translation vector
             * @returns {Point}
             */

        }, {
            key: "translate",
            value: function translate() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                if (args.length == 0) {
                    return this.clone();
                }

                if (args.length == 1 && args[0] instanceof Flatten.Vector) {
                    return new Flatten.Point(this.x + args[0].x, this.y + args[0].y);
                }

                if (args.length == 2 && typeof args[0] == "number" && typeof args[1] == "number") {
                    return new Flatten.Point(this.x + args[0], this.y + args[1]);
                }

                throw Flatten.Errors.ILLEGAL_PARAMETERS;
            }

            /**
             * Returns projection point on given line
             * @param {Line} line - line this point be projected on
             * @returns {Point}
             */

        }, {
            key: "projectionOn",
            value: function projectionOn(line) {
                if (this.equalTo(line.pt)) // this point equal to line anchor point
                    return this.clone();

                var vec = new Flatten.Vector(this, line.pt);
                if (Flatten.Utils.EQ_0(vec.cross(line.norm))) // vector to point from anchor point collinear to normal vector
                    return this.clone();

                var dist = vec.dot(line.norm); // signed distance
                var proj_vec = line.norm.multiply(dist);
                return this.translate(proj_vec);
            }

            /**
             * Returns true if point is on "left" semi plane. Left semi plane is where line normal vector points to
             * @param line
             * @returns {boolean}
             */

        }, {
            key: "leftTo",
            value: function leftTo(line) {
                var vec = new Flatten.Vector(line.pt, this);
                var onLeftSemiPlane = Flatten.Utils.GT(vec.dot(line.norm), 0);
                return onLeftSemiPlane;
            }

            /**
             * Returns distance between point and other shape
             * @param {Shape} shape
             * @returns {number}
             */

        }, {
            key: "distanceTo",
            value: function distanceTo(shape) {
                if (shape instanceof Point) {
                    var vec = new Flatten.Vector(this, shape);
                    return vec.length;
                }

                if (shape instanceof Flatten.Line) {
                    var _vec = new Flatten.Vector(this, this.projectionOn(shape));
                    return _vec.length;
                }

                if (shape instanceof Flatten.Circle) {
                    var dist2pc = this.distanceTo(shape.pc);
                    return Math.abs(dist2pc - shape.r);
                }

                if (shape instanceof Flatten.Segment) {
                    return shape.distanceToPoint(this);
                }

                if (shape instanceof Flatten.Arc) {
                    return shape.distanceToPoint(this);
                }
            }

            /**
             * Returns true if point is on shape
             * @param {Shape} shape
             * @returns {boolean}
             */

        }, {
            key: "on",
            value: function on(shape) {
                if (shape instanceof Flatten.Point) {
                    return this.equalTo(shape);
                }

                if (shape instanceof Flatten.Line) {
                    return shape.contains(this);
                }

                if (shape instanceof Flatten.Circle) {
                    return shape.contains(this);
                }

                if (shape instanceof Flatten.Segment) {
                    return shape.contains(this);
                }

                if (shape instanceof Flatten.Arc) {
                    return shape.contains(this);
                }
            }

            /**
             * Return string to draw point in svg as circle with radius "r", default is r:"5"
             * @param attrs - json structure with any attributes allowed to svg circle element,
             * like "r", "stroke", "strokeWidth", "fill"
             * Defaults are r:"5", stroke:"black", strokeWidth:"1", fill:"red"
             * @returns {string}
             */

        }, {
            key: "svg",
            value: function svg() {
                var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { r: "5", stroke: "black", strokeWidth: "1", fill: "red" };
                var r = attrs.r,
                    stroke = attrs.stroke,
                    strokeWidth = attrs.strokeWidth,
                    fill = attrs.fill;

                return "\n<circle cx=\"" + this.x + "\" cy=\"" + this.y + "\" r=\"" + r + "\" stroke=\"" + stroke + "\" stroke-width=\"" + strokeWidth + "\" fill=\"" + fill + "\" />";
            }
        }, {
            key: "box",
            get: function get() {
                return new Flatten.Box(this.x, this.y, this.x, this.y);
            }
        }]);

        return Point;
    }();

    /**
     * Function to create point equivalent to "new" constructor
     * @param args
     */
    Flatten.point = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return new (Function.prototype.bind.apply(Flatten.Point, [null].concat(args)))();
    };
};