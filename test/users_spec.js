var frisby = require('frisby');

const url = "http://silda05-u191705";
const port = 8080;
const path = "/storage/users";

const existing_username = "string";
const nonexistent_username = "2439u3iroj2elkjfda";
const example_user = {
	"collaborators": [
		{}
	],
	"display_name": "string",
	"password": "string",
	"sessions": [
		{}
	],
	"username": "string",
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

frisby.create("POST " + path + " with example user should return 201")
	.post(request, example_user, {json: true})
	.timeout(10000)
	.expectStatus(201)
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

frisby.create("GET " + path + "/{username} with existing user should return 200")
	.get(request + "/" + existing_username)
	.timeout(10000)
	.expectStatus(200)
	.toss();

frisby.create("GET " + path + "/[username} with non-existing user should return 404")
	.get(request + "/" + nonexistent_username)
	.timeout(10000)
	.expectStatus(404)
	.toss();
