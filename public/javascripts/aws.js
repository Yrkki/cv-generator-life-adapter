var AWS = require('aws-sdk');
var options = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
var endpointS3 = new AWS.S3(options);
var endpointCloudFront = new AWS.CloudFront({});

module.exports = { endpointS3: endpointS3, endpointCloudFront: endpointCloudFront };
