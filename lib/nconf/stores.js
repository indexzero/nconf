/*
 * stores.js: Top-level include for all nconf stores
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var stores = exports;

stores.Memory = require('nconf/stores/memory').Memory;
stores.File   = require('nconf/stores/file').File;
stores.Redis  = require('nconf/stores/redis').Redis;