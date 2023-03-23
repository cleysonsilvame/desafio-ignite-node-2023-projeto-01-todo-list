import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then(data => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
  }

  #getIndex(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if (rowIndex === -1) throw new Error(`${table.slice(0, -1)} not found`);

    return rowIndex;
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          if (!value) return true;

          return row[key].includes(value);
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#getIndex(table, id);

    const row = this.#database[table][rowIndex];
    this.#database[table][rowIndex] = { id, ...row, ...data };
    this.#persist();
  }

  delete(table, id) {
    const rowIndex = this.#getIndex(table, id);

    this.#database[table].splice(rowIndex, 1);
    this.#persist();
  }
}
