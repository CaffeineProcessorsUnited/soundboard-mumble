var mumble = require('mumble');
var request = require('request');
var fs = require('fs');
var io = require('socket.io-client');
var cpu = require("./soundboard-lib/cpu.js");

//Loading CPU Modules
cpu.loadModule(require("./soundboard-lib/util.cpu.js"), { "utils": require('util')});
cpu.loadModule(require("./soundboard-lib/events.cpu.js"));
cpu.loadModule(require("./soundboard-lib/socket.cpu.js"), { "io" : io, "server": false });
cpu.loadModule(require("./soundboard-lib/config.cpu.js"));

var cparse = require("./cparser.js")(cpu);
var commands = require("./commands.js");
for (var command in commands) {
  if (commands.hasOwnProperty(command) && typeof(commands[command]) == "function" ) {
    cparse.addParser(command, commands[command]);
  }
}
//Configure CPU
cpu.module("events").addEventListener("ready", function(cpu) {
  cpu.module("config").load(JSON.parse(fs.readFileSync('config.json', 'utf8')));
});

cpu.ready();

var options = {
  "key" : cpu.module("config").get("mumble-client", "key"),
  "cert": cpu.module("config").get("mumble-client", "cert")
}

var hostname = cpu.module("config").get("mumble-server", "hostname");
if (hostname != null && hostname != "") {
  mumble.connect( "mumble://" + hostname, options, function ( error, connection ) {
      if( error ) { throw new Error( error ); }
      connection.authenticate( 'SoundboardJudge' );
      connection.on( 'initialized', function(){
        var streamtoserver = connection.inputStream({
           sampleRate: 44100,
           channels: 2
        });
        var url = "http://" + cpu.module("config").get("soundboard-server", "hostname") + ":" + cpu.module("config").get("soundboard-server", "stream-port");
        r = request.get(url);
        r.on('response', function (response) {
          response.on('data', function (chunk) {
            try {
              streamtoserver.write(chunk);
            } catch(e) {
              console.error(e);
            }
          });
          response.on('end', function () {
            cpu.module("util").log('Stream ended');
          });
        });
      });
      connection.on("message", function(message, user, scope){
        cpu.module("util").log("Mumble: message \"" + message + "\"");
        cparse.parse(message, function(response) {
          user.sendMessage(response);
        });
      });
  });
} else {
  cpu.module("util").log("Cannot connect to mumble server: No Hostname provided in config file");
}
