const io = require('socket.io')()

io.on('connection', function(socket) {
    console.log('connection');
})

io.listen(3003);

module.exports = (req, res, next) => {
    console.log('Data event', req.method);
    if (req.method.toLowerCase() !== 'get') {
        io.emit('databaseEvent', {method: req.method});
    }
    next()
}