module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            gopjs:{
                src:'Web/public/Admin/**/*.js',
                dest:'Web/public/all.js'
            },
            gopjsIndex:{
                src:'Web/public/Index/**/*.js',
                dest:'Web/public/allIndex.js'
            }
        },
        watch: {
            scripts: {
                files: ['Web/public/Admin/**/*.js'],
                tasks: ['concat'],
                options: {
                    spawn: false
                }
            },
            scripts2: {
                files: ['Web/public/Index/**/*.js'],
                tasks: ['concat'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default',['watch']);
}