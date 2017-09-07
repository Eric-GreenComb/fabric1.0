/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
// var expressJWT = require('express-jwt');
// var jwt = require('jsonwebtoken');
// var bearerToken = require('express-bearer-token');
var cors = require('cors');
var config = require('./config.json');
var helper = require('./app/helper.js');
var channels = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));
// set secret variable
// app.set('secret', 'thisismysecret');
// app.use(expressJWT({
// 	secret: 'thisismysecret'
// }).unless({
// 	path: ['/users']
// }));
// app.use(bearerToken());
app.use(function (req, res, next) {
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

	return next();

	// var token = req.token;
	// jwt.verify(token, app.get('secret'), function (err, decoded) {
	// 	if (err) {
	// 		res.send({
	// 			success: false,
	// 			message: 'Failed to authenticate token. Make sure to include the ' +
	// 			'token returned from /users call in the authorization header ' +
	// 			' as a Bearer token'
	// 		});
	// 		return;
	// 	} else {
	// 		// add the decoded user name and org name to the request object
	// 		// for the downstream code to use
	// 		req.username = decoded.username;
	// 		req.orgname = decoded.orgName;
	// 		logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
	// 		return next();
	// 	}
	// });
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function () { });
logger.info('****************** SERVER STARTED ************************');
logger.info('**************  http://' + host + ':' + port +
	'  ******************');
server.timeout = 240000;

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}

// 
app.get('/', function (req, res) {
	res.send('Fabric HTTP-API');
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST API START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Invoke createObj on chaincode on target peers
app.post('/createObj', function (req, res) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = new Array(config.peers);

	var channelName = config.channelName;
	var chaincodeName = config.chaincodeName;

	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	req.username = config.userName;
	req.orgname = config.orgName;

	invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});

// Query to queryObj
app.post('/queryObj', function (req, res) {
	logger.debug('==================== QUERY BY queryObjs ==================');

	var channelName = config.channelName;
	var chaincodeName = config.chaincodeName;

	let peer = config.peer1;

	var fcn = req.body.fcn;
	var args = req.body.args;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	req.username = config.userName;
	req.orgname = config.orgName;

	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});

// Query to queryObjs
app.post('/queryObjs', function (req, res) {
	logger.debug('==================== QUERY BY queryObjs ==================');

	var channelName = config.channelName;
	var chaincodeName = config.chaincodeName;

	let peer = config.peer1;

	var fcn = req.body.fcn;
	var args = req.body.args;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	req.username = config.userName;
	req.orgname = config.orgName;

	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});

//Query for Channel Information
app.get('/channel/height', function (req, res) {
	let peer = config.peer1;

	req.username = config.userName;
	req.orgname = config.orgName;

	query.getChainInfo(peer, req.username, req.orgname).then(
		function (message) {
			res.send(message.height);
		});
});

//  Query Get Block by BlockNumber
app.get('/channel/blocks/:blockId', function (req, res) {
	let blockId = req.params.blockId;
	let peer = config.peer1;
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}

	req.username = config.userName;
	req.orgname = config.orgName;

	query.getBlockByNumber(peer, blockId, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Register and enroll user
app.post('/users', function (req, res) {
	var username = req.body.username;
	var orgName = req.body.orgName;
	logger.debug('End point : /users');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	// var token = jwt.sign({
	// 	exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
	// 	username: username,
	// 	orgName: orgName
	// }, app.get('secret'));
	helper.getRegisteredUsers(username, orgName, true).then(function (response) {
		if (response && typeof response !== 'string') {
			// response.token = token;
			response.token = "token";
			res.json(response);
		} else {
			res.json({
				success: false,
				message: response
			});
		}
	});
});
// Create Channel
app.post('/channels', function (req, res) {
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug('End point : /channels');
	var channelName = req.body.channelName;
	var channelConfigPath = req.body.channelConfigPath;
	logger.debug('Channel name : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!channelConfigPath) {
		res.json(getErrorMessage('\'channelConfigPath\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	logger.debug('req.username : ' + req.username);
	logger.debug('req.orgname : ' + req.orgname);
	channels.createChannel(channelName, channelConfigPath, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Join Channel
app.post('/channels/:channelName/peers', function (req, res) {
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = req.params.channelName;
	var peers = req.body.peers;
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	join.joinChannel(channelName, peers, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Install chaincode on target peers
app.post('/chaincodes', function (req, res) {
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodePath) {
		res.json(getErrorMessage('\'chaincodePath\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Instantiate chaincode on target peers
app.post('/channels/:channelName/chaincodes', function (req, res) {
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var functionName = req.body.functionName;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('functionName  : ' + functionName);
	logger.debug('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!functionName) {
		res.json(getErrorMessage('\'functionName\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, functionName, args, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', function (req, res) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Query on chaincode on target peers
app.get('/channels/:channelName/chaincodes/:chaincodeName', function (req, res) {
	logger.debug('==================== QUERY BY CHAINCODE ==================');
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeName;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	logger.debug(args);

	req.username = "ministor";
	req.orgname = "org1";

	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
//  Query Get Block by BlockNumber
app.get('/channels/:channelName/blocks/:blockId', function (req, res) {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.params.blockId;
	let peer = req.query.peer;
	logger.debug('channelName : ' + req.params.channelName);
	logger.debug('BlockID : ' + blockId);
	logger.debug('Peer : ' + peer);
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	query.getBlockByNumber(peer, blockId, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Query Get Transaction by Transaction ID
app.get('/channels/:channelName/transactions/:trxnId', function (req, res) {
	logger.debug(
		'================ GET TRANSACTION BY TRANSACTION_ID ======================'
	);
	logger.debug('channelName : ' + req.params.channelName);
	let trxnId = req.params.trxnId;
	let peer = req.query.peer;
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	query.getTransactionByID(peer, trxnId, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Query Get Block by Hash
app.get('/channels/:channelName/blocks', function (req, res) {
	logger.debug('================ GET BLOCK BY HASH ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let hash = req.query.hash;
	let peer = req.query.peer;
	if (!hash) {
		res.json(getErrorMessage('\'hash\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	query.getBlockByHash(peer, hash, req.username, req.orgname).then(
		function (message) {
			res.send(message);
		});
});
//Query for Channel Information
app.get('/channels/:channelName', function (req, res) {
	logger.debug(
		'================ GET CHANNEL INFORMATION ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	req.username = "ministor";
	req.orgname = "org1";

	query.getChainInfo(peer, req.username, req.orgname).then(
		function (message) {
			res.send(message);
		});
});
// Query to fetch all Installed/instantiated chaincodes
app.get('/chaincodes', function (req, res) {
	var peer = req.query.peer;
	var installType = req.query.type;
	//TODO: add Constnats
	if (installType === 'installed') {
		logger.debug(
			'================ GET INSTALLED CHAINCODES ======================');
	} else {
		logger.debug(
			'================ GET INSTANTIATED CHAINCODES ======================');
	}

	req.username = "ministor";
	req.orgname = "org1";

	query.getInstalledChaincodes(peer, installType, req.username, req.orgname)
		.then(function (message) {
			res.send(message);
		});
});
// Query to fetch channels
app.get('/channels', function (req, res) {
	logger.debug('================ GET CHANNELS ======================');
	logger.debug('peer: ' + req.query.peer);
	var peer = req.query.peer;
	if (!peer) {
		res.json(getErrorMessage('\'peer\''));
		return;
	}

	req.username = "ministor";
	req.orgname = "org1";

	query.getChannels(peer, req.username, req.orgname)
		.then(function (
			message) {
			res.send(message);
		});
});


