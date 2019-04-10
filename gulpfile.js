const del = require('del');
const { src, dest, parallel, series, watch } = require('gulp');
const csso = require('gulp-csso');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const rigger = require('gulp-rigger');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

const clean = () => {
    return del('./build');
};


const html = (cb) => {
    return src('./src/*.html')
        .pipe(rigger().on('error', (error) => cb(error.message)))
        .pipe(dest('./build'))
        .pipe(browserSync.stream());
};

const styles = (cb) => {
    return src('./src/css/*.{sass,scss,css}')
        .pipe(sass().on('error', (error) => cb(error.message)))
        .pipe(autoprefixer({
            browsers: [
                '> 1%',
                'last 2 versions',
                'firefox >= 4',
                'safari 7',
                'safari 8',
                'IE 8',
                'IE 9',
                'IE 10',
                'IE 11'
            ]
        }))
        .pipe(csso())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./build/css'))
        .pipe(browserSync.stream())
};

const scripts = (cb) => {
    return src('./src/js/*')
        .pipe(rigger().on('error', (error) => cb.error(error.message)))
        .pipe(uglify().on('error', (error) => cb.error(error.message)))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./build/js'))
        .pipe(browserSync.stream())
};

 const images = () => {
    return src('./src/img/**/*')
        .pipe(imagemin())
        .pipe(dest('./build/img'));
};

const fonts = () => {
    return src('./src/fonts/**/*')
        .pipe(imagemin())
        .pipe(dest('./build/fonts'));
};

const serve = () => {
    browserSync.init({
        server: './build',
        port: 8000
    });
    watch("./src/html/**/*.html", html, browserSync.reload)
    watch('./src/*.html', html);
    watch('./src/css/*.{sass,scss,css}', styles);
    watch('./src/js/*', scripts);
};

exports.build =  series(clean, parallel(html, styles, scripts, fonts, images));
exports.default =  series(clean, parallel(html, styles, scripts, fonts, images), serve);
