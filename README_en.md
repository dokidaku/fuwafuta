![banner](banner.png)

[简体中文](README.md)

Two Double Three · Connect
==========================

Danmaku can be flying everywhere (/=w=)~

And it's more than a mobile screen, more than texts, and more than the repeating 233333's.


TL;DR
=====

Go all the way down to [Installing and Configuration](#Installing and Configuration)

So what is this about
=====================

*Bullet Hell* (aka *Bullet Curtain*, but simply called *Comment* in Japan)
is a type of comment system, originated from the commenting system
of [Nico Nico Douga](https://en.wikipedia.org/wiki/Niconico).

…Then people started to think about moving them out of desktop & mobile
screens, onto bigger screens during a performance or such things.

This project provides a perfect ~~(-ish)~~ approach of doing this.

Features & Highlights
=====================

* Everything Nico Nico has
* An HTML5 client to send comments, ~~perhaps~~ supports mobile devices
* Based on Socket.IO, real-time can be achieved (if the network works well)
* Administration console to keep the big screen clean
  * Accept/reject comments
  * When rejecting, provide a reason to avoid being misunderstood
  * Through this way the audience can chat with administrators (Nope)
  * Get keyword filtering, or disable the administrating functionality completely
* Would you imagine drawing to comment??
* And advanced/script comments (No not possible right now ♪───Ｏ（≧∇≦）Ｏ────♪)

Installing and Configuration
============================

Server side installation
------------------------

First we get a server of (almost) any operating system (Windows is okay but *nix is better ^^).

Then we install Node.JS on it. (You can ask a coder—or me—for help).

And get this project's files onto that machine, by `git clone` or FTP or anything you like. Then

```bash
$ cd server
$ npm install -i -g
$ node main.js -p 8080
``` 
…and we're done.

Client (Display) side installation
----------------------------------

Install .NET Framework 4.0 or Wine—Mono doesn't seem to support transparent regions?

Copy `TwoDoubleThree-Connect.exe` to the computer connected to the big screen.

Client (Display) side configuration
-----------------------------------

Under the same directory as the executable file, create a `settings.txt`.
Every line contains information in the format `[Name] - [Value]`

of which `[Name]` can be one of the following:

* `Host`: The URL of the server. Add a port if you want.
* `Font Family`: The name of the font to display comments.
* `Font Size`: Font size.
* `Line Height`: Distance between two rows of comments.
* `Timer Interval`: The time interval of display refreshing. Adjust if the display is not fluid enough.
* `Display Layers`: The maximum layers of comments. Each layer is the same size as screen and contains
  many rows. Comments in different rows of one layer will never intersect.

The Administration Console
==========================

Add `/admin` to the server URL to enter the administration console.
The passcode is shown in the console/terminal of the server, which changes once every minute.

```
Current passcode: 3db41a8f4ae812c830a9c3035670ff07
```

After that you'll be able to see all comments and decide whether they'll appear on the big screen.
Those will not be sent there before you click 'accept' or enable 'bypass'.

More Stuff && Gallery
=====================

Visit our [project site](#) (under construction = =).

Licences
========

[The MIT/Expat License]()

Artwork: [CC BY 4.0 International](http://creativecommons.org/licenses/by/4.0/)

(To be continued)
