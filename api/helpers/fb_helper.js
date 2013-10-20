var settings = require('../config/secrets').facebook;

var appId = settings.appId;
var appSecret = settings.appSecret;

exports.signatureOK = function(sigReq) {
  var crypto = require('crypto');
  var sig_payload = sigReq.split('.');
  var signature = sig_payload[0];
  var payload = sig_payload[1];
  var secret = new Buffer(appSecret, 'utf8');
  var signer = crypto.createHmac('sha256', secret);
  var hash = signer.update(payload).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace('=','');
  return hash === signature;
}