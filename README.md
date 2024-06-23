# Vythm

A discord bot in Node.js

## Requirements

-   Node 16+
-   Discord.js
    -   @discordjs/voice
-   play-dl
-   libsodium-wrappers
-   ffmpeg-static

## Notes

REQUIRES A VALID TOKEN. for obvious reasons, will not commit it here.

Place token in `src/config.json`

uses lint-staged, airbnb rules, prettier

targets node 16+ (tested with node 20 LTS)

Client Structure: Handlers read folders and load modules by filename All events
are emitted by Client and need to be handled with an event handler

-   ready event handler handles updating api
-   interactionCreate event handles most interactions (aka commands), so event
    -> interactionhandler -> command code

## TODO

-   create infrastructure for sending messages, instead of writing strings...
-   extract "is in voice channel" to a decorator, maybe other decorators too
-   view queue, pagination
-   play/plause/resume
-   now playing (and timestamp of current song)
-   seek (this may be impossible)
-   maybe add other features too? time to resurrect xkcd-thief
-   investigate other stream downloader backends, since play-dl may not be actively developed
-   fix yarn/npm confusion
-   fix tslint/eslint confusion
-   setup a real logger instead of this console.log stuff
-   clean up comments
-   consider changing to normal functions instead of arrow
-   set up dotenv for secrets
-   add unit testing
-   dockerize!
-   deploy to shinray's raspi
