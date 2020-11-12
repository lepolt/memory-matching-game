const functions = require('firebase-functions');
const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;
const fetch = require('node-fetch');
var config = require('./config');

const APP_ACCESS_KEY = config.APP_ACCESS_KEY;
const unsplash = new Unsplash({ accessKey: APP_ACCESS_KEY });

global.fetch = fetch;

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
// exports.addMessage = functions.https.onRequest(async (req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into Cloud Firestore using the Firebase Admin SDK.
//     const writeResult = await admin.firestore().collection('messages').add({original: original});
//     // Send back a message that we've succesfully written the message
//     res.json({result: `Message with ID: ${writeResult.id} added.`});
//   });

exports.fetchImages = functions.https.onRequest(async (req, res) => {
    // Grab the count parameter.
    const count = req.query.count;

    // Build the Unsplash request
    return unsplash.photos.getRandomPhoto({ 
        count: count,
        // query: "nature;animals;buildings",
        content_filter: "high",
        orientation: "squarish"
     })
    .then(toJson)
    .then(json => {
      // Your code
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(json)
      return
    });
})