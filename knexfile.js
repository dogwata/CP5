// Update with your config settings.

module.exports = {

  development: {
    client: 'mariasql',
    connection: {
      unixSocket : '/var/run/mysqld/mysqld.sock',
      user     : 'root',
      db : 'redbird',
      charset  : 'utf8'
      //host     : '127.0.0.1',
      //user     : 'root',
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
