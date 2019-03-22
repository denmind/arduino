var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require("path");
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const PIN_LED = 13;
const PIN_BUTTON = 2;
const PIN_POTENTIO = "A4";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var five = require("johnny-five"),potentiometer,tactileSwitch,led;
var board = new five.Board();

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/midterm.html'));
});

board.on('ready', function () {
    var self = this;

    console.log('Arduino is ready'); 
    potentiometer = new five.Sensor({
        //PIN FOR POTENTIO
        pin: PIN_POTENTIO,
        freq: 255
    });

    tactileSwitch = new five.Button({
        //PIN FOR BUTTONs
        pin: PIN_BUTTON,
        isPullup: true
    });

    led = new five.Led(13);

    potentiometer.scale(0, 255).on("data", function () {
        var value = this.value;
        console.log(parseInt(value));
        board.emit('value', { value: value });
        self.analogWrite(PIN_LED, value);
    });

    tactileSwitch.on("down", function (value) {
        led.on();
        board.emit('switch', 'on');
        //sself.digitalWrite(PIN_LED, 1);
    });

    tactileSwitch.on("up", function () {
        led.off();
        board.emit('switch', 'off');
        //self.digitalWrite(PIN_LED, 0);
    });

    tactileSwitch.on("hold", function () {
        board.emit('switch', 'hold');
    });

    
});
io.sockets.on('connection', function (socket) {
    board.on('value', function (val) {
        socket.emit('value', { val: val });
    });
    board.on('switch', function (value) {
        socket.emit('switch', {value: value});
    });
}); 
const port = process.env.PORT || 3000;
server.listen(port);