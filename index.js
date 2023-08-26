const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.handler = async (event) => {
// ensure "type": is the correct image type (png, jpeg)
  const newImageRecord = {"name": event.Records[0].s3.object.key, "type": ".png", "size": event.Records[0].s3.object.size};
  let Bucket = '401bucketsz';
  let Key = 'images.json';
  
  try {
    // get the images.json file
  let imagesDict = await S3.getObject({Bucket, Key}).promise();
  // turn buffer->string and string->json
  let stringifiedImgs = imagesDict.Body.toString();
  let parsedImgs = JSON.parse(stringifiedImgs);
  // remove dupe records by looping through and keeping only unique object keys
  const dupeFilter = parsedImgs.filter(rec => rec.name !== event.Records[0].s3.object.key);
  dupeFilter.push(newImageRecord);
  const body = JSON.stringify(dupeFilter);
  const command = {Bucket, Key: "images.json", Body: body, ContentType: 'application/json'};
  await uploadFilesOnS3(command);
  } catch (e) {
    console.error(e)
    const body = JSON.stringify([newImageRecord]);
    const command = {Bucket, Key: "images.json", Body: body, ContentType: 'application/json'};
  await uploadFilesOnS3(command);

  };
  
  // external callback function for upload
  async function uploadFilesOnS3(command) {
    try {
      const response = await S3.upload(command).promise();
      console.log('response:', response);
      return response;
    } catch (err){
      console.log(err)
    }
};
  
};
