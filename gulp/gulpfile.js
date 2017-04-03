var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
	del          = require('del'),
    uglify       = require('gulp-uglifyjs'), 
    cssnano      = require('gulp-cssnano'),
    uncss        = require('gulp-uncss'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    concat       = require('gulp-concat'),
    sitemap      = require('gulp-sitemap'),
    robots       = require('gulp-robots'),
    autoprefixer = require('gulp-autoprefixer'),
    notify       = require('gulp-notify'),
    ftp          = require('vinyl-ftp');



// Главный таск. Работа с файлами, библиотеками, препроцессорами. Вызывается через команду "gulp".

gulp.task('scss', function(){
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({
            includePaths: [
                require('bourbon').includePaths, 
                require('node-normalize-scss').includePaths,
                require('bourbon-neat').includePaths
            ]
        })
        .on('error', notify.onError(function (error) {
            return "A task sсss error occurred: " + error.message;
        })))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function(){
	return gulp.src('app/libs/**/*.js') 
        .pipe(concat('libs.js')
        .on('error', notify.onError(function (error) {
            return "A task scripts error occurred: " + error.message;
        })))
		.pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('style', function(){
	return gulp.src('app/libs/**/*.css') 
        .pipe(concat('libs.css')
        .on('error', notify.onError(function (error) {
            return "A task style error occurred: " + error.message;
        })))
		.pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
        baseDir: 'app'
        },
		notify: false
	});
});

gulp.task('watch', ['browser-sync', 'scripts', 'style', 'scss'], function() {
	gulp.watch('app/scss/**/*.scss', ['scss']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('app/libs/**/*.css', ['style']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
	gulp.watch('app/css/**/*.css', browserSync.reload);
	gulp.watch('app/**/*.html', browserSync.reload);
});

gulp.task('default', ['watch']);




// При возникновении проблем с изображениями запустить таск "gulp clear".

gulp.task('clear', function () {
    return cache.clearAll();
})




// Сборка конечного проекта вызывается командой "gulp build".

gulp.task('img', function() {
    return gulp.src('app/img/**/*') 
        .pipe(imagemin({ 
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('build', ['clean', 'img'], function() {

	var buildCss = gulp.src('app/css/**/*')
    .pipe(cssnano())
    .pipe(uncss({
            html: ['index.html']
        }))
	.pipe(gulp.dest('dist/css'))

    var buildFont = gulp.src('app/font/**/*')
	.pipe(gulp.dest('dist/font'))
    
	var buildJs = gulp.src('app/js/**/*')
    .pipe(uglify())
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

});




// Оптимизация сайта для поисковиков. Запуск выполняется командой "gulp meta".

gulp.task('sitemap', function () {
    gulp.src('dist/**/*.html', {
            read: false
        })
        .pipe(sitemap({
            siteUrl: 'http://site'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('robots', function () {
    gulp.src('dist/index.html')
        .pipe(robots({
            useragent: 'Googlebot, Yandex ',
            allow: ['dist/ '],
            disallow: ['app/ ']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('meta', ['sitemap', 'robots' ]);




// Выгрузка файлов на сервер по ftp 

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});
