const gulp = require("gulp");
const del = require("del");
const ts = require("gulp-typescript");
const tslint = require("gulp-tslint");
const webpack = require("webpack-stream");

gulp.task("clean", () => {
    return del("dist");
});

gulp.task("ts:lint", () => {
    const tsProject = ts.createProject("tsconfig.json");
    return tsProject.src()
        .pipe(tslint({
            "configuration": "tslint.json"
        }))
        .pipe(tslint.report());
});

gulp.task("ts:compile", () => {
    return gulp.src("src/app.ts")
        .pipe(webpack(require("./webpack.config.js")))
        .pipe(gulp.dest("dist/"));
});

gulp.task("static:copy", () => {
    return gulp.src("static/**")
        .pipe(gulp.dest("dist/"));
});

gulp.task("build", ["ts:compile", "static:copy"]);

gulp.task("watch", ["build"], () => {
    gulp.watch(["src/**/*.ts", "static/**"], ["build"]);
});

gulp.task("default", ["clean", "ts:lint", "build"]);
