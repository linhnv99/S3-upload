const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
  httpOptions: { timeout: 10000 },
});

const createBucket = (bucketName) =>
  new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      ACL: "private", //private | public-read | public-read-write | authenticated-read,
    };

    s3.createBucket(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });

const deleteBucket = (bucketName) =>
  new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
    };

    s3.deleteBucket(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });

const uploadFile = async ({
  name,
  data: dataBuffer,
  size,
  encoding,
  mimetype,
  subDir,
  isPublic = false,
}) => {
  const keyName = `${new Date().getTime()}_${name}`;

  const params = {
    ACL: isPublic ? "public-read" : undefined,
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: subDir ? `${subDir}/${keyName}` : keyName,
    Body: dataBuffer,
  };

  const options = {
    partSize: 10 * 1024 * 1024, // 10 MB
    queueSize: 10,
  };

  const data = await s3
    .upload(params, options, (err) => {
      if (err) {
        console.error(err);
      }
    })
    .promise();

  const { key, Location: url } = data;

  return { key, url };
};

const deleteFile = ({ bucketName, key }) => {
  const paramsForDelete = {
    Bucket: bucketName,
    Key: key,
  };
  return new Promise((resolve, reject) => {
    s3.deleteObject(paramsForDelete, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

const downloadFile = async ({ bucketName, key }) => {
  return s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: key,
    Expires: 300,
  });
};

module.exports = {
  createBucket,
  deleteBucket,
  uploadFile,
  deleteFile,
  downloadFile,
};
