var frisby = require('frisby');
var conn = require('./connection.json');
var randomstring = require('randomstring');
var async = require('async');

const url = conn.host;
const port = conn.port;
const path = "/storage/sessions";

const invalid_id = "adfadf";

var request = url + ":" + port.toString() + path;
var username = randomstring.generate();
var password = randomstring.generate();
var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

frisby.globalSetup({
	request: {
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		inspectOnFailure: true
	}
});

var example_json = {
    "admin": username,
    "dataset": [
        username
    ],
    "id": username,
    "name": username,
    "participants": [
        username
    ],
    "presenters": [
        username
    ]
};

var user_json = {
    "collaborators": [
        {}
    ],
    "display_name": username,
    "password": password,
    "sessions": [
        {}
    ],
    "username": username,
    "walletAddress": "address"
};

async.series([
    function(done){
        frisby.create("POST /storage/users should create a new user")
            .post(url + ":" + port.toString() + "/storage/users", user_json, {json: true})
            .timeout(10000)
            .expectStatus(201)
            .after(function(err, res, body){
                done();
            })
            .toss();
    },
    function(done){
        frisby.globalSetup({
            request: {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    "Authorization": auth
                },
                inspectOnFailure: true
            }
        });

        frisby.create("POST " + path + " with valid JSON body should return 201")
            .post(request, example_json, {json: true})
            .timeout(10000)
            .expectStatus(201)
            .afterJSON(function(json){
                frisby.create("And GET " + path + "/{sessionID} with the newly created session should return 200")
                    .get(request + "/" + json.entity.id)
                    .timeout(10000)
                    .expectStatus(200)
                    .toss();
            })
            .toss();

        frisby.create("POST " + path + " with empty JSON array should return 400")
            .post(request, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("POST " + path + " with empty JSON object should return 400")
            .post(request, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("GET " + path + "/{sessionID} with invalid session ID should return 404")
            .get(request + "/" + invalid_id)
            .timeout(10000)
            .expectStatus(404)
            .toss();
        done();
    }
]);


