var frisby = require('frisby');
var conn = require('./connection.json');
var randomstring = require('randomstring');
var async = require('async');
const url = conn.host;
const port = conn.port;
const path = "/V2/storage/states";
const userpath = "/storage/users";
const sessionpath = "/storage/sessions";
var session_id = null
var state_id = null;
const invalid_id = "adflkja";

const new_state_json = {
	"user":{
		"data":{
			"dataAttr":[
				"test","test1"
			],
			"dataCont":[
				"test",
				"test1",
				"test2",
				"test3",
				"test4"
			],
			"dataLoaded":true
		},
		"notes":[
			"test1","test2"
		],
		"user":{
			"id":1,
			"name":"Share.io"
		},
		"viz":{
			"annotations":[
				"test","test1","test2"
			],
			"brush":{
				"pMove":false,
				"x0":0,
				"x1":0,
				"y0":0,
				"y1":0
			},
			"color":"#68a2ff",
			"control":"brush",
			"height":400,
			"width":800,
			"padding":30,
			"type":"scatterplot",
			"xAxis":"x",
			"yAxis":"y"
		}
	}
};

const example_patch_array = [
	{ "op": "replace", "path": "/user/viz/brush/x0", "value": "60" },
	{ "op": "add", "path": "/user/viz/annotations/-", "value": "someAnnotation" }
];


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
            .post(url + ":" + port.toString() + userpath, user_json, {json: true})
            .timeout(10000)
            .expectStatus(201)
			.after(function(err, res, body){
                done();
			})
            .toss();
	},
	function(done) {
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
        frisby.create("POST " + sessionpath + " with valid JSON body should return 201")
            .post(url + ":" + port.toString() + sessionpath, example_json, {json: true})
            .timeout(10000)
            .expectStatus(201)
            .afterJSON(function (json) {
                session_id = json.entity.id;
                done();
            })
            .toss();
    },
    function(done) {
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
        frisby.create("GET " + path + "/{sessionID} with valid session ID should return 200")
            .get(request + "/" + session_id + "?count=10")
            .removeHeader('Content-Type')
            .timeout(10000)
            .expectStatus(200)
            .toss();

        frisby.create("GET " + path + "/{sessionID} with invalid session ID should return 404")
            .get(request + invalid_id + "?count=10")
            .removeHeader('Content-Type')
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("POST " + path + "/{sessionID} with valid session ID and empty state object should return 400")
            .post(request + "/" + session_id, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("POST " + path + "/{sessionID} with valid session ID and example state object should return 200")
            .post(request + "/" + session_id, new_state_json, {json: true})
            .timeout(10000)
            .expectStatus(200)
            .afterJSON(function(json){
                state_id = json.entity.id;
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
        frisby.create("POST " + path + "/{sessionID} with invalid session ID and example state object should return 404")
            .post(request + "/" + invalid_id, new_state_json, {json: true})
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("POST " + path + "/{sessionID} with invalid session ID and empty state object should return 400")
            .post(request + "/" + invalid_id, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        var patchReqLatest = request + "/" + session_id + "/latest";
        var invalidReq = request + "/" + invalid_id + "/latest";
        frisby.create("PATCH " + path + "/{sessionID}/latest with valid session id and example patch array should return 204")
            .patch(patchReqLatest, example_patch_array, {json: true})
            .timeout(10000)
            .expectStatus(204)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/latest with valid session ID and empty patch array should return 400")
            .patch(patchReqLatest, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/latest with valid session ID and patch = empty object {} should return 400")
            .patch(patchReqLatest, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/latest with invalid session ID and example patch array should return 404")
            .patch(invalidReq, example_patch_array, {json: true})
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/latest with invalid session ID and empty patch array should return 400")
            .patch(invalidReq, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/latest with invalid session ID and patch = empty object {} should return 400")
            .patch(invalidReq, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        var getReq = request + "/" + session_id + "/";
        var invalidSess = request + "/" + invalid_id + "/";
        frisby.create("GET " + path + "/{sessionID}/{stateID} with valid session ID and valid stateID should return 200")
            .get(getReq + state_id)
            .timeout(10000)
            .expectStatus(200)
            .toss();


        frisby.create("GET " + path + "/{sessionID}/{stateID} with invalid session ID and valid stateID should return 404")
            .get(invalidSess + state_id)
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("GET " + path + "/{sessionID}/{stateID} with valid session ID and invalid stateID should return 404")
            .get(getReq + invalid_id)
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("GET " + path + "/{sessionID}/{stateID} with invalid session ID and invalid stateID should return 404")
            .get(invalidSess + invalid_id)
            .timeout(10000)
            .expectStatus(404)
            .toss();

        var patchReq = request + "/" + session_id + "/";
        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with valid session ID, valid stateID, and example patch array should return 204")
            .patch(patchReq + state_id, example_patch_array, {json: true})
            .timeout(10000)
            .expectStatus(204)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with invalid session ID, valid stateID, and example patch array should return 404")
            .patch(invalidSess + state_id, example_patch_array, {json: true})
            .timeout(10000)
            .expectStatus(404)
            .toss();


        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with valid session ID, invalid stateID, and example patch array should return 404")
            .patch(patchReq + invalid_id, example_patch_array, {json: true})
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with invalid session ID, invalid stateID, and example patch array should return 404")
            .patch(invalidSess + invalid_id, example_patch_array, {json: true})
            .timeout(10000)
            .expectStatus(404)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with valid session ID, valid stateID, and empty patch array should return 400")
            .patch(patchReq + state_id, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with invalid session ID, valid stateID, and empty patch array should return 400")
            .patch(invalidSess + state_id, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with valid session ID, invalid stateID, and empty patch array should return 400")
            .patch(patchReq + invalid_id, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with invalid session ID, invalid stateID, and empty patch array should return 400")
            .patch(invalidSess + invalid_id, [], {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with valid session ID, valid stateID, and patch = empty object {} should return 400")
            .patch(patchReq + state_id, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with invalid session ID, valid stateID, and patch = empty object {} should return 400")
            .patch(invalidSess + state_id, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with valid session ID, invalid stateID, and patch = empty object {} should return 400")
            .patch(patchReq + invalid_id, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();

        frisby.create("PATCH " + path + "/{sessionID}/{stateID} with invalid session ID, invalid stateID, and patch = empty object {} should return 400")
            .patch(invalidSess + invalid_id, {}, {json: true})
            .timeout(10000)
            .expectStatus(400)
            .toss();
        done();
	}
]);


