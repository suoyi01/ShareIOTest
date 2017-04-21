/**
 * Created by yi on 4/20/17.
 */
var frisby = require('frisby');
var conn = require('./connection.json');
var randomstring = require('randomstring');
var async = require('async');

const url = conn.host;
const port = conn.port;
const path = "/storage/users";

var valid_username = randomstring.generate();
var password = randomstring.generate();
var auth = "Basic " + new Buffer(valid_username + ":" + password).toString("base64");

const invalid_username = "2439u3iroj2elkjfda";
const invalid_password = "invalid";

const example_user = {
    "collaborators": [
        {}
    ],
    "display_name": valid_username,
    "password": password,
    "sessions": [
        {}
    ],
    "username": valid_username,
    "walletAddress": "string"
};

var request = url + ":" + port.toString() + path;

frisby.globalSetup({
    request: {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        inspectOnFailure: true
    }
});
