import minimist from "minimist"
import { echo, error } from "./utils.js"

const { _, help, h } = minimist(process.argv.slice(2))

export const cmd = help || h || !_.length ? "help" : _[0]

// The vocabulary identifier is passed as URI or plain number
export const id = (_.length > 1 ? "" + _[1] : "").replace(/^https?:\/\/bartoc\.org\/[a-z+]\/node\//,"")
if (_.length > 1 && !id.match(/^[1-9][0-9]*$/)) {
  error(`Invalid BARTOC Identifier: ${id}`)
}

export const args = _.slice(2)

export function usage(commands) {
  if (cmd == "help") {
    echo(`Usage: ./config ${Object.keys(commands).join("|")} [bartoc-uri]`)
    process.exit()
  } else if (!commands[cmd]) {
    error(`Unknown command: ${cmd}`)
  }
}
