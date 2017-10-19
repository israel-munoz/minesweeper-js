/*! Minesweeper JS - Records controller
    v1.0.0
    Israel Munoz <israel.munoz.v@gmail.com>
    https://github.com/israel-munoz/minesweeper-js

    Stores records using IndexedDB with Local Storage as fallback
 */
window.records = (function () {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: 'readwrite'};
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    function openIdb(success, error) {
        var request = window.indexedDB.open('records', 1);
        request.onerror = function (event) {
            error();
        };
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            var os = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
            os.createIndex('time', 'time', { unique: false });
        };
        request.onsuccess = function (event) {
            success(event.target.result);
        };
    }

    function getFromDb(callback) {
        openIdb(function (db) {
            var store = db.transaction('records').objectStore('records');
            var data = [];
            store.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    data.push(cursor.value);
                    cursor.continue();
                } else if (callback) {
                    callback(data);
                }
            }
        });
    }

    function insertIntoDb(item, callback) {
        openIdb(function (db) {
            var store = db.transaction('records', 'readwrite').objectStore('records');
            var request = store.add(item);
            request.onsuccess = function () {
                if (callback) {
                    callback();
                }
            };
        });
    }

    function clearIdb(callback) {
        openIdb(function (db) {
            var store = db.transaction('records', 'readwrite').objectStore('records');
            var request = store.clear();
            request.onsuccess = function () {
                if (callback) {
                    callback();
                }
            };
            request.onerror = function () {
                debugger;
            }
        })
    }

    function getFromStorage(callback) {
        var value = localStorage.getItem('records') || '[]';
        var data = JSON.parse(value);
        if (callback) {
            callback(data);
        }
    }

    function saveStorage(data, callback) {
        var json = JSON.stringify(data);
        localStorage.setItem('records', json);
        if (callback) {
            callback();
        }
    }

    function insertIntoStorage(item, callback) {
        getFromStorage(function (data) {
            item.id = data.length + 1;
            data.push(item);
            saveStorage(data, callback);
        });
    }

    function clearStorage(callback) {
        localStorage.removeItem('records');
        if (callback) {
            callback();
        }
    }

    function getRecordsList(callback) {
        var success = function (data) {
            data.sort(function (a, b) {
                return a.time - b.time;
            });
            if (callback) {
                callback(data);
            }
        }
        if (window.indexedDB) {
            getFromDb(success); 
        } else {
            getFromStorage(success);
        }
    }

    function addRecord(name, time, callback) {
        var item = { name: name, time: time };
        if (window.indexedDB) {
            insertIntoDb(item, callback);
        } else {
            insertIntoStorage(item, callback);
        }
    }

    function clearRecords(callback) {
        clearIdb(function () {
            clearStorage(callback);
        });
    }

    return {
        getRecordsList: getRecordsList,
        addRecord: addRecord,
        clearRecords: clearRecords
    }
})();
