"use strict";

module.exports = function (grunt) {



    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('arboreal.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> (<%= pkg.author.email %>);' +
                ' Licensed <%= _.map(pkg.licenses, "type").join(", ") %>; See MIT-LICENSE.txt for more info*/\n',
        // Task configuration.
        clean: {
            files: ['lib/arboreal.min.js']
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: true
            },
            dist: {
                files: [{
                        'lib/arboreal.min.js': 'lib/arboreal.js',
                    }]
            }
        },
        jshint: {
            options: {
                jshintrc: true,
                reporterOutput: "",
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['lib/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '',
                tasks: ['', '']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            },
        },
        qunit: {
            files: ['test/**/*.html']
        },

    jsdoc : {
        dist : {
	    expand: true,
            src: ['lib/**/*.js', 'README.md'],
            options: {
                destination: 'docs/doc',
               template : "node_modules/ink-docstrap/template",
              configure : "jsdoc.json",
            }
        }
    },


    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsdoc');


    // Default task.
    grunt.registerTask('default', ['clean', 'jshint', 'qunit', 'jsdoc','uglify']);

};