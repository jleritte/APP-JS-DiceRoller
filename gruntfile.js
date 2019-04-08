module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        esnext: true,
        asi: true,
        debug: true
      },
      files: {
        src: ['js/*.js']
      }
    },
    browserify: {
      dist: {
        options: {
          transform: [['babelify',{presets: ['es2015','react']}]],
          browserifyOptions: {
            paths: [
              'js',
              'js/**'
            ]
          }
        },
        src: ['js/Roller.js'],
        dest: 'resources/app.js',
      }
    },
    uglify: {
      build: {
        src: 'resources/app.js',
        dest: 'resources/app.min.js'
      },
      map: {
        options: {
          sourceMap: true
        },
        files: {
          'resources/app.min.js': ['resources/app.js']
        }
      }
    },
    watch: {
      js: {
        files: ['js/*.js','js/*.json'],
        tasks: ['jshint','browserify','uglify'],
        options: {
          atBegin: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');


  grunt.registerTask('default', ['jshint','browserify','uglify']);

};