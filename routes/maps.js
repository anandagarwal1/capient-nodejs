let express = require('express');
let router = express.Router();
var http = require('http');
var request = require('request');


router.get('/GetTwitterFeeds/:search', function (req, res) {
    console.log('Getting GetTwitterFeeds');
    var search = req.params.search;
    console.log(search);
    var authenticationHeader = "bearer AAAAAAAAAAAAAAAAAAAAAEwK6gAAAAAAHfu999wp3lUxzTubRyjVJfmAS2k%3DMsyLKK8PhJPHn5SA3oHnHlkgLK94FCXTuXkbd43dvOn0vdBPvF";
    var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + search + '&count=100;rpp=100&geocode=39.8,-95.583068847656,2500km';
    request({
        url: url,
        headers: { "Authorization": authenticationHeader }
    },
        function (error, response, body) {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
            else {
                res.status(200).json(body);
            }
        }
    );
});

router.get('/get-facebook-data', function (req, res) {
    console.log('Getting facebook feeds');
 //  var search = req.params.search;
  //  console.log(search);
    var authenticationHeader = "EAAaY3eYCkrIBAFKZAkZA2yCkzT8YZC0RTVUzJf96FYm91ZAvuAD40c6tJSFOInuG4UpBa33LZCRymSkK8xN7ZBjbxLXo4dlsOW4GsXHzLaQUfcXbX29WeZBwUdiCtJpy7fspSlIvVvxQaFud6gLRxl6ThbwCpZCFpFunCukuHFYehXgdoxUXZC8PrFqTNzlN9yhO1fTMQ3bvrY4Kco0eHfOVDY8EGaK5c7r4UZCuqp340gxwZDZD";
    var url = 'https://graph.facebook.com/search? q=coffee&type=place&center=37.76,-122.427&distance=1000&fields=checkins,description,hours,location,name';
    request({
        url: url,
        auth: {
            'bearer': authenticationHeader
          }
    },
        function (error, response, body) {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
            else {
                res.status(200).json(body);
            }
        }
    );
});

module.exports = router;