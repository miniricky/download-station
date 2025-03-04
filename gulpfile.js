var gulp              = require('gulp');
var concat            = require('gulp-concat');
var twig              = require('gulp-twig');
var htmlbeautify      = require('gulp-html-beautify');
var cleancss          = require('gulp-clean-css')
var removeSourcemaps  = require('gulp-remove-sourcemaps');
var rename            = require("gulp-rename");
var sass              = require('gulp-sass')(require('sass'));
var sourcemaps        = require('gulp-sourcemaps');
var uglify            = require('gulp-uglify');
var w3cValidation     = require('gulp-w3c-html-validation');

// Global options.
var htmlbeautify_options = {
  indent_size: 2,
  indent_char: ' ',
  end_with_newline: true
};

var js_scripts = [
  './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  './node_modules/jquery/dist/jquery.min.js',
  './js-src/verify-sid.js',
  './js-src/sid.js',
  './js-src/animeflv-scraping.js',
  './js-src/animeflv.js',
  './js-src/animeflv-filter.js',
];

gulp.task('sass', function () {
  return gulp.src('./scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      mplementation: require('sass'),
      quietDeps: true,
      silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
    }).on('error', sass.logError))
    .pipe(cleancss())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./css'));
});

gulp.task('validate-html', function () {
  return gulp.src('./templates/**/*.html.twig')
    .pipe(w3cValidation({
      generateReport: 'false',
      relaxerror: [
        "The character encoding was not declared. Proceeding using “windows-1252”.",
        "Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”.",
        "End tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”",
        "End of file seen without seeing a doctype first. Expected “<!DOCTYPE html>”.",
        "Element “head” is missing a required instance of child element “title”.",
        'Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.',
        'This document appears to be written in '
      ]
    }));
});

gulp.task('join', async function () {
  gulp.src(['./generators/*.html'])
    .pipe(twig())
    .pipe(htmlbeautify(htmlbeautify_options))
    .pipe(rename(function (path) {
      path.extname = ".php"
    }))
    .pipe(gulp.dest('./'));
});


gulp.task('watch', function () {
  gulp.watch([
      './scss/*',
      './scss/**/*',
      './templates/*',
      './templates/**/*',
      './js/*'
    ]);
});

gulp.task('js', function () {
  return gulp.src(js_scripts)
    .pipe(sourcemaps.init())
    .pipe(concat('scripts-all.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./js/'));
});

gulp.task('build', gulp.series([
  'sass',
  'js',
  'join'
]));

gulp.task('default', gulp.series(['watch']));