# mongoose-graphql [![Build Status][travis-image]][travis-url]

[travis-url]: https://travis-ci.org/MLH-KM/mongoose-graphql
[travis-image]: https://travis-ci.org/MLH-KM/mongoose-graphql.svg?branch=master

[mongoose-graphql](https://github.com/zipdrug/mongoose-graphql) converts a mongoose model to graphql types.

## Installation

Using [npm](https://www.npmjs.org/):

    $ npm install --save mongoose-graphql

```js
// using ES6 modules
import { modelToType } from 'mongoose-graphql';

// using CommonJS modules
var mongooseGraphQL = require('mongoose-graphql');
var modelToType = mongooseGraphQL.modelToType;
```
## API

### `modelToType(model, [options])`

Convert a mongoose model to graphql types.

You can use this type definition in [graphql-tools](https://github.com/apollostack/graphql-tools) to build an executable schema.

```js
const CategorySchema = new Schema({
      type: String,
});

const BookModel = mongoose.model('Book', new Schema({
      category: CategorySchema,
      name: String,
      isbn: String,
      author: { type: Schema.Types.ObjectId, ref: 'Author' }
}));

const typeDef = modelToType(BookModel, {
    // Add fields to the GraphQL type that don't exist in the Mongoose model
    extend: {
        Book: {
            publishers: '[Publisher]'
        },
        BookCategory: {
            genre: 'Genre'
        }
    },
    // If you're using refs, the ref will be used as the GraphQL field return type.
    // You may override this behavior and specify the return type with a string
    refs: {
        Author: 'Writer'
    },
    // Omit fields from the GraphQL type
    omit: ['isbn']
});

console.log(typeDef);
```

Outputs:
```graphql
type BookCategory {
    _id: String
    genre: Genre
    type: String
}

type Book {
    _id: String
    category: BookCategory
    name: String
    publishers: [Publisher]
    author: Writer
}
```
