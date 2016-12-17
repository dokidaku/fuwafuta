fuwa · futa
===========

Yet another thorough solution to live performances with instant comments.

## Directory structure

* `cmtsvr/`: Server-side application with Node.js.
* `player/`: Client-side HTML pages. These are automatically served by running the server-side application.

## Installation

* Make sure you have a relatively-new version of [Node.js](http://nodejs.org/) installed. (v5.10.1 works, others untested)
* On your server, clone the repository and `cd` to the project in a terminal.
* Run `cd ./cmtsvr`.
* Run `npm install` to install dependencies.
* Run `npm test` to run tests. (Optional)
* Modify [`cmtsvr/main.js`](cmtsvr/main.js) to set the passes of different roles.
* Run `npm start` to start the whole application.

## Usage

* `http://<ip>:6033/*` will be the commenting API server.
* `http://<ip>:6033/player/*` will be the player's static file server.
* The default HLS stream to play is `http://localhost:6060/master.m3u8`.
    - Can be changed at [`player/play.html`](player/play.html).
    - Can be tested with [`HLS Endless`](https://github.com/dayvson/hls-endless).

## IM server API

### `POST /verify`
- (POST body): (String) the pass

Verification. Send a secret pass as the whole request body to prove that the server is an authorized IM server.

Body sample: `$$$letmeinImtheWeChatserver$$$`

### `POST /new_client`
- (POST body) **uid_sub**: (String) the sub-client ID

Creates a new sub-client. Enclose an ID (OpenID, etc.) of a user in the request to notify the server of a newcomer.

Body sample: `uid_sub=d41d8cd98f00b204e9800998ecf8427e`

### `POST /new_comment`
- (POST body) **uid_sub**: (String) the sub-client ID
- (POST body) **text**: (String) the text of the comment
- (POST body) **attr**: (String) the attribute in the form of `<colour>;<position>`, where `<position>` is a character `t` (top) or `b` (bottom)

Creates a new comment. The sub-client ID should be registered by `/new_client` first.

Body sample: `uid=d41d8cd98f00b204e9800998ecf8427e&text=Hello+World&attr=#ffffff;t`

**Note: bodies in encoded-form or JSON format can both be accepted.**

## TODO

* ~~Remove `/new_client` and handle regstration internally~~ (Done)
* Test the IM APIs
* Use an environment variable to decide the port to listen on
* Folder structure refactoring
* WeChat integration
