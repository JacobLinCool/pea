-- Migration number: 0000 	 2023-04-29T11:59:40.598Z

CREATE TABLE Developer (
    -- the developer id
    id TEXT NOT NULL PRIMARY KEY,
    -- the developer's public email
    email TEXT NOT NULL UNIQUE,
    -- the developer's name
    name TEXT NOT NULL,
    -- when the user was created
    created INT NOT NULL CHECK (created > 0)
);

CREATE TABLE Application (
    -- the application id
    id TEXT NOT NULL PRIMARY KEY,
    -- the developer id
    owner TEXT NOT NULL,
    -- the application name
    name TEXT NOT NULL,
    -- the application description
    description TEXT NOT NULL,
    -- the secret to sign the JWTs
    secret TEXT NOT NULL,
    -- the RegExp string to match application domain
    domain TEXT NOT NULL,
    -- when the application was created
    created INT NOT NULL CHECK (created > 0),
    FOREIGN KEY (owner) REFERENCES Developer(id)
);

CREATE TABLE User (
    -- email represents the user entity
    email TEXT NOT NULL PRIMARY KEY,
    -- when the user was created
    created INT NOT NULL CHECK (created > 0)
);

CREATE TABLE Login (
    -- the login id
    id TEXT NOT NULL PRIMARY KEY,
    -- application id
    app TEXT NOT NULL,
    -- the user's email
    user TEXT NOT NULL,
    -- the login time
    time INT NOT NULL CHECK (time > 0),
    -- the user's IP address
    ip TEXT NOT NULL,
    FOREIGN KEY (app) REFERENCES Application(id),
    FOREIGN KEY (user) REFERENCES User(email)
);
