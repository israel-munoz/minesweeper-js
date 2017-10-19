/*! Minesweeper JS - Main script
    v1.0.0
    Israel Munoz <israel.munoz.v@gmail.com>
    https://github.com/israel-munoz/minesweeper-js
 */
(function() {
    var states = {
        stopped: 0,
        playing: 1,
        won: 2,
        failed: 3
    };
    var state = states.stopped;
    var bomb = '•';
    var bombs = 10;
    var matrix = [];
    var visible = [];
    var flagged = [];
    var bombsArray = [];
    var clickingBoard = false;
    var time = {
        start: 0,
        end: 0,
        count: 0,
        clockInterval: null,
        drawInterval: null,
        frame: 1000 / 60
    };
    var canvasSize = {
        w: 420,
        h: 500
    };
    var buttonProps = {
        w: 50,
        h: 50,
        x: (canvasSize.w - 50) / 2,
        y: 10
    };
    var clockProps = {
        x: 10,
        y: 10,
        w: 100,
        h: 50
    };
    var boardProps = {
        x: 10,
        y: 90,
        w: 400,
        h: 400
    };
    var size = {
        c: 10,
        r: 10
    };
    var showButton = document.querySelector('button.records-show');
    var closeButton = document.querySelector('.records button.close');
    var element = document.querySelector('canvas');
    var canvas = element.utils();
    var board = [size.c, size.r];
    var colors = {
        blue: '#00f',
        green: 'green',
        brown: 'brown',
        red: 'red',
        darkblue: '#00008b',
        darkyellow: '#8da75b',
        darkgreen: '#254b1f',
        orange: '#ff8c00',
        white: '#fff',
        black: '#000',
        yellow: '#ff0',
        gray: '#ccc'
    };
    var numberColors = {
        1: 'blue',
        2: 'green',
        3: 'brown',
        4: 'darkblue',
        5: 'darkyellow',
        6: 'darkgreen',
        7: 'orange',
        8: 'red'
    };

    function getBlockSize() {
        return {
            w: Math.floor(boardProps.w / size.c),
            h: Math.floor(boardProps.h / size.r)
        };
    }

    function getBlockByPosition(x, y) {
        var bs = getBlockSize();
        var res = {
            x: Math.floor(x / bs.w),
            y: Math.floor(y / bs.h)
        };
        res.p = res.x * size.c + res.y;
        return res;
    }

    function drawClock() {
        var min = '0' + Math.floor(time.count / 60).toString();
        var sec = '0' + (time.count - min * 60).toString();
        var display = min.substr(min.length - 2) + ':' + sec.substr(sec.length - 2);
        var bs = getBlockSize();
        canvas.drawRect({ fillColor: colors.black }, clockProps.x, clockProps.y, clockProps.w, clockProps.h);
        canvas.drawText({ fontFamily: 'consolas', fontSize: (bs.h / 1.2) + 'px', fontColor: colors.white },
            display, clockProps.x + clockProps.w / 2, clockProps.y + clockProps.h / 2);
    }

    function drawButton() {
        var x = buttonProps.x,
            y = buttonProps.y,
            w = buttonProps.w,
            h = buttonProps.h;
        canvas.drawRect({ lineColor: colors.black }, x, y, w, h);
        x += w / 2;
        y += h / 2;
        canvas.drawCircle({ fillColor: colors.yellow, lineColor: colors.black, lineWidth: 1 }, x, y, 15);
        if (state === states.failed) {
            canvas.drawLine({ lineColor: colors.black, lineWidth: 1 }, x - 7, y - 7, x - 3, y - 3);
            canvas.drawLine({ lineColor: colors.black, lineWidth: 1 }, x - 7, y - 3, x - 3, y - 7);
            canvas.drawLine({ lineColor: colors.black, lineWidth: 1 }, x + 7, y - 7, x + 3, y - 3);
            canvas.drawLine({ lineColor: colors.black, lineWidth: 1 }, x + 7, y - 3, x + 3, y - 7);
            canvas.drawLine({ lineColor: colors.black, lineWidth: 1 }, x - 8, y + 6, x + 8, y + 6);
        } else {
            canvas.drawCircle({ fillColor: colors.black }, x - 5, y - 5, 2);
            canvas.drawCircle({ fillColor: colors.black }, x + 5, y - 5, 2);
            if (clickingBoard) {
                canvas.drawCircle({ fillColor: colors.black }, x, y + 6, 3)
            } else {
                canvas.drawCurve({ lineColor: colors.black, lineWidth: 1, fillColor: colors.black },
                    x - 8, y + 4, x - 5, y + 11, x + 5, y + 11, x + 8, y + 4, state === states.won);
            }
        }
    }

    function drawNumber(n, x, y) {
        var bs = getBlockSize();
        canvas.drawText(
            {
                fontFamily: 'segoe ui',
                fontSize: (bs.h / 1.5) + 'px',
                fontColor: colors[numberColors[n]] || colors.black
            },
            n, x + bs.w / 2, y + bs.h / 2);
    }

    function drawFlag(x, y) {
        var bs = getBlockSize();
        var unit = bs.h / 40;
        x += bs.w / 2;
        y += bs.h / 2;
        canvas.drawPath(
            { lineColor: colors.brown, fillColor: colors.red, lineWidth: unit * 2 },
            x + unit * 5, y - unit * 6,
            [
                [
                    x - unit * 2, y - unit * 7,
                    x - unit * 1, y - unit,
                    x - unit * 7, y - unit
                ],
                [
                    x - unit * 7, y - unit * 1,
                    x - unit * 3, y + unit * 3,
                    x, y + unit * 3
                ],
                [
                    x + unit * 3, y + unit * 3,
                    x + unit * 5, y + unit,
                    x + unit * 5, y + unit
                ]
            ],
            true
        );
        canvas.drawLine(
            { lineColor: colors.black, lineWidth: unit * 2 },
            x + unit * 5, y - unit * 8,
            x + unit * 5, y + unit * 11
        );
        canvas.drawCircle(
            { fillColor: colors.black },
            x + unit * 5, y - unit * 8,
            unit * 1.8
        );
    }

    function drawBomb(x, y) {
        var bs = getBlockSize();
        var unit = bs.w / 40;
        var style = { fillColor: colors.red, lineColor: colors.red }
        x += bs.w / 2;
        y += bs.h / 2;
        canvas.drawCircle(
            { fillColor: colors.red },
            x, y,
            unit * 5);
        canvas.drawLine(
            style,
            x - unit * 6, y - unit * 6,
            x + unit * 6, y + unit * 6);
        canvas.drawLine(
            style,
            x - unit * 8, y,
            x + unit * 8, y);
        canvas.drawLine(
            style,
            x - unit * 6, y + unit * 6,
            x + unit * 6, y - unit * 6);
        canvas.drawLine(
            style,
            x, y - unit * 8,
            x, y + unit * 8);
    }

    function drawBlock(x, y, v, f, t) {
        var bs = getBlockSize();
        var blockStyle = { lineColor: colors.black, fillColor: v || f ? colors.gray : colors.white };
        x = x * bs.w + boardProps.x;
        y = y * bs.h + boardProps.y;
        canvas.drawRect(blockStyle, x, y, bs.w, bs.h);
        if (f) {
            drawFlag(x, y);
        } else if (v && t === bomb) {
            drawBomb(x, y);
        } else if (v && t > 0) {
            drawNumber(t, x, y);
        }
    }
    
    function getRandom(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function setBombs() {
        var b = [];
        var m = [size.c, size.r];
        var i, j, x, y;
        var set;
        var alreadyAdded = function (item) { return item[0] === x && item[1] === y; };
        for (i = 0; i < bombs; i += 1) {
            set = false;
            while (!set) {
                x = getRandom(size.c);
                y = getRandom(size.r);
                if (!b.find(alreadyAdded)) {
                    b.push([x, y]);
                    set = true;
                }
            }
        }
        return b;
    }

    function getBombsCount(bombs, x, y) {
        var count = 0;
        var pos = [];
        var hasBomb = function (item){ return item[0] === i && item[1] === j; };
        var i, j;
        i = x - 1;
        j = y - 1;
        count += Number(!!bombs.find(hasBomb));
        i = x;
        count += Number(!!bombs.find(hasBomb));
        i = x + 1;
        count += Number(!!bombs.find(hasBomb));
        i = x - 1;
        j = y;
        count += Number(!!bombs.find(hasBomb));
        i = x + 1;
        count += Number(!!bombs.find(hasBomb));
        i = x - 1;
        j = y + 1;
        count += Number(!!bombs.find(hasBomb));
        i = x;
        count += Number(!!bombs.find(hasBomb));
        i = x + 1;
        count += Number(!!bombs.find(hasBomb));
        return count;
    }

    function setMatrix() {
        visible = [];
        flagged = [];
        var b = setBombs();
        var m = [];
        var i, j, k, l, t;
        var hasBomb = function (item) {return item[0] === i && item[1] === j; };
        for (i = 0; i < size.c; i += 1) {
            for (j = 0; j < size.r; j += 1) {
                t = 0;
                if (b.find(hasBomb)) {
                    t = '•';
                } else {
                    t = getBombsCount(b, i, j);
                }
                m.push(t);
            }
        }
        matrix = m;
        bombsArray = b;
    }

    function draw() {
        canvas.clear();
        drawClock();
        drawButton();
        var bs = getBlockSize();
        var i, j, p = 0;
        for (i = 0; i < size.c; i += 1) {
            for (j = 0; j < size.r; j += 1) {
                drawBlock(i, j, visible.indexOf(p) >= 0, flagged.indexOf(p) >= 0, matrix[p]);
                p += 1;
            }
        }
    }

    function buttonClick() {
        start();
        draw();
    }

    function boardClick(x, y) {
        if (state !== states.playing ||
            x < 0 || y < 0 || x >= size.c || y >= size.r) {
            return;
        }
        var p = x * size.c + y;
        if (visible.indexOf(p) < 0) {
            visible.push(p);
            var f = flagged.indexOf(p);
            if (f >= 0) {
                flagged.splice(f, 1);
            }
            if (matrix[p] === bomb) {
                var item, index;
                for (var i = 0; i < bombsArray.length; i += 1) {
                    item = bombsArray[i];
                    index = item[0] * size.c + item[1];
                    visible.push(index);
                    index = flagged.indexOf(index);
                    if (index >= 0) {
                        flagged.splice(index, 1);
                    }
                }
                stop(false);
            } else {
                if (matrix[p] === 0) {
                    setTimeout(function () {
                        boardClick(x, y - 1);
                    }, time.frame);
                    setTimeout(function () {
                        boardClick(x - 1, y);
                    }, time.frame);
                    setTimeout(function () {
                        boardClick(x + 1, y);
                    }, time.frame);
                    setTimeout(function () {
                        boardClick(x, y + 1);
                    }, time.frame);
                }
                if (visible.length === matrix.length - bombs) {
                    stop(true);
                }
            }
        }
        draw();
    }

    function canvasRightClick(x, y) {
        if (state !== states.playing) {
            return;
        }
        var bs = getBlockSize();
        var i, j, p;
        i = Math.floor(x / bs.w);
        j = Math.floor(y / bs.h);
        p = i * size.c + j;
        if (visible.indexOf(p) >= 0) {
            return;
        }
        if (flagged.indexOf(p) < 0) {
            flagged.push(p);
        } else {
            flagged.splice(flagged.indexOf(p), 1);
        }
        draw();
    }

    function startTimer() {
        if (state !== states.playing) {
            state = states.playing;
        }
        time.start = Number(new Date());
        time.count = 0;
        time.clockInterval = setInterval(function () {
            time.count += 1;
        }, 1000);
        time.drawInterval = setInterval(function () {
            draw();
        }, 1000);
        draw();
    }

    function stopTimer() {
        clearInterval(time.clockInterval);
        clearInterval(time.drawInterval);
        time.clockInterval = null;
        time.drawInterval = null;
        time.end = Number(new Date());
    }

    function start() {
        setMatrix();
        state = states.playing;
        startTimer();
    }

    function stop(success) {
        state = success ? states.won : states.failed;
        stopTimer();
        var totalTime = (time.end - time.start) / 1000;
        setTimeout(function () {
            if (success) {
                var r = records.getRecordsList(function (data) {
                    var last = data[9];
                    if (!last || totalTime < last.time) {
                        var name = prompt('SUCCESS!');
                        if (name === null) {
                            return;
                        }
                        while (!name) {
                            name = prompt('Please add your name');
                            if (name === null) {
                                return;
                            }
                        }
                        records.addRecord(name, totalTime);
                        showRecords();
                    } else {
                        alert('SUCCESS!');
                    }
                });
            } else {
                alert('FAIL!');
            }
        }, time.frame * 2);
    }

    function clickLimits(x, y, x1, x2, y1, y2) {
        return (
            x >= x1 &&
            x <= x2 &&
            y >= y1 &&
            y <= y2);
    }

    function boardClicked(x, y) {
        return clickLimits(x, y,
            boardProps.x, boardProps.x + boardProps.w + 1,
            boardProps.y, boardProps.y + boardProps.h - 1);
    }

    function buttonClicked(x, y) {
        return clickLimits(x, y,
            buttonProps.x, buttonProps.x + buttonProps.w + 1,
            buttonProps.y, buttonProps.y + buttonProps.h - 1);
    }

    function createRecordRow(item) {
        var tr = document.createElement('tr'),
            name = document.createElement('td'),
            time = document.createElement('td');
        name.textContent = item.name;
        time.textContent = Math.floor(item.time);
        tr.appendChild(name);
        tr.appendChild(time);
        return tr;
    }

    function fillRecordsTable(data) {
        var panel = document.querySelector('#records'),
            table = panel.querySelector('table > tbody'),
            i, j = data.length;
        if (j > 10) {
            j = 10;
        }
        table.innerHTML = '';
        for (var i = 0; i < j; i += 1) {
            table.appendChild(createRecordRow(data[i]));
        }
    }

    function showRecords() {
        records.getRecordsList(fillRecordsTable);
    }

    element.addEventListener('click', function (e) {
        e.preventDefault();
        var x = e.offsetX;
        var y = e.offsetY;
        if (buttonClicked(x, y)) {
            buttonClick();
        } else if (boardClicked(x, y)) {
            if (state === states.stopped) {
                start();
            }
            var block = getBlockByPosition(e.offsetX - boardProps.x, e.offsetY - boardProps.y);
            boardClick(block.x, block.y);
        }
    });
    element.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        canvasRightClick(e.offsetX - boardProps.x, e.offsetY - boardProps.y);
    });
    element.addEventListener('mousedown', function (e) {
        if (boardClicked(e.offsetX, e.offsetY)) {
            clickingBoard = true;
            draw();
        }
    });
    element.addEventListener('mouseup', function (e) {
        if (boardClicked(e.offsetX, e.offsetY)) {
            clickingBoard = false;
            draw();
        }
    });
    showButton.addEventListener('click', function (e) {
        document.querySelector('#records').classList.add('visible');
    });
    closeButton.addEventListener('click', function (e) {
        document.querySelector('#records').classList.remove('visible');
    });

    canvas.setDefaults({
        width: canvasSize.w,
        height: canvasSize.h,
        lineWidth: 1
    });
    draw();
    showRecords();
})();
