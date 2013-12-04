module.exports = function(grunt) {
  grunt.initConfig({
    clean: ['dist/'],
    browserify: {
      'dist/bookmarklet.js': ['bookmarklet.js']
    },
    watch: {
      css: {
          files: '*.js',
          tasks: ['browserify', 'forever:restart']
        }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-forever');

  grunt.registerTask('default', ['clean', 'browserify', 'forever:start', 'watch']);
}
