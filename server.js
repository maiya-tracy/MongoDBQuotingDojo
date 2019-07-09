var express = require("express");

var path = require("path");
var session = require('express-session');

var app = express();
var bodyParser = require('body-parser');
const server = app.listen(1337);
const io = require('socket.io')(server);

app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}))

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Quote');

const flash = require('express-flash');
app.use(flash());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  limit: '5mb'
}));

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


var QuoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    minlength: 5
  },
  quoter: {
    type: String,
    required: true,
    minlength: 2
  }
}, {
  timestamps: true
})
mongoose.model('Quote', QuoteSchema);
var Quote = mongoose.model('Quote');

app.get('/', function(req, res) {
  res.render("index");
});

app.get('/quotes', function(req, res) {
  Quote.find({}, (err, quotes) => {
    if (err) {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash('quoteserrors', err.errors[key].message);
      }
    } else {
      res.render("quotes", {
        quotes: quotes
      });
    }
  });
});

app.post("/quotes", function(req, res) {
  var quote = new Quote({
    quote: req.body.quote,
    quoter: req.body.quoter
  });
  quote.save(function(err) {
    if (err) {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash('quoteserrors', err.errors[key].message);
      }
      // redirect the user to an appropriate route
      res.redirect('/');
    } else {
      res.redirect("/quotes");
    }
  });
});
