const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.getEventList = functions.https.onCall((data, context) => {
  const { id, type } = data;
});
