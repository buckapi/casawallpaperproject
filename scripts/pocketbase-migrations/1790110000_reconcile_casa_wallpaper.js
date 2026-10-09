/// <reference path="../../pb_data/types.d.ts" />

const systemFields = () => [
  {
    autogeneratePattern: "[a-z0-9]{15}", hidden: false,
    id: "text3208210256", max: 15, min: 15, name: "id",
    pattern: "^[a-z0-9]+$", presentable: false, primaryKey: true,
    required: true, system: true, type: "text",
  },
  {
    hidden: false, id: "autodate2990389176", name: "created",
    onCreate: true, onUpdate: false, presentable: false,
    system: false, type: "autodate",
  },
  {
    hidden: false, id: "autodate3332085495", name: "updated",
    onCreate: true, onUpdate: true, presentable: false,
    system: false, type: "autodate",
  },
];

const textField = (id, name) => ({
  autogeneratePattern: "", hidden: false, id, max: 0, min: 0, name,
  pattern: "", presentable: false, primaryKey: false, required: false,
  system: false, type: "text",
});

const jsonField = (id, name) => ({
  hidden: false, id, maxSize: 0, name, presentable: false,
  required: false, system: false, type: "json",
});

const fileField = (id, name, maxSelect, maxSize) => ({
  hidden: false, id, maxSelect, maxSize, mimeTypes: [], name,
  presentable: false, protected: false, required: false, system: false,
  thumbs: [], type: "file",
});

const selectField = (id, name, values) => ({
  hidden: false, id, maxSelect: 1, name, presentable: false,
  required: false, system: false, type: "select", values,
});

const publicCollection = (id, name, fields) => new Collection({
  createRule: "", deleteRule: "", fields: [...systemFields(), ...fields],
  id, indexes: [], listRule: "", name, system: false, type: "base",
  updateRule: "", viewRule: "",
});

migrate((app) => {
  // The generic legacy images records belong to several other projects.
  // Only the empty schema is retained because current Casa Wallpaper code
  // still knows how to create records in this collection.
  const images = publicCollection("5bjt6wpqfj0rnsl", "images", [
    fileField("jjqmldpp", "image", 1, 50242880),
    textField("0nggf6ew", "type"),
    textField("5elndbru", "userId"),
  ]);
  app.save(images);

  const portfolio = publicCollection("mqws7b1oyrxdj63", "potfolioCasa", [
    textField("mchmqb59", "name"),
    {
      cascadeDelete: false, collectionId: "5bjt6wpqfj0rnsl", hidden: false,
      id: "hxepcy7k", maxSelect: 99, minSelect: 0, name: "img",
      presentable: false, required: false, system: false, type: "relation",
    },
    selectField("6ebhqobi", "type", ["img", "video"]),
    selectField("bpkqgvqe", "tag", ["residencial", "comercial"]),
    fileField("5zktyl1l", "images", 99, 5242880),
    selectField("qpa81k12", "sourceType", ["upload", "instagram"]),
    textField("dik9ahyl", "instagramUrl"),
  ]);
  app.save(portfolio);

  const instagram = new Record(portfolio);
  instagram.set("id", "numh4hezdn29gdp");
  instagram.set("name", "buckapi tes");
  instagram.set("type", "video");
  instagram.set("tag", "residencial");
  instagram.set("sourceType", "instagram");
  instagram.set("instagramUrl", "https://www.instagram.com/reels/DXn-0f7u5_k/");
  app.save(instagram);

  const services = publicCollection("x9j03rnewcac7va", "serviceCasa", [
    textField("hykyun5t", "name"),
    fileField("bgegwoof", "images", 99, 5242880),
    jsonField("7mbyyc74", "items"),
    textField("hxela6wn", "description"),
    textField("shsjtlli", "preitems"),
    jsonField("ivql6kza", "lidescription"),
  ]);
  app.save(services);

  const users = app.findCollectionByNameOrId("users");
  let admin = null;
  try {
    admin = app.findAuthRecordByEmail("users", "admin@walivio.com/");
  } catch (_) {
    admin = new Record(users);
    admin.set("email", "admin@walivio.com/");
    admin.set("name", "Casa Wallpaper Admin");
    admin.set("type", "admin");
    admin.set("emailVisibility", false);
    admin.set("verified", true);
    admin.setPassword($security.randomString(48));
    app.save(admin);
  }
}, (app) => {
  try {
    const admin = app.findAuthRecordByEmail("users", "admin@walivio.com/");
    app.delete(admin);
  } catch (_) {}

  for (const name of ["serviceCasa", "potfolioCasa", "images"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name));
    } catch (_) {}
  }
});
