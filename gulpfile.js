var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require("gulp-minify-css");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

// sass
gulp.task('sass', function(){
    return gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(minifyCss())
        .pipe(gulp.dest('./css'));
});
gulp.task('watch-sass', function(){
    gulp.watch('./scss/*.scss', ['sass'])
});


// js
gulp.task('scripts', function() {
    gulp.src(['./node_modules/handlebars/dist/handlebars.js', './config.js', './scripts/helpers.js', './scripts/main.js'])
      .pipe(concat('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./scripts'))
});
gulp.task('watch-js', function(){
    gulp.watch('./scripts/*.js', ['scripts'])
});


// 
gulp.task('watch', ['sass', 'watch-sass', 'scripts', 'watch-js']);
gulp.task('default', ['sass', 'scripts']);
