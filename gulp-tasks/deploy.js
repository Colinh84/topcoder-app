var merge = require('merge-stream');
var awspublishRouter = require('gulp-awspublish-router');

module.exports = function(gulp, $, config, utilities) {
  'use strict';

  gulp.task('deploy', ['build'], function() {
    var awsConfig = {
      params: {
        Bucket: config.aws.bucket
      },
      'accessKeyId': config.aws.key,
      'secretAccessKey': config.aws.secret
    };

    var publisher = $.awspublish.create(awsConfig);

    utilities.log('Deploying to S3');

    var gzip = gulp.src(['build/**/*.js', 'build/**/*.css']).pipe($.awspublish.gzip())
      .pipe(awspublishRouter({
        cache: {
          cacheTime: 94608000,
          allowTransform: false,
          public: true
        },
        routes: {
          '^.+$': '$&'
        }
      }));

    var plain = gulp.src(['build/**/*', '!build/**/*.js', '!build/**/*.css'])
      .pipe(awspublishRouter({
        cache: {
          cacheTime: 94608000,
          allowTransform: false,
          public: true
        },
        routes: {
          '^.+\\.html': {
            cacheTime: 0
          },
          '^.+$': '$&'
        }
      }));

    return merge(gzip, plain)
      .pipe(publisher.cache())
      .pipe(publisher.publish())
      .pipe($.if(!config.production, publisher.sync()))
      .pipe($.awspublish.reporter());
  });
};
