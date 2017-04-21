/**
 * Created by yi on 4/20/17.
 */
var frisby = require('frisby');
var conn = require('./connection.json');
var randomstring = require('randomstring');
var async = require('async');

const url = conn.host;
const port = conn.port;

var admin = randomstring.generate();
var adminpw = randomstring.generate();
var participant = randomstring.generate();
var participantpw = randomstring.generate();
var presenter = randomstring.generate();
var presenterpw = randomstring.generate();
var additional = randomstring.generate();
var additionalpw = randomstring.generate();

var session_id = null;
var other_removed, self_removed, added;

other_removed = [presenter];

self_removed = [participant];

added = [additional];

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
        var example_users = [
            {
                "display_name": admin,
                "password": adminpw,
                "sessions": [
                    {}
                ],
                "username": admin,
                "walletAddress": "string",
                "collaborators": [
                    {}
                ]
            },
            {
                "display_name": participant,
                "password": participantpw,
                "sessions": [
                    {}
                ],
                "username": participant,
                "walletAddress": "string",
                "collaborators": [
                    {}
                ]
            },
            {
                "display_name": presenter,
                "password": presenterpw,
                "sessions": [
                    {}
                ],
                "username": presenter,
                "walletAddress": "string",
                "collaborators": [ {}
                ]
            },
            {
                "display_name": additional,
                "password": additionalpw,
                "sessions": [
                    {}
                ],
                "username": additional,
                "walletAddress": "string",
                "collaborators": [
                    {}
                ]
            }
        ];

        var path = "/storage/users";
        var request = url + ":" + port.toString() + path;

        var counter = 0;
        example_users.forEach(function(user){
            frisby.create("POST " + path + " with example user should return 201")
                .post(request, user, {json: true})
                .timeout(10000)
                .expectStatus(201)
                .after(function(err, res, body){
                    counter++;
                    if(counter == example_users.length)
                        done();
                })
                .toss();
        });
    },
    function(done){
        var adminauth = "Basic " + new Buffer(admin + ":" + adminpw).toString("base64");
        var presenterauth = "Basic " + new Buffer(presenter + ":" + presenterpw).toString("base64");
        var participantauth = "Basic " + new Buffer(participant + ":" + participantpw).toString("base64");

        var example_session = {
            "admin": admin,
            "dataset": [
                "test"
            ],
            "id": "test",
            "name": "test",
            "participants": [
               presenter,
               participant
            ],
            "presenters": [
               presenter,
               participant
            ]
        };

        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("POST " + path + " with valid JSON body as admin should return 201")
            .post(request, example_session, {json: true})
            .addHeader("Authorization", adminauth)
            .timeout(10000)
            .expectStatus(201)
            .toss();
        frisby.create("POST " + path + " with valid JSON body as presenter should return 201")
            .post(request, example_session, {json: true})
            .addHeader("Authorization", presenterauth)
            .timeout(10000)
            .expectStatus(201)
            .toss();
        frisby.create("POST " + path + " with valid JSON body as participant should return 201")
            .post(request, example_session, {json: true})
            .addHeader("Authorization", participantauth)
            .timeout(10000)
            .expectStatus(201)
            .afterJSON(function(json){
                session_id = json.entity.id;
                done();
            })
            .toss();
    },
    function(done) {
        var auth = "Basic " + new Buffer(presenter + ":" + presenterpw).toString("base64");
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;

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

        frisby.create("GET " + path + "?userID={user_id} with the newly created session as presenter should return 200")
            .get(request + "?userID=" + participant)
            .timeout(10000)
            .expectStatus(200)
            .after(function (err, res, body) {
                done();
            })
            .toss();
    },
    function(done) {
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("GET " + path + "/{session_id} with the newly created session as presenter should return 200")
            .get(request + "/" + session_id)
            .timeout(10000)
            .expectStatus(200)
            .after(function (err, res, body) {
                done();
            })
            .toss();
    },
    function(done) {
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("PUT" + path + "/{session_id}/participants removing other participants as presenter should return 403")
            .put(request + "/" + session_id + "/participants", other_removed, {json: true})
            .timeout(10000)
            .expectStatus(403)
            .after(function (err, res, body) {
                done();
            })
            .toss();
    },
    function(done) {
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("PUT" + path + "/{session_id}/participants adding users as presenter should return 403")
            .put(request + "/" + session_id + "/participants", added, {json: true})
            .timeout(10000)
            .expectStatus(403)
            .after(function (err, res, body) {
                done();
            })
            .toss();
    },
    function(done){
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("PUT" + path + "/{session_id}/presenters removing other presenters as presenter should return 403")
            .put(request + "/" + session_id + "/presenters", other_removed, {json: true})
            .timeout(10000)
            .expectStatus(403)
            .after(function(err, res, body){
                done();
            })
            .toss();
    },
    function(done){
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("PUT" + path + "/{session_id}/presenters adding users presenters as presenter should return 403")
            .put(request + "/" + session_id + "/presenters", added, {json: true})
            .timeout(10000)
            .expectStatus(403)
            .after(function(err, res, body){
                done();
            })
            .toss();
    },
    function(done){
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("PUT" + path + "/{session_id}/presenters removing himself as presenter should return 200")
            .put(request + "/" + session_id + "/presenters", self_removed, {json: true})
            .timeout(10000)
            .expectStatus(200)
            .after(function(err, res, body){
                done();
            })
            .toss();
    },
    function(done) {
        var path = "/storage/sessions";
        var request = url + ":" + port.toString() + path;
        frisby.create("PUT" + path + "/{session_id}/participants removing himself as presenter should return 200")
            .put(request + "/" + session_id + "/participants", self_removed, {json: true})
            .timeout(10000)
            .expectStatus(200)
            .after(function (err, res, body) {
                done();
            })
            .toss();
    }
]);
