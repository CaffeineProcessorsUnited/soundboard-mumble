var mumble = require('mumble');

var options = {
    //key: fs.readFileSync( 'key.pem' ),
    //cert: fs.readFileSync( 'cert.pem' )
};

console.log( 'Connecting' );
mumble.connect( 'mumble://mygamehub.de', options, function ( error, connection ) {
    if( error ) { throw new Error( error ); }
    console.log( 'Connected' );
    connection.authenticate( 'SoundboardJudge' );
    connection.on( 'initialized', onInit );
    connection.on( 'voice', onVoice );
});

var onInit = function() {
    console.log( 'Connection initialized' );
    // Connection is authenticated and usable.
};

var onVoice = function( voice ) {
    console.log( "Recieving Voice Data" );
};
