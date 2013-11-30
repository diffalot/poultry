module.exports = function(grunt) {
  grunt.initConfig({
    clean: ['dist/'],
    browserify: {
      'dist/bookmarklet.js': ['bookmarklet.js']
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'browserify']);
}
