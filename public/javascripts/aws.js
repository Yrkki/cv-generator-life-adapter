var S3 = require('@aws-sdk/client-s3');
var CloudFront = require('@aws-sdk/client-cloudfront');

var options = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? process.env.CV_GENERATOR_LIFE_ADAPTER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? process.env.CV_GENERATOR_LIFE_ADAPTER_AWS_SECRET_ACCESS_KEY
};
var endpointS3 = new S3.S3(options);
var endpointCloudFront = new CloudFront.CloudFront({});

module.exports = { endpointS3: endpointS3, endpointCloudFront: endpointCloudFront };
