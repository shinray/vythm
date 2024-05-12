# Vythm

A discord bot in Node.js

## Requirements

-   Node 16
-   Discord.js
-   -   @discordjs/voice
-   libsodium-wrappers
-   ffmpeg-static

## Notes

REQUIRES A VALID TOKEN. for obvious reasons, will not commit it here.

Place token in `src/config.json`

uses lint-staged, airbnb rules, prettier

targets node 16

Client Structure: Handlers read folders and load modules by filename All events
are emitted by Client and need to be handled with an event handler

-   ready event handler handles updating api
-   interactionCreate event handles most interactions (aka commands), so event
    -> interactionhandler -> command code

## TODO

-   create infrastructure for sending messages, instead of writing strings...
-   view queue, pagination
-   play/plause/resume
-   maybe add other features too? time to resurrect xkcd-thief
-   fix yarn/npm confusion
-   fix tslint/eslint confusion
-   clean up comments
-   set up dotenv for secrets
-   add unit testing
-   dockerize!
-   deploy to shinray's raspi
