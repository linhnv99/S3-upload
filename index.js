require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");

const {
  createBucket,
  uploadFile,
  deleteBucket,
  deleteFile,
  downloadFile,
} = require("./fileUtils");

const app = express();

const PORT = 3000;

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// file
app.use(fileUpload());

app.post("/upload", async (req, res, next) => {
  const file = req.files.file;
  const { key, url } = await uploadFile(file);
  res.json({ key, url });
});

app.post("/delete", async (req, res, next) => {
  const response = await deleteFile(req.body);
  res.json(response);
});

app.post("/download", async (req, res, next) => {
  const response = await downloadFile(req.body);
  res.json(response);
});

app.post("/create-bucket", async (req, res, next) => {
  const response = await createBucket(req.body.bucketName);
  res.json(response);
});

app.post("/delete-bucket", async (req, res, next) => {
  console.log(req.body.name);
  const response = await deleteBucket(req.body.bucketName);
  res.json(response);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
