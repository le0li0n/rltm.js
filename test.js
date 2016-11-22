const assert = require('chai').assert;

var fork = require('child_process').fork;
var child = fork('./socket.io-server');

process.on('exit', function () {
    child.kill();
});

let rltm = require('./src/index');

let testMessageData = {
    rand: Math.random()
};

let testStateData = {
    rand: Math.random()
};

let testNewStateData = {
    rand: Math.random()
};

var agentInput = process.env.AGENT || 'pubnub';

var agents = {
    pubnub: rltm('pubnub', {
        publishKey: 'pub-c-191d5212-dd99-4f2e-a8cf-fb63775232bc',
        subscribeKey: 'sub-c-aa1d9fe8-a85b-11e6-a397-02ee2ddab7fe',
        uuid: new Date()
    }),
    socketio: rltm('socketio', {
        endpoint: 'http://localhost:8000',
        uuid: new Date()
    })    
};

var agent = agents[agentInput];

describe(agent.service, function() {

    describe('init', function() {

        it('should create agent object', function() {
            assert.isObject(agent, 'was successfully created');
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {
            room.on('ready', function(){
                done();
            });
        });

        it('should get itself as a join event', function(done) {

            room.on('join', function(uuid, state) {
                assert.isOk(uuid, 'uuid is set');
                done();
            });

        });
        
        room = agent.join('test-channel', testStateData);

    });

    describe('publish subscribe', function() {

        it('should send and receive message', function(done) {

            room.on('message', function(message){
                done();
            });

            room.publish(testMessageData);

        });

    });

    describe('here now', function() {

        it('at least one user online', function(done) {

            room.hereNow(function(users) {

                assert.isOk(users, 'At least one user online now');
                
                done();

            });

        });

    });

    describe('state', function() {

        it('should set state', function(done) {

            room.on('state', function(uuid, state) {
                assert.isOk(uuid, 'uuid supplied');
                assert.isObject(state, 'state is object');
                done();
            });

            room.setState(testNewStateData);

        });

    });

    describe('unsubscribe', function() {

        it('should disconnect', function() {
            room.unsubscribe();
            room.publish(testMessageData);
        });

    });

    describe('history', function() {

        it('should recall history', function(done) {

            this.timeout(8000);

            setTimeout(function() {
                room.history(function(history) {

                    assert.deepEqual(history[0].data, testMessageData, 'latest message is correct');
                    assert.isAbove(history.length, 1, 'at least one messages received');

                    done();

                });
            }, 2500);

        });

    });

});

