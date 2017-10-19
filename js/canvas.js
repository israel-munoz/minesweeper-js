/*! Minesweeper JS - Canvas extensions
    v1.0.0
    Israel Munoz <israel.munoz.v@gmail.com>
    https://github.com/israel-munoz/minesweeper-js

    Extension to simplify canvas drawing functions.
 */
HTMLCanvasElement.prototype.utils = (function () {
    var _context;
    var _defaults;

    function getContext() {
        return _context;
    }

    function setDefaults(values) {
        _defaults = _defaults || {};
        if (values.width) {
            _defaults.width = values.width;
            this.canvas.width = values.width;
        }
        if (values.height) {
            _defaults.height = values.height;
            this.canvas.height = values.height;
        }
        _defaults.fillColor = values.fillColor || '#fff';
        _defaults.lineColor = values.lineColor || null;
        _defaults.lineWidth = values.lineWidth || 1;
    }

    function clear() {
        this.drawRect(_defaults, 0, 0, _defaults.width, _defaults.height);
    }
    
    function drawLine(styles, fromX, fromY, toX, toY) {
        var ctx = getContext();
        ctx.lineWidth = styles.lineWidth || _defaults.lineWidth;
        ctx.strokeStyle = styles.lineColor;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
    }

    function drawPath(styles, startX, startY, points, closePath) {
        var ctx = getContext();
        var i, j = points.length;
        var point;
        ctx.lineWidth = styles.lineWidth || _defaults.lineWidth;
        ctx.strokeStyle = styles.lineColor;
        ctx.fillStyle = styles.fillColor || 'transparent';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        for (i = 0; i < j; i += 1) {
            point = points[i];
            if (point.length) {
                ctx.bezierCurveTo(
                    point[0], // cp1x
                    point[1], // cp1y
                    point[2], // cp2x
                    point[3], // cp2y
                    point[4], // x
                    point[5]  // y
                );
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        if (closePath) {
            ctx.lineTo(startX, startY);
        }
        ctx.stroke();
        if (ctx.fillStyle !== 'transparent') {
            ctx.fill();
        }
    }

    function drawRect(styles, x, y, width, height) {
        var ctx = getContext(),
            fill, line;
        if (styles.fillColor) {
            fill = true;
            ctx.fillStyle = styles.fillColor;
        }
        if (styles.lineWidth || styles.lineColor) {
            line = true;
            ctx.strokeStyle = styles.lineColor;
            ctx.lineWidth = styles.lineWidth || 1;
        }
        var x1 = x,
            y1 = y,
            x2 = x + width,
            y2 = y + height;
        ctx.beginPath();
        if (styles.borderRadius) {
            var r = styles.borderRadius,
                mr = r / 2;
            ctx.moveTo(x1 + r, y1);
            ctx.lineTo(x2 - r, y1);
            ctx.stroke();
            ctx.bezierCurveTo(
                x2 - mr, y1,
                x2, y1 + mr,
                x2, y1 + r);
                ctx.stroke();
            ctx.lineTo(x2, y2 - r);
            ctx.stroke();
            ctx.bezierCurveTo(
                x2, y2 - mr,
                x2 - mr, y2,
                x2 - r, y2);
                ctx.stroke();
            ctx.lineTo(x1 + r, y2);
            ctx.stroke();
            ctx.bezierCurveTo(
                x1 + mr, y2,
                x1, y2 - mr,
                x1, y2 - r);
            ctx.stroke();
            ctx.lineTo(x1, y1 + r);
            ctx.stroke();
            ctx.bezierCurveTo(
                x1, y1 + mr,
                x1 + mr, y1,
                x1 + r, y1);
            ctx.stroke();
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (line) {
            ctx.stroke();
        }
    }

    function drawCurve(styles, startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY, closePath) {
        var ctx = getContext();
        ctx.strokeStyle = styles.lineColor;
        ctx.lineWidth = styles.lineWidth;
        ctx.fillStyle = ctx.fillColor || null;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        if (closePath) {
            ctx.lineTo(startX, startY);
            ctx.fill();
        }
        ctx.stroke();
    }

    function drawCircle(styles, centerX, centerY, radiusSize) {
        var ctx = getContext();
        ctx.fillStyle = styles.fillColor;
        ctx.strokeStyle = styles.lineColor;
        ctx.lineWidth = styles.lineWidth;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radiusSize, 0, Math.PI * 2, false);
        ctx.fill();
        if (styles.lineColor && styles.lineWidth) {
            ctx.stroke();
        }
    }

    function drawText(styles, text, x, y, width) {
        var ctx = getContext();
        ctx.fillStyle = styles.fontColor;
        ctx.textAlign = styles.textAlign || 'center';
        ctx.textBaseline = styles.textBaseline || 'middle';
        ctx.font = [styles.fontSize, styles.fontFamily].join(' ');
        ctx.fillText(text, x, y, width);
    }

    function init() {
        _context = this.getContext('2d');
        return {
            canvas: this,
            setDefaults: setDefaults,
            clear: clear,
            drawLine: drawLine,
            drawPath: drawPath,
            drawRect: drawRect,
            drawCurve: drawCurve,
            drawCircle: drawCircle,
            drawText: drawText
        };
    }

    return init;
})();
