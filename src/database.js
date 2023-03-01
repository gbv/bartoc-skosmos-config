import { $ } from "zx"
import fs from "fs"
import { echo, error } from "./utils.js"

// Implements a subset of SPARQL Graph Store protocol

export class FusekiClient {

  constructor(base) {
    this.base = base
  }

  requestUrl(graph) {
    const query = graph == "default" ? "default" : new URLSearchParams({graph})
    return `${this.base}/skosmos/data?${query}`
  }

  async putGraph(graph, file) {
    if (!fs.existsSync(file)) {
      error(`Missing ${file} to load`)
    }
    echo(`# Loading ${file} as ${graph} into ${this.base}`)
    return $`/opt/fuseki/bin/s-put ${this.base}/skosmos/data ${graph} ${file}`
  }

  async deleteGraph(graph) {
    echo(`# Unloading ${graph} from ${this.base}`)
    return fetch(this.requestUrl(graph), { method: "DELETE" })
	.then(res => res.ok ? res : (()=>{throw new Error(res.statusText)})())
  }
}
