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
          'build/style.css':'sass/style.scss',
        }
      }
    },
    watch: {
      sass: {
        files: "**/*.scss",
        tasks: ['sass']
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
          src : [
            'css/**/*.css',
            'style.css',
            'js/**/*.js',
            '*.html'
          ]
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "./"
          }

        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-browser-sync');
  // Default task(s).
  grunt.registerTask('default', ['browserSync','watch']);


};
