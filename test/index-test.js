/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
import { words } from 'lodash';
import { modelToType } from '../lib/index';
import {
    AuthorModel,
    AuthorType,
    AuthorTypeExtended,
    BookModel,
    BookTypes,
    BookTypesExtended,
    NotebookTypes,
    OrderModel,
    OrderTypes,
    StoreModel,
    StoreType
} from './models';

test('flat StoreModel converts to a type string', t => {
    const schema = modelToType(StoreModel);

    t.deepEqual(words(schema), words(StoreType));
});

test('nested OrderModel converts to a type string', t => {
    const schema = modelToType(OrderModel);
    t.deepEqual(words(schema), words(OrderTypes), `Expected\n${schema}\nto equal\n${OrderTypes}`);
});

test('embedded BookModel converts to a type string', t => {
    const schema = modelToType(BookModel);
    t.deepEqual(words(schema), words(BookTypes), `Expected\n${schema}\nto equal\n${BookTypes}`);
});

test('can extend generated types', t => {
    const schema = modelToType(BookModel, {
        extend: {
            Book: {
                publishers: '[Publisher]'
            },
            BookCategory: {
                genre: 'Genre'
            }
        }
    });

    t.deepEqual(words(schema), words(BookTypesExtended), `Expected\n${schema}\nto equal\n${BookTypesExtended}`);
});

test('can overwrite generated type name', t => {
    const schema = modelToType(BookModel, {
        name: 'Notebook'
    });

    t.deepEqual(words(schema), words(NotebookTypes), `Expected\n${schema}\nto equal\n${NotebookTypes}`);
});

test('can infer type from ref', t => {
    const schema = modelToType(AuthorModel);

    t.deepEqual(words(schema), words(AuthorType), `Expected\n${schema}\nto equal\n${AuthorType}`);
});

test('can override inferred type from ref', t => {
    const schema = modelToType(AuthorModel, {
        refs: {
            Book: 'Notebook'
        }
    });

    t.deepEqual(words(schema), words(AuthorTypeExtended), `Expected\n${schema}\nto equal\n${AuthorTypeExtended}`);
});
