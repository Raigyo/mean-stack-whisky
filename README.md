# MEAN Stack

April 2021

> 🔨 From udemy: [La MEAN stack par la pratique - Samir Medjdoub / Code Concept](https://www.udemy.com/course/la-mean-stack-par-la-pratique/)

---

![logo](_readme-img/logo.jpg)

## Test localy

## Front End part

- _./src/app/app.module.ts_: import / export all modules used in the application
- _./src/app/app-routing.module.ts_: routing
- _./src/app/material.module.ts_: import / export modules related to material design. _./src/app/material.module.ts_ has to be imported in _./src/app/app.module.ts_

**Home**

- _./src/app/app.component.html_: \<router-outlet\> add the content from routing component _./src/app/app-routing.module.ts_

**blogpost**

- _./src/app/models/blogpost.ts_: typed schema
- _./src/app/services/blogpost.service.ts_: request on MongoDB
- _./src/app/blogpost-list/blogpost-list.component.ts_: observable on Blogpost[]
- _./src/app/blogpost-list/blogpost-list.component.html_: view

## Angular concepts

### Observable

Source of data pushed when we suscribe.

### Modules

Ex: `ng g m material --flat` => Ceate module _\_src/app/material.module.ts_

### Components

Ex: `ng g c blogpost --skip-tests --module=app` => Create new blogpost component

Ex: `ng g c blogpost-list --skip-tests --module=app` => Create new blogpost-list component

### Models: Interfaces

We use interfaces instead classes because we don't need behaviors (methods).

Ex: Interface _blogpost.ts_ in _\_src/app/models_

### Services

**blogpost**

Ex: `ng g s blogpost` => Create new blogpost service

## Dependancies

### API

- [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for node.

`npm i express`

- [eslint](https://www.npmjs.com/package/eslint): ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

`npm i eslint --save-dev`

`npm install --save-dev eslint-config-prettier`

- [cors](https://www.npmjs.com/package/cors): CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

`npm i cors`

- [nodemon](https://www.npmjs.com/package/nodemon): nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.

`npm install --save-dev nodemon`

- [mongoDB](https://www.mongodb.com/): MongoDB is a general purpose, document-based, distributed database built for modern application developers and for the cloud era.

**WSL2**:

- `sudo service mongodb status`: status for checking the status of your database.
- `sudo service mongodb start`: start to start running your database.
- `sudo service mongodb stop`: stop to stop running your database.

**Shell**

- `mongo`: MongoDB shell
- `show dbs`: View databases
- `use [DB_NAME]`: Choose databases
- `show collections`: View collections
- `db.[COLLECTION_NAME].find({})`: View documents in collection

- [mongoose](https://www.npmjs.com/package/mongoose): Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks.

`npm i mongoose`

### APP

- [Angular CLI](https://angular.io/cli): The Angular CLI is a command-line interface tool that you use to initialize, develop, scaffold, and maintain Angular applications directly from a command shell.

```batch
ng new my-first-project
cd my-first-project
ng serve
```

`npm install -g @angular/cli`

- [Angular Material](https://material.angular.io/): Material Design components for Angular.

`ng add @angular/material`

## Useful links

- [codeconcept/whisky-cms-ng](https://github.com/codeconcept/whisky-cms-ng).
- [codeconcept/whisky-cms-ng-srv](https://github.com/codeconcept/whisky-cms-ng-srv).
- [Comment installer MongoDB sur Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04-fr).
- [Install MongoDB - WSL 2](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database).
- [The mongo Shell](https://docs.mongodb.com/manual/mongo/).
- [Angular - Text interpolation](https://angular.io/guide/interpolation#text-interpolation).
