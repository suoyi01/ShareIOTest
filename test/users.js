var chakram = require('chakram');
var expect = chakram.expect;

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

describe("POST " + path, function(){
	this.timeout(5000);
	it("with example user should return 201", function(){
		var response = chakram.post(request, example_user);
		return expect(response).to.have.status(201);
	});

	it("with empty JSON object should return 400", function(){
		var response = chakram.post(request, {});
		return expect(response).to.have.status(400);
	});

	it("with empty JSON array should return 400", function(){
		var response = chakram.post(request, []);
		return expect(response).to.have.status(400);
	});
});


describe("GET " + path + "/{username}", function(){
	this.timeout(5000);
	it("with existing user should return 200", function(){
		var response = chakram.get(request + "/" + existing_username);
		return expect(response).to.have.status(200);
	});

	it("with non-existing user should return 404", function(){
		var response = chakram.get(request + "/" + nonexistent_username);
		expect(response).to.have.status(404);
		return chakram.wait();
	});
});
