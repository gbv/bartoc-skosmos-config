import chalk from "chalk"
import { echo } from "zx"
export { echo }

export function error(msg) {
  console.warn(chalk.red(msg))
  process.exit(1)
}

export const ok = msg => console.log(chalk.green(msg))
export const warn = msg => console.log(chalk.magenta(msg))

import fs from 'fs'
import CSV from "comma-separated-values"

export function readCSV(file) {
  const options = { header: true, cast: false, cellDelimiter: ","}
  const csv = new CSV(fs.readFileSync(file).toString(), options)
  const data = csv.parse()
  if (!data) {
    throw new Exception(`Failed to load CSV from ${file}!`)
  }
  return data
}

