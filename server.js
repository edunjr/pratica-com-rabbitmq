var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (error, connection) => {
  connection.createChannel((error, channel) => {
    var q = 'rpc_queue';
    
    channel.assertQueue(q, {durable: false});

    console.log(' [x] Waiting for a client to make a request...');

    channel.consume(q, function reply(message) {
      console.log('correlationId (server): ' + message.properties.correlationId);
      var n = parseInt(message.content.toString());
      //console.log(` [.] fibonacci ${d}`);
      console.log(' [.] fibonacci (%d)', n);

      var result = fibonacci(n);

      // Rever daqui pra baixo
      var replyTo = message.properties.replyTo;

      channel.sendToQueue(replyTo, new Buffer(result.toString()), {
        correlationId: message.properties.correlationId
      });

      channel.ack(message);
    });
  });
});

function fibonacci(n) {
  if (n == 0 || n == 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}