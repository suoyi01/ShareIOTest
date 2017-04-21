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

async.series([
	function(done){
        frisby.create("POST " + path + " with example user should return 201")
            .post(request, example_user, {json: true})
            .timeout(10000)
            .expectStatus(201)
			.after(function(err, res, body){
				done();
			})
            .toss();

        frisby.create("POST " + path + " with empty JSON object should return 400")
            .post(request, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("POST " + path + " with empty JSON array should return 400")
            .post(request, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();
	},
	function(done){
        frisby.globalSetup({
            request: {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': auth
                },
                inspectOnFailure: true
            }
        });
        frisby.create("GET " + path + "/{username} with existing user should return 200")
            .get(request + "/" + valid_username)
            .timeout(10000)
            .expectStatus(200)
            .toss();

        frisby.create("GET " + path + "/[username} with non-existing user should return 404")
            .get(request + "/" + invalid_username)
            .timeout(10000)
            .expectStatus(404)
            .toss();
        done();
	}
]);

