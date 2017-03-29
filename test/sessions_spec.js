var frisby = require('frisby');

const url = "http://silda05-u191705";
const port = 8080;
const path = "/storage/sessions";

const example_json = {
	"admin": "string",
	"dataset": [
		"string"
	],
	"id": "string",
	"name": "string",
	"participants": [
		"string"
	],
        "presenters": [
		"string"
	]
};

const invalid_id = "adfadf";

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
