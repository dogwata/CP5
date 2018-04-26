const express = require('express');
const bodyParser = require("body-parser");
const when = require('when');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

const jwt = require('jsonwebtoken');
let jwtSecret = process.env.jwtSecret;
if (jwtSecret === undefined) {
  console.log("You need to define a jwtSecret environment variable to continue.");
  knex.destroy();
  process.exit();
}

const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

let bcrypt = require('bcrypt');
const saltRounds = 10;

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log("TOKEN: "+token+ " "+req.headers);
  if (!token)
    return res.status(403).send({ error: 'No token provided.' });
  jwt.verify(token, jwtSecret, function(err, decoded) {
    if (err)
      return res.status(500).send({ error: 'Failed to authenticate token.' });
    req.userID = decoded.id;
    next();
  });
}

app.get('/api/me', verifyToken, (req,res) => {
  knex('users').where('id',req.userID).first().select('username','name','id').then(user => {
    console.log(user+ " "+user.id);
    res.status(200).json({user:user});
  }).catch(error => {
    res.status(500).json({ error });
  });
});

app.post('/api/login', (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send();
  knex('users').where('email',req.body.email).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Invalid credentials");
      throw new Error('abort');
    }
    return [bcrypt.compare(req.body.password, user.hash),user];
  }).spread((result,user) => {
    if (result) {
       let token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: 86400
       });
      res.status(200).json({user:{username:user.username,name:user.name,id:user.id},token:token});
    } else {
       res.status(403).send("Invalid credentials");
    }
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

app.get('/api/channels/:gid/:id', verifyToken, (req, res) => {
  console.log("here7");
  let offset = 0;
  if (req.query.offset)
    offset = parseInt(req.query.offset);
  let limit = 50;
  if (req.query.limit)
    limit = parseInt(req.query.limit);

  let gid = parseInt(req.params.gid);
  let id = parseInt(req.params.id);

  console.log("gid:"+gid);
  console.log("id:"+id);

  knex('followers').where('user_id', id).where('follows_id', gid).first().then(user => {
      console.log("HERE10"+user);
      if (typeof user === 'undefined') {
           res.status(500).json( "Not authorized" );
           sent = 1;
           return;
      } else {

  knex('users').join('tweets', 'users.id', 'tweets.user_id')
    .where('group_id',gid)
    .orderBy('created', 'desc')
    .select('tweets.id','tweet','username','name', 'created', 'user_id as userID', 'group_id').then(tweets => {
    res.status(200).json({tweets:tweets});
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });

  }});
});

app.delete('/api/channels/:gid/:id/:msg_id', verifyToken, (req,res) => {
  let gid = parseInt(req.params.gid);
  let id = parseInt(req.params.id);
  let msg_id = parseInt(req.params.msg_id);
  console.log("gid "+gid+ " id "+id+ " msgid "+msg_id);

  let sent = 0;
  knex('followers').where('user_id', id).where('follows_id', gid).first().then(user => {
      console.log("HERE10"+user);
      if (typeof user === 'undefined') {
           res.status(500).json( "Not authorized" );
           sent = 1;
           return;
      } else {

  if (sent == 1) { return; }
  console.log("here10");

  knex('users').where('id',id).first().then(user => {
    return knex('tweets').where('id', msg_id).first().del()
        .catch(error => { res.status(500).json({error}); sent = 1; } );
  }).then(tweet => {
    if (sent != 1) {
       res.status(200).json({tweet:tweet});
       return;
    }
  }).catch(error => {
    if (sent != 1) {
      console.log(error);
      res.status(500).json({ error });
    }
  });

  }});
});

app.put('/api/channels/:gid', verifyToken, (req, res) => {
  let gid = parseInt(req.params.gid);
  console.log(gid);
  if (typeof gid === 'undefined') { return res.status(400).send(); }

  knex('groups').where('group_id', gid).update({ 'direct': 1 }).then(() => {
      console.log("updated");
      res.status(200).json({groups: 'none'});
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

app.post('/api/channels', verifyToken, (req, res) => {
  console.log("CREATE: "+req.body.groupname+ " "+req.body.description);
  if (!req.body.groupname || typeof req.body.description === 'undefined'
        || typeof req.body.public === 'undefined' || typeof req.body.direct === 'undefined') {
    console.log("HERE");
    return res.status(400).send();
  }
  knex('groups').where('name', req.body.groupname).first().then(user => {
    if (user !== undefined) {
      console.log("Reopen group "+user);
      res.status(200).send({group:user.group_id});
      throw new Error('abort');
    }
  }).then(() => {
    return knex('groups').insert({name: req.body.groupname, description:req.body.description,
                                 public:req.body.public, direct: 0});
  }).then(group => {
    console.log("Creating group");
    console.log(group);
    res.status(200).json({group:group});
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

app.get('/api/users/:id', (req, res) => {
  let id = parseInt(req.params.id);
  knex('users').where('id',id).first().select('username','name','id').then(user => {
    res.status(200).json({user:user});
  }).catch(error => {
    res.status(500).json({ error });
  });
});


app.post('/api/users', (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.username || !req.body.name)
    return res.status(400).send();
  knex('users').where('email',req.body.email).first().then(user => {
    if (user !== undefined) {
      res.status(403).send("Email address already exists");
      throw new Error('abort');
    }
    return knex('users').where('username',req.body.username).first();
  }).then(user => {
    if (user !== undefined) {
      res.status(409).send("User name already exists");
      throw new Error('abort');
    }
    return bcrypt.hash(req.body.password, saltRounds);
  }).then(hash => {
    return knex('users').insert({email: req.body.email, hash: hash, username:req.body.username,
				 name:req.body.name, role: 'user'});
  }).then(ids => {
    return knex('users').where('id',ids[0]).first().select('username','name','id');
  }).then(user => {
    //res.status(200).json({user:user});
    let token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).json({user:user,token:token});

    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

/*
app.delete('/api/users/:id', (req, res) => {
  let id = parseInt(req.params.id);
  knex('users').where('id',id).first().del().then(user => {
    res.sendStatus(200);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});
*/

app.get('/api/channels/user/1/:id', verifyToken, (req, res) => {
  let id = parseInt(req.params.id);
  console.log("here6 "+req.params.id);
  knex('followers').join('groups','followers.follows_id','groups.group_id')
    .where('followers.user_id',id)
    .where('groups.direct', 1)
    .orderBy('name','asc') //asc is default anyway but yeah
    .select('group_id', 'name','description', 'public', 'direct').then(tweets => {
      res.status(200).json({groups:tweets});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

app.post('/api/channels/:id/:gid', verifyToken, (req, res) => {
  let id = parseInt(req.params.id);
  let gid = parseInt(req.params.gid);
  let sent =0;
  knex('followers').where('user_id', id).where('follows_id', gid).first().then(user => {
      console.log("HERE10"+user);
      if (typeof user === 'undefined') {
           res.status(500).json( "Not authorized" );
           sent = 1;
           return;
      } else {

  if (sent == 1) { return; }
  console.log("here10");

  knex('users').where('id',id).first().then(user => {
   return knex('tweets').insert({user_id: id, tweet:req.body.tweet, created: new Date(),group_id: gid});
  }).then(ids => {
    return knex('tweets').where('id',ids[0]).first();
  }).then(tweet => {
    res.status(200).json({tweet:tweet});
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });

  }});
});

/*
app.delete('/api/users/:id/tweets/:tweetId', (req, res) => {
  let id = parseInt(req.params.id);
  let tweetId = parseInt(req.params.tweetId);
  knex('users').where('id',id).first().then(user => {
    return knex('tweets').where({'user_id':id,id:tweetId}).first().del();
  }).then(tweets => {
    res.sendStatus(200);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});
*/

app.get('/api/tweets/hash/:hashtag', (req, res) => {
  let offset = 0;
  if (req.query.offset)
    offset = parseInt(req.query.offset);
  let limit = 50;
  if (req.query.limit)
    limit = parseInt(req.query.limit);
  knex('users').join('tweets','users.id','tweets.user_id')
    .whereRaw("tweet REGEXP '^#" + req.params.hashtag + "' OR tweet REGEXP ' #" + req.params.hashtag + "'")
    .orderBy('created','desc')
    .limit(limit)
    .offset(offset)
    .select('tweet','username','name','created','users.id as userID').then(tweets => {
      res.status(200).json({tweets:tweets});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

app.get('/api/users/name/:id', verifyToken, (req,res) => {
  let id = req.params.id;
  console.log("GetUser:"+id);
  knex('users').where('username', id).first().then(user => {
        if (!user) { throw new Error("Username does not exist") };
        return user.id;
     }).then( id => {res.status(200).json(id);} ).catch(error => { console.log(error); res.status(500).json("Username does not exist."); });
});

app.post('/api/users/:id/follow', verifyToken, (req,res) => {
  let id = parseInt(req.params.id);
  let follows;
  if (req.body.id) { follows = req.body.id; }
  /*else {
     console.log(req.body.username);
     follows = when(knex('users').where('username', req.body.username).first().then(user => {
        if (!user) { throw new Error("Username does not exist") };
        return user.id;
     }).catch(error => { console.log(error); res.status(500).json("Username does not exist."); }));
  }*/

  console.log("FOLLOWS: "+follows);
  knex('users').where('id',id).first().then(user => {
    return knex('groups').where('group_id',follows).first();
  }).then(group => {
    if (!group) {
         throw new Error("Channel does not exist");
    }

    if (group.channel === 0) {
         throw new Error("Channel not open to join.");
    }

    return knex('followers').where({user_id:id,follows_id:follows}).first();
  }).then(entry => {
    if (entry === undefined)
      return knex('followers').insert({user_id: id, follows_id:follows});
    else
      return true;
  }).then(ids => {
    res.sendStatus(200);
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

app.delete('/api/users/:id/follow/:follower', verifyToken, (req,res) => {
  let id = parseInt(req.params.id);
  let follows = parseInt(req.params.follower);
  knex('users').where('id',id).first().then(user => {
    return knex('groups').where('group_id',follows).first();
  }).then(user => {
    return knex('followers').where({'user_id':id,follows_id:follows}).first().del();
  }).then(ids => {
    res.sendStatus(200);
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
