var EventEmitter_ts_1 = require('../../base/EventEmitter.ts');
var $ = require("jquery");
var _ = require("lodash");
var d3 = require("d3");
var DEBOUNCE_TIME = 1000;
/**
* Represents a timescale
*/
/* @Mixin(EventEmitter)*/
var TimeScale = (function () {
    /**
     * Constructor for the timescale
     */
    function TimeScale(element, dimensions) {
        this._dimensions = { width: 500, height: 500 };
        this._eventEmitter = new EventEmitter_ts_1.default();
        this.element = element;
        this.x = d3.time.scale();
        this.y = d3.scale.linear();
        this.buildTimeScale();
        if (!this.dimensions) {
            this.resizeElements();
        }
        else {
            this.dimensions = dimensions;
        }
    }
    Object.defineProperty(TimeScale.prototype, "data", {
        /**
         * Returns the data contained in this timescale
         */
        get: function () {
            return this._data;
        },
        /**
         * Setter for the data
         */
        set: function (data) {
            this._data = data;
            this.x.domain(d3.extent(data.map(function (d) { return d.date; })));
            this.y.domain([0, d3.max(data.map(function (d) { return d.value; }))]);
            this.resizeElements();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeScale.prototype, "events", {
        /**
         * Gets an event emitter by which events can be listened to
         * Note: Would be nice if we could mixin EventEmitter
         */
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeScale.prototype, "dimensions", {
        /**
         * Gets the dimensions of this timescale
         */
        get: function () {
            return this._dimensions;
        },
        /**
         * Sets the dimensions of this timescale
         */
        set: function (value) {
            $.extend(this._dimensions, value);
            this.resizeElements();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeScale.prototype, "selectedRange", {
        /**
         * Sets the currently selected range of dates
         */
        set: function (range) {
            function selectedRangeChanged() {
                var _this = this;
                // One is set, other is unset
                if ((!range || !this._range) && (range || this._range)) {
                    return true;
                }
                if (range && this._range) {
                    // Length of Array Changed
                    if (range.length !== this._range.length) {
                        return true;
                    }
                    else {
                        // Check each date
                        range.forEach(function (v, i) {
                            if (v.getTime() !== _this._range[i].getTime()) {
                                return true;
                            }
                        });
                    }
                }
                return false;
            }
            function redrawRange() {
                this.brush.extent(range);
                this.brush(d3.select(this.element.find(".brush")[0]));
            }
            if (selectedRangeChanged.bind(this)()) {
                this._range = range;
                if (range && range.length) {
                    redrawRange.bind(this)();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Builds the initial timescale
     */
    TimeScale.prototype.buildTimeScale = function () {
        var _this = this;
        this.svg = d3.select(this.element[0]).append("svg");
        this.clip = this.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect");
        this.context = this.svg.append("g")
            .attr("class", "context");
        this.bars = this.context.append("g")
            .attr("class", "bars")
            .style("fill", "rgba(0,100,200,.5)");
        this.xAxis = this.context.append("g")
            .attr("class", "x axis");
        var brushed = _.debounce(function () {
            _this.events.raiseEvent("rangeSelected", _this.brush.empty() ? [] : _this.brush.extent());
        }, DEBOUNCE_TIME);
        this.brush = d3.svg.brush().on("brush", brushed);
    };
    /**
     * Resizes all the elements in the graph
     */
    TimeScale.prototype.resizeElements = function () {
        var _this = this;
        var margin = { top: 0, right: 10, bottom: 20, left: 10 }, width = this._dimensions.width - margin.left - margin.right, height = this._dimensions.height - margin.top - margin.bottom;
        this.x.range([0, width]);
        this.y.range([0, height]);
        if (this.bars && this._data) {
            var tmp = this.bars
                .selectAll("rect")
                .data(this._data);
            tmp
                .enter().append("rect");
            tmp
                .attr("transform", function (d, i) {
                var rectHeight = _this.y(d.value);
                return "translate(" + _this.x(d.date) + "," + (height - rectHeight) + ")";
            })
                .style({ "width": 2 })
                .style("height", function (d) {
                return _this.y(d.value);
            });
            tmp.exit().remove();
        }
        this.svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        this.clip
            .attr("width", width)
            .attr("height", height);
        this.xAxis
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(this.x).orient("bottom"));
        this.context
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        this.brush.x(this.x);
        // Need to recreate the brush element for some reason
        d3.selectAll(this.element.find(".x.brush").toArray()).remove();
        this.brushEle = this.context.append("g")
            .attr("class", "x brush")
            .call(this.brush)
            .selectAll("rect")
            .attr("height", height + 7)
            .attr("y", -6);
        this.brushGrip = d3.select(this.element.find(".x.brush")[0])
            .selectAll(".resize").append("rect")
            .attr('x', -3)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr("y", (height / 2) - 15)
            .attr("width", 6)
            .attr("fill", "lightgray")
            .attr("height", 30);
    };
    return TimeScale;
})();
exports.TimeScale = TimeScale;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZVNjYWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVGltZVNjYWxlLnRzIl0sIm5hbWVzIjpbIlRpbWVTY2FsZSIsIlRpbWVTY2FsZS5jb25zdHJ1Y3RvciIsIlRpbWVTY2FsZS5kYXRhIiwiVGltZVNjYWxlLmV2ZW50cyIsIlRpbWVTY2FsZS5kaW1lbnNpb25zIiwiVGltZVNjYWxlLnNlbGVjdGVkUmFuZ2UiLCJUaW1lU2NhbGUuc2VsZWN0ZWRSYW5nZS5zZWxlY3RlZFJhbmdlQ2hhbmdlZCIsIlRpbWVTY2FsZS5zZWxlY3RlZFJhbmdlLnJlZHJhd1JhbmdlIiwiVGltZVNjYWxlLmJ1aWxkVGltZVNjYWxlIiwiVGltZVNjYWxlLnJlc2l6ZUVsZW1lbnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxnQ0FBeUIsNEJBQTRCLENBQUMsQ0FBQTtBQUN0RCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsSUFBWSxDQUFDLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDNUIsSUFBWSxFQUFFLFdBQU0sSUFBSSxDQUFDLENBQUE7QUFFekIsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBRTNCOztFQUVFO0FBQ0YseUJBQXlCO0FBQ3pCO0lBa0JJQTs7T0FFR0E7SUFDSEEsbUJBQVlBLE9BQWVBLEVBQUVBLFVBQWdCQTtRQVJyQ0MsZ0JBQVdBLEdBQXVDQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxNQUFNQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUM5RUEsa0JBQWFBLEdBQUdBLElBQUlBLHlCQUFZQSxFQUFFQSxDQUFDQTtRQVF2Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDdkJBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQVFBLENBQUNBO1FBQy9CQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxL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R0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFFcERBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO2FBQ2pEQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQTthQUNsQkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFcEJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO2FBQzlCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUU5QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7YUFDL0JBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLENBQUNBO2FBQ3JCQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBRXpDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTthQUNoQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFFN0JBLElBQUlBLE9BQU9BLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBO1lBQ3JCQSxLQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxlQUFlQSxFQUFFQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxLQUFJQSxDQUFD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