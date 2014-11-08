var secrets = require('../config/secrets');
var util = require('util');
var request = require('request');
var async = require('async');
var _ = require('lodash');
var moment = require('moment');

var data = [
  {
    name: '런던',
    lat: '51.5286416',
    lon: '-0.1015987',
    span: 'rb-span-2'
  },
  {
    name: '파리',
    lat: '48.8588589',
    lon: '2.3470599'
  },
  {
    name: '케이프타운',
    lat: '-33.9149861',
    lon: '18.6560594'
  },
  {
    name: '모스크바',
    lat: '55.749792',
    lon: '37.632495'
  },
  {
    name: '두바이',
    lat: '25.073858',
    lon: '55.2298444'
  },
  {
    name: '베이징',
    lat: '39.9388838',
    lon: '116.3974589'
  },
  {
    name: '시드니',
    lat: '-33.7969235',
    lon: '150.9224326'
  },
  {
    name: '도쿄',
    lat: '35.673343',
    lon: '139.710388'
  },
  {
    name: '서울',
    lat: '37.5651',
    lon: '126.98955',
    span: 'rb-span-2'
  },
  {
    name: '로스엔젤레스',
    lat: '34.0204989',
    lon: '-118.4117325'
  },
  {
    name: '뉴욕',
    lat: '40.7056308',
    lon: '-73.9780035',
    span: 'rb-span-4'
  }
];

exports.get = function(req, res) {
  getWeather(function(err, result) {
    if (err) {
      res.status(500).json({ error: err });
    }
    else {
      res.render('api/weather', {
        title: '날씨',
        data: result
      });
    }
  });
};

function getWeather(callback) {
  var result = [];

  async.eachSeries(data, function(d, callback) {
    var options = {
      url: util.format('http://apis.skplanetx.com/gweather/forecast/mid?lon=%s&lat=%s&version=1', d.lon, d.lat),
      headers: {
        appKey: secrets.skplanet
      },
      json: true
    };

    request.get(options, function(err, resp, body) {
      if (!err && resp.statusCode == 200) {
        if (body.result.code < 9400) {
          result.push({
            name: d.name,
            span: d.span,
            today: parseForecast(body.gweather.forecastDays[0].forecast.splice(0,1)[0]),
            forecast: _.map(body.gweather.forecastDays[0].forecast, parseForecast)
          });
          callback();
        }
        else {
          callback(body.result.message);
        }
      }
      else {
        callback(body.error);
      }
    });

  }, function(err) {
    callback(err, result);
  });

}

function parseForecast(forecast) {
  return {
    temperature: forecast.temperature.tc.replace(/\..*$/g, ''),
    icon: forecast.sky.icon,
    dayofweek: moment(forecast.time).format('ddd')
  };
}