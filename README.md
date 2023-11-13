# Vythm

A discord bot in Node.js

## Notes

REQUIRES A VALID TOKEN. for obvious reasons, will not commit it here.

Place token in `src/config.json`

uses lint-staged, airbnb rules, prettier

targets node 16

Client Structure:
Handlers read folders and load modules by filename
All events are emitted by Client and need to be handled with an event handler
* ready event handler handles updating api
* interactionCreate event handles most interactions (aka commands), so event -> interactionhandler -> command code

## TODO
clean up comments
clean up lint errors (far too many uses of `any`)
set up dotenv for secrets
handle ready event in standardized way, hook all initialization into ready event
actually import dl library and do the work
add unit testing