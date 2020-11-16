const functions = require('firebase-functions');
const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;
const fetch = require('node-fetch');
const firebase = require('firebase');
var config = require('./config');

const UNSPLASH_ACCESS_KEY = config.UNSPLASH_ACCESS_KEY;
const unsplash = new Unsplash({ accessKey: UNSPLASH_ACCESS_KEY });

global.fetch = fetch;

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.fetchImages = functions.https.onRequest(async (req, res) => {
    // Grab the count parameter.
    const count = parseInt(req.query.count, 10);

    getImageData(count)
    .then(toJson)
    // Build the Unsplash request
    // return unsplash.photos.getRandomPhoto({ 
    //     count: count,
    //     // query: "nature;animals;buildings",
    //     content_filter: "high",
    //     orientation: "squarish"
    //  })
    // .then(toJson)
    .then(json => {
      // Your code
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(json)
      return
    });
});

async function getImageData(count) {
  // Init firebase if it's not already
  if (!firebase.apps.length) {
    firebase.initializeApp(config.firebaseConfig);
  }

  // Get a reference to the database service
  var database = firebase.database();

  const maxIndex = 25000 - count;
  const randomIndex = Math.floor(Math.random() * maxIndex);

  return await database.ref('photos')
    .orderByKey()
    .startAt(randomIndex.toString())
    .limitToFirst(count)
    .once('value')
    .then(snapshot => {
      // Return an Array of Objects
      return Object.values(snapshot.val());
    });
}
