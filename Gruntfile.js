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
        files: "**/*.scss",
        tasks: ['sass','copy']
      }
    },
    copy: {
      web: {
        files: [
          {expand: true, src: ['index.html'], dest: 'build/web/'},
          {expand: true, src: ['js/tictactoe.js'], dest: 'build/web/'},
          {expand: true, src: ['js/web.js'], dest: 'build/web/'},
          {expand: true, src: ['css/style.css'], dest: 'build/web/'},
          {expand: true, src: ['bower_components/**/*'], dest: 'build/web/'},
        ],
      },
      plugin: {
        files: [
          {expand: true, src: ['plugin.html'], dest: 'build/plugin/'},
          {expand: true, src: ['js/tictactoe.js'], dest: 'build/plugin/'},
          {expand: true, src: ['js/plugin.js'], dest: 'build/plugin/'},
          {expand: true, src: ['manifest.json'], dest: 'build/plugin/'},
          {expand: true, src: ['css/plugin.css'], dest: 'build/plugin/'},
          {expand: true, src: ['bower_components/**/*'], dest: 'build/plugin/'},
          {expand: true, src: ['img/**/*'], dest: 'build/plugin/'},
        ],
      },
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
            baseDir: "build",
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
  // Default task(s).
  grunt.registerTask('build', ['sass','copy']);
  grunt.registerTask('default', ['build','browserSync','watch']);


};
