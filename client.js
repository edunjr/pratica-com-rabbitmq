const amqp = require('amqplib/callback_api');
const uuid = require('uuid/v4');
var args = process.argv.slice(2);

if (args.length == 0) {
	console.log('Usage: client.js num');
	process.exit(1);
}

amqp.connect('amqp://localhost', (error, connection) => {
	connection.createChannel((error, channel) => {
		// Queue anonima?
		channel.assertQueue('', {exclusive: true}, (error, assertedQueue) => {
			// Lembrar de testar pra ver qual é a saída fornecida por uuid();
			var cID = uuid();
			console.log('cID: ' + cID);

			// Quem é number?
			var number = parseInt(args[0]);

			console.log(`[x] Requesting fib${number}`);
			
			channel.consume(assertedQueue.queue, (message) => {
				console.log('correlationId: ' + message.properties.correlationId);
				if (message.properties.correlationId == cID) {
					console.log(` [.] Got ${message.content.toString()}`);
					
					setTimeout( function(){
						// Fecha a conexõo com o worker. 
						connection.close();
						process.exit(0)
					}, 500);
				}
			}, {noAck: true}); // Lembrar o porquê no noAck.

			channel.sendToQueue('rpc_queue', new Buffer(number.toString()), { 
				correlationId: cID, 
				replyTo: assertedQueue.queue	
			});
		});
	});
});

