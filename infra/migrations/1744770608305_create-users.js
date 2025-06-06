exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    //For reference: Github limits usernames to 39 characters
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    //For reference: the maximum length of an email address is 254 characters
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    //For reference: the maximum length that bcrypt can hash is 72 characters
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
  });
};

exports.down = false;
