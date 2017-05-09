module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          style: 'expanded',
          sourcemap: 'auto'
        },
        files: {
          'css/style.css':'sass/style.scss',
          'css/plugin.css':'sass/plugin.scss',
        }
      }
    },
    watch: {
      sass: {
        files: ["**/*.scss", "js/**/*.js", "index.html", "plugin.html"],
        tasks: ['build']
      }
    },
    processhtml: {
        build: {
            files: {
              'build/web/index.html': ['index.html'],
              'build/plugin/plugin.html': ['plugin.html']
            }
        }
    },
    uglify: {
        target: {
          files: {
            'js/web.min.js': ['js/tictactoe.js', 'js/web.js'],
            'js/plugin.min.js': ['js/tictactoe.js', 'js/plugin.js'],
          }
        }
    },
    copy: {
      web: {
        files: [
          {expand: true, src: ['js/web.min.js'], dest: 'build/web/'},
          {expand: true, src: ['css/style.min.css'], dest: 'build/web/'},
          {expand: true, src: ['bower_components/**/*'], dest: 'build/web/'},
        ],
      },
      plugin: {
        files: [
          {expand: true, src: ['js/plugin.min.js'], dest: 'build/plugin/'},
          {expand: true, src: ['manifest.json'], dest: 'build/plugin/'},
          {expand: true, src: ['css/plugin.min.css'], dest: 'build/plugin/'},
          {expand: true, src: ['bower_components/**/*'], dest: 'build/plugin/'},
          {expand: true, src: ['img/**/*'], dest: 'build/plugin/'},
        ],
      },
    },
    cssmin: {
      main: {
        files: [{
          expand: true,
          cwd: 'css',
          src: ['*.css', '!*.min.css'],
          dest: 'css',
          ext: '.min.css'
        }]
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src : [
            'build/web/css/**/*.css',
            'build/plugin/css/**/*.css',
          ]
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "./",
            directory: true
          }

        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  // Default task(s).
  grunt.registerTask('build', ['sass','cssmin','uglify','copy','processhtml']);
  grunt.registerTask('default', ['build','browserSync','watch']);


};
