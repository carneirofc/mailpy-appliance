conn = new Mongo();

const grants = {
  "entries.delete": { desc: "Delete an entry" },
  "entries.insert": { desc: "Insert a new entry" },
  "entries.update": { desc: "Update every aspect of an entry" },
  "groups.delete": { desc: "Delete a group" },
  "groups.disable": { desc: "Disable monitoring for a group" },
  "groups.insert": { desc: "Add groups" },
  "groups.update": { desc: "Update every aspect of a group" },
  "users.update": { desc: "Update user attributes" },
};

const roles = {
  Admin: {
    desc: "Full control over the system",
    grants: [
      grants["entries.delete"],
      grants["entries.insert"],
      grants["entries.update"],
      grants["groups.delete"],
      grants["groups.disable"],
      grants["groups.insert"],
      grants["groups.update"],
      grants["users.update"]
    ]
  },
  Guest: {
    desc: "Read-only",
    grants: []
  }
};

const conditions = {
  "out of range": { desc: "Must remain within the specified range." },
  "superior than": { desc: "Must remain superior than." },
  "inferior than": { desc: "Must remain inferior than." },
  "increasing step": { desc: "Each increasing step triggers an alarm." },
  "decreasing step": { desc: "Each decreasing step triggers an alarm." },
};

const listFromObjects = (objs) => {
  /** Given an object where the key is the corresponding entry name, obtain a list */
  const items = [];
  for (let name in objs) {
    const obj = objs[name];
    items.push({ ...obj, name: name });
  }
  print(items);
  return items;
}

const createConditions = (db) => {
  print(`Creating "conditions" at ${db}`);
  // ----- conditions ------
  db.createCollection("conditions", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "desc"],
        properties: {
          name: {
            bsonType: "string",
            description: "Required string type",
          },
          desc: {
            bsonType: "string",
            description: "Required string type",
          },
        },
      },
    },
  });
  db.conditions.createIndex({ name: 1 }, { unique: true });

  const items = listFromObjects(conditions);
  return db.conditions.insertMany(items);
}

const createGrants = (db) => {
  print(`Creating "grants" at ${db}`);
  db.createCollection("grants", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "desc"],
        properties: {
          name: {
            bsonType: "string",
            description: "Required string type",
          },
          desc: {
            bsonType: "string",
            description: "Required string type",
          },
        },
      },
    },
  });
  db.grants.createIndex({ name: 1 }, { unique: true });

  const items = listFromObjects(grants);
  return db.grants.insertMany(items);
}

const crateGroups = (db) => {
  print(`Creating "groups" at ${db}`);
  // ----- groups ------
  db.createCollection("groups", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "enabled"],
        properties: {
          name: {
            bsonType: "string",
            description: "Group name",
          },
          enabled: {
            bsonType: "bool",
            description: "Is group enabled",
          },
        },
      },
    },
  });
  db.groups.createIndex({ name: 1 }, { unique: true });
}

const createEntries = (db) => {
  print(`Creating "entries" at ${db}`);
  // ----- entries ------
  db.createCollection("entries", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "alarm_values",
          "condition",
          "email_timeout",
          "emails",
          "group",
          "pvname",
          "subject",
          "unit",
          "warning_message",
        ],
        properties: {
          alarm_values: { bsonType: "string" },
          condition: { bsonType: "string" },
          email_timeout: { bsonType: "int" },
          emails: { bsonType: "string" },
          group: { bsonType: "string" },
          pvname: { bsonType: "string" },
          subject: { bsonType: "string" },
          unit: { bsonType: "string" },
          warning_message: { bsonType: "string" },
        },
      },
    },
  });
  db.entries.createIndex(
    { pvname: 1, emails: 1, condition: 1, alarm_values: 1 },
    { unique: true }
  );
}

const createUsers = (db) => {
  print(`Creating "users" at ${db}`);
  // ---- Users ----
  db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["id", "name", "email", "roles"],
        properties: {
          id: {
            bsonType: "string",
            description: "Required string type",
          },
          name: {
            bsonType: "string",
            description: "Required string type",
          },
          email: {
            bsonType: "string",
            description: "Required string type",
          },
          roles: {
            bsonType: "array",
            description: "User roles",
          }
        },
      },
    },
  });
  db.users.createIndex({ id: 1 }, { unique: true });
}

const createRoles = (db) => {
  print(`Creating "roles" at ${db}`);
  // --- Roles ---
  db.createCollection("roles", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "name",
          "desc",
          "grants",
        ],
        properties: {
          name: {
            description: "Role name",
            bsonType: "string",
          },
          desc: {
            description: "Role description",
            bsonType: "string",
          },
          grants: {
            bsonType: "array",
            description: "Role grants"
          }
        }
      }
    }
  });

  const items = listFromObjects(roles);
  return db.roles.insertMany(items);
}

const createDatabase = (name) => {
  print(`Initialising databse ${name}`);

  try {
    // Authorization
    createGrants(db);
    createRoles(db);
    createUsers(db);

    // App bahaviour
    createConditions(db); // Alarm conditions
    createEntries(db);    // Entries
    crateGroups(db);      // Group of entries

  } catch (error) {
    print(`Failed to initialise database ${error}`, error);
    throw error;
  }
}

createDatabase("mailpy");