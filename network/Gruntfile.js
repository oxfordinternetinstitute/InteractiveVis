/*jshint camelcase: false*/

module.exports = function (grunt) {
    'use strict';

    // load all grunt tasks
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var config = {
        app: '',
        dist: 'dist',
        tmp: 'dist/temp',
        distMac32: 'dist/macOS',
        distMac64: 'dist/macOS',
        distLinux32: 'dist/Linux32',
        distLinux64: 'dist/Linux64',
        distWin: 'dist/Win',
        resources: 'resources'
    };

    grunt.initConfig({
        bump: {
            options: {
                files: ['package.json','www/package.json','bower.json'],
                updateConfigs: [],
                commit: false,
                commitMessage: '',
                createTag: false,
                push: false,
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
        jsdoc: {
            dist: {
                src: ['js/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        postcss: {
            options: {
                map: false, // inline sourcemaps
                processors: [
                    require('autoprefixer')() // add vendor prefixes
                    // require('cssnano')() // minify the result
                ]
            },
            dist: {
                src: 'css/style.css'
            }
        },
        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 5, // maximum number of notifications from jshint output // defaults to the name in package.json, or will use project directory's name
                success: true, // whether successful grunt executions should be notified automatically
                duration: 3 // the duration of notification in seconds, for `notify-send only
            }
        },
        browserify: {
            dist: {
                files: {
                    'js/main.min.js': ['js/main.js'],
                },
                options: {
                    fullPaths: false,
                    postBundleCB: function (err, src, next) {
                        // HACK: save Node's `require` before it gets overrided by browserify
                        next(err, "if (typeof require !== 'undefined') {nodeRequire = require;} " + src)
                    }
                }
            }
        },
        bower_concat: {
            all: {
                dest: 'js/_bower.js',
                mainFiles: {
                    'graham_scan': 'src/graham_scan.js'
                }
                // exclude: ['components-font-awesome','lato', 'moment']
            }
        },
        concat: {
            js: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/*.js'
                ],
                dest: 'js/main.min.js'
            },
        },
        uglify: {
            js: {
                files: {
                    'js/main.min.js': ['js/main.min.js']
                }
            }
        },
        less: {
            style: {
                files: {
                    'css/style.css': 'less/style.less'
                }
            }
        },
        watch: {
            js: {
                files: ['src/*.js'],
                tasks: ['jshint', 'concat:js'],
                options: {
                    livereload: false
                }
            },
            css: {
                files: ['less/*.less'],
                tasks: ['less:style','postcss:dist'],
                options: {
                    livereload: false,
                }
            }
        },
        config: config,
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.dist %>/*',
                        '<%= config.tmp %>/*'
                    ]
                }]
            },
            distMac32: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.distMac32 %>/*',
                        '<%= config.tmp %>/*'
                    ]
                }]
            },
            distMac64: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.distMac64 %>/*',
                        '<%= config.tmp %>/*'
                    ]
                }]
            },
            distLinux64: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.distLinux64 %>/*',
                        '<%= config.tmp %>/*'
                    ]
                }]
            },
            distLinux32: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.distLinux32 %>/*',
                        '<%= config.tmp %>/*'
                    ]
                }]
            },
            distWin: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.distWin %>/*',
                        '<%= config.tmp %>/*'
                    ]
                }]
            }
        },
        jshint: {
            // options: {
            //     jshintrc: '.jshintrc'
            // },
            files: ['src/*.js']
        },
        copy: {
            appLinux: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.distLinux64 %>/app.nw',
                    src: '**'
                }]
            },
            appLinux32: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.distLinux32 %>/app.nw',
                    src: '**'
                }]
            },
            appMacos32: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.distMac32 %>/nwjs.app/Contents/Resources/app.nw',
                    src: '**'
                }, {
                    expand: true,
                    cwd: '<%= config.resources %>/mac/',
                    dest: '<%= config.distMac32 %>/nwjs.app/Contents/',
                    filter: 'isFile',
                    src: '*.plist'
                }, {
                    expand: true,
                    cwd: '<%= config.resources %>/mac/',
                    dest: '<%= config.distMac32 %>/nwjs.app/Contents/Resources/',
                    filter: 'isFile',
                    src: '*.icns'
                }]
            },
            appMacos64: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.distMac64 %>/nwjs.app/Contents/Resources/app.nw',
                    src: '**'
                }, {
                    expand: true,
                    cwd: '<%= config.resources %>/mac/',
                    dest: '<%= config.distMac64 %>/nwjs.app/Contents/',
                    filter: 'isFile',
                    src: '*.plist'
                }, {
                    expand: true,
                    cwd: '<%= config.resources %>/mac/',
                    dest: '<%= config.distMac64 %>/nwjs.app/Contents/Resources/',
                    filter: 'isFile',
                    src: '*.icns'
                }]
            },
            webkit32: {
                files: [{
                    expand: true,
                    cwd: '<%=config.resources %>/node-webkit/MacOS32',
                    dest: '<%= config.distMac32 %>/',
                    src: '**'
                }]
            },
            webkit64: {
                files: [{
                    expand: true,
                    cwd: '<%=config.resources %>/node-webkit/MacOS64',
                    dest: '<%= config.distMac64 %>/',
                    src: '**'
                }]
            },
            copyWinToTmp: {
                files: [{
                    expand: true,
                    cwd: '<%= config.resources %>/node-webkit/Windows/',
                    dest: '<%= config.tmp %>/',
                    src: '**'
                }]
            }
        },
        compress: {
            appToTmp: {
                options: {
                    archive: '<%= config.tmp %>/app.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    src: ['**']
                }]
            },
            finalWindowsApp: {
                options: {
                    archive: '<%= config.distWin %>/netCanvas.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.tmp %>',
                    src: ['**']
                }]
            }
        },
        rename: {
            macApp32: {
                files: [{
                    src: '<%= config.distMac32 %>/nwjs.app',
                    dest: '<%= config.distMac32 %>/netCanvas.app'
                }]
            },
            macApp64: {
                files: [{
                    src: '<%= config.distMac64 %>/nwjs.app',
                    dest: '<%= config.distMac64 %>/netCanvas.app'
                }]
            },
            zipToApp: {
                files: [{
                    src: '<%= config.tmp %>/app.zip',
                    dest: '<%= config.tmp %>/app.nw'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('watch', [ 'watch' ]);

    grunt.registerTask('chmod32', 'Add lost Permissions.', function () {
        var fs = require('fs'),
        path = config.distMac32 + '/netCanvas.app/Contents/';
        if (fs.existsSync(path + 'Frameworks/node-webkit Helper EH.app/Contents/MacOS/node-webkit Helper EH')) {
            fs.chmodSync(path + 'Frameworks/node-webkit Helper EH.app/Contents/MacOS/node-webkit Helper EH', '555');
        } else {
            fs.chmodSync(path + 'Frameworks/nwjs Helper EH.app/Contents/MacOS/nwjs Helper EH', '555');
        }
        if (fs.existsSync(path + 'Frameworks/node-webkit Helper NP.app/Contents/MacOS/node-webkit Helper NP')) {
            fs.chmodSync(path + 'Frameworks/node-webkit Helper NP.app/Contents/MacOS/node-webkit Helper NP', '555');
        } else {
            fs.chmodSync(path + 'Frameworks/nwjs Helper NP.app/Contents/MacOS/nwjs Helper NP', '555');
        }
        if (fs.existsSync(path + 'Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper')) {
            fs.chmodSync(path + 'Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper', '555');
        } else {
            fs.chmodSync(path + 'Frameworks/nwjs Helper.app/Contents/MacOS/nwjs Helper', '555');
        }
        if (fs.existsSync(path + 'MacOS/node-webkit')) {
            fs.chmodSync(path + 'MacOS/node-webkit', '555');
        } else {
            fs.chmodSync(path + 'MacOS/nwjs', '555');
        }
    });

    grunt.registerTask('chmod64', 'Add lost Permissions.', function () {
        var fs = require('fs'),
        path = config.distMac64 + '/netCanvas.app/Contents/';
        if (fs.existsSync(path + 'Frameworks/node-webkit Helper EH.app/Contents/MacOS/node-webkit Helper EH')) {
            fs.chmodSync(path + 'Frameworks/node-webkit Helper EH.app/Contents/MacOS/node-webkit Helper EH', '555');
        } else {
            fs.chmodSync(path + 'Frameworks/nwjs Helper EH.app/Contents/MacOS/nwjs Helper EH', '555');
        }
        if (fs.existsSync(path + 'Frameworks/node-webkit Helper NP.app/Contents/MacOS/node-webkit Helper NP')) {
            fs.chmodSync(path + 'Frameworks/node-webkit Helper NP.app/Contents/MacOS/node-webkit Helper NP', '555');
        } else {
            fs.chmodSync(path + 'Frameworks/nwjs Helper NP.app/Contents/MacOS/nwjs Helper NP', '555');
        }
        if (fs.existsSync(path + 'Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper')) {
            fs.chmodSync(path + 'Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper', '555');
        } else {
            fs.chmodSync(path + 'Frameworks/nwjs Helper.app/Contents/MacOS/nwjs Helper', '555');
        }
        if (fs.existsSync(path + 'MacOS/node-webkit')) {
            fs.chmodSync(path + 'MacOS/node-webkit', '555');
        } else {
            fs.chmodSync(path + 'MacOS/nwjs', '555');
        }
    });

    grunt.registerTask('createLinuxApp', 'Create linux distribution.', function (version) {
        var done = this.async();
        var childProcess = require('child_process');
        var exec = childProcess.exec;
        var path = './' + (version === 'Linux64' ? config.distLinux64 : config.distLinux32);
        exec('mkdir -p ' + path + '; cp resources/node-webkit/' + version + '/nw.pak ' + path + ' && cp resources/node-webkit/' + version + '/nw ' + path + '/node-webkit && cp resources/node-webkit/' + version + '/icudtl.dat ' + path + '/icudtl.dat', function (error, stdout, stderr) {
            var result = true;
            if (stdout) {
                grunt.log.write(stdout);
            }
            if (stderr) {
                grunt.log.write(stderr);
            }
            if (error !== null) {
                grunt.log.error(error);
                result = false;
            }
            done(result);
        });
    });

    grunt.registerTask('createWindowsApp', 'Create windows distribution.', function () {
        var done = this.async();
        var concat = require('concat-files');
        concat([
            'dist/temp/nw.exe',
            'dist/temp/app.nw'
        ], 'dist/temp/netCanvas.exe', function () {
            var fs = require('fs');
            fs.unlink('dist/temp/app.nw', function (error, stdout, stderr) {
                if (stdout) {
                    grunt.log.write(stdout);
                }
                if (stderr) {
                    grunt.log.write(stderr);
                }
                if (error !== null) {
                    grunt.log.error(error);
                    done(false);
                } else {
                    fs.unlink('dist/temp/nw.exe', function (error, stdout, stderr) {
                        var result = true;
                        if (stdout) {
                            grunt.log.write(stdout);
                        }
                        if (stderr) {
                            grunt.log.write(stderr);
                        }
                        if (error !== null) {
                            grunt.log.error(error);
                            result = false;
                        }
                        done(result);
                    });
                }
            });
        });
    });

    grunt.registerTask('createPlistFile', 'set node webkit and app relevant information to a new plist file', function() {
        var resourcesPath = config.resources;
        var nwExecuteable = 'nwjs';

        var infoPlistTmp = grunt.file.read(resourcesPath + '/mac/Info.plist.tmp', {
            encoding: 'UTF8'
        });
        var infoPlist = grunt.template.process(infoPlistTmp, {
            data: {
                nwExecutableName: nwExecuteable,
                version: '5'
            }
        });
        grunt.file.write(resourcesPath + '/mac/Info.plist', infoPlist, {
            encoding: 'UTF8'
        });
    });

    grunt.registerTask('dist-linux', [
        'clean:distLinux64',
        'copy:appLinux',
        'createLinuxApp:Linux64'
    ]);

    grunt.registerTask('dist-linux32', [
        'clean:distLinux32',
        'copy:appLinux32',
        'createLinuxApp:Linux32'
    ]);

    grunt.registerTask('dist-win', [
        'clean:distWin',
        'copy:copyWinToTmp',
        'compress:appToTmp',
        'rename:zipToApp',
        'createWindowsApp',
        'compress:finalWindowsApp'
    ]);

    grunt.registerTask('dist-mac', [
        'clean:distMac64',
        'createPlistFile',
        'copy:webkit64',
        'copy:appMacos64',
        'rename:macApp64',
        'chmod64'
    ]);

    grunt.registerTask('dist-mac32', [
        'clean:distMac32',
        'createPlistFile',
        'copy:webkit32',
        'copy:appMacos32',
        'rename:macApp32',
        'chmod32'
    ]);

    grunt.registerTask('check', [
        'jshint'
    ]);

    grunt.registerTask('dmg', 'Create dmg from previously created app folder in dist.', function () {
        var done = this.async();
        var createDmgCommand = 'resources/mac/package.sh "netCanvas"';
        require('child_process').exec(createDmgCommand, function (error, stdout, stderr) {
            var result = true;
            if (stdout) {
                grunt.log.write(stdout);
            }
            if (stderr) {
                grunt.log.write(stderr);
            }
            if (error !== null) {
                grunt.log.error(error);
                result = false;
            }
            done(result);
        });
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-jsdoc');

    // This is required if you use any options.
    grunt.task.run('notify_hooks');


};
