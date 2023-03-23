import { parse } from "csv-parse";
import fs from "node:fs";

const path = new URL("./seed.csv", import.meta.url);

const file = fs.createReadStream(path);

const parser = file.pipe(parse());

let counter = 0;

for await (const record of parser) {
  if (!counter++) continue;

  const task = { title: record[0], description: record[1] };

  try {
    const response = await fetch("http://localhost:3333/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });

    if (response.status >= 400)
      throw new Error(`STATUS: ${response.status} - ${await response.text()}`);
  } catch (e) {
    process.stdout.write(`[record ${counter}] ${e}\n`);
    break;
  }
}

process.stdout.write(`done!\n`);
