/*
 *  This File contains all command parsers. Ever commandparser takes three arguments:
 *      cpu:        The cpu library, to acces its functionality
 *      options:    this contains all argumetns passed to a command as an array
 *      callback:   function to be executed when finished with parsing
*/
var SocketRegisterd = false;

function setUpSocketListener(cpu, callback) {
  if (!SocketRegisterd) {
    cpu.module("socket").on("get_playlist", {
      onreceive: function(cpu, context) {
        var data = context["data"];
        var playlists = data["playlists"];
        var i = 1
        callback.call(this, "List of Playlists:")
        for (var entry in playlists) {
          callback.call(this, "" + i + ") " + playlists[entry]);
          i ++;
        }
      }
    });
    cpu.module("socket").on("get_queue", {
      onreceive: function(cpu, context) {
        var data = context["data"];
        var queue = data["queue"];
        //TODO add output to consol that is meaning full, fist load extra information on server to send with queue to display in chat
      }
    });
    cpu.module("socket").registerSocket();
    SocketRegisterd = true;
  }
}

module.exports = {
  "pause": function (cpu, options, callback) {
    cpu.module("socket").emit("pause");
    callback.call(this, "The playback will pause shortly");
  },
  "stop": function(cpu, options, callback) {
    cpu.module("socket").emit("stop");
    callback.call(this, "The playback will stop shortly");
  },
  "next": function(cpu, options, callback) {
    cpu.module("socket").emit("next");
    callback.call(this, "The next song is beeing loaded");
  },
  "prev": function(cpu, options, callback) {
    cpu.module("socket").emit("prev");
    callback.call(this, "The previous song is beeing loaded");
  },
  "add": function(cpu, options, callback) {
    if (options.length < 2) {
      callback.call(this, "Too view arguments provide: add <service> <path>");
    } else {
      var service = options[0];
      var path = options[1];
      cpu.module("socket").emit("add_track", {"service": service, "path": path + "",'next': false});
      callback.call(this, "successfully added track");
    }
  },
  "play": function(cpu, options, callback) {
    if (options.length == 0) {
      cpu.module("socket").emit('play');
      callback.call(this, "Track will resume shortly");
    } else if (options.length == 2) {
      var service = options[0];
      var path = options[1];
      cpu.module("socket").emit("add_track", {"service": service, "path": path,'next': true});
      callback.call(this, "Going to play your track shortly");
    } else {
      callback.call(this, "Malformed command either call commad without arguments to resume track or use this syntax: play <service> <path>");
    }
  },
  "playlist": function(cpu, options, callback){
    setUpSocketListener(cpu, callback);
    if (options.length < 1) {
      callback.call(this, "Too view arguments provided: playlist list /or/ playlist load <playlistname>");
    } else {
      if (options[0] === "list") {
        cpu.module("socket").emit("get_playlist", {"name": undefined});
      } else if (options.length > 1 && options[0] === 'load') {
        cpu.module("socket").emit("playPlaylist", {'name': options[1], 'playing': true});
        callback.call(this, "Loading Playlist: " + options[1]);
      } else {
        callback.call(this, "Invalid arguments provided: playlist list /or/ playlist load <playlistname>");
      }
    }
  },
  "queue": function(cpu, options, callback) {
    setUpSocketListener(cpu, callback);
    if (options.length < 1) {
      callback.call(this, "Too view arguments provided: queue list");
    } else {
      if (options[0] === "list") {
        cpu.module("socket").emit("get_queue");
      }
    }
  }
}
