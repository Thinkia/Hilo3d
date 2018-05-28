const gitlabPath = '../Hilo3d';

const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace');

const pkg = require('./package.json');
const gitlabPkg = require(`${gitlabPath}/package.json`);

gulp.task('del', (done) => {
    del(['build', 'exmaples', 'docs', 'src'], {
        force:true
    }).then(()=>{
        done();
    });
});

gulp.task('copy', ['del'], () => {
    return gulp.src([
            `${gitlabPath}/+(build|examples|docs)/**/*`,
            `${gitlabPath}/README.md`,
            `${gitlabPath}/+(src)/+(loader|texture|material|shader|renderer)/**/*`,
        ])
        .pipe(gulp.dest('./'));
});

gulp.task('version', () => {
    return gulp.src('./package.json')
        .pipe(replace(/"version"[\s]*:[\s]*"[\d\.]+"/g, `"version": "${gitlabPkg.version}"`))
        .pipe(gulp.dest('./'))
});

gulp.task('default', ['copy', 'version'], (done) => {
    console.log(`Hilo3d update: ${pkg.version} => ${gitlabPkg.version}`);
    done();
});