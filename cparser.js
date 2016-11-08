
var CommandParser = function(cpu) {
  var _cpu;
  var commandparser = {}

  function CommandParser(cpu) {
    if (!(this instanceof CommandParser)) {
        return new CommandParser(cpu);
    }
    _cpu = cpu;
  }

  CommandParser.prototype.addParser = function (command, parser) {
    commandparser[command] = parser;
  };

  CommandParser.prototype.parse = function (commandstring, callback) {
    var commandarr = commandstring.split(" ");
    var options = [];
    var command = commandarr[0];
    for(var i=1; i<commandarr.length; i++) {
      options.push(commandarr[i]);
    }
    if(typeof(command) === "string" && commandparser[command] !== undefined) {
      commandparser[command].call(this, _cpu, options, callback);
    } else {
      _cpu.module("util").log("Unknown command: \"" + command + "\"");
    }
  };

  return new CommandParser(cpu);
};
var exports = module.exports = CommandParser;
