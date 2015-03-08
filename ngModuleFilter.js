var through = require('through2');
var moduleInfoParser = require("./moduleInfoParser")
var FileDependenciesTracker = require("./FileDependenciesTracker");
var path = require('path');

module.exports = function (options) {
    var tracker = new FileDependenciesTracker(options.appModule);
    var files = [];

    var stream = through.obj(function (file, enc, cb) {
        moduleInfoParser(file.contents.toString()).forEach(function (moduleDep) {
            tracker.register(moduleDep.name, path.dirname(file.path), moduleDep.dependencies);
        });
        files.push(file);
        cb();
    }, function (cb) {
        files.
            filter(function (file) {
                var fileIsRequired = tracker.fileIsRequired(file.path);
                if (!fileIsRequired) {
                    console.log(file.path + " is not required for " + options.appModule);
                }
                return fileIsRequired;
            }).
            forEach(function (file) {
                stream.push(file);
            });
        cb();
    });
    return stream;
};