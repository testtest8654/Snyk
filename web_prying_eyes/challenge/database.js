const sqlite = require("sqlite-async");
const crypto = require("node:crypto");

class Database {
  constructor(db_file) {
    this.db_file = db_file;
    this.db = undefined;
  }

  async connect() {
    this.db = await sqlite.open(this.db_file);
  }

  async migrate() {
    console.log("Migrating database...");
    return this.db.exec(`
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS posts;

            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username    VARCHAR(32) NOT NULL UNIQUE,
                password    VARCHAR(64) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS posts (
              id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
              createdAt     INTEGER NOT NULL,
              authorId      INTEGER NOT NULL,
              parentId      INTEGER,
              title         VARCHAR(1024),
              message       VARCHAR(1024) NOT NULL,
              attachedImage VARCHAR(256)
            );

            INSERT INTO users (username, password) VALUES ('TheModerator', '40a08c53dec06bdb677c0104975ae3dc'),
                                                          ('relics01',     '4bc85978dab2dbc5854e6ae3047d0701'),
                                                          ('aatjww',       '9b7659a258f0d38bd7d238aee2220241'),
                                                          ('thefroj',      '3807ef9f277d3e94a10a37d8cc595379'),
                                                          ('RE3C3D3D',     'c03ec4216c6a1593c37204b4c6bb9b11'),
                                                          ('Planet98',     'bf99f5418119f065cc9335b64f40d0d4'),
                                                          ('B0z0d',        '81d40c0d3519edb7c92ca7617cfbcf5e'),
                                                          ('XX_HUNTER_XX', '9c277dd76c51fe930d23b6e8b8d5687a'),
                                                          ('hunter2',      '201b5e7355acb7d9141cadec52a44631'),
                                                          ('onion',        '2131bbaa0c9c784b88f85ff244cd4135');

            INSERT INTO posts (createdAt, authorId, parentId, title, message, attachedImage) VALUES 
              (1672847644857, 1, null,  '[INFO] Welcome to our forum, please read the rules', 'Please obey the rules while posting on this site.\n\n1. All purchases must go through a moderator.\n2. No doxxing, threatening members or leaking of personal data.\n3. Keep all conversation on topic.\n4. Do not upload illegal content to the site.\n\nHave fun.', null),
              (1673076284553, 4, null,  '[SELLING] HackTheBox documents', 'Pack contains 215 PDFs marked confidental or higher. Stolen from HackTheBox internal file hosting. Selling for 8 XMR.', '/uploads/d85b7401f9ceafc7bd036135a1a58bcd'),
              (1673515184519, 6, 1, '', 'Ok but who asked?', null),
              (1674259651852, 1, 2, '', 'Verified contents. Please obey the rules if purchasing.', null),
              (1674412617941, 1, null,  '[BEWARE OF SCAMS] Scam information', 'If you find any posts or receive anything sketchy in relation to our forum, please contact me directly.', null),
              (1674550957289, 7, null,  '[SELLING] clu__y7_9 email credentials', 'missing chars = b and 8. requires mfa access, will only be available for short amount of time!!! contact for price', null),
              (1674620197927, 1, 6, '', 'Please obey the rules if purchasing.', null),
              (1675162886170, 3, 6, '', 'Interested.', null),
              (1676469404975, 6, null,  '[BUYING] Large writeup dumps', 'Willing to purchase large writeup dumps for currently active boxes. Real sellers only. Will work with @TheModerator during purchase. Do not contact me if you''re not willing to give information quickly.', null),
              (1676655840826, 1, 9, '', 'Please obey the rules if selling.', null),
              (1676776427971, 1, null,  'Where to get started with leaks?', 'Lets help out the noobs. Any tips for acquiring data breaches and good places to read about them?', null),
              (1677682268722, 7, 6, '', 'no purchase has been made yet.. still looking for buyers, credentials still work.', '/uploads/da4ac4aef3f08c54b4547a683e2075ab'),
              (1677702813754, 5, null,  '[BUYING] Architecture info', 'buying literally any information on large organisation architecture. redacted proof must be provided before full transfer, happy to use middle person.', null),
              (1677756516426, 8, 9, '', 'careful,, someone tried dm selling writeups, scam?', null),
              (1678295630721, 4, 2, '', 'Bump. Still available. Only selling once.', null);
            `);
  }

  async loginUser(username, password) {
    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        resolve(await stmt.get([username, hashedPassword]));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getUserByUsername(username) {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare("SELECT * FROM users WHERE username = ?");
        resolve(await stmt.get([username]));
      } catch (e) {
        reject(e);
      }
    });
  }

  async registerUser(username, password) {
    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        resolve(await stmt.run([username, hashedPassword]));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getPost(postId) {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare("SELECT * FROM posts WHERE id = ?");
        resolve(await stmt.get([postId]));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getPosts() {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare(
          "SELECT posts.*, users.username, (SELECT count(*) FROM posts as nested WHERE parentId = posts.id) as replies FROM posts LEFT JOIN users ON posts.authorId = users.id WHERE parentId IS NULL"
        );
        resolve(await stmt.all([]));
      } catch (e) {
        reject(e);
      }
    });
  }

  async createPost(authorId, parentId, title, message, image) {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare(
          "INSERT INTO posts (authorId, parentId, title, message, attachedImage, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
        );
        resolve(await stmt.run([authorId, parentId, title, message, image, new Date().getTime()]));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getThread(parentId) {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare(
          "SELECT posts.*, users.username FROM posts LEFT JOIN users ON users.id = posts.authorId WHERE posts.id = ? OR posts.parentId = ?"
        );
        resolve(await stmt.all([parentId, parentId]));
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = Database;
