var chai = require('chai');
var expect = chai.expect;
chai.should();
var assert = chai.assert;
var chakram = require('chakram');

const url = "http://silda05-u191705";
const port = 8080;
const path = "/V2/storage/states";
const session_id = "5193b405196343d9b58c6f56281ca515";
const state_id = "8582823d-ef67-4a3e-b67e-70e83b87c720";
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
	{ "op": "add", "path": "/user/viz/annotations/-", "value": "someAnnotation" },
	{ "op": "remove", "path": "/user/viz/height"}
];


var request = url + ":" + port.toString() + path;

describe("GET " + path + "/{sessionID}", function () {
	it("with valid session ID should return 200", function(){
		return chakram.get(request + "/" + session_id + "?count=10")
			.done(function(response){
				expect(response.response.statusCode).to.equal(200);
				return chakram.wait();
			});
	});

	it("with invalid session ID should return 404", function(){
		return chakram.get(request + invalid_id + "?count=10")
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});
}); 

describe("POST " + path + "/{sessionID}", function(){
	it("with valid session ID and example state object should return 200", function(){
		return chakram.post(request + "/" + session_id, new_state_json)
			.done(function(response){
				expect(response.response.statusCode).to.equal(200);
				return chakram.wait();
			});
	});

	it("with valid session ID and empty state object should return 400", function(){
		return chakram.post(request + "/" + session_id, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with invalid session ID and example state object should return 404", function(){
		return chakram.post(request + "/" + invalid_id, new_state_json)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with invalid session ID and empty state object should return 400", function(){
		return chakram.post(request + "/" + invalid_id, {})
			.done(function(response){
				expect(response.response.statusCode.to.equal(400));
			});
	});
});

describe("PATCH " + path + "/{sessionID}/latest", function(){
	var patchReq = request + "/" + session_id + "/latest";
	var invalidReq = request + "/" + invalid_id + "/latest";
	it("with valid session ID and example patch array should return 204", function(){
		return chakram.patch(patchReq, example_patch_array)
			.done(function(response){
				expect(response.response.statusCode).to.equal(204);
				return chakram.wait();
			});
	});

	it("with valid session ID and empty patch array should return 204", function(){
		return chakram.patch(patchReq, [])
			.done(function(response){
				expect(response.response.statusCode).to.equal(204);
				return chakram.wait();
			});
	});

	it("with valid session ID and patch = empty object {} should return 400", function(){
		return chakram.patch(patchReq, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with invalid session ID and example patch array should return 400", function(){
		return chakram.patch(invalidReq, example_patch_array)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with invalid session ID and empty patch array should return 400", function(){
		return chakram.patch(invalidReq, [])
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with invalid session ID and patch = empty object {} should return 400", function(){
		return chakram.patch(invalidReq, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});
});

describe("GET " + path + "/{sessionID}/{stateID}", function(){
	var getReq = request + "/" + session_id + "/";
	var invalidSess = request + "/" + invalid_id + "/";

	it("with valid session ID and valid stateID should return 200", function(){
		return chakram.get(getReq + state_id)
			.done(function(response){
				expect(response.response.statusCode).to.equal(204);
				return chakram.wait();
			});
	});

	it("with invalid session ID and valid stateID should return 404", function(){
		return chakram.get(invalidSess + state_id)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with valid session ID and invalid stateID should return 404", function(){
		return chakram.get(getReq + invalid_id)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with invalid session ID and invalid stateID should return 404", function(){
		return chakram.get(invalidSess + invalid_id)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});
});

describe("PATCH " + path + "/{sessionID}/{stateID}", function(){
	var patchReq = request + "/" + session_id + "/";
	var invalidSess = request + "/" + invalid_id + "/";

	it("with valid session ID, valid stateID, and example patch array should return 204", function(){
		return chakram.patch(patchReq + state_id, example_patch_array)
			.done(function(response){
				expect(response.response.statusCode).to.equal(204);
				return chakram.wait();
			});
	});

	it("with invalid session ID, valid stateID, and example patch array should return 404", function(){
		return chakram.patch(invalidSess + state_id, example_patch_array)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with valid session ID, invalid stateID, and example patch array should return 404", function(){
		return chakram.patch(patchReq + invalid_id, example_patch_array)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with invalid session ID, invalid stateID, and example patch array should return 404", function(){
		return chakram.patch(invalidSess + invalid_id, example_patch_array)
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with valid session ID, valid stateID, and empty patch array should return 204", function(){
		return chakram.patch(patchReq + state_id, [])
			.done(function(response){
				expect(response.response.statusCode).to.equal(204);
				return chakram.wait();
			});
	});

	it("with invalid session ID, valid stateID, and empty patch array should return 400", function(){
		return chakram.patch(invalidSess + state_id, [])
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with valid session ID, invalid stateID, and empty patch array should return 404", function(){
		return chakram.patch(patchReq + invalid_id, [])
			.done(function(response){
				expect(response.response.statusCode).to.equal(404);
				return chakram.wait();
			});
	});

	it("with invalid session ID, invalid stateID, and empty patch array should return 400", function(){
		return chakram.patch(invalidSess + invalid_id, [])
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with valid session ID, valid stateID, and patch = empty object {} should return 400", function(){
		return chakram.patch(patchReq + state_id, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with invalid session ID, valid stateID, and patch = empty object {} should return 400", function(){
		return chakram.patch(invalidSess + state_id, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with valid session ID, invalid stateID, and patch = empty object {} should return 400", function(){
		return chakram.patch(patchReq + invalid_id, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});

	it("with invalid session ID, invalid stateID, and patch = empty object {} should return 400", function(){
		return chakram.patch(invalidSess+ invalid_id, {})
			.done(function(response){
				expect(response.response.statusCode).to.equal(400);
				return chakram.wait();
			});
	});
});
